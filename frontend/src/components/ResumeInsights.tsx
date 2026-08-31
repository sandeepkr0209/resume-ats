import { motion } from "framer-motion";
import { Briefcase, GraduationCap, FolderGit2, Award } from "lucide-react";
import type { Resume } from "../types/analysis";

export default function ResumeInsights({ resume }: { resume: Resume }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Resume Insights</h2>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl glass p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-scan">
            <Briefcase size={16} /> Experience Timeline
          </div>
          {resume.experiences.length === 0 ? (
            <p className="text-sm text-text-faint">No experience entries extracted.</p>
          ) : (
            <div className="space-y-5 border-l border-border pl-5">
              {resume.experiences.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-scan" />
                  <p className="text-sm font-medium text-text">
                    {exp.role || "Role"} {exp.company && <span className="text-text-dim">· {exp.company}</span>}
                  </p>
                  {exp.duration && <p className="font-mono text-xs text-text-faint">{exp.duration}</p>}
                  {exp.description && <p className="mt-1 text-sm text-text-dim">{exp.description}</p>}
                  {exp.skills_used.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exp.skills_used.map((s) => (
                        <span key={s} className="rounded-full bg-surface px-2 py-0.5 font-mono text-[11px] text-text-dim">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl glass p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-match">
              <GraduationCap size={16} /> Education
            </div>
            {resume.education.length ? (
              <ul className="space-y-1 text-sm text-text-dim">
                {resume.education.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-faint">None extracted.</p>
            )}
          </div>

          <div className="rounded-2xl glass p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-warn">
              <FolderGit2 size={16} /> Projects
            </div>
            {resume.projects.length ? (
              <ul className="space-y-1.5 text-sm text-text-dim">
                {resume.projects.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-faint">None extracted.</p>
            )}
          </div>

          <div className="rounded-2xl glass p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-scan">
              <Award size={16} /> Certifications
            </div>
            {resume.certifications.length ? (
              <ul className="space-y-1 text-sm text-text-dim">
                {resume.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-faint">None extracted.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
