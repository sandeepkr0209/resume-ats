from models.schemas import JobDescription
from services.llm_client import call_structured

_SCHEMA_HINT = JobDescription.model_json_schema()

_SYSTEM_PROMPT = f"""You are an expert HR assistant.

Your job is to analyze job descriptions and extract structured information
from them.

Return ONLY valid JSON matching this schema (fill it with real values,
never return the schema itself or keys like "properties"/"title"/"type"):

{_SCHEMA_HINT}

Rules:
- If minimum experience is not mentioned, return null.
- If information for a list is missing, return an empty list.
- Do not invent information that isn't in the job description.
- "required_skills" and "preferred_skills" should be short, individual
  skill/technology names (e.g. "SQL", "REST APIs"), not full sentences.
"""


def parse_job_description(job_description_text: str) -> JobDescription:
    if not job_description_text or not job_description_text.strip():
        raise ValueError("Job description text is empty.")

    user_prompt = f"Analyze the following job description:\n\n{job_description_text}"
    return call_structured(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema_model=JobDescription,
    )
