import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import MockDashboard from "./MockDashboard";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-16 px-6 pb-24 pt-16 lg:flex-row lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex-1 text-center lg:text-left"
      >
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-scan">
          AI-Powered ATS Analysis
        </span>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Is your resume ready
          <br className="hidden lg:block" /> for the <span className="text-gradient">job?</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-text-dim lg:mx-0">
          Upload your resume. Paste the job description. Let AI analyze your match —
          skill by skill, requirement by requirement.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
          <Link
            to="/analyze"
            className="group flex items-center gap-2 rounded-full bg-scan px-7 py-3.5 font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Analyze My Resume
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-medium text-text-dim transition-colors hover:border-border-strong hover:text-text"
          >
            <PlayCircle size={18} />
            See How It Works
          </a>
        </div>
      </motion.div>

      <div className="flex flex-1 justify-center lg:justify-end">
        <MockDashboard />
      </div>
    </section>
  );
}
