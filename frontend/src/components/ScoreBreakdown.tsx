import { motion } from "framer-motion";
import type { CategoryScore } from "../types/analysis";

function barColor(score: number) {
  if (score >= 90) return "bg-match";
  if (score >= 75) return "bg-scan";
  if (score >= 60) return "bg-warn";
  return "bg-critical";
}

export default function ScoreBreakdown({ breakdown }: { breakdown: CategoryScore[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Score Breakdown</h2>
      <div className="mt-5 space-y-5 rounded-2xl glass p-6">
        {breakdown.map((item, i) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-text">
                {item.label}{" "}
                <span className="font-mono text-xs text-text-faint">({item.weight_percent}% weight)</span>
              </span>
              <span className="font-mono text-text-dim">{item.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                className={`h-full rounded-full ${barColor(item.score)}`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
