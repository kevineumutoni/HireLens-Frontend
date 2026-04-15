// src/store/authStore.ts
// Authentication state management with Zustand
// - Persists token in localStorage
// - 5-minute inactivity session timeout
// - Auto-logout on timeout

import { create } from 'zustand';
import { User, AuthState } from '@/app/types';

// ─── Valid credentials (as requested) ─────────────────────────────────────────
const VALID_CREDENTIALS = [
  { email: 'recruiter@umurava.africa', password: 'HireLens2024!', name: 'Alex Recruiter', role: 'recruiter' as const },
  { email: 'admin@umurava.africa', password: 'Admin2024!', name: 'Admin User', role: 'admin' as const },
  { email: 'demo@umurava.africa', password: 'Demo1234!', name: 'Demo Recruiter', role: 'recruiter' as const },
];

// 5 minutes in milliseconds
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

const TOKEN_KEY = 'hirelens_token';
const USER_KEY = 'hirelens_user';
const LAST_ACTIVITY_KEY = 'hirelens_last_activity';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => boolean;
  updateActivity: () => void;
  initializeFromStorage: () => void;
}

// ─── Helper: generate mock JWT-like token ─────────────────────────────────────
function generateToken(email: string): string {
  const payload = btoa(JSON.stringify({ email, iat: Date.now() }));
  return `hl_${payload}_${Math.random().toString(36).slice(2)}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────
let sessionTimer: ReturnType<typeof setTimeout> | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // ─── Login ─────────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 800));

    const match = VALID_CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );

    if (!match) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const user: User = { email: match.email, name: match.name, role: match.role };
    const token = generateToken(email);
    const now = Date.now().toString();

    // Persist to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(LAST_ACTIVITY_KEY, now);

    set({ user, token, isAuthenticated: true });

    // Start session timeout timer
    get().updateActivity();

    return { success: true };
  },

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    if (sessionTimer) {
      clearTimeout(sessionTimer);
      sessionTimer = null;
    }

    set({ user: null, token: null, isAuthenticated: false });
  },

  // ─── Check if session is still valid ───────────────────────────────────────
  checkSession: () => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      // Session expired — auto logout
      get().logout();
      return false;
    }
    return true;
  },

  // ─── Update last activity timestamp (resets timeout) ───────────────────────
  updateActivity: () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    // Reset timer
    if (sessionTimer) clearTimeout(sessionTimer);

    sessionTimer = setTimeout(() => {
      // Auto logout after 5 min of inactivity
      const { isAuthenticated, logout } = get();
      if (isAuthenticated) {
        logout();
        // Redirect to login — we'll dispatch a custom event the router can listen to
        window.dispatchEvent(new CustomEvent('hirelens:session_expired'));
      }
    }, SESSION_TIMEOUT_MS);
  },

  // ─── Restore session from localStorage on app load ─────────────────────────
  initializeFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);

    if (!token || !userRaw) return;

    try {
      const user: User = JSON.parse(userRaw);

      // Check if session is still valid
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) return;

      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT_MS) {
        // Expired — clean up
        get().logout();
        return;
      }

      set({ user, token, isAuthenticated: true });
      get().updateActivity(); // restart the countdown
    } catch {
      get().logout();
    }
  },
}));