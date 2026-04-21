export type SkillLevel = "Expert" | "Advanced" | "Intermediate" | "Beginner" | string;

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface Availability {
  status?: string;
  type?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
  technologies?: string[];
}

export interface Education {
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  startYear?: string | number;
  endYear?: string | number;
}

export interface ProjectItem {
  name?: string;
  link?: string;
  description?: string;
  technologies?: string[];
}

export interface LanguageItem {
  name?: string;
  proficiency?: string;
}

export interface Certification {
  name?: string;
  issuer?: string;
  issueDate?: string;
}

export interface Candidate {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  headline?: string;
  bio?: string;
  availability?: Availability;
  socialLinks?: SocialLinks;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
  projects?: ProjectItem[];
  languages?: LanguageItem[];
  certifications?: Certification[];
}