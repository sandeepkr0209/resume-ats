import { motion } from "framer-motion";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import ScoreGauge from "./ScoreGauge";

export default function MockDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-sm rounded-2xl glass p-6 shadow-2xl shadow-black/40"
    >
      <div className="scan-line" />
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-text-dim">
          scan_result.json
        </span>
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-match" />
      </div>

      <div className="flex justify-center">
        <ScoreGauge score={87} size={160} />
      </div>

      <div className="mt-6 space-y-3 font-mono text-sm">
        <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
          <span className="flex items-center gap-2 text-text-dim">
            <CheckCircle2 size={14} className="text-match" /> Matching Skills
          </span>
          <span className="text-text">18 / 21</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
          <span className="flex items-center gap-2 text-text-dim">
            <XCircle size={14} className="text-critical" /> Missing Skills
          </span>
          <span className="text-text">3</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
          <span className="flex items-center gap-2 text-text-dim">
            <TrendingUp size={14} className="text-scan" /> Experience Match
          </span>
          <span className="text-text">92%</span>
        </div>
      </div>
    </motion.div>
  );
}
