import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileCheck2, X, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  file: File | null;
  onChange: (f: File | null) => void;
  maxSizeMb?: number;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumeUploader({ file, onChange, maxSizeMb = 5 }: ResumeUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (f: File | undefined | null) => {
      if (!f) return;
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file type "${ext}". Please upload a PDF or DOCX.`);
        return;
      }
      if (f.size > maxSizeMb * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        return;
      }
      setError(null);
      onChange(f);
    },
    [maxSizeMb, onChange],
  );

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-text-dim">
        <UploadCloud size={16} className="text-scan" />
        Resume Upload
      </div>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              validateAndSet(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-scan bg-scan/5" : "border-border hover:border-border-strong"
            }`}
          >
            <UploadCloud
              size={36}
              className={`mb-3 transition-colors ${dragOver ? "text-scan" : "text-text-faint"}`}
            />
            <p className="font-medium text-text">Drop your resume here</p>
            <p className="mt-1 text-sm text-text-dim">or click to browse files</p>
            <p className="mt-3 font-mono text-xs text-text-faint">Supports PDF, DOCX · max {maxSizeMb}MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files?.[0])}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center justify-between rounded-xl border border-match/30 bg-match/5 p-5"
          >
            <div className="flex items-center gap-3">
              <FileCheck2 size={22} className="text-match" />
              <div>
                <p className="text-sm font-medium text-text">{file.name}</p>
                <p className="font-mono text-xs text-text-dim">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full p-1.5 text-text-dim transition-colors hover:bg-critical/10 hover:text-critical"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-critical">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
