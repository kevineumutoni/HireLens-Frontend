// src/app/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, initializeFromStorage } = useAuthStore();

  useEffect(() => {
    initializeFromStorage();
    
    const checkAuth = () => {
      const { isAuthenticated, isSessionValid } = useAuthStore.getState();
      
      if (!isAuthenticated || !isSessionValid()) {
        router.push("/login");
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}