"""
Deterministic weighted scoring.

Scoring methodology (weights configurable via config.SCORE_WEIGHTS / env vars):

    skills_match             35%  -- required-skill coverage (matcher.py)
    experience_match         20%  -- candidate years vs JD minimum
    responsibilities_match   20%  -- keyword overlap: resume vs JD responsibilities
    education_match          10%  -- keyword overlap: resume education vs JD requirements
    preferred_skills_match   10%  -- preferred-skill coverage
    keyword_relevance         5%  -- overall resume-vs-JD keyword overlap

The LLM is never asked to invent the final number. It's used earlier
(structured extraction) and later (turning these numbers into plain-English
explanations/recommendations), but the score itself is computed here from
the structured, comparable fields -- so the same resume/JD pair always
produces the same score.
"""
from models.schemas import (
    JobDescription,
    Resume,
    SkillMatch,
    CategoryScore,
    ExperienceMatch,
    EducationMatch,
)
from services.matcher import match_skills, keyword_overlap_percent
from config import settings


def score_experience(job: JobDescription, resume: Resume) -> ExperienceMatch:
    required = job.minimum_experience
    candidate = resume.total_experience_years

    if required is None or required <= 0:
        return ExperienceMatch(required_years=required, candidate_years=candidate, meets_requirement=True, score=100.0)

    if candidate is None:
        return ExperienceMatch(required_years=required, candidate_years=None, meets_requirement=False, score=0.0)

    ratio = candidate / required
    score = round(min(ratio, 1.0) * 100, 1)
    return ExperienceMatch(
        required_years=required,
        candidate_years=candidate,
        meets_requirement=candidate >= required,
        score=score,
    )


def score_education(job: JobDescription, resume: Resume) -> EducationMatch:
    if not job.education_requirements:
        return EducationMatch(required=[], candidate=resume.education, matched=True, score=100.0)

    req_text = " ".join(job.education_requirements)
    cand_text = " ".join(resume.education)
    if not cand_text.strip():
        return EducationMatch(required=job.education_requirements, candidate=resume.education, matched=False, score=0.0)

    overlap = keyword_overlap_percent(req_text, cand_text)
    matched = overlap >= 30.0  # at least some meaningful term overlap
    return EducationMatch(
        required=job.education_requirements,
        candidate=resume.education,
        matched=matched,
        score=overlap,
    )


def build_breakdown(
    job: JobDescription,
    resume: Resume,
    raw_resume_text: str,
) -> tuple[float, list[CategoryScore], SkillMatch, SkillMatch, ExperienceMatch, EducationMatch]:
    required_skills = match_skills(job.required_skills, resume, raw_resume_text)
    preferred_skills = match_skills(job.preferred_skills, resume, raw_resume_text) if job.preferred_skills else SkillMatch(coverage_percent=100.0)

    experience = score_experience(job, resume)
    education = score_education(job, resume)

    responsibilities_text = " ".join(job.responsibilities)
    resume_text_for_overlap = " ".join(
        resume.projects + [e.description or "" for e in resume.experiences]
    )
    responsibilities_score = (
        keyword_overlap_percent(responsibilities_text, resume_text_for_overlap)
        if responsibilities_text.strip()
        else 100.0
    )

    jd_full_text = " ".join(
        [job.role] + job.required_skills + job.preferred_skills + job.responsibilities
    )
    resume_full_text = raw_resume_text or ""
    keyword_relevance_score = keyword_overlap_percent(jd_full_text, resume_full_text)

    weights = settings.SCORE_WEIGHTS
    components = {
        "skills_match": (required_skills.coverage_percent, "Required Skills Match"),
        "experience_match": (experience.score, "Experience Match"),
        "responsibilities_match": (min(responsibilities_score, 100.0), "Responsibilities Match"),
        "education_match": (education.score, "Education Match"),
        "preferred_skills_match": (preferred_skills.coverage_percent, "Preferred Skills Match"),
        "keyword_relevance": (min(keyword_relevance_score, 100.0), "Resume/Keyword Relevance"),
    }

    breakdown: list[CategoryScore] = []
    overall = 0.0
    for key, (value, label) in components.items():
        w = weights[key]
        overall += value * w
        breakdown.append(
            CategoryScore(
                label=label,
                weight_percent=round(w * 100, 1),
                score=round(value, 1),
            )
        )

    return round(overall, 1), breakdown, required_skills, preferred_skills, experience, education


def verdict_for_score(score: float) -> str:
    if score >= 90:
        return "Excellent Match"
    if score >= 75:
        return "Strong Match"
    if score >= 60:
        return "Moderate Match"
    return "Needs Improvement"
