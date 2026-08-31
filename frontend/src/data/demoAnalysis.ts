import type { AnalysisResult } from "../types/analysis";

export const DEMO_JOB_DESCRIPTION = `Data Scientist — Growth Analytics
We're looking for a Data Scientist to join our growth analytics team. You'll build
predictive models, own the full pipeline from data cleaning to deployment, and
communicate findings to non-technical stakeholders.

Requirements: Python, SQL, Machine Learning, Pandas, Scikit-learn, XGBoost, Flask,
REST APIs, Git. Bachelor's degree in Computer Science, Data Science, or a related
field. Preferred: Docker, AWS, A/B testing experience, Tableau.`;

export const DEMO_ANALYSIS: AnalysisResult = {
  candidate_name: "Aditi Sharma",
  candidate_email: "aditi.sharma@example.com",
  candidate_phone: "+91 98XXX XXXXX",

  overall_score: 87,
  verdict: "Strong Match",
  score_explanation:
    "Aditi's resume strongly matches the role's Python, SQL, and machine-learning requirements, and her forecasting project maps closely onto the growth-analytics responsibilities. The main gaps are Docker and AWS, and a couple of skills (Git, REST APIs) show up in her project descriptions but aren't listed explicitly.",

  breakdown: [
    { label: "Required Skills Match", weight_percent: 35, score: 89, explanation: "Strong alignment with the technical requirements." },
    { label: "Experience Match", weight_percent: 20, score: 92, explanation: "Meets the effective experience bar for this level." },
    { label: "Responsibilities Match", weight_percent: 20, score: 81, explanation: "Project work closely mirrors the day-to-day responsibilities." },
    { label: "Education Match", weight_percent: 10, score: 100, explanation: "Degree matches the stated requirement." },
    { label: "Preferred Skills Match", weight_percent: 10, score: 60, explanation: "Some nice-to-haves are present, others aren't." },
    { label: "Resume/Keyword Relevance", weight_percent: 5, score: 78, explanation: "Good overall keyword overlap with the JD." },
  ],

  required_skills: {
    matched: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn", "XGBoost", "Flask"],
    missing: [],
    possibly_present: ["REST APIs", "Git"],
    bonus: ["Prophet", "Isolation Forest", "TensorFlow"],
    coverage_percent: 89,
  },
  preferred_skills: {
    matched: ["A/B testing"],
    missing: ["Docker", "AWS"],
    possibly_present: [],
    bonus: [],
    coverage_percent: 33,
  },

  experience: {
    required_years: 0.5,
    candidate_years: 1,
    meets_requirement: true,
    score: 92,
  },
  education: {
    required: ["Bachelor's degree in Computer Science, Data Science, or related field"],
    candidate: ["B.Tech in Computer Science, 2024"],
    matched: true,
    score: 100,
  },

  projects: [
    "Sales Forecasting Pipeline — Prophet + XGBoost on 400K+ retail transaction rows, deployed via a Flask API",
    "Customer Churn Predictor — scikit-learn model served behind a small Flask app",
  ],
  certifications: ["Data Analytics Virtual Internship — Tata Forage"],

  warnings: [
    { severity: "info", message: "Resume length is within a healthy range for ATS parsing." },
    { severity: "warning", message: "\"Docker\" and \"AWS\" aren't mentioned anywhere in the resume text." },
  ],

  recommendations: [
    {
      category: "Keyword Alignment",
      title: "Make REST APIs and Git explicit",
      detail: "Your Flask project implies REST API and Git usage, but neither term appears in your skills list. If accurate, add them explicitly so ATS keyword scans pick them up.",
    },
    {
      category: "Strengthen Project Description",
      title: "Quantify the churn predictor's impact",
      detail: "The churn project description is currently just a one-liner. Adding what changed as a result (e.g. accuracy achieved, or a decision it informed) would strengthen it, without inventing numbers you don't have.",
    },
    {
      category: "Missing Skill",
      title: "Docker and AWS aren't shown",
      detail: "Both are listed as preferred, not required. If you have any exposure to either (even coursework or a personal project), add it — otherwise, leaving them out honestly is the right call.",
    },
    {
      category: "Preferred Skills",
      title: "Tableau isn't mentioned",
      detail: "The JD lists Tableau as a nice-to-have for stakeholder communication. If you've used any BI/visualization tool (even matplotlib dashboards), consider noting it.",
    },
  ],
  before_after: [
    {
      before: "Worked on a machine learning project for sales forecasting.",
      after: "Built a sales forecasting pipeline (Prophet + XGBoost) processing 400K+ transaction rows, deployed via a Flask REST API.",
      note: "Grounded in details already present in your resume — no invented metrics.",
    },
  ],

  parsed_job: {
    role: "Data Scientist — Growth Analytics",
    required_skills: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn", "XGBoost", "Flask", "REST APIs", "Git"],
    preferred_skills: ["Docker", "AWS", "A/B testing", "Tableau"],
    minimum_experience: 0.5,
    education_requirements: ["Bachelor's degree in Computer Science, Data Science, or related field"],
    responsibilities: [
      "Build predictive models",
      "Own the full pipeline from data cleaning to deployment",
      "Communicate findings to non-technical stakeholders",
    ],
  },
  parsed_resume: {
    name: "Aditi Sharma",
    email: "aditi.sharma@example.com",
    phone: "+91 98XXX XXXXX",
    total_experience_years: 1,
    skills: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn", "XGBoost", "Flask", "Prophet", "Isolation Forest", "TensorFlow", "A/B testing"],
    experiences: [
      {
        company: "Tata Forage (virtual)",
        role: "Data Analytics Intern",
        duration: "4 weeks",
        description: "Built a credit-risk style predictive modeling case study and a stakeholder-ready report.",
        skills_used: ["XGBoost", "SHAP", "Python"],
      },
    ],
    education: ["B.Tech in Computer Science, 2024"],
    projects: [
      "Sales Forecasting Pipeline — Prophet + XGBoost on 400K+ retail transaction rows, deployed via a Flask API",
      "Customer Churn Predictor — scikit-learn model served behind a small Flask app",
    ],
    certifications: ["Data Analytics Virtual Internship — Tata Forage"],
  },

  is_demo: true,
};
