"use client";

import { useEffect, useState } from "react";
import { listCandidatesApi } from "@/app/lib/api";
import { FileUploadModal } from "@/app/components/FileUploadModal";
import { AddCandidateModal } from "./AddCandidateModal";
import { CandidateModal } from "./CandidateModal"; // ← NEW
import { Pagination } from "@/app/components/ui/Pagination";
import { Users, Search, Plus, Upload, MapPin, Mail, Briefcase, ChevronRight } from "lucide-react";

import type { Candidate, Skill } from "./types";

const BRAND = "#2C7CF2";

function Avatar({ first, last }: { first?: string; last?: string }) {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
  const hue = ((first?.charCodeAt(0) ?? 0) * 37 + (last?.charCodeAt(0) ?? 0) * 13) % 360;
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue},60%,88%)`,
        border: `2px solid hsl(${hue},60%,78%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        color: `hsl(${hue},50%,35%)`,
      }}
    >
      {initials}
    </div>
  );
}

function SkillTag({ name }: { name: string }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 99,
        background: "rgba(44,124,242,0.08)",
        border: "1px solid rgba(44,124,242,0.15)",
        fontSize: 11,
        fontWeight: 600,
        color: BRAND,
      }}
    >
      {name}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[44, 160, 140, 180, 110, 100].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div
            style={{
              width: w,
              height: i === 0 ? 36 : 13,
              borderRadius: i === 0 ? "50%" : 6,
              background: "#F1F5F9",
              animation: "pulse 1.4s ease infinite",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Candidate | null>(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;

      const data = (await listCandidatesApi(skip, pageSize, search)) as {
        data?: Candidate[];
        total?: number | string;
      };

      setCandidates(data.data || []);
      setTotal(Number(data.total || 0));
    } catch (error) {
      console.error("Failed to load candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadCandidates();
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadCandidates();
  }, [page]);
  // ──────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 18,
          padding: "20px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.3s ease both",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                background: "rgba(44,124,242,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} color={BRAND} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                Candidates
              </h1>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                {loading ? "Loading…" : `${total.toLocaleString()} candidate${total !== 1 ? "s" : ""} total`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              />
              <input
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "9px 13px 9px 33px",
                  borderRadius: 11,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 13,
                  color: "#0F172A",
                  background: "#FAFAFA",
                  outline: "none",
                  width: 240,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = BRAND;
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(44,124,242,0.10)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#FAFAFA";
                }}
              />
            </div>

            {/* Upload CSV/PDF */}
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 11,
                border: "1.5px solid #E2E8F0",
                background: "#F8FAFF",
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1";
                (e.currentTarget as HTMLElement).style.background = "#F1F5F9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
                (e.currentTarget as HTMLElement).style.background = "#F8FAFF";
              }}
            >
              <Upload size={13} /> Upload CSV / PDF
            </button>

            {/* Add candidate */}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 11,
                border: "none",
                background: BRAND,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s, transform 0.1s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a65d6")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = BRAND)}
              onMouseDown={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(0.97)")}
              onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
            >
              <Plus size={14} /> Add Candidate
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.4s ease both",
          animationDelay: "0.05s",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 780, borderCollapse: "collapse" }}>
            {/* Head */}
            <thead>
              <tr style={{ background: "#F8FAFF", borderBottom: "1px solid #E8EDFF" }}>
                {["Candidate", "Email", "Headline", "Location", "Skills", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "56px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: "rgba(44,124,242,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Users size={20} color={BRAND} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                        {search ? "No candidates match your search" : "No candidates yet"}
                      </p>
                      <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                        {search ? "Try a different search term" : "Add a candidate or upload a CSV to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, idx) => {
                  const key = (candidate as Record<string, unknown>)["_id"] || (candidate as Record<string, unknown>)["id"] || candidate.email || idx;
                  return (
                    <tr
                      key={String(key)}
                      onClick={() => setSelected(candidate)}
                      style={{
                        borderTop: "1px solid #F8FAFC",
                        transition: "background 0.12s",
                        cursor: "pointer", // ← was "default"
                        animation: "fadeUp 0.3s ease both",
                        animationDelay: `${idx * 0.03}s`,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFF")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Name + avatar */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar first={candidate.firstName} last={candidate.lastName} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                            {candidate.firstName} {candidate.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Mail size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>{candidate.email}</span>
                        </div>
                      </td>

                      {/* Headline */}
                      <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Briefcase size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: 12,
                              color: "#475569",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {candidate.headline || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>{candidate.location || "—"}</span>
                        </div>
                      </td>

                      {/* Skills */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {candidate.skills?.slice(0, 3).map((skill: Skill, sIdx: number) => (
                            <SkillTag key={sIdx} name={skill.name} />
                          ))}
                          {(candidate.skills?.length ?? 0) > 3 && (
                            <span
                              style={{
                                padding: "2px 7px",
                                borderRadius: 99,
                                background: "#F1F5F9",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#64748B",
                              }}
                            >
                              +{(candidate.skills?.length ?? 0) - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Arrow */}
                      <td style={{ padding: "12px 16px" }}>
                        <ChevronRight size={14} color="#CBD5E1" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > pageSize && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #F1F5F9",
              background: "#FAFBFF",
            }}
          >
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>

      <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={loadCandidates} />
      <AddCandidateModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={loadCandidates} />

      <CandidateModal candidate={selected} onClose={() => setSelected(null)} />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}