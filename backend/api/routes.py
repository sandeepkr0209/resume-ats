import logging
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from config import settings
from models.schemas import AnalysisResult
from parsers.pdf_parser import ResumeParsingError
from services.analysis_service import run_analysis
from services.llm_client import LLMError

logger = logging.getLogger("resumeai.api")
router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
):
    # --- Validate JD ---
    if not job_description or not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    if len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="That job description looks too short to analyze meaningfully. Please paste the full JD.",
        )

    # --- Validate file ---
    if not resume_file.filename:
        raise HTTPException(status_code=400, detail="No resume file was uploaded.")

    suffix = Path(resume_file.filename).suffix.lower()
    if suffix not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Please upload a PDF or DOCX resume.",
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await resume_file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # --- Persist to a temp file, process, then always clean up ---
    upload_dir = Path(settings.TEMP_UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    temp_path = upload_dir / f"{uuid.uuid4().hex}{suffix}"

    try:
        with open(temp_path, "wb") as f:
            f.write(contents)

        result = run_analysis(job_description, temp_path)
        return result

    except ResumeParsingError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while analyzing this resume. Please try again.",
        )
    finally:
        # Never retain uploaded resumes on disk longer than the request.
        temp_path.unlink(missing_ok=True)
