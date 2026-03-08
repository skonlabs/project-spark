"""
Content Optimization Engine

Generates AI-optimized content including:
- Rewritten versions of existing content
- Educational articles
- Prompt-aligned articles
- Comparison articles
- FAQs
- Documentation expansions
"""
from __future__ import annotations

from app.services.llm_client import llm_client


OPTIMIZER_SYSTEM = """You are an expert AI Engine Optimization (AEO) content strategist.
You create content specifically optimized to appear in LLM-generated answers.
Your content is authoritative, educational, well-structured, and naturally answers
questions users ask AI assistants. You write in clear, engaging prose that LLMs
find easy to cite and quote. Always produce high-quality, substantive content."""


class ContentOptimizer:
    """Generates and optimizes content for maximum AI discoverability."""

    # ─── Content Rewriting ────────────────────────────────────────────────────

    async def rewrite_for_aeo(
        self,
        original_content: str,
        product_name: str,
        product_category: str,
        target_prompts: list[str] | None = None,
    ) -> dict:
        """Rewrite existing content to be more AI-optimized."""
        prompts_str = "\n".join(f"- {p}" for p in (target_prompts or []))

        prompt = f"""Rewrite the following content to be optimized for AI Engine Optimization (AEO).

PRODUCT: {product_name}
CATEGORY: {product_category}
TARGET PROMPTS TO ANSWER:
{prompts_str if prompts_str else "(general AEO optimization)"}

ORIGINAL CONTENT:
---
{original_content[:6000]}
---

Rewrite this content following these AEO principles:
1. Add a clear entity definition at the start: "{product_name} is a [category] platform that [core value prop]"
2. Use H2/H3 headings that match natural question formats
3. Add a FAQ section answering the most likely user questions
4. Include clear definitions of key terms
5. Add comparison context where appropriate
6. Ensure consistent product positioning throughout
7. Make content scannable with bullet points and short paragraphs
8. Add specific examples and use cases

Return:
{{
  "rewritten_content": "<full rewritten content in Markdown>",
  "improvements_made": ["<list of specific improvements>"],
  "aeo_score_impact": "<estimated improvement description>"
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)

    # ─── Article Generation ───────────────────────────────────────────────────

    async def generate_educational_article(
        self,
        topic: str,
        product_name: str,
        product_category: str,
        target_audience: str = "technical professionals",
        word_count: int = 1500,
    ) -> dict:
        """Generate an educational article optimized for AI citation."""
        prompt = f"""Write a comprehensive educational article on "{topic}" optimized for AI Engine Optimization.

RELATED PRODUCT: {product_name} (a {product_category} platform)
TARGET AUDIENCE: {target_audience}
TARGET WORD COUNT: ~{word_count} words

Requirements:
1. Start with a clear, definitive explanation of the topic
2. Include structured sections with descriptive H2 headings
3. Define all key terms explicitly
4. Include practical examples and use cases
5. Add a "Key Takeaways" section
6. Include 5-8 FAQ questions and answers at the end
7. Naturally mention {product_name} as a relevant tool (not promotional)
8. Make content quotable — LLMs should want to cite specific sentences

Return:
{{
  "title": "<article title>",
  "meta_description": "<150 char description>",
  "content": "<full article in Markdown>",
  "word_count": <number>,
  "target_prompts": ["<prompts this article answers>"],
  "key_entities": ["<key terms defined>"],
  "faq_questions": ["<FAQ questions included>"]
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)

    async def generate_comparison_article(
        self,
        product_name: str,
        competitor_name: str,
        product_category: str,
        product_description: str,
        competitor_description: str = "",
    ) -> dict:
        """Generate a balanced comparison article."""
        prompt = f"""Write an objective, comprehensive comparison article: "{product_name} vs {competitor_name}".

PRODUCT: {product_name} — {product_description}
COMPETITOR: {competitor_name} — {competitor_description or "a competing platform in the same category"}
CATEGORY: {product_category}

Requirements:
1. Start with a clear overview of what each product does
2. Use a comparison table for features
3. Cover: pricing model, ease of use, features, integrations, support, ideal use case
4. Be objective — acknowledge strengths AND limitations of both
5. Include "When to choose X" sections for each
6. End with a clear recommendation framework
7. Include FAQ section for comparison questions

This article will be cited by LLMs when users ask "X vs Y" questions.

Return:
{{
  "title": "<comparison article title>",
  "meta_description": "<150 char description>",
  "content": "<full article in Markdown>",
  "comparison_table": {{
    "headers": ["Feature", "{product_name}", "{competitor_name}"],
    "rows": [["<feature>", "<product value>", "<competitor value>"]]
  }},
  "winner_categories": {{
    "{product_name}": ["<areas where it wins>"],
    "{competitor_name}": ["<areas where it wins>"]
  }},
  "target_prompts": ["<prompts this answers>"]
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)

    async def generate_faq_content(
        self,
        product_name: str,
        product_category: str,
        product_description: str,
        num_questions: int = 15,
    ) -> dict:
        """Generate a comprehensive FAQ page."""
        prompt = f"""Generate a comprehensive FAQ page for {product_name}.

PRODUCT: {product_name}
CATEGORY: {product_category}
DESCRIPTION: {product_description}

Generate {num_questions} FAQ questions that users actually ask AI assistants about this product.
Include questions across categories: what/why/how/when/who/pricing/technical/comparison.

Each answer should:
- Start with a direct, definitive answer
- Be 100-200 words
- Include specific details
- Be optimized to appear as an AI assistant answer

Return:
{{
  "faqs": [
    {{
      "question": "<natural language question>",
      "answer": "<comprehensive answer>",
      "category": "what|how|why|when|who|pricing|technical|comparison"
    }}
  ]
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)

    async def generate_prompt_aligned_content(
        self,
        prompt_cluster: str,
        target_prompts: list[str],
        product_name: str,
        product_category: str,
        product_description: str,
    ) -> dict:
        """Generate content specifically aligned to answer a cluster of user prompts."""
        prompts_str = "\n".join(f"- {p}" for p in target_prompts)
        prompt = f"""Create content specifically designed to answer this cluster of AI assistant prompts.

PROMPT CLUSTER TYPE: {prompt_cluster}
TARGET PROMPTS:
{prompts_str}

PRODUCT: {product_name} ({product_category})
DESCRIPTION: {product_description}

Create an article that directly and authoritatively answers all these prompts.
The content should:
1. Match the exact intent of these queries
2. Provide clear, definitive answers an AI would quote
3. Position {product_name} naturally as a solution
4. Include specific data, examples, and frameworks
5. Be the single best resource for these prompts

Return:
{{
  "title": "<article title that matches the prompts>",
  "content": "<full article in Markdown>",
  "key_answers": ["<key quotable answers included>"],
  "prompt_match_score": "<estimated how well this covers the prompts>",
  "meta_description": "<150 char description>"
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)

    async def optimize_entity_definition(
        self,
        product_name: str,
        current_description: str,
        product_category: str,
        target_audience: str,
    ) -> dict:
        """Generate optimized entity definition statements."""
        prompt = f"""Create the optimal entity definition for {product_name} for AI Engine Optimization.

CURRENT DESCRIPTION: {current_description}
CATEGORY: {product_category}
TARGET AUDIENCE: {target_audience}

An entity definition helps LLMs understand exactly what this product is.
It should be:
- Clear and unambiguous
- Category-defining
- Comprehensive in 1-3 sentences
- Use standard industry terminology

Generate multiple variants for different contexts:

Return:
{{
  "one_liner": "<One sentence: X is a [category] platform that [value prop]>",
  "short_description": "<2-3 sentences for homepage hero>",
  "long_description": "<paragraph for about page>",
  "technical_description": "<for developer documentation>",
  "category_positioning": "<how it fits in the category landscape>",
  "llm_optimized_definition": "<optimized for LLM citation>"
}}"""

        return await llm_client.extract_json(prompt, system=OPTIMIZER_SYSTEM)


# ─── Singleton ────────────────────────────────────────────────────────────────

content_optimizer = ContentOptimizer()
