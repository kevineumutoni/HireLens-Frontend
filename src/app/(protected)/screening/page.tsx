"use client";

import { useEffect, useState, useCallback } from "react";
import {
  listScreeningResultsApi,
  listJobsApi,
  triggerScreeningApi,
  deleteScreeningRunApi,
  deleteAllScreeningRunsApi,
} from "@/app/lib/api";
import {
  BarChart2,
  Briefcase,
  Play,
  X,
  CheckCircle2,
  TrendingUp,
  Clock,
  RefreshCw,
  ChevronDown,
  Zap,
  MoreVertical,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { CandidateResultCard, CandidateResult } from "./CandidateResultCard";
import { ScreeningProgressModal, ProgressLog } from "./ScreeningProgressModal";

const BRAND = "#2C7CF2";
const DEBUG = true;

function log(...args: unknown[]) {
  if (DEBUG) console.log("[screening]", ...args);
}
function warn(...args: unknown[]) {
  if (DEBUG) console.warn("[screening]", ...args);
}
function errlog(...args: unknown[]) {
  if (DEBUG) console.error("[screening]", ...args);
}

function formatAxiosError(e: unknown): string {
  if (!axios.isAxiosError(e)) {
    if (e instanceof Error) return e.message;
    return "Request failed";
  }
  const status = e.response?.status;
  const detail =
    (e.response?.data as any)?.detail ??
    (e.response?.data as any)?.message ??
    e.message;

  return status ? `(${status}) ${detail}` : String(detail);
}

function StatBox({
  label,
  value,
  color = "#0F172A",
  bg = "#F8FAFC",
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "10px 14px", minWidth: 72 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
          color: "#94A3B8",
          margin: "0 0 3px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function RunBadge({ id }: { id: string }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 99,
        background: "rgba(44,124,242,0.08)",
        color: BRAND,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      {id}
    </span>
  );
}

function TopNSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Show top:</span>
      {[5, 10, 20, 50].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            border: "none",
            background: value === n ? BRAND : "#F1F5F9",
            color: value === n ? "#fff" : "#64748B",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: "inherit",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function RunScreeningModal({
  jobs,
  onClose,
  onStart,
}: {
  jobs: Array<{ id?: string; jobId?: string; title?: string; status?: string; applicantCount?: number; location?: string }>;
  onClose: () => void;
  onStart: (jobId: string, title: string, count: number) => void;
}) {
  const [sel, setSel] = useState("");
  const [err, setErr] = useState("");
  const selJob = jobs.find((j) => (j.jobId || j.id) === sel);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: 460,
          overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}
      >
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(44,124,242,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Play size={14} color={BRAND} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>Run AI Screening</h2>
              <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Gemini evaluates candidates vs job</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            <X size={12} />
          </button>
        </div>

        <div style={{ padding: "18px 20px" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Select Job <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={sel}
              onChange={(e) => {
                setSel(e.target.value);
                setErr("");
              }}
              style={{
                width: "100%",
                padding: "9px 32px 9px 12px",
                borderRadius: 10,
                border: `1.5px solid ${err ? "#EF4444" : "#E2E8F0"}`,
                fontSize: 13,
                color: "#0F172A",
                background: "#FAFAFA",
                outline: "none",
                fontFamily: "inherit",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">— Choose a job —</option>
              {jobs
                .filter((j) => j.status !== "closed")
                .map((j) => (
                  <option key={j.jobId || j.id} value={j.jobId || j.id}>
                    {j.title || "Untitled"} · {j.applicantCount ?? 0} applicants
                  </option>
                ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: "absolute",
                right: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
                pointerEvents: "none",
              }}
            />
          </div>
          {err && <p style={{ fontSize: 11, color: "#EF4444", margin: "5px 0 0", fontWeight: 500 }}>{err}</p>}

          {selJob && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(44,124,242,0.05)",
                border: "1px solid rgba(44,124,242,0.15)",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>{selJob.title}</p>
              <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>
                📍 {selJob.location} · 👥 {selJob.applicantCount ?? 0} candidates
              </p>
            </div>
          )}
        </div>

        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              background: "#F8FAFF",
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!sel) {
                setErr("Please select a job");
                return;
              }
              onStart(sel, selJob?.title || "Job", selJob?.applicantCount || 0);
              onClose();
            }}
            style={{
              flex: 2,
              padding: "9px",
              borderRadius: 10,
              border: "none",
              background: sel ? BRAND : "#CBD5E1",
              color: sel ? "#fff" : "#94A3B8",
              fontSize: 13,
              fontWeight: 700,
              cursor: sel ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <Zap size={13} /> Start Screening
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScreeningPage() {
  const [results, setResults] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [topNMap, setTopNMap] = useState<Record<string, number>>({});
  const [pageError, setPageError] = useState<string>("");

  const [openMenuId, setOpenMenuId] = useState<string>("");

  const [progOpen, setProgOpen] = useState(false);
  const [progLogs, setProgLogs] = useState<ProgressLog[]>([]);
  const [progTotal, setProgTotal] = useState(0);
  const [progDone, setProgDone] = useState(0);
  const [progTitle, setProgTitle] = useState("");
  const [progFinished, setProgFinished] = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const res = await listScreeningResultsApi(0, 50);
      const data = Array.isArray(res?.data) ? res.data : [];
      setResults(data);
    } catch (e: unknown) {
      const msg = formatAxiosError(e);
      setPageError(`Failed to load screening results: ${msg}`);
      toast.error("Could not load screening results. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const res = await listJobsApi(0, 100);
      setJobs(Array.isArray(res?.data) ? res.data : []);
    } catch (e: unknown) {
      // not fatal
    }
  }, []);

  useEffect(() => {
    void loadResults();
    void loadJobs();
  }, [loadResults, loadJobs]);

  const startScreening = async (jobId: string, title: string, total: number) => {
    const addLog = (text: string, type: ProgressLog["type"] = "step") =>
      setProgLogs((prev) => [...prev, { text, type, ts: Date.now() }]);

    setProgLogs([]);
    setProgTotal(total || 100);
    setProgDone(0);
    setProgTitle(title);
    setProgOpen(true);
    setProgFinished(false);

    addLog(`Starting screening for "${title}"…`, "info");
    addLog("Fetching candidates from database…");
    await new Promise((r) => setTimeout(r, 400));
    addLog("Connecting to Gemini AI…");
    await new Promise((r) => setTimeout(r, 300));
    addLog("Sending candidates for evaluation…");

    const realTotal = total || 100;
    let fake = 0;
    const ticker = setInterval(() => {
      fake = Math.min(fake + Math.floor(Math.random() * 3) + 1, realTotal - 1);
      setProgDone(fake);
      setProgLogs((prev) => {
        const last = prev[prev.length - 1];
        const txt = `Evaluating candidate ${fake}/${realTotal}…`;
        if (last?.text?.startsWith("Evaluating candidate")) {
          return [...prev.slice(0, -1), { text: txt, type: "step", ts: Date.now() }];
        }
        return [...prev, { text: txt, type: "step", ts: Date.now() }];
      });
    }, 1800);

    try {
      const res = await triggerScreeningApi({ job_id: jobId, use_all_candidates: true });

      clearInterval(ticker);
      setProgDone(realTotal);

      addLog(`✓ ${res.successfulEvaluations ?? realTotal} candidates evaluated`, "done");
      if ((res.failedEvaluations ?? 0) > 0) addLog(`⚠ ${res.failedEvaluations} failed`, "error");
      addLog(`✓ Top ${res.shortlistSize ?? 10} candidates ranked`, "done");
      addLog("✓ Results saved to database!", "done");
      setProgFinished(true);

      toast.success("Screening complete! Results loaded below.");
      await loadResults();
    } catch (e: unknown) {
      clearInterval(ticker);
      const msg = formatAxiosError(e);
      addLog(`✗ ${msg}`, "error");
      setProgFinished(true);
      toast.error(`Screening failed: ${msg}`);
    }
  };

  const getTopN = (id: string) => topNMap[id] ?? 10;
  const setTopN = (id: string, n: number) => setTopNMap((p) => ({ ...p, [id]: n }));

  const deleteRun = async (runId: string) => {
    setOpenMenuId("");
    const ok = window.confirm("Delete this screening run permanently? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteScreeningRunApi(runId);
      toast.success("Screening run deleted.");
      await loadResults();
    } catch (e: unknown) {
      toast.error(`Delete failed: ${formatAxiosError(e)}`);
    }
  };

  const deleteAllRuns = async () => {
    const ok = window.confirm("Delete ALL screening runs permanently?");
    if (!ok) return;

    try {
      const res = await deleteAllScreeningRunsApi();
      toast.success(`Deleted ${res?.deleted ?? "all"} runs.`);
      await loadResults();
    } catch (e: unknown) {
      toast.error(`Delete all failed: ${formatAxiosError(e)}`);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}
      onClick={() => openMenuId && setOpenMenuId("")}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 18,
          padding: "18px 22px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "rgba(44,124,242,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart2 size={19} color={BRAND} />
          </div>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
              Screening Results
            </h1>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
              {loading ? "Loading…" : `${results.length} run${results.length !== 1 ? "s" : ""} in database`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={loadResults}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              background: "#F8FAFF",
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              background: BRAND,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Play size={12} /> Run New Screening
          </button>

          <button
            type="button"
            onClick={deleteAllRuns}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1.5px solid #FCA5A5",
              background: "#FEF2F2",
              fontSize: 12,
              fontWeight: 800,
              color: "#991B1B",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            title="Delete all screening runs"
          >
            <Trash2 size={12} /> Delete all
          </button>
        </div>
      </div>

      {pageError && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1.5px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#991B1B",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {pageError}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `3px solid ${BRAND}`,
              borderTopColor: "transparent",
              animation: "spin 0.7s linear infinite",
            }}
          />
        </div>
      ) : results.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #CBD5E1",
            borderRadius: 18,
            padding: "56px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>No screening results yet</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              background: BRAND,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Play size={12} /> Run First Screening
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {results.map((result, idx) => {
            const runId = result.id || result._id || result.screeningRunId || String(idx);
            const topN = getTopN(runId);
            const shortlist = (result.shortlist || []) as CandidateResult[];
            const displayed = shortlist.slice(0, topN);
            const successRate =
              result.total_evaluated > 0 ? Math.round((result.successful_evaluations / result.total_evaluated) * 100) : 0;

            return (
              <div
                key={runId}
                style={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "rgba(44,124,242,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Briefcase size={15} color={BRAND} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        {result.job?.title || "Untitled Job"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        {result.job?.location && <span style={{ fontSize: 12, color: "#64748B" }}>{result.job.location}</span>}
                        {result.timestamp && (
                          <span style={{ fontSize: 11, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} />
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {result.screeningRunId && <RunBadge id={result.screeningRunId} />}

                    {/* 3-dots menu */}
                    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId((cur) => (cur === runId ? "" : runId))}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          border: "1.5px solid #E2E8F0",
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748B",
                        }}
                        title="More"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === runId && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 40,
                            zIndex: 50,
                            minWidth: 180,
                            background: "#fff",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                            borderRadius: 12,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => deleteRun(runId)}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              border: "none",
                              background: "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#B91C1C",
                              fontFamily: "inherit",
                            }}
                          >
                            <Trash2 size={14} /> Delete run 
                          </button>
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 9px",
                        borderRadius: 99,
                        background: "rgba(44,124,242,0.08)",
                        border: "1px solid rgba(44,124,242,0.15)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: BRAND,
                      }}
                    >
                      <Zap size={10} /> Gemini AI
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #F8FAFC" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <StatBox label="Evaluated" value={result.total_evaluated ?? 0} />
                    <StatBox label="Successful" value={result.successful_evaluations ?? 0} color="#15803D" bg="#F0FDF4" />
                    <StatBox label="Failed" value={result.failed_evaluations ?? 0} color="#DC2626" bg="#FFF1F2" />
                    <StatBox label="Pass rate" value={`${successRate}%`} color={BRAND} bg="rgba(44,124,242,0.07)" />
                    <StatBox label="Shortlisted" value={(result.shortlist || []).length} color="#8B5CF6" bg="#F5F3FF" />
                  </div>
                </div>

                {/* Shortlist */}
                <div style={{ padding: "14px 20px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={13} color={BRAND} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Top {displayed.length} Candidates</span>
                    </div>
                    <TopNSelector value={topN} onChange={(n) => setTopN(runId, n)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {displayed.map((c, i) => (
                      <CandidateResultCard key={c.candidateId || i} candidate={c} defaultOpen={i === 0} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <RunScreeningModal jobs={jobs} onClose={() => setShowModal(false)} onStart={startScreening} />}

      {progOpen && (
        <ScreeningProgressModal
          logs={progLogs}
          jobTitle={progTitle}
          total={progTotal}
          done={progDone}
          finished={progFinished}
          onClose={() => setProgOpen(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}