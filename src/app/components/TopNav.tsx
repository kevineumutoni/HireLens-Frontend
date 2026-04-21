// src/app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { LensLogo } from "./LensLogo";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, updateActivity } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <LensLogo size={32} />
            <div>
              <div className="text-sm font-bold text-slate-900">HireLens</div>
              <div className="text-xs text-slate-500">Talent Screening</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/jobs"
              onClick={() => updateActivity()}
              className={`text-sm font-medium transition ${
                isActive("/jobs")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Jobs
            </Link>
            <Link
              href="/candidates"
              onClick={() => updateActivity()}
              className={`text-sm font-medium transition ${
                isActive("/candidates")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Candidates
            </Link>
            <Link
              href="/screening"
              onClick={() => updateActivity()}
              className={`text-sm font-medium transition ${
                isActive("/screening")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Results
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs text-slate-500">Logged in as</div>
              <div className="text-sm font-medium text-slate-900">{user?.email}</div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-slate-600"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-slate-200 py-2 md:hidden">
            <Link
              href="/jobs"
              className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              Jobs
            </Link>
            <Link
              href="/candidates"
              className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              Candidates
            </Link>
            <Link
              href="/screening"
              className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              Results
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}