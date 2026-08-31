# ResumeAI

**Know exactly how well your resume matches the job.**

An AI-powered ATS resume analyzer: paste a job description, upload a resume
(PDF/DOCX), and get a transparent, weighted match score with skill-level
detail and honest, non-fabricated recommendations.

This is a refactor of an existing single-file Python script (JD/resume
extraction + LLM-scored matching, run over a local folder of resumes) into a
FastAPI backend + React frontend, with the scoring logic made deterministic
and reproducible. See [What changed from the original script](#what-changed-from-the-original-script)
for the specifics.

---

## Architecture

```
resume-ats/
├── backend/            FastAPI app
│   ├── main.py         App entrypoint, CORS, global error handler
│   ├── config.py       Env-driven settings + scoring weights
│   ├── api/routes.py   POST /api/analyze, GET /api/health
│   ├── models/         Pydantic schemas (JD, Resume, AnalysisResult, ...)
│   ├── parsers/        PDF / DOCX text extraction
│   └── services/
│       ├── llm_client.py       Groq wrapper: retries, timeout, validated JSON
│       ├── jd_parser.py        LLM: JD -> structured JobDescription
│       ├── resume_parser.py    LLM: resume text -> structured Resume
│       ├── matcher.py          Deterministic skill/keyword matching
│       ├── scorer.py           Deterministic weighted scoring
│       ├── warnings_check.py   ATS compatibility checks
│       ├── recommender.py      LLM: explanations/recommendations (given the
│       │                       already-computed scores -- never asked to
│       │                       invent a number)
│       └── analysis_service.py Orchestrates the full pipeline
│
├── frontend/           React + TypeScript + Vite + Tailwind v4 + Framer Motion
│   └── src/
│       ├── pages/       LandingPage, AnalyzerPage, ResultsPage
│       ├── components/  Hero, ScoreGauge, SkillsAnalysis, Recommendations, ...
│       ├── context/     Session-persisted analysis result
│       ├── services/    API client
│       ├── data/        Demo dataset ("Try Demo" mode, no API call)
│       └── utils/       Client-side report (.txt) generation
│
├── .env.example
└── README.md (this file)
```

**Pipeline per analysis (exactly 3 LLM calls, regardless of resume length):**

```
JD text -----------> [LLM] parse_job_description -> JobDescription
Resume file -> text -> [LLM] parse_resume_text     -> Resume
(JobDescription, Resume) -> deterministic matcher + scorer -> scores
(scores + JD + Resume)  -> [LLM] generate_recommendations -> explanations
```

---

## Scoring methodology

The score is **computed deterministically**, not decided by the LLM. Weights
are configurable via environment variables and must sum to 1.0 (validated at
startup):

| Category | Default weight | How it's computed |
|---|---|---|
| Required Skills Match | 35% | Skill coverage: exact match → synonym table (`ML`↔`Machine Learning`, `JS`↔`JavaScript`, etc.) → fuzzy match for near-typos |
| Experience Match | 20% | `candidate_years / required_years`, capped at 100% |
| Responsibilities Match | 20% | Keyword overlap between JD responsibilities and resume projects/experience descriptions |
| Education Match | 10% | Keyword overlap between required and candidate education strings |
| Preferred Skills Match | 10% | Same matcher as required skills, applied to the preferred-skills list |
| Resume/Keyword Relevance | 5% | Overall keyword overlap between full JD text and full resume text |

The LLM is used only for (a) structured extraction and (b) turning the
already-computed numbers into plain-English explanations and
recommendations — it never invents the score itself, which is what made the
original script's scores inconsistent between runs on the same inputs.

**Honesty guardrails in the recommender:** missing skills are distinguished
from skills that appear somewhere in the resume text but weren't lifted into
the structured skills list ("possibly present"). The recommender is
instructed to never assert the candidate has a skill they don't have
evidence for, and never to fabricate metrics in "before/after" bullet
rewrites.

---

## What changed from the original script

The original script worked, but had a few things fixed/rebuilt during the
refactor:

- `paragraph.text_strip()` doesn't exist on `python-docx` paragraphs (raises
  `AttributeError`) — fixed to `paragraph.text.strip()`.
- `read_resume()` returned `None` for unsupported file types instead of
  raising, which meant `parse_resume(None)` would crash downstream with a
  confusing error — now raises a clear, user-facing message immediately.
- The job description and the `resumes/` folder were hardcoded — the app now
  accepts an arbitrary JD and a single uploaded file per request.
- No timeout/retry around the Groq calls, and `json.loads()` on the raw LLM
  output would crash on malformed JSON — the LLM client now has a timeout,
  retries with backoff on rate limits/transient errors, and retries once
  with the validation error fed back to the model if the JSON doesn't parse
  or match the schema.
- `MatchResult.details: dict` was a free-form, LLM-authored blob — replaced
  with typed sub-models (`SkillMatch`, `CategoryScore`, `ExperienceMatch`,
  `EducationMatch`, ...) so the frontend gets a predictable shape.
- The LLM was asked to invent the entire match score in one shot — replaced
  with the deterministic scorer described above, which is the main reason
  the original could give different scores for the same resume/JD pair on
  different runs.
- `time.sleep(5)` between calls (meant to dodge rate limits in a batch loop)
  is gone — a single request only makes 3 LLM calls, and rate-limit
  handling is now a real retry-with-backoff in `llm_client.py`.
- Uploaded files are written to a temp path per-request and deleted in a
  `finally` block — nothing is persisted beyond the request.

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com)

## Installation & running

### Backend (FastAPI)

**macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env    # then edit .env and set GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

**Windows PowerShell:**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item ..\.env.example .env    # then edit .env and set GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The app is now at `http://localhost:5173`. In dev, Vite proxies `/api/*` to
`http://localhost:8000` (see `frontend/vite.config.ts`), so no extra config
is needed for local development.

### Try it without a Groq key

Click **"Try Demo"** on the analyzer page — it loads a realistic sample
result entirely client-side, no backend call, clearly labeled as demo data.

---

## API

### `POST /api/analyze`

`multipart/form-data`:
- `job_description` (string, required, ≥50 chars)
- `resume_file` (file, required, `.pdf` or `.docx`, ≤`MAX_UPLOAD_SIZE_MB`)

Returns an `AnalysisResult` JSON object (see `backend/models/schemas.py`)
containing the candidate summary, overall score, category breakdown, skill
matches, experience/education match, ATS warnings, recommendations, and the
full parsed JD/resume for transparency.

Error responses use `{"detail": "human-readable message"}` with an
appropriate status code (400 for bad input, 422 for unreadable files, 502
for LLM failures, 500 for anything unexpected) — no stack traces or API keys
are ever exposed to the client.

### `GET /api/health`

Simple liveness check.

---

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Required. Never sent to the frontend. |
| `GROQ_MODEL` | Defaults to `openai/gpt-oss-120b`, same as the original script. |
| `MAX_UPLOAD_SIZE_MB` | Upload size cap (default 5MB). |
| `ALLOWED_ORIGINS` | CORS allowlist for the frontend origin(s). |
| `WEIGHT_*` | Scoring weights — must sum to 1.0. |

---

## Security & privacy notes

- The Groq API key lives only in the backend's environment; it is never
  exposed to the frontend.
- Uploaded resumes are written to a temp file for the duration of a single
  request and deleted immediately after (`finally` block in `routes.py`) —
  nothing is persisted to a database.
- File type and size are validated server-side, not just in the UI.
- CORS is restricted to `ALLOWED_ORIGINS`.

## Limitations (honest, on purpose)

- **Scanned/image-only PDFs aren't supported.** Text extraction requires a
  text layer; OCR wasn't in scope for this MVP.
- **Responsibilities/education/keyword matching use token-overlap, not
  embeddings.** It's deterministic and reasonable, but it's an
  approximation of semantic similarity, not true semantic search. A
  production version could swap in an embedding-based similarity for those
  three categories without changing the rest of the architecture.
- **"Download Report" produces a plain-text file**, not a designed PDF.
  Pulling in a PDF-rendering pipeline felt like over-engineering for a v1;
  it's a natural next step.
- **No auth, database, or persistence layer** — intentionally, per the "MVP
  first" scope. The architecture (clean service boundaries, typed schemas)
  is built to make adding those later straightforward without a rewrite.
- **ATS warnings only cover what's determinable from extracted text** — no
  claims are made about visual formatting, since that information doesn't
  survive text extraction.

## Future improvements

- OCR fallback for scanned PDFs
- Embedding-based semantic matching for responsibilities/keyword scoring
- Server-rendered PDF report export
- Streaming progress over SSE/WebSocket so the loading UI reflects real
  backend stage completion rather than a time-based approximation
- Auth + saved analysis history, once there's a real need for persistence
