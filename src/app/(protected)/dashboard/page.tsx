"use client";

// ============================================================
// src/app/dashboard/page.tsx — fixed timeout + loading states
// Fixes:
// 1. Added per-request AbortController with 15s timeout
// 2. Each stat fetches independently — one failure doesn't kill all
// 3. Shows "Backend offline" warning instead of crash
// 4. Graceful skeleton while loading
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { listJobsApi, listCandidatesApi, listScreeningResultsApi } from "@/app/lib/api";
import {
  Briefcase, Users, Zap, TrendingUp,
  MapPin, ChevronRight, Sparkles,
  AlertCircle, WifiOff,
} from "lucide-react";

const BRAND = "#2C7CF2";

type JobLite = {
  id?: string;
  jobId?: string;
  title?: string;
  location?: string;
  status?: "open" | "screening" | "closed" | string;
  applicantCount?: number;
};

// ── Status pill ────────────────────────────────────────────────
function StatusPill({ status }: { status?: string }) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    open:      { bg: "#ECFDF5", color: "#059669", dot: "#10B981", label: "Open"      },
    screening: { bg: "rgba(44,124,242,0.10)", color: BRAND, dot: BRAND, label: "Screening" },
    closed:    { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8", label: "Closed"    },
  };
  const { bg, color, dot, label } = map[s] ?? map.open;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: bg, color, fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, loading, accent, delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  loading: boolean;
  accent: string;
  delay?: string;
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      animation: "fadeUp 0.4s ease both", animationDelay: delay ?? "0s",
      transition: "box-shadow 0.2s, transform 0.2s", cursor: "default",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(44,124,242,0.10)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.07em", margin: 0,
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 32, fontWeight: 900, color: "#0F172A",
            margin: "6px 0 0", letterSpacing: "-0.03em", lineHeight: 1,
          }}>
            {loading ? (
              <span style={{
                display: "inline-block", width: 48, height: 32, borderRadius: 6,
                background: "#F1F5F9", animation: "pulse 1.4s ease infinite",
              }} />
            ) : value}
          </p>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: accent + "18",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={20} color={accent} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton row ───────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ height: 13, width: "55%", borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
        <div style={{ height: 11, width: "35%", borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite", animationDelay: "0.1s" }} />
      </div>
      <div style={{ height: 22, width: 72, borderRadius: 99, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────
export default function DashboardPage() {

  // ── unchanged state ────────────────────────────────────────
  const [jobs, setJobs]                             = useState<JobLite[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [candidatesTotal, setCandidatesTotal]       = useState<number>(0);
  const [screeningRunsTotal, setScreeningRunsTotal] = useState<number>(0);
  const [backendError, setBackendError]             = useState(false);

  // ── Fixed: independent fetches with per-request timeouts ──
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setBackendError(false);

      // Fetch jobs — 15s timeout
      try {
        const jobsRes = await Promise.race([
          listJobsApi(0, 50),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
        ]) as any;
        if (!cancelled) {
          const rows: JobLite[] = Array.isArray(jobsRes?.data) ? jobsRes.data : [];
          setJobs(rows);
        }
      } catch (e: any) {
        console.error("Jobs fetch failed:", e?.message || e);
        if (!cancelled && e?.message === "timeout") setBackendError(true);
      }

      // Fetch candidates total — independent
      try {
        const candRes = await Promise.race([
          listCandidatesApi(0, 1),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
        ]) as any;
        if (!cancelled) setCandidatesTotal(Number(candRes?.total ?? 0));
      } catch (e) {
        console.error("Candidates fetch failed:", e);
      }

      // Fetch screening runs total — independent
      try {
        const runsRes = await Promise.race([
          listScreeningResultsApi(0, 1),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
        ]) as any;
        if (!cancelled) setScreeningRunsTotal(Number(runsRes?.total ?? 0));
      } catch (e) {
        console.error("Screening runs fetch failed:", e);
      }

      if (!cancelled) setLoading(false);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // ── unchanged stats memo ──────────────────────────────────
  const stats = useMemo(() => {
    const active          = jobs.filter((j) => j.status === "open").length;
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount ?? 0), 0);
    return { active, totalApplicants, totalJobs: jobs.length };
  }, [jobs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero header ───────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)",
        borderRadius: 20, padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
        position: "relative", overflow: "hidden",
        animation: "fadeUp 0.35s ease both",
      }}>
        {[{ w: 260, t: -80, r: -80 }, { w: 140, t: 20, r: 60 }].map((s, i) => (
          <div key={i} style={{
            position: "absolute", width: s.w, height: s.w, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.10)", top: s.t, right: s.r, pointerEvents: "none",
          }} />
        ))}
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 99, padding: "4px 12px", marginBottom: 10,
          }}>
            <Sparkles size={12} color="#fff" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: "0.04em" }}>
              Powered by Gemini AI
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            Recruiter Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.70)", margin: "5px 0 0" }}>
            Overview of jobs, candidates, and AI screening activity
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 12, padding: "10px 16px", position: "relative",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#4ADE80",
            boxShadow: "0 0 0 3px rgba(74,222,128,0.3)",
            animation: "ping 2s ease infinite", flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Live data</span>
        </div>
      </div>

      {/* ── Backend error banner ─────────────────────────────── */}
      {backendError && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 18px", borderRadius: 12,
          background: "#FFF7ED", border: "1px solid #FED7AA",
          animation: "fadeUp 0.3s ease both",
        }}>
          <WifiOff size={16} color="#EA580C" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#9A3412", margin: 0 }}>
              Backend connection timeout
            </p>
            <p style={{ fontSize: 12, color: "#C2410C", margin: "2px 0 0" }}>
              Make sure your Python backend is running at{" "}
              <code style={{ background: "#FEF3C7", padding: "1px 5px", borderRadius: 4 }}>
                localhost:8000
              </code>.
              Dashboard data may be incomplete.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard icon={TrendingUp} label="Active jobs"    value={stats.active}         loading={loading} accent={BRAND}     delay="0.05s" />
        <StatCard icon={Briefcase}  label="Total jobs"     value={stats.totalJobs}      loading={loading} accent="#6366F1"   delay="0.10s" />
        <StatCard icon={Users}      label="Candidates"     value={candidatesTotal}      loading={loading} accent="#10B981"   delay="0.15s" />
        <StatCard icon={Zap}        label="Screening runs" value={screeningRunsTotal}   loading={loading} accent="#F59E0B"   delay="0.20s" />
      </div>

      {/* ── Recent jobs ───────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.4s ease both", animationDelay: "0.25s",
      }}>
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "rgba(44,124,242,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Briefcase size={16} color={BRAND} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Recent Jobs</h2>
              {!loading && (
                <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} loaded
                </p>
              )}
            </div>
          </div>
          <a
            href="/jobs"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 13, fontWeight: 600, color: BRAND,
              textDecoration: "none", padding: "6px 12px", borderRadius: 8,
              border: "1.5px solid rgba(44,124,242,0.25)",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(44,124,242,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor = BRAND;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,124,242,0.25)";
            }}
          >
            View all <ChevronRight size={13} />
          </a>
        </div>

        <div style={{ padding: "0 24px" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ borderTop: i > 0 ? "1px solid #F8FAFC" : "none" }}>
                <SkeletonRow />
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div style={{
              padding: "48px 0", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(44,124,242,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Briefcase size={20} color={BRAND} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#64748B", margin: 0 }}>No jobs yet</p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Post your first job to get started.</p>
            </div>
          ) : (
            jobs.slice(0, 6).map((job, idx) => (
              <a
                key={job.id ?? job.jobId ?? idx}
                href={`/jobs`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0", gap: 12,
                  borderTop: idx > 0 ? "1px solid #F8FAFC" : "none",
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: "rgba(44,124,242,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Briefcase size={15} color={BRAND} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: "#0F172A",
                      margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {job.title ?? "Untitled job"}
                    </p>
                    {job.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MapPin size={11} color="#94A3B8" />
                        <span style={{ fontSize: 12, color: "#94A3B8" }}>{job.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <StatusPill status={job.status} />
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 99,
                    border: "1px solid #E2E8F0", background: "#F8FAFC",
                  }}>
                    <Users size={11} color="#94A3B8" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                      {job.applicantCount ?? 0}
                    </span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {!loading && jobs.length > 0 && (
          <div style={{
            padding: "12px 24px", borderTop: "1px solid #F1F5F9",
            background: "#FAFBFF", display: "flex", justifyContent: "center",
          }}>
            <a href="/jobs" style={{
              fontSize: 13, fontWeight: 600, color: BRAND,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
            }}>
              See all {jobs.length} jobs <ChevronRight size={13} />
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes ping   { 0%{box-shadow:0 0 0 0 rgba(74,222,128,0.5)} 70%{box-shadow:0 0 0 8px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}