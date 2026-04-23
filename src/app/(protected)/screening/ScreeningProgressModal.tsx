"use client";

import { X, Zap, CheckCircle, BarChart3 } from "lucide-react";

const BRAND = "#2C7CF2";

export interface ProgressLog {
  text: string;
  type: "step" | "done" | "error" | "info";
  ts: number;
}

interface Props {
  logs: ProgressLog[];
  jobTitle: string;
  total: number;
  done: number;
  onClose?: () => void;
  onViewResults?: () => void;
  finished: boolean;
}

export function ScreeningProgressModal({ logs, jobTitle, total, done, onClose, onViewResults, finished }: Props) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(13,27,62,0.55)", backdropFilter: "blur(5px)" }} />

      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: 22, boxShadow: "0 24px 64px rgba(44,124,242,0.20)", overflow: "hidden", pointerEvents: "all", animation: "modalIn 0.2s ease both" }}>

          <div style={{ background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {finished ? <CheckCircle size={17} color="#fff" /> : <Zap size={17} color="#fff" />}
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>
                  {finished ? "Screening complete" : "Screening candidates…"}
                </h2>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", margin: 0 }}>{jobTitle}</p>
              </div>
            </div>
            {finished && onClose && (
              <button
                onClick={onClose}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{ padding: "16px 22px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                {finished ? "All done" : `Evaluated ${done} of ${total}`}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: finished ? "#10B981" : BRAND }}>{pct}%</span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 99, background: "#F1F5F9", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: finished ? "linear-gradient(90deg,#10B981,#34D399)" : `linear-gradient(90deg,#1a65d6,${BRAND})`, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <div style={{ margin: "14px 22px 0", background: "#F8FAFF", border: "1px solid #E8EDFF", borderRadius: 12, padding: "12px 14px", maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {logs.length === 0
              ? <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Starting up…</p>
              : logs.map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                  {log.type === "done"  && <CheckCircle size={12} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />}
                  {log.type === "error" && <X size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />}
                  {log.type === "step"  && (
                    i === logs.length - 1 && !finished
                      ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${BRAND}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0, marginTop: 1 }} />
                      : <CheckCircle size={12} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
                  )}
                  {log.type === "info" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#CBD5E1", flexShrink: 0, marginTop: 3 }} />}
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: log.type === "error" ? "#DC2626" : log.type === "done" ? "#059669" : "#374151", fontWeight: log.type === "done" || log.type === "error" ? 600 : 400 }}>
                    {log.text}
                  </span>
                </div>
              ))
            }
          </div>

          {finished && onViewResults ? (
            <div style={{ padding: "16px 22px 20px", display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: "10px", borderRadius: 11, border: "1.5px solid #E2E8F0", background: "#F8FAFF", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
              >
                Close
              </button>
              <button
                onClick={onViewResults}
                style={{ flex: 2, padding: "10px", borderRadius: 11, border: "none", background: "#8B5CF6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#7C3AED")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B5CF6")}
              >
                <BarChart3 size={14} /> View Results
              </button>
            </div>
          ) : !finished ? (
            <p style={{ padding: "12px 22px 18px", fontSize: 11, color: "#94A3B8", textAlign: "center", margin: 0 }}>
              Gemini AI is evaluating each candidate — this may take 1–3 minutes.
            </p>
          ) : (
            <div style={{ padding: "0 22px 18px" }} />
          )}
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