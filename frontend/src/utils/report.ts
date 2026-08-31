import type { AnalysisResult } from "../types/analysis";

// MVP scope: generates a clean plain-text report client-side. A designed
// PDF export is a reasonable future improvement (see README) but wasn't
// worth pulling in a PDF-rendering dependency for a v1.
export function buildReportText(result: AnalysisResult): string {
  const lines: string[] = [];
  const push = (s: string = "") => lines.push(s);

  push("RESUMEAI — ATS ANALYSIS REPORT");
  push("=".repeat(40));
  push();
  push(`Candidate: ${result.candidate_name || "Unknown"}`);
  if (result.candidate_email) push(`Email: ${result.candidate_email}`);
  if (result.candidate_phone) push(`Phone: ${result.candidate_phone}`);
  push(`Role: ${result.parsed_job.role || "Unspecified"}`);
  push();
  push(`OVERALL SCORE: ${result.overall_score}/100 — ${result.verdict}`);
  push(result.score_explanation);
  push();

  push("SCORE BREAKDOWN");
  push("-".repeat(40));
  result.breakdown.forEach((b) => push(`${b.label} (${b.weight_percent}%): ${b.score}/100`));
  push();

  push("MATCHED SKILLS");
  push("-".repeat(40));
  push(result.required_skills.matched.join(", ") || "None");
  push();

  push("MISSING SKILLS");
  push("-".repeat(40));
  push(result.required_skills.missing.join(", ") || "None");
  push();

  if (result.required_skills.possibly_present.length) {
    push("POSSIBLY PRESENT (mentioned in resume text but not listed as a skill)");
    push("-".repeat(40));
    push(result.required_skills.possibly_present.join(", "));
    push();
  }

  push("EXPERIENCE MATCH");
  push("-".repeat(40));
  push(
    `Required: ${result.experience.required_years ?? "Not specified"} yrs | Candidate: ${
      result.experience.candidate_years ?? "Unknown"
    } yrs | Meets requirement: ${result.experience.meets_requirement ? "Yes" : "No"}`,
  );
  push();

  push("EDUCATION MATCH");
  push("-".repeat(40));
  push(`Required: ${result.education.required.join("; ") || "Not specified"}`);
  push(`Candidate: ${result.education.candidate.join("; ") || "Not specified"}`);
  push();

  push("ATS WARNINGS");
  push("-".repeat(40));
  if (result.warnings.length === 0) push("None");
  else result.warnings.forEach((w) => push(`[${w.severity.toUpperCase()}] ${w.message}`));
  push();

  push("RECOMMENDATIONS");
  push("-".repeat(40));
  result.recommendations.forEach((r, i) => {
    push(`${i + 1}. [${r.category}] ${r.title}`);
    push(`   ${r.detail}`);
  });

  return lines.join("\n");
}

export function downloadReport(result: AnalysisResult) {
  const text = buildReportText(result);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (result.candidate_name || "candidate").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  a.href = url;
  a.download = `resumeai_report_${safeName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
