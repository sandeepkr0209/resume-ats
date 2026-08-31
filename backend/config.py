"""
Central configuration for the ResumeAI backend.

Everything that used to be hardcoded in the original script (API key,
model name, folder paths, scoring behaviour) lives here and is driven
by environment variables so the app works for arbitrary JDs/resumes
instead of one hardcoded job description and a local "resumes" folder.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- LLM ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "60"))
    LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "2"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))

    # --- Uploads ---
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}
    TEMP_UPLOAD_DIR: str = os.getenv("TEMP_UPLOAD_DIR", "/tmp/resumeai-uploads")

    # --- CORS ---
    ALLOWED_ORIGINS = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if o.strip()
    ]

    # --- Scoring weights (must sum to 1.0; validated at import time) ---
    SCORE_WEIGHTS = {
        "skills_match": float(os.getenv("WEIGHT_SKILLS_MATCH", "0.35")),
        "experience_match": float(os.getenv("WEIGHT_EXPERIENCE_MATCH", "0.20")),
        "responsibilities_match": float(os.getenv("WEIGHT_RESPONSIBILITIES_MATCH", "0.20")),
        "education_match": float(os.getenv("WEIGHT_EDUCATION_MATCH", "0.10")),
        "preferred_skills_match": float(os.getenv("WEIGHT_PREFERRED_SKILLS", "0.10")),
        "keyword_relevance": float(os.getenv("WEIGHT_KEYWORD_RELEVANCE", "0.05")),
    }


settings = Settings()

_total = sum(settings.SCORE_WEIGHTS.values())
if abs(_total - 1.0) > 0.01:
    raise ValueError(
        f"Scoring weights must sum to 1.0, got {_total:.3f}. "
        f"Check your WEIGHT_* environment variables."
    )
