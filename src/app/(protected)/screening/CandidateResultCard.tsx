"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Star } from "lucide-react";

const BRAND = "#2C7CF2";

export interface CandidateResult {
  candidateId: string;
  candidateName?: string;
  rank: number;
  matchScore: number;
  finalScore?: number;
  recommendation?: string;
  strengths?: string[];
  gaps?: string[];
  reasoning?: string;
  explanation?: string;
  evaluationStatus?: string;
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ * (1 - pct / 100);
  const color =
    score >= 80 ? "#10B981" :
    score >= 60 ? BRAND :
    score >= 40 ? "#F59E0B" :
                  "#EF4444";
  return (
    <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
      <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={26} cy={26} r={r} fill="none" stroke="#F1F5F9" strokeWidth={4} />
        <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 900, color,
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
    <span style={{
      padding: "3px 9px", borderRadius: 99,
      background: bg, color, fontSize: 11, fontWeight: 700,
    }}>
      {rec ?? "—"}
    </span>
  );
}

export function CandidateResultCard({
  candidate,
  defaultOpen = false,
}: {
  candidate: CandidateResult;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isTop3 = candidate.rank <= 3;

  const displayName =
    candidate.candidateName ||
    (candidate.candidateId?.replace(/_/g, " ")) ||
    `Candidate ${candidate.rank}`;

  return (
    <div style={{
      border: "1px solid",
      borderColor: isTop3 ? "rgba(44,124,242,0.28)" : "#F0F4F8",
      borderRadius: 12,
      overflow: "hidden",
      background: "#fff",
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,124,242,0.08)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "11px 14px", cursor: "pointer",
          background: open ? "#FAFBFF" : "#fff",
          transition: "background 0.15s",
        }}
        onClick={() => setOpen(!open)}
      >
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: isTop3 ? BRAND : "#F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isTop3
            ? <Star size={13} color="#fff" fill="#fff" />
            : <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>#{candidate.rank}</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "#0F172A",
            margin: "0 0 3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {displayName}
          </p>
          <RecBadge rec={candidate.recommendation} />
        </div>

        <ScoreRing score={candidate.matchScore ?? 0} />

        <div style={{ color: "#94A3B8", flexShrink: 0 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {open && (
        <div style={{
          borderTop: "1px solid #F0F4FF",
          padding: "12px 14px",
          background: "#FAFBFF",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* Strengths + Gaps */}
          {((candidate.strengths?.length ?? 0) > 0 || (candidate.gaps?.length ?? 0) > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(candidate.strengths?.length ?? 0) > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <CheckCircle size={12} color="#10B981" />
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: "#10B981",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>Strengths</span>
                  </div>
                  {candidate.strengths!.map((s, i) => (
                    <p key={i} style={{
                      fontSize: 12, color: "#374151",
                      margin: "0 0 4px", paddingLeft: 8, lineHeight: 1.5,
                    }}>· {s}</p>
                  ))}
                </div>
              )}

              {(candidate.gaps?.length ?? 0) > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <XCircle size={12} color="#F59E0B" />
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: "#F59E0B",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>Gaps</span>
                  </div>
                  {candidate.gaps!.map((g, i) => (
                    <p key={i} style={{
                      fontSize: 12, color: "#374151",
                      margin: "0 0 4px", paddingLeft: 8, lineHeight: 1.5,
                    }}>· {g}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reasoning */}
          {candidate.reasoning && (
            <div style={{
              padding: "8px 12px",
              background: "rgba(44,124,242,0.05)",
              border: "1px solid rgba(44,124,242,0.12)",
              borderRadius: 8,
              fontSize: 12, color: "#374151", lineHeight: 1.65,
            }}>
              <span style={{ fontWeight: 700, color: BRAND }}>Reasoning: </span>
              {candidate.reasoning}
            </div>
          )}

          {candidate.explanation && (
            <div style={{
              padding: "8px 12px",
              background: "#F8FAFF",
              border: "1px solid #E8EDFF",
              borderRadius: 8,
              fontSize: 12, color: "#374151", lineHeight: 1.65,
            }}>
              <span style={{ fontWeight: 700, color: "#6366F1" }}>AI note: </span>
              {candidate.explanation}
            </div>
          )}

          {/* Score chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              padding: "3px 9px", borderRadius: 99,
              background: "#F1F5F9", fontSize: 11, fontWeight: 600, color: "#64748B",
            }}>
              Match: <strong style={{ color: "#0F172A" }}>{candidate.matchScore}/100</strong>
            </span>
            {candidate.finalScore !== undefined && candidate.finalScore !== candidate.matchScore && (
              <span style={{
                padding: "3px 9px", borderRadius: 99,
                background: "#F1F5F9", fontSize: 11, fontWeight: 600, color: "#64748B",
              }}>
                Final: <strong style={{ color: "#0F172A" }}>{candidate.finalScore}/100</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}