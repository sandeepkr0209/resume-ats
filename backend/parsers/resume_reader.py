from pathlib import Path
from .pdf_parser import read_pdf, ResumeParsingError
from .docx_parser import read_docx

__all__ = ["read_resume", "ResumeParsingError"]


def read_resume(file_path: Path) -> str:
    """
    Dispatch to the right extractor based on file suffix.

    BUG FIX: the original `read_resume` returned `None` for unsupported
    file types instead of raising, which meant a bad upload would silently
    flow into `parse_resume(None)` and crash later with a confusing
    traceback. Here we raise a clear, user-facing error immediately.
    """
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return read_pdf(file_path)
    elif suffix == ".docx":
        return read_docx(file_path)
    else:
        raise ResumeParsingError(
            f"Unsupported file type '{suffix}'. Please upload a PDF or DOCX resume."
        )
