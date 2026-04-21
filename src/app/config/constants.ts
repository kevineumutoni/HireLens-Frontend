// src/app/config/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
export const SESSION_WARNING_MS = 1 * 60 * 1000; // warn at 19 minutes

export const BRAND_COLORS = {
  primary: "#2C7CF2",
  primaryDark: "#1a5fd4",
  primaryLight: "#EBF2FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  neutral: "#F8FAFF",
};

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const LANGUAGE_PROFICIENCY = ["Basic", "Conversational", "Fluent", "Native"];
export const AVAILABILITY_STATUS = ["Available", "Open to Opportunities", "Not Available"];
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];