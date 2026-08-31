"""
Deterministic matching logic.

The original script asked the LLM to eyeball a resume against a JD and
invent a percentage and a free-form `details` dict in one shot -- which is
exactly why running the same resume/JD pair twice could give different
scores. This module replaces the *matching* step (not the explanations)
with rule-based logic: normalization, a small synonym table, and fuzzy
string matching for near-duplicates (e.g. "Postgres" vs "PostgreSQL").
Everything here is deterministic given the same inputs.
"""
import re
from difflib import SequenceMatcher

from models.schemas import Resume, SkillMatch

# A small, curated synonym table. Extend as needed -- this is intentionally
# conservative so unrelated technologies never get treated as equivalent.
_SYNONYMS: dict[str, set[str]] = {
    "machine learning": {"ml"},
    "artificial intelligence": {"ai"},
    "javascript": {"js"},
    "typescript": {"ts"},
    "natural language processing": {"nlp"},
    "kubernetes": {"k8s"},
    "amazon web services": {"aws"},
    "google cloud platform": {"gcp"},
    "structured query language": {"sql"},
    "continuous integration": {"ci"},
    "continuous deployment": {"cd", "continuous delivery"},
    "user interface": {"ui"},
    "user experience": {"ux"},
    "representational state transfer": {"rest", "rest api", "rest apis"},
    "postgresql": {"postgres"},
    "microsoft .net": {".net", "dotnet", "dot net"},
    "c#": {"csharp", "c sharp"},
    "object relational mapping": {"orm"},
}
# Build a reverse lookup: any alias -> canonical set (alias + canonical name)
_ALIAS_GROUPS: list[set[str]] = []
for canonical, aliases in _SYNONYMS.items():
    _ALIAS_GROUPS.append({canonical} | aliases)


def _normalize(term: str) -> str:
    term = term.lower().strip()
    term = re.sub(r"[^a-z0-9.#+\s]", "", term)
    term = re.sub(r"\s+", " ", term)
    return term


def _same_skill(a: str, b: str) -> bool:
    na, nb = _normalize(a), _normalize(b)
    if not na or not nb:
        return False
    if na == nb:
        return True
    # Synonym groups
    for group in _ALIAS_GROUPS:
        if na in group and nb in group:
            return True
    # Fuzzy match for near-identical spellings/typos (conservative threshold)
    if SequenceMatcher(None, na, nb).ratio() >= 0.9:
        return True
    # Substring containment for multi-word terms (e.g. "REST API" in
    # "REST APIs and middleware")
    if len(na) > 3 and (na in nb or nb in na):
        return True
    return False


def match_skills(jd_skills: list[str], resume: Resume, raw_resume_text: str) -> SkillMatch:
    candidate_skills = list(resume.skills)
    for exp in resume.experiences:
        candidate_skills.extend(exp.skills_used)

    matched, missing, possibly_present = [], [], []
    lowered_resume_text = (raw_resume_text or "").lower()

    for jd_skill in jd_skills:
        if any(_same_skill(jd_skill, cand) for cand in candidate_skills):
            matched.append(jd_skill)
            continue
        # Not in the extracted skills list -- but does the keyword show up
        # anywhere in the raw resume text (e.g. buried in a project
        # description that the LLM didn't lift into `skills`)?
        norm_skill = _normalize(jd_skill)
        norm_skill_singular = norm_skill[:-1] if norm_skill.endswith("s") else norm_skill
        if norm_skill and (norm_skill in lowered_resume_text or norm_skill_singular in lowered_resume_text):
            possibly_present.append(jd_skill)
        else:
            missing.append(jd_skill)

    bonus = [
        s
        for s in candidate_skills
        if not any(_same_skill(s, jd_skill) for jd_skill in jd_skills)
    ]
    # de-dupe while preserving order
    bonus = list(dict.fromkeys(bonus))

    total = len(jd_skills) or 1
    coverage = round(100 * len(matched) / total, 1)

    return SkillMatch(
        matched=matched,
        missing=missing,
        possibly_present=possibly_present,
        bonus=bonus,
        coverage_percent=coverage,
    )


_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
    "is", "are", "be", "as", "by", "at", "this", "that", "will", "your",
    "you", "our", "we", "including", "etc", "using", "into",
}


def _keywords(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]{1,}", text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 2}


def keyword_overlap_percent(text_a: str, text_b: str) -> float:
    """Rough token-overlap ratio used for the responsibilities/relevance
    signals. This is intentionally simple (no embeddings dependency) but
    deterministic -- documented as an approximation, not a claim of true
    semantic understanding."""
    kw_a = _keywords(text_a)
    if not kw_a:
        return 0.0
    kw_b = _keywords(text_b)
    overlap = kw_a & kw_b
    return round(100 * len(overlap) / len(kw_a), 1)
