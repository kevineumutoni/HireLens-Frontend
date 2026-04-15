"use client";

/**
 * Session management
 * - token stored in localStorage
 * - expires after 5 minutes (configurable)
 */
import { create } from "zustand";
import { AuthSession } from "./types";

const STORAGE_KEY = "hirelens_session_v1";
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

type SessionState = {
  session: AuthSession | null;
  hydrate: () => void;
  login: (email: string, token: string) => void;
  logout: () => void;
  isValid: () => boolean;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      set({ session: parsed });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  login: (email, token) => {
    const now = Date.now();
    const session: AuthSession = {
      token,
      user: { email, role: "recruiter" },
      expiresAt: now + SESSION_TTL_MS,
    };
    set({ session });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  logout: () => {
    set({ session: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  isValid: () => {
    const s = get().session;
    if (!s) return false;
    return Date.now() < s.expiresAt;
  },
}));