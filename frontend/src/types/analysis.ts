export interface JobDescription {
  role: string;
  required_skills: string[];
  preferred_skills: string[];
  minimum_experience: number | null;
  education_requirements: string[];
  responsibilities: string[];
}

export interface Experience {
  company: string | null;
  role: string | null;
  duration: string | null;
  description: string | null;
  skills_used: string[];
}

export interface Resume {
  name: string | null;
  email: string | null;
  phone: string | null;
  total_experience_years: number | null;
  skills: string[];
  experiences: Experience[];
  education: string[];
  projects: string[];
  certifications: string[];
}

export interface SkillMatch {
  matched: string[];
  missing: string[];
  possibly_present: string[];
  bonus: string[];
  coverage_percent: number;
}

export interface CategoryScore {
  label: string;
  weight_percent: number;
  score: number;
  explanation: string;
}

export interface ExperienceMatch {
  required_years: number | null;
  candidate_years: number | null;
  meets_requirement: boolean;
  score: number;
}

export interface EducationMatch {
  required: string[];
  candidate: string[];
  matched: boolean;
  score: number;
}

export interface ATSWarning {
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface RecommendationItem {
  category: string;
  title: string;
  detail: string;
}

export interface BeforeAfterItem {
  before: string;
  after: string;
  note: string;
}

export interface AnalysisResult {
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_phone: string | null;

  overall_score: number;
  verdict: string;
  score_explanation: string;

  breakdown: CategoryScore[];

  required_skills: SkillMatch;
  preferred_skills: SkillMatch;

  experience: ExperienceMatch;
  education: EducationMatch;

  projects: string[];
  certifications: string[];

  warnings: ATSWarning[];
  recommendations: RecommendationItem[];
  before_after: BeforeAfterItem[];

  parsed_job: JobDescription;
  parsed_resume: Resume;

  is_demo?: boolean;
}
