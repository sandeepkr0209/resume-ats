"""
ATS compatibility warnings.

These are all things we can actually determine from the extracted text and
structured data -- no claims about visual formatting, fonts, or layout,
since none of that survives text extraction.
"""
from models.schemas import Resume, SkillMatch, ATSWarning


def build_warnings(resume: Resume, raw_resume_text: str, required_skills: SkillMatch) -> list[ATSWarning]:
    warnings: list[ATSWarning] = []

    if not resume.email:
        warnings.append(ATSWarning(severity="warning", message="No email address was found on the resume."))
    if not resume.phone:
        warnings.append(ATSWarning(severity="info", message="No phone number was found on the resume."))
    if not resume.name:
        warnings.append(ATSWarning(severity="warning", message="Could not confidently identify a candidate name."))

    if not resume.skills:
        warnings.append(ATSWarning(severity="critical", message="No dedicated skills were extracted from the resume."))

    if not resume.experiences and not resume.projects:
        warnings.append(ATSWarning(severity="critical", message="No work experience or projects were found."))

    if not resume.education:
        warnings.append(ATSWarning(severity="info", message="No education section was found."))

    if required_skills.coverage_percent < 30:
        warnings.append(
            ATSWarning(severity="critical", message="Very low keyword coverage against the required skills.")
        )

    word_count = len((raw_resume_text or "").split())
    if word_count > 1200:
        warnings.append(ATSWarning(severity="info", message="Resume text is quite long; consider trimming to the most relevant content."))
    if word_count < 80:
        warnings.append(ATSWarning(severity="warning", message="Very little text could be extracted -- check that the file isn't a scanned image."))

    return warnings
