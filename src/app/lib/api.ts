// src/app/lib/api.ts

import axios from "axios";
import { API_BASE_URL } from "@/app/config/constants";
import { useAuthStore } from "@/app/store/authStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);


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
  const res = await api.patch(`/api/jobs/${jobId}`, payload);
  return res.data;
}

export async function deleteJobApi(jobId: string) {
  await api.delete(`/api/jobs/${jobId}`);
}

export async function syncCandidatesApi(jobId: string) {
  const res = await api.patch(`/api/jobs/${jobId}/sync-candidates`);
  return res.data;
}

export async function unsyncCandidatesApi(jobId: string) {
  const res = await api.patch(`/api/jobs/${jobId}/unsync-candidates`);
  return res.data;
}


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


export async function triggerScreeningApi(payload: {
  job_id: string;
  candidate_ids?: string[];
  use_all_candidates?: boolean;
}) {
  const res = await api.post("/api/screening", payload, {
    timeout: 15 * 60 * 1000, 
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

export async function deleteScreeningRunApi(runId: string) {
  const res = await api.delete(`/api/screening/${runId}`);
  return res.data;
}

export async function deleteAllScreeningRunsApi() {
  const res = await api.delete("/api/screening");
  return res.data;
}


export async function healthCheckApi() {
  const res = await api.get("/health");
  return res.data;
}