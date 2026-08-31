from models.schemas import Resume
from services.llm_client import call_structured

_SCHEMA_HINT = Resume.model_json_schema()

_SYSTEM_PROMPT = f"""You are an expert resume parser.

Extract information from the resume based on its meaning, not only on exact
section headings. Different resumes use different headings for the same
thing, e.g. "Experience", "Professional Experience", "Work History",
"Employment", "Internships" may all contain relevant experience. Skills may
appear in a dedicated skills section, or inside work experience, internship,
or project descriptions.

Return ONLY valid JSON matching this schema (fill it with real values,
never return the schema itself or keys like "properties"/"title"/"type"):

{_SCHEMA_HINT}

Rules:
1. Do not invent information that isn't in the resume.
2. If a value is not available, return null.
3. If a list has no information, return an empty list.
4. Include internships inside "experiences".
5. Extract skills mentioned anywhere in the resume (skills section, work
   experience, internships, and projects).
"""


def parse_resume_text(resume_text: str) -> Resume:
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    user_prompt = f"Parse the following resume:\n\n{resume_text}"
    return call_structured(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema_model=Resume,
    )
