import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

function colorForScore(score: number) {
  if (score >= 90) return "var(--color-match)";
  if (score >= 75) return "var(--color-scan)";
  if (score >= 60) return "var(--color-warn)";
  return "var(--color-critical)";
}

export default function ScoreGauge({ score, size = 220, label = "ATS Match Score" }: ScoreGaugeProps) {
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const color = colorForScore(score);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.4, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [score]);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={10}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold" style={{ color }}>
          {display}
        </span>
        <span className="mt-1 text-xs uppercase tracking-widest text-text-dim">{label}</span>
      </div>
    </div>
  );
}
