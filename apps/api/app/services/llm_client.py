"""
Unified LLM client — abstracts Anthropic, OpenAI, Google, xAI.
All platform AI operations flow through this module.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

import anthropic
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings


# ─── Provider constants ───────────────────────────────────────────────────────

ANTHROPIC_MODELS = {
    "claude-opus-4-6": "claude-opus-4-6",
    "claude-sonnet-4-6": "claude-sonnet-4-6",
    "claude-haiku-4-5": "claude-haiku-4-5-20251001",
}

OPENAI_MODELS = {
    "gpt-4o": "gpt-4o",
    "gpt-4o-mini": "gpt-4o-mini",
    "gpt-4-turbo": "gpt-4-turbo",
}

GOOGLE_MODELS = {
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-1.5-flash": "gemini-1.5-flash",
}


class LLMResponse:
    """Normalized response from any LLM provider."""

    def __init__(
        self,
        text: str,
        model: str,
        provider: str,
        latency_ms: int,
        usage: dict | None = None,
        raw: Any = None,
    ) -> None:
        self.text = text
        self.model = model
        self.provider = provider
        self.latency_ms = latency_ms
        self.usage = usage or {}
        self.raw = raw


class LLMClient:
    """
    Unified async LLM client supporting multiple providers.
    Primary platform LLM is Anthropic Claude.
    """

    def __init__(self) -> None:
        self._anthropic: anthropic.AsyncAnthropic | None = None
        self._openai = None
        self._google = None

    @property
    def anthropic(self) -> anthropic.AsyncAnthropic:
        if self._anthropic is None:
            self._anthropic = anthropic.AsyncAnthropic(
                api_key=settings.anthropic_api_key
            )
        return self._anthropic

    @property
    def openai(self):
        if self._openai is None:
            try:
                from openai import AsyncOpenAI
                self._openai = AsyncOpenAI(api_key=settings.openai_api_key)
            except ImportError:
                pass
        return self._openai

    # ─── Core completion ──────────────────────────────────────────────────────

    @retry(
        retry=retry_if_exception_type((anthropic.RateLimitError, anthropic.APIConnectionError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def complete_anthropic(
        self,
        prompt: str,
        model: str = "claude-sonnet-4-6",
        system: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> LLMResponse:
        start = time.monotonic()
        messages = [{"role": "user", "content": prompt}]

        kwargs: dict[str, Any] = {
            "model": ANTHROPIC_MODELS.get(model, model),
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system

        response = await self.anthropic.messages.create(**kwargs)

        latency_ms = int((time.monotonic() - start) * 1000)
        text = response.content[0].text if response.content else ""

        return LLMResponse(
            text=text,
            model=model,
            provider="anthropic",
            latency_ms=latency_ms,
            usage={
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
            raw=response,
        )

    async def complete_openai(
        self,
        prompt: str,
        model: str = "gpt-4o",
        system: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> LLMResponse:
        if not self.openai:
            raise RuntimeError("OpenAI client not available — check OPENAI_API_KEY")

        start = time.monotonic()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = await self.openai.chat.completions.create(
            model=OPENAI_MODELS.get(model, model),
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        latency_ms = int((time.monotonic() - start) * 1000)
        text = response.choices[0].message.content or ""

        return LLMResponse(
            text=text,
            model=model,
            provider="openai",
            latency_ms=latency_ms,
            usage={
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
            },
            raw=response,
        )

    async def complete_google(
        self,
        prompt: str,
        model: str = "gemini-1.5-pro",
        system: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> LLMResponse:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.google_ai_api_key)
        except ImportError:
            raise RuntimeError("Google AI not installed — pip install google-generativeai")

        start = time.monotonic()
        gemini_model = genai.GenerativeModel(
            model_name=GOOGLE_MODELS.get(model, model),
            system_instruction=system,
        )
        response = await asyncio.to_thread(
            gemini_model.generate_content,
            prompt,
            generation_config={"max_output_tokens": max_tokens, "temperature": temperature},
        )
        latency_ms = int((time.monotonic() - start) * 1000)

        return LLMResponse(
            text=response.text,
            model=model,
            provider="google",
            latency_ms=latency_ms,
            raw=response,
        )

    # ─── Dispatch ─────────────────────────────────────────────────────────────

    async def complete(
        self,
        prompt: str,
        model: str | None = None,
        provider: str | None = None,
        system: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> LLMResponse:
        """Route to the correct provider based on model or provider hint."""
        model = model or settings.primary_llm

        # Determine provider from model name
        if provider is None:
            if any(m in model for m in ["claude", "anthropic"]):
                provider = "anthropic"
            elif any(m in model for m in ["gpt", "openai"]):
                provider = "openai"
            elif any(m in model for m in ["gemini", "google"]):
                provider = "google"
            else:
                provider = "anthropic"  # default

        if provider == "anthropic":
            return await self.complete_anthropic(prompt, model, system, max_tokens, temperature)
        elif provider == "openai":
            return await self.complete_openai(prompt, model, system, max_tokens, temperature)
        elif provider == "google":
            return await self.complete_google(prompt, model, system, max_tokens, temperature)
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    async def complete_parallel(
        self,
        prompt: str,
        models: list[str],
        system: str | None = None,
        max_tokens: int = 4096,
    ) -> list[LLMResponse]:
        """Run the same prompt across multiple models in parallel."""
        tasks = [
            self.complete(prompt=prompt, model=model, system=system, max_tokens=max_tokens)
            for model in models
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        responses = []
        for model, result in zip(models, results):
            if isinstance(result, Exception):
                # Return a failed response stub rather than crashing
                responses.append(
                    LLMResponse(
                        text="",
                        model=model,
                        provider="unknown",
                        latency_ms=0,
                        usage={"error": str(result)},
                    )
                )
            else:
                responses.append(result)
        return responses

    # ─── Structured extraction ────────────────────────────────────────────────

    async def extract_json(
        self,
        prompt: str,
        model: str | None = None,
        system: str | None = None,
    ) -> dict:
        """Complete and parse response as JSON."""
        import json

        extraction_system = (
            (system + "\n\n" if system else "")
            + "Respond ONLY with valid JSON. Do not include markdown fences or any text outside the JSON."
        )

        response = await self.complete(
            prompt=prompt,
            model=model,
            system=extraction_system,
            temperature=0.1,
        )

        # Strip markdown fences if present
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip().rstrip("```").strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Attempt to find JSON in the response
            import re
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {"error": "Failed to parse JSON", "raw": text}


# ─── Singleton ────────────────────────────────────────────────────────────────

llm_client = LLMClient()
