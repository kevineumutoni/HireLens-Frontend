// src/app/lib/types.ts
export type AuthUser = {
  email: string;
  name?: string; 
  role: "recruiter" | "admin";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  expiresAt: number;
};

export type JobStatus = "open" | "screening" | "closed";

export type Job = {
  id: string;
  jobId?: string;
  title: string;
  location: string;
  employmentType: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minYearsExperience: number;
  description?: string;
  createdAt: string;
  status: JobStatus;
  applicantCount?: number;
};

export type CandidateShortlistEntry = {
  candidateId: string;
  matchScore: number;
  recommendation: string;
  strengths: string[];
  gaps: string[];
  recruiterNote?: string;
};

export type ScreeningResult = {
  jobId: string;
  generatedAt: string;
  top: CandidateShortlistEntry[];
};