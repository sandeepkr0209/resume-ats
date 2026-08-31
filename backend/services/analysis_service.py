import logging
from pathlib import Path

from models.schemas import AnalysisResult
from services.jd_parser import parse_job_description
from services.resume_parser import parse_resume_text
from services.scorer import build_breakdown, verdict_for_score
from services.recommender import generate_recommendations
from services.warnings_check import build_warnings
from parsers.resume_reader import read_resume

logger = logging.getLogger("resumeai.analysis")


def run_analysis(job_description_text: str, resume_file_path: Path) -> AnalysisResult:
    """
    Full pipeline: JD extraction -> resume extraction -> deterministic
    scoring -> LLM-generated explanations/recommendations.

    Exactly 3 LLM calls per analysis (JD parse, resume parse, recommender),
    regardless of resume length, matching the "avoid unnecessary LLM calls"
    requirement.
    """
    raw_resume_text = read_resume(resume_file_path)

    job = parse_job_description(job_description_text)
    resume = parse_resume_text(raw_resume_text)

    (
        overall_score,
        breakdown,
        required_skills,
        preferred_skills,
        experience,
        education,
    ) = build_breakdown(job, resume, raw_resume_text)

    verdict = verdict_for_score(overall_score)
    warnings = build_warnings(resume, raw_resume_text, required_skills)

    rec_output = generate_recommendations(job, resume, required_skills, preferred_skills, overall_score)

    return AnalysisResult(
        candidate_name=resume.name,
        candidate_email=resume.email,
        candidate_phone=resume.phone,
        overall_score=overall_score,
        verdict=verdict,
        score_explanation=rec_output.score_explanation,
        breakdown=breakdown,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        experience=experience,
        education=education,
        projects=resume.projects,
        certifications=resume.certifications,
        warnings=warnings,
        recommendations=rec_output.recommendations,
        before_after=rec_output.before_after,
        parsed_job=job,
        parsed_resume=resume,
    )
