// src/app/lib/api.ts

import axios from "axios";
import { API_BASE_URL } from "@/app/config/constants";
import { useAuthStore } from "@/app/store/authStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export async function signupApi(firstName: string, lastName: string, email: string, password: string) {
  const res = await api.post("/api/auth/signup", { firstName, lastName, email, password });
  return res.data;
}

export async function signinApi(email: string, password: string) {
  const res = await api.post("/api/auth/signin", { email, password });
  return res.data;
}

// ==================== JOBS ====================

export async function listJobsApi(skip = 0, limit = 100) {
  // ✅ axios -> uses API_BASE_URL (FastAPI), not Next.js
  const res = await api.get("/api/jobs", { params: { skip, limit } });
  return res.data;
}

export async function getJobApi(jobId: string) {
  const res = await api.get(`/api/jobs/${jobId}`);
  return res.data;
}

export async function createJobApi(payload: any) {
  const res = await api.post("/api/jobs", payload);
  return res.data;
}

export async function updateJobApi(jobId: string, payload: any) {
  const res = await api.put(`/api/jobs/${jobId}`, payload);
  return res.data;
}

export async function deleteJobApi(jobId: string) {
  await api.delete(`/api/jobs/${jobId}`);
}

// Optional: endpoints used by your "Use all candidates" toggle (if you added it)
export async function syncCandidatesApi(jobId: string) {
  const res = await api.patch(`/api/jobs/${jobId}/sync-candidates`);
  return res.data;
}

export async function unsyncCandidatesApi(jobId: string) {
  const res = await api.patch(`/api/jobs/${jobId}/unsync-candidates`);
  return res.data;
}

// ==================== CANDIDATES ====================

export async function listCandidatesApi(skip = 0, limit = 10, search?: string) {
  const params: any = { skip, limit };
  if (search) params.search = search;
  const res = await api.get("/api/candidates", { params });
  return res.data;
}

export async function getCandidateApi(candidateId: string) {
  const res = await api.get(`/api/candidates/${candidateId}`);
  return res.data;
}

export async function uploadCandidatesApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/candidates/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteCandidateApi(candidateId: string) {
  await api.delete(`/api/candidates/${candidateId}`);
}

// ==================== SCREENING ====================

// Trigger a new screening run (calls Gemini on the backend)
export async function triggerScreeningApi(payload: {
  job_id: string;
  candidate_ids?: string[];
  use_all_candidates?: boolean;
}) {
  // Screening can take a long time (many Gemini calls)
  const res = await api.post("/api/screening", payload, {
    timeout: 15 * 60 * 1000, // 10 minutes
  });
  return res.data;
}

export async function listScreeningResultsApi(skip = 0, limit = 10, jobId?: string) {
  const params: any = { skip, limit };
  if (jobId) params.job_id = jobId;
  const res = await api.get("/api/screening", { params });
  return res.data;
}

export async function getScreeningResultApi(runId: string) {
  const res = await api.get(`/api/screening/${runId}`);
  return res.data;
}

// ==================== HEALTH ====================

export async function healthCheckApi() {
  const res = await api.get("/health");
  return res.data;
}