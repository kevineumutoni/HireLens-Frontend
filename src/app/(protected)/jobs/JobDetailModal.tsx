"use client";
// src/app/components/jobs/JobDetailModal.tsx
// White modal popup with full job details — triggered when clicking a job card

import { X, MapPin, Clock, Users, GraduationCap, Zap, Calendar } from "lucide-react";

const BRAND = "#2C7CF2";

interface Job {
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
}

interface Props {
  job: Job;
  onClose: () => void;
  onScreen?: (jobId: string) => void;
  isBusy?: boolean;
}

function StatusPill({ status }: { status?: string }) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    open:      { bg: "#ECFDF5", color: "#059669", dot: "#10B981", label: "Open" },
    screening: { bg: "rgba(44,124,242,0.10)", color: BRAND, dot: BRAND, label: "Screening" },
    closed:    { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8", label: "Closed" },
  };
  const { bg, color, dot, label } = map[s] ?? map.open;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      background: bg, color, fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

export function JobDetailModal({ job, onClose, onScreen, isBusy }: Props) {
  const id = job.id || job.jobId || "";

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(13,27,62,0.50)",
          backdropFilter: "blur(5px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 600,
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 24px 64px rgba(44,124,242,0.18)",
          overflow: "hidden",
          pointerEvents: "all",
          animation: "modalIn 0.2s ease both",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
        }}>
          {/* ── Blue header strip ─────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)",
            padding: "22px 26px 18px",
            position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            {/* Decorative rings */}
            {[{ w: 200, t: -60, r: -50 }, { w: 110, t: 15, r: 40 }].map((s, i) => (
              <div key={i} style={{
                position: "absolute", width: s.w, height: s.w, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.10)",
                top: s.t, right: s.r, pointerEvents: "none",
              }} />
            ))}

            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <StatusPill status={job.status} />
                  {job.jobId && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>
                      {job.jobId}
                    </span>
                  )}
                </div>
                <h2 style={{
                  fontSize: 20, fontWeight: 900, color: "#fff",
                  margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  {job.title || "Untitled Job"}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.30)",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff", flexShrink: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ───────────────────────────────── */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 26px 24px" }}>

            {/* Meta chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              {[
                { icon: MapPin,    text: job.location },
                { icon: Clock,     text: job.employmentType },
                { icon: Users,     text: `${job.applicantCount ?? 0} applicants` },
                { icon: GraduationCap, text: job.requiredEducation },
                { icon: Calendar,  text: job.minYearsExperience !== undefined ? `${job.minYearsExperience}+ yrs exp` : undefined },
              ].filter(m => m.text).map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: "rgba(44,124,242,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={13} color={BRAND} />
                  </div>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {job.description && (
              <div style={{ marginBottom: 18 }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
                }}>
                  Description
                </p>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                  {job.description}
                </p>
              </div>
            )}

            {/* Required skills */}
            {(job.requiredSkills?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
                }}>
                  Required Skills
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {job.requiredSkills!.map(s => (
                    <span key={s} style={{
                      padding: "4px 11px", borderRadius: 99,
                      background: "rgba(44,124,242,0.08)",
                      color: BRAND, fontSize: 12, fontWeight: 600,
                      border: "1px solid rgba(44,124,242,0.18)",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred skills */}
            {(job.preferredSkills?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
                }}>
                  Preferred Skills
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {job.preferredSkills!.map(s => (
                    <span key={s} style={{
                      padding: "4px 11px", borderRadius: 99,
                      background: "#F5F3FF", color: "#8B5CF6",
                      fontSize: 12, fontWeight: 600,
                      border: "1px solid #EDE9FE",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft skills */}
            {(job.softSkills?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
                }}>
                  Soft Skills
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {job.softSkills!.map(s => (
                    <span key={s} style={{
                      padding: "4px 11px", borderRadius: 99,
                      background: "#ECFDF5", color: "#059669",
                      fontSize: 12, fontWeight: 600,
                      border: "1px solid #D1FAE5",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer action ─────────────────────────────────── */}
          {onScreen && job.status !== "closed" && (
            <div style={{
              padding: "14px 26px 18px",
              borderTop: "1px solid #F1F5F9",
              display: "flex", gap: 10, flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: "10px", borderRadius: 11,
                  border: "1.5px solid #E2E8F0", background: "#F8FAFF",
                  fontSize: 13, fontWeight: 700, color: "#374151",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Close
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => { onClose(); onScreen(id); }}
                style={{
                  flex: 2, padding: "10px", borderRadius: 11, border: "none",
                  background: isBusy ? "#CBD5E1" : BRAND,
                  color: isBusy ? "#94A3B8" : "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: isBusy ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "inherit",
                }}
              >
                <Zap size={13} />
                {isBusy ? "Screening…" : "Screen with AI"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}