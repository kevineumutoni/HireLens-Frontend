"use client";

import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { SessionWarning } from "@/app/components/SessionWarning";
import { Toaster } from "react-hot-toast";
import { AppShell } from "@/app/components/layout/AppShell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
        <SessionWarning />
        <Toaster position="top-right" />
      </AppShell>
    </ProtectedRoute>
  );
}