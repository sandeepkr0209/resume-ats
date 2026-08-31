import { Info, AlertTriangle, ShieldAlert } from "lucide-react";
import type { ATSWarning } from "../types/analysis";

const CONFIG = {
  info: { icon: Info, classes: "border-scan/30 bg-scan/5 text-scan" },
  warning: { icon: AlertTriangle, classes: "border-warn/30 bg-warn/5 text-warn" },
  critical: { icon: ShieldAlert, classes: "border-critical/30 bg-critical/5 text-critical" },
} as const;

export default function ATSWarnings({ warnings }: { warnings: ATSWarning[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">ATS Compatibility</h2>
      {warnings.length === 0 ? (
        <p className="mt-4 text-sm text-text-dim">No compatibility issues detected.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {warnings.map((w, i) => {
            const { icon: Icon, classes } = CONFIG[w.severity];
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${classes}`}>
                <Icon size={16} className="mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
