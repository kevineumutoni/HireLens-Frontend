// src/app/store/authStore.ts
"use client";

import { create } from "zustand";
import { User } from "../types";
import { SESSION_TIMEOUT_MS } from "@/app/config/constants";

const TOKEN_KEY = "hirelens_token";
const USER_KEY = "hirelens_user";
const LAST_ACTIVITY_KEY = "hirelens_last_activity";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionExpiringAt: number | null;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateActivity: () => void;
  initializeFromStorage: () => void;
  isSessionValid: () => boolean;
  getSessionTimeRemaining: () => number;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  sessionExpiringAt: null,

  setAuth: (user: User, token: string) => {
    if (typeof window === "undefined") return;

    const now = Date.now();

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

    set({
      user,
      token,
      isAuthenticated: true,
      sessionExpiringAt: now + SESSION_TIMEOUT_MS,
    });
  },

  logout: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpiringAt: null,
    });
  },

  updateActivity: () => {
    if (typeof window === "undefined") return;

    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    set({ sessionExpiringAt: now + SESSION_TIMEOUT_MS });
  },

  isSessionValid: () => {
    if (typeof window === "undefined") return false;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed < SESSION_TIMEOUT_MS;
  },

  getSessionTimeRemaining: () => {
    const { sessionExpiringAt } = get();
    if (!sessionExpiringAt) return 0;
    return Math.max(0, sessionExpiringAt - Date.now());
  },

  initializeFromStorage: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!token || !userRaw || !lastActivity) return;

    const last = parseInt(lastActivity, 10);
    const elapsed = Date.now() - last;

    if (elapsed > SESSION_TIMEOUT_MS) {
      get().logout();
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      set({
        user,
        token,
        isAuthenticated: true,
        sessionExpiringAt: last + SESSION_TIMEOUT_MS, // use stored last activity time
      });
    } catch {
      get().logout();
    }
  },
}));