import type { AnalysisResult } from "../types/analysis";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Backend base URL.
// Local: http://localhost:8000
// Production: https://resume-ats-gjff.onrender.com
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function analyzeResume(
  jobDescription: string,
  resumeFile: File,
): Promise<AnalysisResult> {
  const formData = new FormData();

  formData.append("job_description", jobDescription);
  formData.append("resume_file", resumeFile);

  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the analysis server. Check your connection and that the backend is running.",
      0,
    );
  }

  if (!response.ok) {
    let detail = "Something went wrong while analyzing this resume.";

    try {
      const data = await response.json();

      if (data?.detail) {
        detail = data.detail;
      }
    } catch {
      // Response wasn't JSON; keep the generic error message.
    }

    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as AnalysisResult;
}