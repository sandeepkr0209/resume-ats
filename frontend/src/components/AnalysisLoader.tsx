import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

const STAGES = [
  { label: "Parsing job description...", detail: "Extracting role, skills & requirements" },
  { label: "Reading resume...", detail: "Extracting experience, education & projects" },
  { label: "Analyzing skills...", detail: "Comparing candidate against requirements" },
  { label: "Calculating ATS score...", detail: "Weighted scoring across categories" },
  { label: "Generating recommendations...", detail: "Turning gaps into actionable advice" },
];

// This mirrors the backend's real pipeline order (see analysis_service.py),
// but since the API returns one response rather than streaming progress,
// stage advancement here is time-based, not a fabricated percentage. It
// settles on the final stage until the actual request resolves.
export default function AnalysisLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return;
    const timer = setTimeout(() => setStageIndex((i) => i + 1), 1800);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  return (
    <div className="mx-auto max-w-md rounded-2xl glass p-8">
      <div className="relative mb-6 flex justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-scan/30 bg-scan/10">
          <Loader2 size={26} className="animate-spin text-scan" />
        </div>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, i) => {
          const done = i < stageIndex;
          const active = i === stageIndex;
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stageIndex ? 1 : 0.35, x: 0 }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5">
                {done ? (
                  <CheckCircle2 size={16} className="text-match" />
                ) : active ? (
                  <Loader2 size={16} className="animate-spin text-scan" />
                ) : (
                  <span className="block h-4 w-4 rounded-full border border-border" />
                )}
              </span>
              <div>
                <p className={`text-sm font-medium ${active ? "text-text" : "text-text-dim"}`}>
                  {stage.label}
                </p>
                <p className="text-xs text-text-faint">{stage.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
