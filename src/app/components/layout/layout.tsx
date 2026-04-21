// src/app/app/layout.tsx
"use client";

import { TopNav } from "@/app/components/TopNav";
import { SessionWarning } from "@/app/components/SessionWarning";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <SessionWarning />
        <Toaster position="top-right" />
      </div>
    </ProtectedRoute>
  );
}