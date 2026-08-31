import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, PlayCircle } from "lucide-react";
import JDInput from "../components/JDInput";
import ResumeUploader from "../components/ResumeUploader";
import AnalysisLoader from "../components/AnalysisLoader";
import { analyzeResume, ApiError } from "../services/api";
import { useAnalysis } from "../context/AnalysisContext";
import { DEMO_ANALYSIS } from "../data/demoAnalysis";

const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB) || 5;

export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResult } = useAnalysis();
  const navigate = useNavigate();

  const canAnalyze = jobDescription.trim().length >= 50 && !!file;

  const handleAnalyze = async () => {
    if (!canAnalyze || !file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeResume(jobDescription, file);
      setResult(result);
      navigate("/results");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something unexpected went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setResult(DEMO_ANALYSIS);
    navigate("/results");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Let's check your <span className="text-gradient">match</span>
        </h1>
        <p className="mt-3 text-text-dim">
          Paste the job description and upload your resume — takes about 30 seconds.
        </p>
        <button
          type="button"
          onClick={handleDemo}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:border-scan/40 hover:text-scan"
        >
          <PlayCircle size={15} />
          Try Demo (sample JD + resume, no upload needed)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisLoader />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid gap-6 lg:grid-cols-2">
              <JDInput value={jobDescription} onChange={setJobDescription} />
              <ResumeUploader file={file} onChange={setFile} maxSizeMb={MAX_UPLOAD_MB} />
            </div>

            {error && (
              <div className="mx-auto mt-6 flex max-w-2xl items-start gap-2 rounded-xl border border-critical/30 bg-critical/5 p-4 text-sm text-critical">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
                className="flex items-center gap-2 rounded-full bg-scan px-9 py-4 font-display text-base font-semibold text-bg transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Sparkles size={18} />
                Analyze Resume
              </button>
            </div>
            {!canAnalyze && (
              <p className="mt-3 text-center text-xs text-text-faint">
                Add a job description (50+ characters) and upload a resume to continue.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
