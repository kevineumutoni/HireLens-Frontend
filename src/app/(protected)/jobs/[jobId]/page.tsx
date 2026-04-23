"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJobApi, listScreeningResultsApi } from "@/app/lib/api";
import {
  ArrowLeft, BarChart3, MapPin, Briefcase,
  Users, CheckCircle, XCircle, Zap, Star,
  ChevronDown, ChevronUp, TrendingUp,
} from "lucide-react";
import Link from "next/link";

const BRAND = "#2C7CF2";

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
      padding: "5px 12px", borderRadius: 99,
      background: bg, color, fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ * (1 - pct / 100);
  const color = score >= 80 ? "#10B981" : score >= 60 ? BRAND : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="#F1F5F9" strokeWidth={4} />
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, color,
      }}>
        {score}
      </div>
    </div>
  );
}

function RecBadge({ rec }: { rec?: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Strong Yes": { bg: "#ECFDF5", color: "#059669" },
    "Yes":        { bg: "rgba(44,124,242,0.10)", color: BRAND },
    "Maybe":      { bg: "#FFFBEB", color: "#D97706" },
    "No":         { bg: "#FEF2F2", color: "#DC2626" },
  };
  const { bg, color } = map[rec ?? ""] ?? { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 700 }}>
      {rec ?? "—"}
    </span>
  );
}

function CandidateRow({ candidate, rank }: { candidate: any; rank: number }) {
  const [open, setOpen] = useState(false);
  const isTop3 = rank <= 3;

  return (
    <div style={{
      border: "1px solid",
      borderColor: isTop3 ? "rgba(44,124,242,0.25)" : "#F1F5F9",
      borderRadius: 14,
      overflow: "hidden",
      background: "#fff",
      transition: "border-color 0.15s",
    }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isTop3 ? BRAND : "#F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isTop3
            ? <Star size={14} color="#fff" />
            : <span style={{ fontSize: 12, fontWeight: 800, color: "#64748B" }}>#{rank}</span>
          }
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            {candidate.candidateId?.replace(/_/g, " ") ?? `Candidate ${rank}`}
          </p>
          <RecBadge rec={candidate.recommendation} />
        </div>

        {/* Score ring */}
        <ScoreRing score={candidate.matchScore ?? 0} />

        {/* Expand */}
        <div style={{ color: "#94A3B8", flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{
          borderTop: "1px solid #F8FAFC",
          padding: "14px 16px",
          background: "#FAFBFF",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Strengths & Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {candidate.strengths?.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <CheckCircle size={12} color="#10B981" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em" }}>Strengths</span>
                </div>
                {candidate.strengths.slice(0, 3).map((s: string, i: number) => (
                  <p key={i} style={{ fontSize: 12, color: "#475569", margin: "0 0 3px", paddingLeft: 8 }}>· {s}</p>
                ))}
              </div>
            )}
            {candidate.gaps?.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <XCircle size={12} color="#F59E0B" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gaps</span>
                </div>
                {candidate.gaps.slice(0, 3).map((g: string, i: number) => (
                  <p key={i} style={{ fontSize: 12, color: "#475569", margin: "0 0 3px", paddingLeft: 8 }}>· {g}</p>
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          {candidate.explanation && (
            <div style={{
              padding: "10px 12px",
              background: "rgba(44,124,242,0.06)",
              border: "1px solid rgba(44,124,242,0.15)",
              borderRadius: 10,
              fontSize: 12, color: "#374151", lineHeight: 1.6,
            }}>
              <span style={{ fontWeight: 700, color: BRAND }}>AI note: </span>
              {candidate.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Skeleton({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "#F1F5F9",
      animation: "pulse 1.4s ease infinite",
    }} />
  );
}

export default function JobDetailPage() {

  const params = useParams<{ jobId: string }>();
  const [job, setJob]           = useState<any>(null);
  const [screening, setScreening] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const jobData = await getJobApi(params.jobId);
        setJob(jobData.data || jobData);

        const screeningData = await listScreeningResultsApi(0, 1, params.jobId);
        if (screeningData.data && screeningData.data.length > 0) {
          setScreening(screeningData.data[0]);
        }
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.jobId]);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ height: 40, width: 120, borderRadius: 8, background: "#F1F5F9", animation: "pulse 1.4s ease infinite" }} />
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <Skeleton w="60%" h={28} />
        <Skeleton w="90%" h={14} />
        <Skeleton w="75%" h={14} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );

  if (!job) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 24px", textAlign: "center",
      background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0",
    }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <XCircle size={22} color="#EF4444" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>Job not found</p>
      <p style={{ fontSize: 13, color: "#94A3B8", margin: "6px 0 0" }}>This job may have been deleted.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Link href="/jobs" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, fontWeight: 600, color: BRAND,
        textDecoration: "none", width: "fit-content",
        padding: "6px 12px", borderRadius: 8,
        border: "1.5px solid rgba(44,124,242,0.2)",
        background: "rgba(44,124,242,0.04)",
        transition: "background 0.15s",
      }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(44,124,242,0.10)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(44,124,242,0.04)")}
      >
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <div style={{
        background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.35s ease both",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)",
          padding: "24px 28px 20px",
          position: "relative", overflow: "hidden",
        }}>
          {[{ w: 200, h: 200, t: -60, r: -60 }, { w: 120, h: 120, t: 20, r: 40 }].map((s, i) => (
            <div key={i} style={{
              position: "absolute", width: s.w, height: s.h, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.10)", top: s.t, right: s.r, pointerEvents: "none",
            }} />
          ))}
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                {job.title}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", margin: "6px 0 0", lineHeight: 1.5, maxWidth: 560 }}>
                {job.description}
              </p>
            </div>
            <StatusPill status={job.status} />
          </div>
        </div>

        <div style={{ padding: "18px 28px", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {[
              { icon: MapPin,    label: "Location",   value: job.location      },
              { icon: Briefcase, label: "Type",        value: job.employmentType },
              { icon: Users,     label: "Applicants",  value: job.applicantCount ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(44,124,242,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={14} color={BRAND} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{ padding: "16px 28px 22px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Required Skills
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {job.requiredSkills?.map((skill: string, idx: number) => (
              <span key={idx} style={{
                padding: "4px 12px", borderRadius: 99,
                background: "rgba(44,124,242,0.08)",
                color: BRAND, fontSize: 12, fontWeight: 600,
                border: "1px solid rgba(44,124,242,0.18)",
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Screening results ───────────────────────────────── */}
      {screening ? (
        <div style={{
          background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.4s ease both", animationDelay: "0.1s",
        }}>
          {/* Card header */}
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
                <BarChart3 size={16} color={BRAND} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Screening Results</h2>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
                  Top {screening.shortlist?.length ?? 0} candidates shortlisted
                </p>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99,
              background: "rgba(44,124,242,0.08)", border: "1px solid rgba(44,124,242,0.18)",
            }}>
              <Zap size={12} color={BRAND} />
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND }}>Gemini AI</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F8FAFC", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Evaluated",  value: screening.total_evaluated,       color: BRAND,      bg: "rgba(44,124,242,0.08)"  },
              { label: "Successful", value: screening.successful_evaluations, color: "#10B981",  bg: "#ECFDF5"                },
              { label: "Failed",     value: screening.failed_evaluations,     color: "#EF4444",  bg: "#FEF2F2"                },
              { label: "Shortlisted",value: screening.shortlist?.length ?? 0, color: "#8B5CF6",  bg: "#F5F3FF"                },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 18px", borderRadius: 12,
                background: bg, minWidth: 80,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 3 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Candidate list */}
          <div style={{ padding: "16px 24px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <TrendingUp size={14} color={BRAND} />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", margin: 0 }}>Top Candidates</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {screening.shortlist?.slice(0, 10).map((candidate: any, idx: number) => (
                <CandidateRow key={idx} candidate={candidate} rank={candidate.rank ?? idx + 1} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: "#fff", border: "1px dashed #CBD5E1",
          borderRadius: 20, padding: "48px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          animation: "fadeUp 0.4s ease both", animationDelay: "0.1s",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(44,124,242,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={22} color={BRAND} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>No screening yet</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, textAlign: "center", maxWidth: 300 }}>
            Trigger AI screening from the Jobs page to see ranked candidates here.
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}