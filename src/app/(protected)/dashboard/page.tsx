"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { listJobsApi, listCandidatesApi, listScreeningResultsApi } from "@/app/lib/api";
import {
  Briefcase, Users, Zap, TrendingUp,
  MapPin, ChevronRight, BarChart3,
  WifiOff, Plus, Clock,
} from "lucide-react";

const BRAND = "#2C7CF2";

type JobLite = {
  id?: string;
  jobId?: string;
  title?: string;
  location?: string;
  status?: "open" | "screening" | "closed" | string;
  applicantCount?: number;
  createdAt?: string;
};

function StatusPill({ status }: { status?: string }) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    open:      { bg: "#ECFDF5",              color: "#059669", dot: "#10B981", label: "Open"     },
    screening: { bg: "rgba(44,124,242,0.10)", color: BRAND,     dot: BRAND,    label: "Screened" },
    closed:    { bg: "#F1F5F9",              color: "#64748B", dot: "#94A3B8", label: "Closed"   },
  };
  const { bg, color, dot, label } = map[s] ?? map.open;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, loading, accent, delay, sub }: {
  icon: React.ElementType; label: string; value: number | string;
  loading: boolean; accent: string; delay?: string; sub?: string;
}) {
  return (
    <div
      style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.4s ease both", animationDelay: delay ?? "0s", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(44,124,242,0.09)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{label}</p>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={accent} />
        </div>
      </div>
      <p style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: "4px 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {loading ? <span style={{ display: "inline-block", width: 52, height: 34, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} /> : value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F1F5F9", flexShrink: 0, animation: "pulse 1.4s ease infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ height: 13, width: "50%", borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
          <div style={{ height: 11, width: "30%", borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite", animationDelay: "0.1s" }} />
        </div>
      </div>
      <div style={{ height: 22, width: 70, borderRadius: 99, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [jobs, setJobs]                             = useState<JobLite[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [candidatesTotal, setCandidatesTotal]       = useState(0);
  const [screeningRunsTotal, setScreeningRunsTotal] = useState(0);
  const [backendError, setBackendError]             = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setBackendError(false);

    try {
      const jobsRes = await Promise.race([
        listJobsApi(0, 50),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
      ]) as any;
      const rows: JobLite[] = Array.isArray(jobsRes?.data) ? jobsRes.data : [];
      console.log("[Dashboard] Jobs loaded:", rows.length);
      setJobs(rows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error("[Dashboard] Jobs fetch failed:", msg);
      if (msg === "timeout") setBackendError(true);
    }

    try {
      const candRes = await Promise.race([
        listCandidatesApi(0, 1),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
      ]) as any;
      setCandidatesTotal(Number(candRes?.total ?? 0));
    } catch (err: unknown) {
      console.error("[Dashboard] Candidates fetch failed:", err);
    }

    try {
      const runsRes = await Promise.race([
        listScreeningResultsApi(0, 1),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
      ]) as any;
      setScreeningRunsTotal(Number(runsRes?.total ?? 0));
    } catch (err: unknown) {
      console.error("[Dashboard] Screening runs fetch failed:", err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchAll(), 50);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const stats = useMemo(() => {
    const open      = jobs.filter(j => j.status === "open").length;
    const screened  = jobs.filter(j => j.status === "screening").length;
    return { open, screened, total: jobs.length };
  }, [jobs]);

  const recentJobs = jobs.slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.3s ease both", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Overview</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "5px 0 0" }}>Your hiring pipeline at a glance</p>
        </div>
        <a
          href="/jobs/new"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a65d6")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = BRAND)}
        >
          <Plus size={15} /> Post a Job
        </a>
      </div>

      {backendError && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "#FFF7ED", border: "1px solid #FED7AA", animation: "fadeUp 0.3s ease both" }}>
          <WifiOff size={16} color="#EA580C" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#9A3412", margin: 0 }}>Backend not reachable</p>
            <p style={{ fontSize: 12, color: "#C2410C", margin: "2px 0 0" }}>
              Make sure your server is running at{" "}
              <code style={{ background: "#FEF3C7", padding: "1px 5px", borderRadius: 4 }}>localhost:8000</code>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <StatCard icon={Briefcase}   label="Total jobs"     value={stats.total}          sub={`${stats.open} open`}      loading={loading} accent={BRAND}     delay="0.05s" />
        <StatCard icon={TrendingUp}  label="Active"         value={stats.open}            sub="accepting applicants"      loading={loading} accent="#10B981"   delay="0.10s" />
        <StatCard icon={BarChart3}   label="Screened"       value={stats.screened}        sub="AI ranking done"           loading={loading} accent="#8B5CF6"   delay="0.15s" />
        <StatCard icon={Users}       label="Candidates"     value={candidatesTotal}        sub="in the database"           loading={loading} accent="#F59E0B"   delay="0.20s" />
        <StatCard icon={Zap}         label="Screening runs" value={screeningRunsTotal}     sub="total runs"                loading={loading} accent="#EF4444"   delay="0.25s" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.4s ease both", animationDelay: "0.3s", gridColumn: "1 / -1" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(44,124,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={16} color={BRAND} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Recent Jobs</h2>
                {!loading && <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{jobs.length} total</p>}
              </div>
            </div>
            <a
              href="/jobs"
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: BRAND, textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(44,124,242,0.20)", transition: "background 0.15s, border-color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(44,124,242,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,124,242,0.20)"; }}
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
            ) : recentJobs.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(44,124,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Briefcase size={20} color={BRAND} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#64748B", margin: 0 }}>No jobs posted yet</p>
                <a href="/jobs/new" style={{ fontSize: 13, color: BRAND, fontWeight: 600, textDecoration: "none" }}>Post your first job →</a>
              </div>
            ) : (
              recentJobs.map((job, idx) => (
                <a
                  key={job.id ?? job.jobId ?? idx}
                  href="/jobs"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", gap: 12, borderTop: idx > 0 ? "1px solid #F8FAFC" : "none", textDecoration: "none", transition: "opacity 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: job.status === "screening" ? "rgba(139,92,246,0.10)" : "rgba(44,124,242,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {job.status === "screening" ? <BarChart3 size={15} color="#8B5CF6" /> : <Briefcase size={15} color={BRAND} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.title ?? "Untitled"}
                      </p>
                      {job.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <MapPin size={11} color="#94A3B8" />
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>{job.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <StatusPill status={job.status} />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                      <Users size={10} color="#94A3B8" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{job.applicantCount ?? 0}</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>

          {!loading && jobs.length > 0 && (
            <div style={{ padding: "12px 24px", borderTop: "1px solid #F1F5F9", background: "#FAFBFF", display: "flex", justifyContent: "center" }}>
              <a href="/jobs" style={{ fontSize: 13, fontWeight: 600, color: BRAND, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                See all {jobs.length} jobs <ChevronRight size={13} />
              </a>
            </div>
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.4s ease both", animationDelay: "0.35s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(139,92,246,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} color="#8B5CF6" />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Pipeline Status</h2>
          </div>

          {[
            { label: "Open — accepting applications", count: stats.open,     color: "#10B981", bg: "#ECFDF5",              href: "/jobs" },
            { label: "Screened — AI ranking done",    count: stats.screened, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", href: "/jobs" },
            { label: "Total candidates in system",    count: loading ? "—" : candidatesTotal, color: BRAND, bg: "rgba(44,124,242,0.08)", href: "/candidates" },
            { label: "AI screening runs",             count: loading ? "—" : screeningRunsTotal, color: "#F59E0B", bg: "#FFFBEB", href: "/screening" },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F8FAFC", textDecoration: "none", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item.label}</span>
              <span style={{ padding: "3px 10px", borderRadius: 99, background: item.bg, color: item.color, fontSize: 13, fontWeight: 800 }}>
                {loading ? <span style={{ display: "inline-block", width: 20, height: 13, borderRadius: 4, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} /> : item.count}
              </span>
            </a>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)", borderRadius: 20, padding: "24px", position: "relative", overflow: "hidden", animation: "fadeUp 0.4s ease both", animationDelay: "0.40s" }}>
          {[{ w: 180, t: -50, r: -50 }, { w: 100, t: 20, r: 30 }].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: s.w, height: s.w, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)", top: s.t, right: s.r, pointerEvents: "none" }} />
          ))}
          <div style={{ position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Zap size={18} color="#fff" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.01em" }}>AI Screening</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", margin: "0 0 18px", lineHeight: 1.6 }}>
              Go to a job and hit Screen to let Gemini rank your candidates with full explanations.
            </p>
            <a
              href="/jobs"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")}
            >
              Go to Jobs <ChevronRight size={13} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}