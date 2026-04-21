"use client";

// ============================================================
// AppShell — UI overhaul. Functional code untouched.
// Colors: #2C7CF2 + white only.
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, BarChart3, LogOut, Sparkles } from "lucide-react";
import { LensLogo } from "@/app/components/LensLogo";
import { useAuthStore } from "@/app/store/authStore";

// ── unchanged constants ────────────────────────────────────────
const BRAND = "#2C7CF2";

const nav = [
  { href: "/dashboard", label: "Home",       icon: LayoutDashboard },
  { href: "/jobs",      label: "Jobs",        icon: Briefcase       },
  { href: "/candidates",label: "Candidates",  icon: Users           },
  { href: "/screening", label: "Screening",   icon: BarChart3       },
];
// ──────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();   // unchanged

  // Avatar initials from email
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "HL";

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "#F0F4FF",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          margin: "0 auto",
          maxWidth: 1400,
          display: "flex",
          gap: 20,
          padding: "20px 20px",
        }}>

          {/* ══════════════════════════════════════════════════
              SIDEBAR — desktop only
          ══════════════════════════════════════════════════ */}
          <aside style={{
            width: 248,
            flexShrink: 0,
            display: "none",   // overridden by .hl-sidebar media query below
          }} className="hl-sidebar">
            <div style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 20,
              padding: "20px 14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "sticky",
              top: 20,
            }}>

              {/* ── Logo ───────────────────────────────────── */}
              <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 16px" }}>
                <LensLogo size={34} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    HireLens
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
                    Recruiter Console
                  </div>
                </div>
              </Link>

              {/* ── Divider ────────────────────────────────── */}
              <div style={{ height: 1, background: "#F1F5F9", margin: "0 4px 14px" }} />

              {/* ── Nav label ──────────────────────────────── */}
              <p style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.09em", padding: "0 10px", margin: "0 0 6px" }}>
                Menu
              </p>

              {/* ── Nav items ──────────────────────────────── */}
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {nav.map((item) => {
                  const Icon  = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 11,
                        textDecoration: "none",
                        fontSize: 13.5,
                        fontWeight: active ? 700 : 500,
                        color: active ? BRAND : "#475569",
                        background: active ? "rgba(44,124,242,0.08)" : "transparent",
                        transition: "background 0.15s, color 0.15s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "#F8FAFF";
                          (e.currentTarget as HTMLElement).style.color = "#0F172A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "#475569";
                        }
                      }}
                    >
                      {/* Active left bar */}
                      {active && (
                        <span style={{
                          position: "absolute",
                          left: 0, top: "18%", bottom: "18%",
                          width: 3, borderRadius: 99,
                          background: BRAND,
                        }} />
                      )}

                      {/* Icon box */}
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: active ? "rgba(44,124,242,0.12)" : "#F1F5F9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.15s",
                      }}>
                        <Icon size={14} color={active ? BRAND : "#64748B"} />
                      </span>

                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* ── AI badge ───────────────────────────────── */}
              <div style={{
                margin: "18px 4px 0",
                padding: "12px 14px",
                background: "linear-gradient(135deg, rgba(44,124,242,0.07) 0%, rgba(99,102,241,0.07) 100%)",
                border: "1px solid rgba(44,124,242,0.15)",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Sparkles size={13} color={BRAND} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: BRAND }}>AI Screening</span>
                </div>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0, lineHeight: 1.55 }}>
                  Gemini AI ranks your candidates in seconds with full explainability.
                </p>
              </div>

              {/* ── Spacer ─────────────────────────────────── */}
              <div style={{ flex: 1, minHeight: 20 }} />

              {/* ── Divider ────────────────────────────────── */}
              <div style={{ height: 1, background: "#F1F5F9", margin: "16px 4px 14px" }} />

              {/* ── User card ──────────────────────────────── */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                borderRadius: 12,
                background: "#F8FAFF",
                border: "1px solid #E2E8F0",
                marginBottom: 8,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: BRAND,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Signed in as</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: "#0F172A",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {user?.email ?? "—"}
                  </div>
                </div>
              </div>

              {/* ── Logout ─────────────────────────────────── */}
              <button
                type="button"
                onClick={logout}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "9px 14px",
                  borderRadius: 11,
                  border: "1px solid #FEE2E2",
                  background: "#FFF5F5",
                  color: "#EF4444",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#FEE2E2";
                  (e.currentTarget as HTMLElement).style.borderColor = "#FCA5A5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#FFF5F5";
                  (e.currentTarget as HTMLElement).style.borderColor = "#FEE2E2";
                }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </aside>

          {/* ══════════════════════════════════════════════════
              MAIN CONTENT
          ══════════════════════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* ── Mobile top bar ─────────────────────────── */}
            <div style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "10px 16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }} className="hl-mobile-bar">
              <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <LensLogo size={28} />
                <span style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>HireLens</span>
              </Link>

              {/* Mobile nav pills */}
              <div style={{ display: "flex", gap: 4 }}>
                {nav.map((item) => {
                  const Icon   = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: active ? "rgba(44,124,242,0.10)" : "transparent",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      title={item.label}
                    >
                      <Icon size={16} color={active ? BRAND : "#94A3B8"} />
                    </Link>
                  );
                })}

                {/* Mobile logout */}
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  title="Sign out"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FFF5F5")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <LogOut size={15} color="#EF4444" />
                </button>
              </div>
            </div>

            {/* Page content */}
            {children}
          </main>
        </div>
      </div>

      {/* ── Responsive rules ──────────────────────────────── */}
      <style>{`
        .hl-sidebar       { display: none !important; }
        .hl-mobile-bar    { display: flex !important; }

        @media (min-width: 1024px) {
          .hl-sidebar    { display: block !important; }
          .hl-mobile-bar { display: none  !important; }
        }

        * { box-sizing: border-box; }
        a { text-decoration: none; }
      `}</style>
    </>
  );
}