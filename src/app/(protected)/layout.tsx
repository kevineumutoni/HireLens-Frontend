"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../lib/sessionStore";
import { TopNav } from "../components/ui/TopNav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrate, isValid, logout } = useSessionStore();

  useEffect(() => {
    hydrate();
    if (!isValid()) {
      logout();
      router.replace("/login");
    }
  }, [hydrate, isValid, logout, router]);

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}