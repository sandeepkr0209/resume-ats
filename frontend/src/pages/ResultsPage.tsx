import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, RotateCcw, FileEdit } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { downloadReport } from "../utils/report";
import ScoreHero from "../components/ScoreHero";
import ScoreBreakdown from "../components/ScoreBreakdown";
import SkillsAnalysis from "../components/SkillsAnalysis";
import JobRequirements from "../components/JobRequirements";
import ResumeInsights from "../components/ResumeInsights";
import Recommendations from "../components/Recommendations";
import ATSWarnings from "../components/ATSWarnings";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ResultsPage() {
  const { result } = useAnalysis();
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
        <h1 className="font-display text-2xl font-semibold">No analysis yet</h1>
        <p className="mt-3 text-text-dim">
          Run an analysis first, or try the demo, to see a results dashboard here.
        </p>
        <button
          onClick={() => navigate("/analyze")}
          className="mt-6 rounded-full bg-scan px-6 py-3 font-semibold text-bg"
        >
          Go to Analyzer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-14 px-6 py-14">
      <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
        <ScoreHero result={result} />
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        <button
          onClick={() => downloadReport(result)}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:border-scan/40 hover:text-scan"
        >
          <Download size={14} /> Download Report
        </button>
        <button
          onClick={() => navigate("/analyze")}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:border-scan/40 hover:text-scan"
        >
          <FileEdit size={14} /> Analyze Another
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:text-text"
        >
          <RotateCcw size={14} /> Start Over
        </button>
      </div>

      {[
        <ScoreBreakdown breakdown={result.breakdown} />,
        <SkillsAnalysis required={result.required_skills} preferred={result.preferred_skills} />,
        <JobRequirements job={result.parsed_job} />,
        <ResumeInsights resume={result.parsed_resume} />,
        <Recommendations recommendations={result.recommendations} beforeAfter={result.before_after} />,
        <ATSWarnings warnings={result.warnings} />,
      ].map((node, i) => (
        <motion.div
          key={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={sectionVariants}
          transition={{ duration: 0.5 }}
        >
          {node}
        </motion.div>
      ))}
    </div>
  );
}
