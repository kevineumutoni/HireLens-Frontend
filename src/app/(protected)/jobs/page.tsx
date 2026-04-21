"use client";
// ============================================================
// src/app/(protected)/jobs/page.tsx
// Fixes:
// 1. Job cards are clickable → opens JobDetailModal with full info
// 2. Live screening progress modal (step-by-step)
// 3. Search + status tabs
// 4. Smaller cards, no description truncation issues
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJobApi, listJobsApi, triggerScreeningApi, updateJobApi } from "@/app/lib/api";
import toast from "react-hot-toast";
import {
  Plus, Briefcase, MapPin, Users, Zap,
  Eye, XCircle, Trash2, MoreVertical,
  Search, Clock, ChevronRight,
} from "lucide-react";
import { JobDetailModal } from "./JobDetailModal";
import { ScreeningProgressModal, ProgressLog } from "../screening/ScreeningProgressModal";

const BRAND = "#2C7CF2";

type JobRow = {
  id?: string;
  jobId?: string;
  title?: string;
  description?: string;
  location?: string;
  employmentType?: string;
  status?: string;
  applicantCount?: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
  softSkills?: string[];
  minYearsExperience?: number;
  requiredEducation?: string;
  createdAt?: string;
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
      background: bg, color, fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

// ── Kebab menu ─────────────────────────────────────────────────
function KebabMenu({
  id, status, isBusy,
  onView, onScreen, onClose, onDelete,
}: {
  id: string; status?: string; isBusy: boolean;
  onView: () => void; onScreen: () => void;
  onClose: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const el = document.getElementById(`km-${id}`);
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, id]);

  const item = (
    label: string, icon: React.ReactNode, onClick: () => void,
    danger = false, disabled = false,
  ) => (
    <button
      type="button" disabled={disabled}
      onClick={() => { onClick(); setOpen(false); }}
      style={{
        width: "100%", textAlign: "left", padding: "8px 14px",
        display: "flex", alignItems: "center", gap: 9,
        background: "none", border: "none",
        fontSize: 13, fontWeight: 600,
        color: danger ? "#EF4444" : "#374151",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.1s", fontFamily: "inherit",
      }}
      onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLElement).style.background = danger ? "#FEF2F2" : "#F8FAFF")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}
    >
      {icon}{label}
    </button>
  );

  return (
    <div id={`km-${id}`} style={{ position: "relative" }}>
      <button
        type="button" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} disabled={isBusy}
        style={{
          width: 30, height: 30, borderRadius: 8,
          border: "1px solid #E2E8F0", background: "#F8FAFF",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: isBusy ? "not-allowed" : "pointer", color: "#64748B",
          opacity: isBusy ? 0.5 : 1, transition: "border-color 0.15s", flexShrink: 0,
        }}
        onMouseEnter={(e) => !isBusy && ((e.currentTarget as HTMLElement).style.borderColor = BRAND)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")}
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 200,
          background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
          minWidth: 176, overflow: "hidden", animation: "fadeUp 0.15s ease both",
        }}>
          {item("View details", <Eye size={13} />, onView)}
          {item("Screen with AI", <Zap size={13} color={BRAND} />, onScreen, false, status === "closed")}
          {item("Close job", <XCircle size={13} />, onClose, false, status === "closed")}
          <div style={{ height: 1, background: "#F1F5F9", margin: "4px 0" }} />
          {item("Delete job", <Trash2 size={13} />, onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0",
      borderRadius: 16, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "55%", height: 15, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
        <div style={{ width: 68, height: 22, borderRadius: 99, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      </div>
      <div style={{ width: "35%", height: 12, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      <div style={{ width: "90%", height: 12, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 32, borderRadius: 9, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function JobsPage() {
  const router = useRouter();

  // ── unchanged state & handlers ────────────────────────────
  const [jobs, setJobs]           = useState<JobRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState<string>("");
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "open" | "screening" | "closed">("all");

  // Modal state
  const [detailJob, setDetailJob] = useState<JobRow | null>(null);

  // Screening progress
  const [progressLogs, setProgressLogs]   = useState<ProgressLog[]>([]);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressDone, setProgressDone]   = useState(0);
  const [progressTitle, setProgressTitle] = useState("");
  const [progressOpen, setProgressOpen]   = useState(false);
  const [progressDone2, setProgressDone2] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await listJobsApi(0, 100);
      setJobs(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error("Failed to load jobs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  // ── Screen with live progress ───────────────────────────────
  const screen = async (jobId: string) => {
    const job = jobs.find(j => (j.id || j.jobId) === jobId);
    const totalCandidates = job?.applicantCount || 0;

    setBusyId(jobId);
    setProgressLogs([]);
    setProgressTotal(totalCandidates || 105);
    setProgressDone(0);
    setProgressTitle(job?.title || "Job");
    setProgressOpen(true);
    setProgressDone2(false);

    // Add initial log
    const addLog = (text: string, type: ProgressLog["type"] = "step") => {
      setProgressLogs(prev => [...prev, { text, type, ts: Date.now() }]);
    };

    addLog(`Starting AI screening for "${job?.title}"…`, "info");
    addLog(`Fetching ${totalCandidates || "all"} candidates from database…`);
    await new Promise(r => setTimeout(r, 600));

    addLog("Initializing Gemini AI connection…");
    await new Promise(r => setTimeout(r, 400));

    addLog("Sending candidates to Gemini for evaluation…");

    try {
      // ── Simulate progress ticks while the real API call runs ──
      let fakeCount = 0;
      const total = totalCandidates || 105;
      const tickInterval = setInterval(() => {
        fakeCount = Math.min(fakeCount + Math.floor(Math.random() * 4) + 1, total - 1);
        setProgressDone(fakeCount);
        if (fakeCount > 0) {
          // Show candidate name placeholder — real backend doesn't stream names yet
          setProgressLogs(prev => {
            const last = prev[prev.length - 1];
            const stepText = `Evaluating candidate ${fakeCount}/${total}…`;
            if (last?.text?.startsWith("Evaluating candidate")) {
              return [...prev.slice(0, -1), { text: stepText, type: "step", ts: Date.now() }];
            }
            return [...prev, { text: stepText, type: "step", ts: Date.now() }];
          });
        }
      }, 1800);

      const res = await triggerScreeningApi({ job_id: jobId, use_all_candidates: true });

      clearInterval(tickInterval);
      setProgressDone(total);

      addLog(`✓ Evaluated ${res.successfulEvaluations ?? res.candidatesScreened ?? total} candidates`, "done");
      if (res.failedEvaluations > 0) {
        addLog(`⚠ ${res.failedEvaluations} evaluations failed (excluded from ranking)`, "error");
      }
      addLog(`✓ Ranked top ${res.shortlistSize ?? 10} candidates`, "done");
      addLog("✓ Screening complete! Results saved.", "done");

      setProgressDone2(true);
      setJobs(prev => prev.map(j => (j.id || j.jobId) === jobId ? { ...j, status: "screening" } : j));
      toast.success("Screening complete!");
      await loadJobs();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || "Screening failed";
      addLog(`✗ ${msg}`, "error");
      setProgressDone2(true);
      toast.error(msg);
    } finally {
      setBusyId("");
    }
  };

  // ── Other handlers (unchanged) ──────────────────────────────
  const closeJob = async (jobId: string) => {
    setBusyId(jobId);
    try {
      await updateJobApi(jobId, { status: "closed" });
      toast.success("Job closed");
      await loadJobs();
    } catch { toast.error("Failed to close job"); }
    finally { setBusyId(""); }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;
    setBusyId(jobId);
    try {
      await deleteJobApi(jobId);
      toast.success("Job deleted");
      await loadJobs();
    } catch { toast.error("Failed to delete job"); }
    finally { setBusyId(""); }
  };

  // ── Filter ─────────────────────────────────────────────────
  const filtered = jobs.filter(j => {
    const matchTab = activeTab === "all" || j.status === activeTab;
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    all:       jobs.length,
    open:      jobs.filter(j => j.status === "open").length,
    screening: jobs.filter(j => j.status === "screening").length,
    closed:    jobs.filter(j => j.status === "closed").length,
  };

  const TABS = [
    { key: "all" as const, label: "All" },
    { key: "open" as const, label: "Open" },
    { key: "screening" as const, label: "Screening" },
    { key: "closed" as const, label: "Closed" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 18, padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.3s ease both",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Jobs</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Manage postings and trigger AI candidate screening
          </p>
        </div>
        <button
          type="button" onClick={() => router.push("/jobs/new")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11, border: "none",
            background: BRAND, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "background 0.15s, transform 0.1s", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a65d6")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = BRAND)}
          onMouseDown={(e)  => ((e.currentTarget as HTMLElement).style.transform = "scale(0.97)")}
          onMouseUp={(e)    => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
        >
          <Plus size={15} /> Add Job
        </button>
      </div>

      {/* ── Stats + Tabs row ────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.35s ease both", animationDelay: "0.04s",
      }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", padding: "0 16px" }}>
          {TABS.map(tab => (
            <button
              key={tab.key} type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 14px", background: "none", border: "none",
                borderBottom: activeTab === tab.key ? `2px solid ${BRAND}` : "2px solid transparent",
                marginBottom: -1,
                fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? BRAND : "#64748B",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                transition: "color 0.15s", fontFamily: "inherit",
              }}
            >
              {tab.label}
              <span style={{
                padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: activeTab === tab.key ? BRAND : "#F1F5F9",
                color: activeTab === tab.key ? "#fff" : "#64748B",
              }}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ position: "relative", maxWidth: 320 }}>
            <Search size={14} style={{
              position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: "#94A3B8", pointerEvents: "none",
            }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or location…"
              style={{
                width: "100%", padding: "8px 12px 8px 33px",
                borderRadius: 10, border: "1.5px solid #E2E8F0",
                fontSize: 13, color: "#0F172A", background: "#FAFAFA",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(44,124,242,0.10)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>

      {/* ── Job cards ─────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#fff", border: "1px dashed #CBD5E1", borderRadius: 18,
          padding: "56px 24px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12, animation: "fadeUp 0.4s ease both",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(44,124,242,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Briefcase size={22} color={BRAND} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            {search ? "No jobs match your search" : "No jobs yet"}
          </p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            {search ? "Try a different term" : "Create your first job to get started"}
          </p>
          {!search && (
            <button
              type="button" onClick={() => router.push("/jobs/new")}
              style={{
                marginTop: 4, display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10, border: "none",
                background: BRAND, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Plus size={14} /> Add Job
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filtered.map((job, idx) => {
            const id     = (job.id || job.jobId || String(idx)) as string;
            const isBusy = busyId === id;

            return (
              <div
                key={id}
                style={{
                  background: "#fff", border: "1px solid #E2E8F0",
                  borderRadius: 16, padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  display: "flex", flexDirection: "column", gap: 12,
                  animation: "fadeUp 0.4s ease both", animationDelay: `${idx * 0.04}s`,
                  transition: "box-shadow 0.15s, border-color 0.15s",
                  opacity: isBusy ? 0.7 : 1, cursor: "pointer",
                }}
                onClick={() => setDetailJob(job)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(44,124,242,0.10)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,124,242,0.25)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
                }}
              >
                {/* Card top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: "rgba(44,124,242,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Briefcase size={16} color={BRAND} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {job.title ?? "Untitled job"}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                        {job.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={10} color="#94A3B8" />
                            <span style={{ fontSize: 11, color: "#64748B" }}>{job.location}</span>
                          </div>
                        )}
                        {job.employmentType && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} color="#94A3B8" />
                            <span style={{ fontSize: 11, color: "#64748B" }}>{job.employmentType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Status + kebab */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusPill status={job.status} />
                    <KebabMenu
                      id={id} status={job.status} isBusy={isBusy}
                      onView={() => setDetailJob(job)}
                      onScreen={() => screen(id)}
                      onClose={() => closeJob(id)}
                      onDelete={() => deleteJob(id)}
                    />
                  </div>
                </div>

                {/* Description preview */}
                {job.description && (
                  <p style={{
                    fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.55,
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>
                    {job.description}
                  </p>
                )}

                {/* Required skills pills (max 3) */}
                {(job.requiredSkills?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {job.requiredSkills!.slice(0, 3).map(s => (
                      <span key={s} style={{
                        padding: "2px 8px", borderRadius: 99,
                        background: "rgba(44,124,242,0.08)", color: BRAND,
                        fontSize: 10, fontWeight: 600,
                        border: "1px solid rgba(44,124,242,0.15)",
                      }}>{s}</span>
                    ))}
                    {(job.requiredSkills!.length > 3) && (
                      <span style={{
                        padding: "2px 7px", borderRadius: 99,
                        background: "#F1F5F9", fontSize: 10, fontWeight: 600, color: "#64748B",
                      }}>
                        +{job.requiredSkills!.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Applicant count + screen button */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 10px", borderRadius: 9,
                    background: "#F8FAFF", border: "1px solid #E8EDFF", flex: 1,
                  }}>
                    <Users size={12} color={BRAND} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                      {job.applicantCount ?? 0}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748B" }}>applicants</span>
                  </div>

                  <button
                    type="button" onClick={() => screen(id)}
                    disabled={isBusy || job.status === "closed"}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      padding: "7px 12px", borderRadius: 9, border: "none",
                      background: isBusy || job.status === "closed" ? "#E2E8F0" : BRAND,
                      color: isBusy || job.status === "closed" ? "#94A3B8" : "#fff",
                      fontSize: 12, fontWeight: 700,
                      cursor: isBusy || job.status === "closed" ? "not-allowed" : "pointer",
                      transition: "background 0.15s", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (!isBusy && job.status !== "closed")
                        (e.currentTarget as HTMLElement).style.background = "#1a65d6";
                    }}
                    onMouseLeave={(e) => {
                      if (!isBusy && job.status !== "closed")
                        (e.currentTarget as HTMLElement).style.background = BRAND;
                    }}
                  >
                    <Zap size={12} />
                    {isBusy ? "…" : "Screen"}
                  </button>

                  <button
                    type="button" onClick={() => setDetailJob(job)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 9,
                      border: "1.5px solid #E2E8F0", background: "#F8FAFF",
                      cursor: "pointer", color: "#64748B",
                      transition: "border-color 0.15s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = BRAND)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Job Detail Modal ─────────────────────────────────── */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onScreen={(id) => screen(id)}
          isBusy={busyId === (detailJob.id || detailJob.jobId)}
        />
      )}

      {/* ── Screening Progress Modal ─────────────────────────── */}
      {progressOpen && (
        <ScreeningProgressModal
          logs={progressLogs}
          jobTitle={progressTitle}
          total={progressTotal}
          done={progressDone}
          finished={progressDone2}
          onClose={() => setProgressOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}