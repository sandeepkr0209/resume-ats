import { createContext, useContext, useState, type ReactNode } from "react";
import type { AnalysisResult } from "../types/analysis";

const STORAGE_KEY = "resumeai:last-result";

interface AnalysisContextValue {
  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResultState] = useState<AnalysisResult | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AnalysisResult) : null;
    } catch {
      return null;
    }
  });

  const setResult = (r: AnalysisResult | null) => {
    setResultState(r);
    try {
      if (r) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(r));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // sessionStorage unavailable (private mode etc.) -- non-fatal, state
      // just won't survive a hard refresh.
    }
  };

  return (
    <AnalysisContext.Provider value={{ result, setResult }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
