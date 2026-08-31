import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { RecommendationItem, BeforeAfterItem } from "../types/analysis";

export default function Recommendations({
  recommendations,
  beforeAfter,
}: {
  recommendations: RecommendationItem[];
  beforeAfter: BeforeAfterItem[];
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">How to Improve Your Score</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl glass p-5"
          >
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb size={15} className="text-scan" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-text-faint">
                {rec.category}
              </span>
            </div>
            <p className="font-medium text-text">{rec.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{rec.detail}</p>
          </motion.div>
        ))}
      </div>

      {beforeAfter.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-display text-lg font-semibold">Before → After</h3>
          <div className="space-y-4">
            {beforeAfter.map((item, i) => (
              <div key={i} className="grid gap-3 rounded-2xl glass p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-critical">Before</p>
                  <p className="text-sm text-text-dim">{item.before}</p>
                </div>
                <ArrowRight size={18} className="mx-auto hidden text-text-faint sm:block" />
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-match">After</p>
                  <p className="text-sm text-text">{item.after}</p>
                </div>
                {item.note && <p className="text-xs italic text-text-faint sm:col-span-3">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
