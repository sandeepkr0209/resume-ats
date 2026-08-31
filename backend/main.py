import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from api.routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resumeai")

app = FastAPI(
    title="ResumeAI API",
    description="AI-powered ATS resume analyzer backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Belt-and-braces: never leak stack traces / internals to the client.
    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.get("/")
async def root():
    return {"service": "ResumeAI API", "status": "running", "docs": "/docs"}
