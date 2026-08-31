"""
Generates the *explanatory* parts of the report (recommendations, the
"why this score" summary, and before/after bullet suggestions) with the
LLM -- but only after all matching/scoring is already done deterministically
(see scorer.py). The LLM is given the computed facts and asked to explain
and suggest, not to decide numbers.
"""
from pydantic import BaseModel, Field

from models.schemas import (
    JobDescription,
    Resume,
    SkillMatch,
    RecommendationItem,
    BeforeAfterItem,
)
from services.llm_client import call_structured


class _RecommendationOutput(BaseModel):
    score_explanation: str = ""
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    before_after: list[BeforeAfterItem] = Field(default_factory=list)


_SCHEMA_HINT = _RecommendationOutput.model_json_schema()

_SYSTEM_PROMPT = f"""You are a career coach helping a candidate improve their
resume for a specific job. You are given the JOB, the CANDIDATE'S PARSED
RESUME, and an already-computed COMPARISON (matched skills, missing skills,
skills that appear somewhere in the resume text but weren't listed
explicitly, and category scores). Do not recompute or contradict the scores.

Return ONLY valid JSON matching this schema (no schema echoing, no
"properties"/"title"/"type" keys):

{_SCHEMA_HINT}

CRITICAL RULES:
- Never tell the candidate to add a skill they do not actually have evidence
  of. Use the "missing" list for skills that are genuinely absent -- for
  those, phrase suggestions conditionally ("if you have experience with X,
  add it") rather than asserting they have it.
- Use the "possibly_present" list for skills that appear somewhere in the
  resume text but aren't in the extracted skills list -- suggest making
  them explicit, since the evidence already exists in the resume.
- Never invent numbers, metrics, or outcomes for "before_after" bullets that
  aren't supported by the resume text. If no metric is available, improve
  the wording/clarity/impact framing without adding a fabricated number.
- Keep "score_explanation" to 2-4 sentences, plain language.
- Provide 3-6 recommendations, each with a short "category" (e.g. "Missing
  Skill", "Strengthen Project Description", "Keyword Alignment"), a "title",
  and a concrete "detail".
- Provide up to 3 "before_after" items only where you can ground the
  "after" version in the candidate's actual project/experience text.
"""


def generate_recommendations(
    job: JobDescription,
    resume: Resume,
    required_skills: SkillMatch,
    preferred_skills: SkillMatch,
    overall_score: float,
) -> _RecommendationOutput:
    comparison = {
        "overall_score": overall_score,
        "required_skills_matched": required_skills.matched,
        "required_skills_missing": required_skills.missing,
        "required_skills_possibly_present": required_skills.possibly_present,
        "preferred_skills_matched": preferred_skills.matched,
        "preferred_skills_missing": preferred_skills.missing,
    }

    user_prompt = f"""
JOB:
{job.model_dump_json(indent=2)}

CANDIDATE PARSED RESUME:
{resume.model_dump_json(indent=2)}

COMPUTED COMPARISON:
{comparison}
"""
    return call_structured(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema_model=_RecommendationOutput,
    )
