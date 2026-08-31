"""
Shared data models.

These are the same core entities from the original script (JobD, Resume,
Experience, MatchResult) but reshaped: MatchResult's free-form `details: dict`
is replaced with typed sub-models so the frontend gets a predictable,
strongly-shaped response instead of an arbitrary LLM-authored dict.
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


# ---------- Job description ----------

class JobDescription(BaseModel):
    role: str = ""
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    minimum_experience: Optional[float] = None
    education_requirements: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)


# ---------- Resume ----------

class Experience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    skills_used: list[str] = Field(default_factory=list)


class Resume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    total_experience_years: Optional[float] = None
    skills: list[str] = Field(default_factory=list)
    experiences: list[Experience] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


# ---------- Matching / scoring ----------

class SkillMatch(BaseModel):
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    # Missing skills whose keyword shows up somewhere in the raw resume text
    # (e.g. inside a project description) but wasn't lifted into the
    # candidate's skills list -- so it's *possibly* present, not fabricated.
    possibly_present: list[str] = Field(default_factory=list)
    bonus: list[str] = Field(default_factory=list)  # candidate skills beyond the JD
    coverage_percent: float = 0.0


class CategoryScore(BaseModel):
    label: str
    weight_percent: float
    score: float  # 0-100
    explanation: str = ""


class ExperienceMatch(BaseModel):
    required_years: Optional[float] = None
    candidate_years: Optional[float] = None
    meets_requirement: bool = True
    score: float = 100.0


class EducationMatch(BaseModel):
    required: list[str] = Field(default_factory=list)
    candidate: list[str] = Field(default_factory=list)
    matched: bool = True
    score: float = 100.0


class ATSWarning(BaseModel):
    severity: str  # "info" | "warning" | "critical"
    message: str


class RecommendationItem(BaseModel):
    category: str
    title: str
    detail: str


class BeforeAfterItem(BaseModel):
    before: str
    after: str
    note: str = ""


class AnalysisResult(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None

    overall_score: float
    verdict: str
    score_explanation: str = ""

    breakdown: list[CategoryScore] = Field(default_factory=list)

    required_skills: SkillMatch
    preferred_skills: SkillMatch

    experience: ExperienceMatch
    education: EducationMatch

    projects: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)

    warnings: list[ATSWarning] = Field(default_factory=list)
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    before_after: list[BeforeAfterItem] = Field(default_factory=list)

    parsed_job: JobDescription
    parsed_resume: Resume
