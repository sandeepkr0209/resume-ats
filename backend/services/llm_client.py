"""
Thin wrapper around the Groq client used by the original script.

Adds what the original script was missing:
- a shared client instance (was created at module import time with no
  error handling if the key was missing)
- retries with backoff on transient failures
- a timeout
- JSON parsing that retries once (asking the model to fix its own output)
  instead of trusting arbitrary LLM output blindly
"""
import json
import time
import logging
from typing import Type, TypeVar

from groq import Groq, APIError, APITimeoutError, RateLimitError
from pydantic import BaseModel, ValidationError

from config import settings

logger = logging.getLogger("resumeai.llm")

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    """Raised when the LLM call fails or returns unusable output after retries."""


def _get_client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise LLMError(
            "Server is not configured with a GROQ_API_KEY. Set it in your .env file."
        )
    return Groq(api_key=settings.GROQ_API_KEY, timeout=settings.LLM_TIMEOUT_SECONDS)


def call_structured(
    *,
    system_prompt: str,
    user_prompt: str,
    schema_model: Type[T],
) -> T:
    """
    Calls the LLM asking for JSON matching `schema_model`, parses and
    validates the response, and retries (with the validation error fed
    back to the model) if parsing/validation fails.
    """
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    last_error: Exception | None = None
    for attempt in range(settings.LLM_MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=settings.LLM_TEMPERATURE,
            )
        except RateLimitError as exc:
            last_error = exc
            wait = 2 ** attempt
            logger.warning("Groq rate-limited, retrying in %ss", wait)
            time.sleep(wait)
            continue
        except (APITimeoutError, APIError) as exc:
            last_error = exc
            logger.warning("Groq API error on attempt %s: %s", attempt, exc)
            time.sleep(1)
            continue

        raw = response.choices[0].message.content or ""
        try:
            data = json.loads(raw)
            return schema_model(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            last_error = exc
            logger.warning("Invalid structured output on attempt %s: %s", attempt, exc)
            # Feed the error back so a retry has a chance to self-correct.
            messages.append({"role": "assistant", "content": raw})
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "That response was not valid JSON matching the required "
                        f"schema ({exc}). Return ONLY corrected valid JSON, "
                        "no explanation, no markdown fences."
                    ),
                }
            )
            continue

    raise LLMError(
        f"The AI model failed to return a usable response after "
        f"{settings.LLM_MAX_RETRIES + 1} attempts: {last_error}"
    )
