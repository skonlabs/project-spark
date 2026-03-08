"""
LLM Ranking Simulation Engine

Runs evaluation prompts across multiple LLMs and extracts:
- Whether the product was mentioned
- Ranking position (1st, 2nd, 3rd mention, etc.)
- Sentiment context
- Competing products mentioned
- Citation/confidence signals
"""
from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass

from app.services.llm_client import llm_client, LLMResponse


@dataclass
class MentionExtraction:
    product_mentioned: bool
    mention_rank: int | None  # 1-based
    mention_context: str | None
    sentiment_score: float  # -1 to 1
    confidence_score: float  # 0-1
    entities_mentioned: list[str]
    competitors_mentioned: list[str]
    citations: list[str]


EXTRACTOR_SYSTEM = """You are an AI response analyst specializing in entity mention extraction.
Given an LLM response and a target product/company, extract precise signals about how the
product appears in the response. Be accurate and literal in your extraction.
Always respond with valid JSON."""


class SimulationEngine:
    """
    Runs prompts across multiple LLMs and extracts entity mention signals.
    """

    DEFAULT_MODELS = [
        "claude-sonnet-4-6",
        "gpt-4o",
        "gemini-1.5-pro",
    ]

    async def run_simulation(
        self,
        prompts: list[str],
        product_name: str,
        target_models: list[str] | None = None,
        competitors: list[str] | None = None,
    ) -> dict:
        """
        Run all prompts across all models and return structured results.
        """
        models = target_models or self.DEFAULT_MODELS
        results = []

        # Create tasks: (prompt, model) cross product
        tasks = [
            self._run_single(
                prompt=prompt,
                product_name=product_name,
                model=model,
                competitors=competitors or [],
            )
            for prompt in prompts
            for model in models
        ]

        # Run in parallel with concurrency limit
        semaphore = asyncio.Semaphore(5)

        async def guarded(task_coro):
            async with semaphore:
                return await task_coro

        raw_results = await asyncio.gather(
            *[guarded(t) for t in tasks],
            return_exceptions=True,
        )

        for (prompt, model), result in zip(
            [(p, m) for p in prompts for m in models],
            raw_results,
        ):
            if isinstance(result, Exception):
                results.append({
                    "prompt": prompt,
                    "model": model,
                    "error": str(result),
                    "product_mentioned": False,
                })
            else:
                results.append(result)

        # Aggregate summary
        summary = self._aggregate_summary(results, product_name, models, competitors or [])

        return {
            "results": results,
            "summary": summary,
        }

    async def _run_single(
        self,
        prompt: str,
        product_name: str,
        model: str,
        competitors: list[str],
    ) -> dict:
        """Run one prompt on one model and extract signals."""
        # Get LLM response to the prompt
        llm_response = await llm_client.complete(
            prompt=prompt,
            model=model,
            max_tokens=2000,
            temperature=0.3,  # Lower temp for more consistent rankings
        )

        # Extract signals from the response
        extraction = await self._extract_signals(
            response_text=llm_response.text,
            product_name=product_name,
            competitors=competitors,
            model=model,
        )

        return {
            "prompt": prompt,
            "model": model,
            "provider": llm_response.provider,
            "response_text": llm_response.text,
            "latency_ms": llm_response.latency_ms,
            "product_mentioned": extraction.product_mentioned,
            "mention_rank": extraction.mention_rank,
            "mention_context": extraction.mention_context,
            "sentiment_score": extraction.sentiment_score,
            "confidence_score": extraction.confidence_score,
            "entities_mentioned": extraction.entities_mentioned,
            "competitors_mentioned": extraction.competitors_mentioned,
            "citations": extraction.citations,
        }

    async def _extract_signals(
        self,
        response_text: str,
        product_name: str,
        competitors: list[str],
        model: str,
    ) -> MentionExtraction:
        """Use Claude to extract entity signals from an LLM response."""
        competitors_str = ", ".join(competitors) if competitors else "any software tools"

        extraction_prompt = f"""Analyze this LLM response and extract entity mention signals.

TARGET PRODUCT: {product_name}
KNOWN COMPETITORS: {competitors_str}

LLM RESPONSE TO ANALYZE:
---
{response_text[:3000]}
---

Extract the following signals:

1. Is "{product_name}" mentioned anywhere in the response? (even variations, abbreviations)
2. If mentioned, what rank position is it? (1 = first product mentioned, 2 = second, etc.)
3. What is the exact context/sentence where it's mentioned?
4. What is the sentiment toward {product_name} (-1.0 = very negative, 0 = neutral, 1.0 = very positive)?
5. How confident does the LLM seem when recommending {product_name} (0-1)?
6. List ALL software products, companies, or tools mentioned in the response.
7. Which of the known competitors appear in the response?
8. Are any sources or citations mentioned?

Respond with:
{{
  "product_mentioned": <true/false>,
  "mention_rank": <null or integer>,
  "mention_context": "<exact quote or null>",
  "sentiment_score": <-1.0 to 1.0>,
  "confidence_score": <0.0 to 1.0>,
  "entities_mentioned": ["<all products/companies mentioned>"],
  "competitors_mentioned": ["<competitors from the known list>"],
  "citations": ["<any URLs or sources cited>"]
}}"""

        result = await llm_client.extract_json(
            extraction_prompt,
            model="claude-haiku-4-5",  # Use fast model for extraction
            system=EXTRACTOR_SYSTEM,
        )

        return MentionExtraction(
            product_mentioned=result.get("product_mentioned", False),
            mention_rank=result.get("mention_rank"),
            mention_context=result.get("mention_context"),
            sentiment_score=float(result.get("sentiment_score", 0.0)),
            confidence_score=float(result.get("confidence_score", 0.0)),
            entities_mentioned=result.get("entities_mentioned", []),
            competitors_mentioned=result.get("competitors_mentioned", []),
            citations=result.get("citations", []),
        )

    def _aggregate_summary(
        self,
        results: list[dict],
        product_name: str,
        models: list[str],
        competitors: list[str],
    ) -> dict:
        """Aggregate per-result data into summary metrics."""
        total = len(results)
        if total == 0:
            return {}

        mentions = [r for r in results if r.get("product_mentioned")]
        mention_count = len(mentions)
        mention_rate = (mention_count / total) * 100

        # Average rank among mentions
        ranks = [r["mention_rank"] for r in mentions if r.get("mention_rank")]
        avg_rank = sum(ranks) / len(ranks) if ranks else None

        # Average sentiment
        sentiments = [r["sentiment_score"] for r in mentions if "sentiment_score" in r]
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0

        # Per-model breakdown
        model_breakdown = {}
        for model in models:
            model_results = [r for r in results if r.get("model") == model]
            model_mentions = [r for r in model_results if r.get("product_mentioned")]
            model_breakdown[model] = {
                "total_prompts": len(model_results),
                "mentions": len(model_mentions),
                "mention_rate": (len(model_mentions) / len(model_results) * 100) if model_results else 0,
                "avg_rank": (
                    sum(r["mention_rank"] for r in model_mentions if r.get("mention_rank"))
                    / len([r for r in model_mentions if r.get("mention_rank")])
                    if any(r.get("mention_rank") for r in model_mentions) else None
                ),
            }

        # Competitor analysis
        competitor_mentions: dict[str, int] = {}
        for r in results:
            for comp in r.get("competitors_mentioned", []):
                competitor_mentions[comp] = competitor_mentions.get(comp, 0) + 1

        competitor_share_of_voice = {
            comp: (count / total) * 100
            for comp, count in sorted(
                competitor_mentions.items(), key=lambda x: x[1], reverse=True
            )
        }

        return {
            "total_tests": total,
            "mention_count": mention_count,
            "mention_rate": round(mention_rate, 1),
            "avg_rank": round(avg_rank, 1) if avg_rank else None,
            "avg_sentiment": round(avg_sentiment, 2),
            "product_share_of_voice": round(mention_rate, 1),
            "model_breakdown": model_breakdown,
            "competitor_share_of_voice": competitor_share_of_voice,
        }


# ─── Singleton ────────────────────────────────────────────────────────────────

simulation_engine = SimulationEngine()
