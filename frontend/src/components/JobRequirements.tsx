import type { JobDescription } from "../types/analysis";

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-text-dim">
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-text-faint">{label}</p>
      {children}
    </div>
  );
}

export default function JobRequirements({ job }: { job: JobDescription }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Job Requirements</h2>
      <p className="mt-1 text-sm text-text-faint">What the AI understood from the JD you provided.</p>

      <div className="mt-5 rounded-2xl glass p-6">
        <Row label="Role">
          <p className="text-sm text-text">{job.role || "Not specified"}</p>
        </Row>
        <Row label="Required Skills">
          <div className="flex flex-wrap gap-2">
            {job.required_skills.length ? job.required_skills.map((s) => <Badge key={s}>{s}</Badge>) : <span className="text-sm text-text-faint">None extracted</span>}
          </div>
        </Row>
        <Row label="Preferred Skills">
          <div className="flex flex-wrap gap-2">
            {job.preferred_skills.length ? job.preferred_skills.map((s) => <Badge key={s}>{s}</Badge>) : <span className="text-sm text-text-faint">None extracted</span>}
          </div>
        </Row>
        <Row label="Experience Requirement">
          <p className="text-sm text-text">
            {job.minimum_experience != null ? `${job.minimum_experience} years minimum` : "Not specified"}
          </p>
        </Row>
        <Row label="Education">
          <div className="flex flex-wrap gap-2">
            {job.education_requirements.length ? job.education_requirements.map((s) => <Badge key={s}>{s}</Badge>) : <span className="text-sm text-text-faint">None specified</span>}
          </div>
        </Row>
        <Row label="Key Responsibilities">
          <ul className="list-inside list-disc space-y-1 text-sm text-text-dim">
            {job.responsibilities.length ? job.responsibilities.map((r) => <li key={r}>{r}</li>) : <li className="list-none text-text-faint">None extracted</li>}
          </ul>
        </Row>
      </div>
    </section>
  );
}
