import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, Sparkles } from "lucide-react";
import type { SkillMatch } from "../types/analysis";

// Tailwind's compiler needs full literal class strings -- interpolated
// `text-${color}` classes get purged, so we map to static strings instead.
const COLOR_CLASSES = {
  match: { text: "text-match", chip: "border-match/30 bg-match/10 text-match" },
  critical: { text: "text-critical", chip: "border-critical/30 bg-critical/10 text-critical" },
  warn: { text: "text-warn", chip: "border-warn/30 bg-warn/10 text-warn" },
  scan: { text: "text-scan", chip: "border-scan/30 bg-scan/10 text-scan" },
} as const;

function SkillGroup({
  title,
  skills,
  icon: Icon,
  color,
}: {
  title: string;
  skills: string[];
  icon: typeof CheckCircle2;
  color: keyof typeof COLOR_CLASSES;
}) {
  if (skills.length === 0) return null;
  const classes = COLOR_CLASSES[color];
  return (
    <div className="rounded-2xl glass p-5">
      <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${classes.text}`}>
        <Icon size={16} />
        {title} ({skills.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className={`rounded-full border px-3 py-1 font-mono text-xs ${classes.chip}`}
          >
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function SkillsAnalysis({
  required,
  preferred,
}: {
  required: SkillMatch;
  preferred: SkillMatch;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Skills Analysis</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <SkillGroup title="Matched Skills" skills={required.matched} icon={CheckCircle2} color="match" />
        <SkillGroup title="Missing Skills" skills={required.missing} icon={XCircle} color="critical" />
        {required.possibly_present.length > 0 && (
          <SkillGroup
            title="Mentioned, Not Listed"
            skills={required.possibly_present}
            icon={HelpCircle}
            color="warn"
          />
        )}
        <SkillGroup title="Bonus Skills" skills={required.bonus} icon={Sparkles} color="scan" />
      </div>

      {preferred.matched.length + preferred.missing.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SkillGroup title="Preferred — Matched" skills={preferred.matched} icon={CheckCircle2} color="match" />
          <SkillGroup title="Preferred — Missing" skills={preferred.missing} icon={XCircle} color="warn" />
        </div>
      )}
    </section>
  );
}
