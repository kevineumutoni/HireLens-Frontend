"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useSessionStore } from "@/app/lib/sessionStore";

export function TopNav() {
  const router = useRouter();
  const { session, isValid, logout } = useSessionStore();

  const onLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand" />
          <div>
            <div className="text-sm font-semibold text-slate-900">HireLens</div>
            <div className="text-xs text-slate-500">Recruiter Dashboard</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link className="text-sm text-slate-700 hover:text-brand" href="/jobs">
            Jobs
          </Link>
          <Link className="text-sm text-slate-700 hover:text-brand" href="/candidates">
            Candidates
          </Link>

          <div className="hidden text-right sm:block">
            <div className="text-xs text-slate-500">{session?.user.email ?? "Not signed in"}</div>
            <div className="text-xs text-slate-400">{isValid() ? "Session active" : "Session expired"}</div>
          </div>

          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}