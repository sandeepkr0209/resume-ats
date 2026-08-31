import { motion } from "framer-motion";
import type { AnalysisResult } from "../types/analysis";
import ScoreGauge from "./ScoreGauge";

const VERDICT_STYLES: Record<string, string> = {
  "Excellent Match": "text-match border-match/40 bg-match/10",
  "Strong Match": "text-scan border-scan/40 bg-scan/10",
  "Moderate Match": "text-warn border-warn/40 bg-warn/10",
  "Needs Improvement": "text-critical border-critical/40 bg-critical/10",
};

export default function ScoreHero({ result }: { result: AnalysisResult }) {
  const verdictClass = VERDICT_STYLES[result.verdict] || VERDICT_STYLES["Moderate Match"];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12"
    >
      {result.is_demo && (
        <span className="absolute right-6 top-6 rounded-full border border-warn/40 bg-warn/10 px-3 py-1 font-mono text-xs text-warn">
          DEMO DATA
        </span>
      )}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-text-dim">
            {result.candidate_name || "Candidate"} · {result.parsed_job.role || "Target Role"}
          </p>
          <span
            className={`mt-3 inline-block rounded-full border px-4 py-1.5 font-display text-sm font-semibold ${verdictClass}`}
          >
            {result.verdict}
          </span>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-dim">
            {result.score_explanation}
          </p>
        </div>
        <ScoreGauge score={result.overall_score} size={200} />
      </div>
    </motion.section>
  );
}
