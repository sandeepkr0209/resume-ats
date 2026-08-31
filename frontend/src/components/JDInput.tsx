import { useRef, useState } from "react";
import { ClipboardPaste, X, FileText } from "lucide-react";
import { DEMO_JOB_DESCRIPTION } from "../data/demoAnalysis";

interface JDInputProps {
  value: string;
  onChange: (v: string) => void;
}

export default function JDInput({ value, onChange }: JDInputProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      className={`glass rounded-2xl p-6 transition-colors ${
        focused ? "border-scan/50" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-text-dim">
          <FileText size={16} className="text-scan" />
          Job Description
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 text-text-dim transition-colors hover:text-scan"
          >
            <ClipboardPaste size={13} /> Paste
          </button>
          <button
            type="button"
            onClick={() => onChange(DEMO_JOB_DESCRIPTION)}
            className="text-text-dim transition-colors hover:text-scan"
          >
            Example JD
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 text-text-dim transition-colors hover:text-critical"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Paste the job description here..."
        rows={12}
        className="w-full resize-none rounded-xl border border-border bg-bg-soft p-4 text-sm leading-relaxed text-text placeholder:text-text-faint focus:border-scan focus:outline-none"
      />

      <div className="mt-2 text-right font-mono text-xs text-text-faint">
        {value.length.toLocaleString()} characters
      </div>
    </div>
  );
}
