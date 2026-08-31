from pathlib import Path
from pypdf import PdfReader
from pypdf.errors import PdfReadError


class ResumeParsingError(Exception):
    """Raised when a resume file can't be read/extracted."""


def read_pdf(file_path: Path) -> str:
    try:
        reader = PdfReader(str(file_path))
    except (PdfReadError, FileNotFoundError, OSError) as exc:
        raise ResumeParsingError(
            "Unable to open this PDF. It may be corrupted or password-protected."
        ) from exc

    if getattr(reader, "is_encrypted", False):
        # Try an empty-password decrypt (common for "restricted" but not
        # truly locked PDFs); if that fails, surface a clear error.
        try:
            reader.decrypt("")
        except Exception as exc:
            raise ResumeParsingError(
                "This PDF is password-protected. Please upload an unlocked file."
            ) from exc

    text = ""
    for page in reader.pages:
        try:
            page_text = page.extract_text()
        except Exception:
            page_text = None
        if page_text:
            text += page_text + "\n"

    if not text.strip():
        raise ResumeParsingError(
            "Unable to read this resume. Please make sure the PDF contains "
            "selectable text (scanned/image-only PDFs aren't supported yet)."
        )
    return text
