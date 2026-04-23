"use client";

import { useEffect, useState } from "react";
import { listScreeningResultsApi } from "@/app/lib/api";
import { CandidateResultCard, CandidateResult } from "@/app/(protected)/screening/CandidateResultCard";
import { X, BarChart3, CheckCircle, XCircle, Users, TrendingUp, Zap } from "lucide-react";

const BRAND = "#2C7CF2";

interface Props {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

export function ScreeningResultsModal({ jobId, jobTitle, onClose }: Props) {
  const [screening, setScreening] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("[ScreeningResults] Loading results for job:", jobId);
        const res = await listScreeningResultsApi(0, 1, jobId);
        console.log("[ScreeningResults] Response:", res);
        const run = res?.data?.[0] ?? null;
        setScreening(run);
        if (!run) setError("No screening results found for this job yet.");
      } catch (err: unknown) {
        console.error("[ScreeningResults] Error:", err);
        setError("Could not load screening results.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const statItems = screening ? [
    { label: "Evaluated",   value: screening.total_evaluated ?? 0,        color: BRAND,      bg: "rgba(44,124,242,0.08)",  icon: <Users size={14} color={BRAND} />        },
    { label: "Passed",      value: screening.successful_evaluations ?? 0, color: "#10B981",  bg: "#ECFDF5",                icon: <CheckCircle size={14} color="#10B981" />  },
    { label: "Skipped",     value: screening.failed_evaluations ?? 0,     color: "#EF4444",  bg: "#FEF2F2",                icon: <XCircle size={14} color="#EF4444" />      },
    { label: "Shortlisted", value: screening.shortlist?.length ?? 0,      color: "#8B5CF6",  bg: "#F5F3FF",                icon: <TrendingUp size={14} color="#8B5CF6" />   },
  ] : [];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(13,27,62,0.52)", backdropFilter: "blur(5px)" }} onClick={onClose} />

      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 640, background: "#fff", borderRadius: 22, boxShadow: "0 24px 64px rgba(44,124,242,0.18)", overflow: "hidden", pointerEvents: "all", animation: "modalIn 0.2s ease both", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

          <div style={{ background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)", padding: "20px 24px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            {[{ w: 200, t: -60, r: -50 }, { w: 110, t: 15, r: 50 }].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: s.w, height: s.w, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)", top: s.t, right: s.r, pointerEvents: "none" }} />
            ))}
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BarChart3 size={14} color="#fff" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "2px 10px" }}>
                    <Zap size={10} color="#fff" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>Gemini AI</span>
                  </div>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Screening Results</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", margin: "4px 0 0" }}>{jobTitle}</p>
              </div>
              <button
                onClick={onClose}
                style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", flexShrink: 0 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BRAND}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Loading results…</p>
              </div>
            ) : error ? (
              <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={22} color="#EF4444" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>{error}</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {statItems.map(s => (
                    <div key={s.label} style={{ flex: "1 1 80px", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: s.bg }}>
                      <div style={{ marginBottom: 4 }}>{s.icon}</div>
                      <span style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</span>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "16px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                    <TrendingUp size={14} color={BRAND} />
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      Top Candidates — {screening?.shortlist?.length ?? 0} ranked
                    </h3>
                  </div>

                  {(screening?.shortlist?.length ?? 0) === 0 ? (
                    <div style={{ padding: "32px 0", textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No ranked candidates in this run yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {screening.shortlist.map((candidate: CandidateResult, idx: number) => (
                        <CandidateResultCard
                          key={candidate.candidateId ?? idx}
                          candidate={{ ...candidate, rank: candidate.rank ?? idx + 1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
      `}</style>
    </>
  );
}