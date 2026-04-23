
export interface User {
  email: string;
  name: string;
  role: 'recruiter' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}


export type JobStatus = 'open' | 'screening' | 'closed';

export interface Job {
  _id?: string;
  jobId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  requiredEducation: string;
  softSkills: string[];
  postedDate: string;
  status: JobStatus;
  applicantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  requiredEducation: string;
  softSkills: string[];
}


export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate: string;
}

export interface Availability {
  status: string;
  type: string;
  startDate?: string;
}

export interface TalentProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  availability: Availability;
  socialLinks?: Record<string, string>;
  appliedJobs?: string[];
  createdAt?: string;
}


export interface ScreeningResult {
  candidateId: string;
  jobId: string;
  rank: number;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'No' | 'Manual review';
  reasoning: string;
  explanation: string;
  evaluationStatus: 'success' | 'failed';
  candidate?: TalentProfile;
}

export interface ScreeningRun {
  _id?: string;
  screeningRunId: string;
  job: Job;
  jobId: string;
  total_evaluated: number;
  successful_evaluations: number;
  failed_evaluations: number;
  shortlist: ScreeningResult[];
  timestamp: string;
  status: 'running' | 'completed' | 'failed';
}


export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}


export interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  screeningJobs: number;
  closedJobs: number;
  totalCandidates: number;
  totalScreeningRuns: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'job_created' | 'screening_started' | 'screening_completed' | 'job_closed';
  title: string;
  subtitle: string;
  timestamp: string;
}