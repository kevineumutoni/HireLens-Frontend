"use client";

import axios from "axios";
import { useSessionStore } from "./sessionStore";
import { Job, ScreeningResult } from "./types";

/**
 * API layer:
 * - Uses NEXT_PUBLIC_API_BASE_URL
 * - Adds Authorization header from session token
 * - Optional mock mode for local UI testing without backend
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK_API || "false") === "true";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const { session, isValid, logout } = useSessionStore.getState();
  if (session?.token) {
    // If session expired, log out before sending request
    if (!isValid()) {
      logout();
      throw new axios.Cancel("Session expired");
    }
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

/* ---------------- MOCKS (for UI testing) ---------------- */

const nowIso = () => new Date().toISOString();

let mockJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Backend Engineer - AI Systems",
    location: "Kigali, Rwanda",
    employmentType: "Full-time",
    requiredSkills: ["Node.js", "Python", "REST API", "Database Design"],
    preferredSkills: ["Gemini API", "AWS", "Docker"],
    minYearsExperience: 3,
    createdAt: nowIso(),
    status: "open",
    applicantsCount: 50,
  },
];

export async function loginApi(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    // Demo credentials; adjust as you like
    if (email === "recruiter@hirelens.ai" && password === "Password@123") {
      return { token: "mock-token-123" };
    }
    throw new Error("Invalid email or password");
  }

  // Example: backend route
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function listJobsApi(): Promise<Job[]> {
  if (USE_MOCK) return mockJobs;
  const res = await api.get("/jobs");
  return res.data;
}

export async function createJobApi(payload: Omit<Job, "id" | "createdAt" | "status" | "applicantsCount">): Promise<Job> {
  if (USE_MOCK) {
    const job: Job = {
      ...payload,
      id: `JOB-${String(mockJobs.length + 1).padStart(3, "0")}`,
      createdAt: nowIso(),
      status: "open",
      applicantsCount: 0,
    };
    mockJobs = [job, ...mockJobs];
    return job;
  }

  const res = await api.post("/jobs", payload);
  return res.data;
}

export async function updateJobApi(jobId: string, payload: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    mockJobs = mockJobs.map((j) => (j.id === jobId ? { ...j, ...payload } : j));
    const updated = mockJobs.find((j) => j.id === jobId)!;
    return updated;
  }

  const res = await api.patch(`/jobs/${jobId}`, payload);
  return res.data;
}

export async function deleteJobApi(jobId: string): Promise<void> {
  if (USE_MOCK) {
    mockJobs = mockJobs.filter((j) => j.id !== jobId);
    return;
  }
  await api.delete(`/jobs/${jobId}`);
}

export async function screenJobApi(jobId: string): Promise<ScreeningResult> {
  if (USE_MOCK) {
    // Fake shortlist
    return {
      jobId,
      generatedAt: nowIso(),
      top: [
        {
          candidateId: "Emmanuel_Gitonga",
          matchScore: 92,
          recommendation: "Strong Yes",
          strengths: ["Strong backend skills", "AWS + Docker experience"],
          gaps: ["Gemini API exposure not explicit"],
          recruiterNote: "Strong fit overall; verify AI orchestration exposure.",
        },
      ],
    };
  }

  const res = await api.post(`/jobs/${jobId}/screen`);
  return res.data;
}