"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteJobApi, listJobsApi, triggerScreeningApi, updateJobApi } from "@/app/lib/api";
import toast from "react-hot-toast";
import {
  Plus, Briefcase, MapPin, Users, Zap,
  Eye, XCircle, Trash2, MoreVertical,
  Search, Clock, ChevronRight, BarChart3,
} from "lucide-react";
import { JobDetailModal } from "./JobDetailModal";
import { ScreeningResultsModal } from "../screening/ScreeningResultsModal";
import { ScreeningProgressModal, ProgressLog } from "@/app/(protected)/screening/ScreeningProgressModal";

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

function StatusPill({ status }: { status?: string }) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    open:      { bg: "#ECFDF5",              color: "#059669", dot: "#10B981", label: "Open"      },
    screening: { bg: "rgba(44,124,242,0.10)", color: BRAND,     dot: BRAND,    label: "Screened"  },
    closed:    { bg: "#F1F5F9",              color: "#64748B", dot: "#94A3B8", label: "Closed"    },
  };
  const { bg, color, dot, label } = map[s] ?? map.open;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

function KebabMenu({ id, status, isBusy, onView, onScreen, onViewResults, onClose, onDelete }: {
  id: string; status?: string; isBusy: boolean;
  onView: () => void; onScreen: () => void; onViewResults: () => void;
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

  const isScreened = status === "screening";

  const items = [
    { label: "View details",      icon: <Eye size={13} />,                       fn: onView,        danger: false, disabled: false },
    ...(isScreened
      ? [{ label: "View results",  icon: <BarChart3 size={13} color="#8B5CF6" />, fn: onViewResults, danger: false, disabled: false }]
      : [{ label: "Screen with AI",icon: <Zap size={13} color={BRAND} />,        fn: onScreen,      danger: false, disabled: false }]
    ),
    { label: "Close job",         icon: <XCircle size={13} />,                   fn: onClose,       danger: false, disabled: status === "closed" },
    { label: "Delete",            icon: <Trash2 size={13} />,                    fn: onDelete,      danger: true,  disabled: false },
  ];

  return (
    <div id={`km-${id}`} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        disabled={isBusy}
        style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: isBusy ? "not-allowed" : "pointer", color: "#64748B", opacity: isBusy ? 0.5 : 1, flexShrink: 0 }}
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 200, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 180, overflow: "hidden" }}>
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => { item.fn(); setOpen(false); }}
              style={{ width: "100%", textAlign: "left", padding: "9px 14px", display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", fontSize: 13, fontWeight: 600, color: item.danger ? "#EF4444" : "#374151", cursor: item.disabled ? "not-allowed" : "pointer", opacity: item.disabled ? 0.4 : 1, fontFamily: "inherit" }}
              onMouseEnter={(e) => !item.disabled && ((e.currentTarget as HTMLElement).style.background = item.danger ? "#FEF2F2" : "#F8FAFF")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "55%", height: 15, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
        <div style={{ width: 68, height: 22, borderRadius: 99, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      </div>
      <div style={{ width: "35%", height: 12, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      <div style={{ width: "90%", height: 12, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
    </div>
  );
}

type TabKey = "all" | "open" | "screening" | "closed";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs]           = useState<JobRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState("");
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [detailJob, setDetailJob] = useState<JobRow | null>(null);

  const [progOpen, setProgOpen]         = useState(false);
  const [progLogs, setProgLogs]         = useState<ProgressLog[]>([]);
  const [progTotal, setProgTotal]       = useState(0);
  const [progDone, setProgDone]         = useState(0);
  const [progTitle, setProgTitle]       = useState("");
  const [progFinished, setProgFinished] = useState(false);

  const [resultsJobId, setResultsJobId]     = useState<string | null>(null);
  const [resultsJobTitle, setResultsJobTitle] = useState("");
  const [resultsOpen, setResultsOpen]       = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[Jobs] Fetching jobs...");
      const data = await listJobsApi(0, 100);
      console.log("[Jobs] Response:", data);
      const list = Array.isArray(data?.data) ? data.data : [];
      console.log("[Jobs] Loaded:", list.length, "jobs");
      setJobs(list);
    } catch (err: unknown) {
      console.error("[Jobs] Error:", err);
      toast.error("Could not load jobs — check your connection");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadJobs(), 50);
    return () => clearTimeout(t);
  }, [loadJobs]);

  const openResults = (jobId: string, jobTitle: string) => {
    setResultsJobId(jobId);
    setResultsJobTitle(jobTitle);
    setResultsOpen(true);
  };

  async function screen(jobId: string) {
    const job = jobs.find(j => (j.id ?? j.jobId) === jobId);
    const total = job?.applicantCount || 100;

    setBusyId(jobId);
    setProgLogs([]);
    setProgTotal(total);
    setProgDone(0);
    setProgTitle(job?.title ?? "Job");
    setProgOpen(true);
    setProgFinished(false);

    const addLog = (text: string, type: ProgressLog["type"] = "step") =>
      setProgLogs(prev => [...prev, { text, type, ts: Date.now() }]);

    addLog(`Starting AI screening for "${job?.title}"…`, "info");
    addLog("Fetching candidates from the database…");
    await new Promise(r => setTimeout(r, 500));
    addLog("Connecting to Gemini AI…");

    let fake = 0;
    const ticker = setInterval(() => {
      fake = Math.min(fake + Math.floor(Math.random() * 3) + 1, total - 1);
      setProgDone(fake);
      setProgLogs(prev => {
        const last = prev[prev.length - 1];
        const txt = `Evaluating candidate ${fake}/${total}…`;
        if (last?.text?.startsWith("Evaluating candidate")) return [...prev.slice(0, -1), { text: txt, type: "step" as const, ts: Date.now() }];
        return [...prev, { text: txt, type: "step" as const, ts: Date.now() }];
      });
    }, 1800);

    try {
      const res = await triggerScreeningApi({ job_id: jobId, use_all_candidates: true });
      clearInterval(ticker);
      setProgDone(total);
      addLog(`${res.successfulEvaluations ?? total} candidates evaluated`, "done");
      if ((res.failedEvaluations ?? 0) > 0) addLog(`${res.failedEvaluations} evaluations could not be completed`, "error");
      addLog("Candidates ranked and results saved", "done");
      setProgFinished(true);
      setJobs(prev => prev.map(j => (j.id ?? j.jobId) === jobId ? { ...j, status: "screening" } : j));
      await loadJobs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Screening failed";
      console.error("[Screen] Error:", err);
      addLog(`Screening did not complete: ${msg}`, "error");
      setProgFinished(true);
    } finally {
      clearInterval(ticker);
      setBusyId("");
    }
  }

  async function closeJob(jobId: string) {
    setBusyId(jobId);
    try {
      await updateJobApi(jobId, { status: "closed" });
      toast.success("Job closed");
      await loadJobs();
    } catch (err: unknown) {
      console.error("[CloseJob] Error:", err);
      toast.error("Could not close job");
    } finally {
      setBusyId("");
    }
  }

  async function deleteJob(jobId: string) {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setBusyId(jobId);
    try {
      await deleteJobApi(jobId);
      toast.success("Job deleted");
      await loadJobs();
    } catch (err: unknown) {
      console.error("[DeleteJob] Error:", err);
      toast.error("Could not delete job");
    } finally {
      setBusyId("");
    }
  }

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

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all",       label: "All"      },
    { key: "open",      label: "Open"     },
    { key: "screening", label: "Screened" },
    { key: "closed",    label: "Closed"   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.3s ease both", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Jobs</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Manage job postings and run AI candidate screening</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/jobs/new")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, border: "none", background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a65d6")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = BRAND)}
        >
          <Plus size={15} /> Add Job
        </button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.35s ease both", animationDelay: "0.04s" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", padding: "0 16px" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{ padding: "12px 14px", background: "none", border: "none", borderBottom: activeTab === tab.key ? `2px solid ${BRAND}` : "2px solid transparent", marginBottom: -1, fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? BRAND : "#64748B", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              {tab.label}
              <span style={{ padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: activeTab === tab.key ? BRAND : "#F1F5F9", color: activeTab === tab.key ? "#fff" : "#64748B" }}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 16px" }}>
          <div style={{ position: "relative", maxWidth: 320 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…"
              style={{ width: "100%", padding: "8px 12px 8px 33px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#FAFAFA", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(44,124,242,0.10)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #CBD5E1", borderRadius: 18, padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(44,124,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase size={22} color={BRAND} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            {search ? "No jobs match your search" : "No jobs yet"}
          </p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            {search ? "Try different terms" : "Create your first job posting to get started"}
          </p>
          {!search && (
            <button type="button" onClick={() => router.push("/jobs/new")} style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <Plus size={14} /> Add Job
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filtered.map((job, idx) => {
            const id = (job.id ?? job.jobId ?? String(idx)) as string;
            const isBusy = busyId === id;
            const isScreened = job.status === "screening";

            return (
              <div
                key={id}
                style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s ease both", animationDelay: `${idx * 0.04}s`, opacity: isBusy ? 0.7 : 1, cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s" }}
                onClick={() => setDetailJob(job)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(44,124,242,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,124,242,0.25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: isScreened ? "rgba(139,92,246,0.10)" : "rgba(44,124,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isScreened ? <BarChart3 size={16} color="#8B5CF6" /> : <Briefcase size={16} color={BRAND} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <StatusPill status={job.status} />
                    <KebabMenu
                      id={id} status={job.status} isBusy={isBusy}
                      onView={() => setDetailJob(job)}
                      onScreen={() => screen(id)}
                      onViewResults={() => openResults(id, job.title ?? "Job")}
                      onClose={() => closeJob(id)}
                      onDelete={() => deleteJob(id)}
                    />
                  </div>
                </div>

                {job.description && (
                  <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                    {job.description}
                  </p>
                )}

                {(job.requiredSkills?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {job.requiredSkills!.slice(0, 3).map(s => (
                      <span key={s} style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(44,124,242,0.08)", color: BRAND, fontSize: 10, fontWeight: 600, border: "1px solid rgba(44,124,242,0.15)" }}>{s}</span>
                    ))}
                    {(job.requiredSkills!.length > 3) && (
                      <span style={{ padding: "2px 7px", borderRadius: 99, background: "#F1F5F9", fontSize: 10, fontWeight: 600, color: "#64748B" }}>+{job.requiredSkills!.length - 3}</span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 9, background: "#F8FAFF", border: "1px solid #E8EDFF", flex: 1 }}>
                    <Users size={12} color={BRAND} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{job.applicantCount ?? 0}</span>
                    <span style={{ fontSize: 11, color: "#64748B" }}>applicants</span>
                  </div>

                  {isScreened ? (
                    <button
                      type="button"
                      onClick={() => openResults(id, job.title ?? "Job")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "none", background: "#8B5CF6", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#7C3AED")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B5CF6")}
                    >
                      <BarChart3 size={12} /> View Results
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => screen(id)}
                      disabled={isBusy || job.status === "closed"}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "none", background: isBusy || job.status === "closed" ? "#E2E8F0" : BRAND, color: isBusy || job.status === "closed" ? "#94A3B8" : "#fff", fontSize: 12, fontWeight: 700, cursor: isBusy || job.status === "closed" ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                      onMouseEnter={(e) => { if (!isBusy && job.status !== "closed") (e.currentTarget as HTMLElement).style.background = "#1a65d6"; }}
                      onMouseLeave={(e) => { if (!isBusy && job.status !== "closed") (e.currentTarget as HTMLElement).style.background = BRAND; }}
                    >
                      <Zap size={12} />
                      {isBusy ? "Screening…" : "Screen"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailJob(job)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFF", cursor: "pointer", color: "#64748B", fontFamily: "inherit" }}
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

      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onScreen={(id) => screen(id)}
          onViewResults={(id) => openResults(id, detailJob.title ?? "Job")}
          isBusy={busyId === (detailJob.id ?? detailJob.jobId)}
        />
      )}

      {progOpen && (
        <ScreeningProgressModal
          logs={progLogs}
          jobTitle={progTitle}
          total={progTotal}
          done={progDone}
          finished={progFinished}
          onClose={() => {
            setProgOpen(false);
            if (progFinished && resultsJobId) {
              setResultsOpen(true);
            }
          }}
          onViewResults={() => {
            setProgOpen(false);
            const job = jobs.find(j => j.title === progTitle);
            const jid = job?.id ?? job?.jobId ?? "";
            if (jid) openResults(jid, progTitle);
          }}
        />
      )}

      {resultsOpen && resultsJobId && (
        <ScreeningResultsModal
          jobId={resultsJobId}
          jobTitle={resultsJobTitle}
          onClose={() => { setResultsOpen(false); setResultsJobId(null); }}
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