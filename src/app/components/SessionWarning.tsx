// src/app/components/SessionWarning.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { SESSION_WARNING_MS } from "@/app/config/constants";
import { Clock, LogOut } from "lucide-react";

export function SessionWarning() {
  const router = useRouter();
  const { getSessionTimeRemaining, updateActivity, logout } = useAuthStore();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // prevents re-opening the modal every second
  const hasShownRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = getSessionTimeRemaining();
      setTimeLeft(Math.max(0, Math.ceil(timeRemaining / 1000)));

      // expired
      if (timeRemaining <= 0) {
        hasShownRef.current = false;
        setShowWarning(false);
        logout();
        router.push("/login");
        return;
      }

      // enter warning zone -> show ONCE
      if (timeRemaining <= SESSION_WARNING_MS) {
        if (!hasShownRef.current) {
          hasShownRef.current = true;
          setShowWarning(true);
        }
      } else {
        // outside warning zone: reset so next time it can show again
        hasShownRef.current = false;
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getSessionTimeRemaining, logout, router]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-900">Session Expiring</h2>
        </div>

        <p className="mb-6 text-sm text-slate-600">
          Your session will expire in{" "}
          <span className="font-bold text-orange-600">{timeLeft} seconds</span>.
          Would you like to stay logged in?
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              updateActivity();
              hasShownRef.current = false; // allow future warnings again
              setShowWarning(false);
            }}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Stay Logged In
          </button>

          <button
            type="button"
            onClick={() => {
              hasShownRef.current = false;
              setShowWarning(false);
              logout();
              router.push("/login");
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}