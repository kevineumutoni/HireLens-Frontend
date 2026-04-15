// Centralized types (DRY). Adjust later to match backend exactly.

export type AuthUser = {
  email: string;
  role: "recruiter" | "admin";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  // Epoch millis when session expires
  expiresAt: number;
};

export type JobStatus = "open" | "screening" | "closed";

export type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minYearsExperience: number;
  createdAt: string; // ISO string
  status: JobStatus;
  applicantsCount: number;
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