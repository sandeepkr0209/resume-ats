import { motion } from "framer-motion";
import { UploadCloud, FileSearch, Gauge } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Resume",
    detail: "PDF or DOCX. We read it locally on the server and never store it beyond the analysis.",
  },
  {
    icon: FileSearch,
    title: "Paste Job Description",
    detail: "Drop in any JD. The AI extracts the role, required skills, and responsibilities.",
  },
  {
    icon: Gauge,
    title: "Get Your ATS Score",
    detail: "A transparent, weighted match score plus concrete, honest recommendations.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
        <p className="mt-3 text-text-dim">Three steps. No guesswork.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
            className="relative rounded-2xl glass p-7"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-scan/30 bg-scan/10 text-scan">
              <step.icon size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-dim">{step.detail}</p>
            {i < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border sm:block" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
