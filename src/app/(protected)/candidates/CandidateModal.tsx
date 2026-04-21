"use client";


import { useEffect } from "react";
import {
  X, MapPin, Mail, Briefcase, GraduationCap, Code2,
  Globe, Calendar, Star,
  CheckCircle, FolderGit2, Languages,
} from "lucide-react";
import { FaGithub as Github, FaLinkedin as Linkedin } from "react-icons/fa";

const BRAND = "#2C7CF2";

// ── helpers ────────────────────────────────────────────────────

function Avatar({ first, last, size = 52 }: { first?: string; last?: string; size?: number }) {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
  const hue = ((first?.charCodeAt(0) ?? 0) * 37 + (last?.charCodeAt(0) ?? 0) * 13) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},60%,88%)`,
      border: `2.5px solid hsl(${hue},60%,76%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 900,
      color: `hsl(${hue},50%,32%)`,
    }}>
      {initials}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 12, paddingBottom: 8,
        borderBottom: "1px solid #F1F5F9",
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "rgba(44,124,242,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function SkillBadge({ skill }: { skill: { name: string; level: string; yearsOfExperience?: number } }) {
  const levelColors: Record<string, { bg: string; text: string }> = {
    Expert:       { bg: "rgba(44,124,242,0.12)",  text: "#1a65d6" },
    Advanced:     { bg: "rgba(16,185,129,0.10)",  text: "#065f46" },
    Intermediate: { bg: "rgba(245,158,11,0.10)",  text: "#92400e" },
    Beginner:     { bg: "rgba(148,163,184,0.12)", text: "#475569" },
  };
  const colors = levelColors[skill.level] ?? levelColors.Beginner;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 10px", borderRadius: 8,
      border: "1px solid rgba(0,0,0,0.06)",
      background: "#FAFBFF",
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{skill.name}</span>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
        background: colors.bg, color: colors.text,
      }}>
        {skill.level}
      </span>
      {skill.yearsOfExperience != null && (
        <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: 2 }}>
          {skill.yearsOfExperience}y
        </span>
      )}
    </div>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────

interface CandidateModalProps {
  candidate: any | null;
  onClose: () => void;
}

export function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!candidate) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [candidate, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (candidate) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [candidate]);

  if (!candidate) return null;

  const fullName = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim();

  const availabilityColor =
    candidate.availability?.status === "Available" ? "#16a34a" :
    candidate.availability?.status === "Open to Opportunities" ? "#d97706" : "#94A3B8";

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
          animation: "backdropIn 0.2s ease",
        }}
      />

      {/* ── Panel ─────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 51,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 96vw)",
          maxHeight: "90vh",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "modalIn 0.22s cubic-bezier(0.22,1,0.36,1)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid #F1F5F9",
          background: "linear-gradient(135deg, #F8FAFF 0%, #fff 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar first={candidate.firstName} last={candidate.lastName} size={56} />
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {fullName || "Unknown Candidate"}
                </h2>
                {candidate.headline && (
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontStyle: "italic" }}>
                    {candidate.headline}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
                  <InfoRow icon={<Mail size={13} color="#94A3B8" />} text={candidate.email} />
                  <InfoRow icon={<MapPin size={13} color="#94A3B8" />} text={candidate.location} />
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1.5px solid #E2E8F0", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, color: "#64748B",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLElement).style.background = "#F8FAFF"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Availability + social links */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
            {candidate.availability?.status && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: availabilityColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: availabilityColor }}>
                  {candidate.availability.status}
                </span>
                {candidate.availability.type && (
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    · {candidate.availability.type}
                  </span>
                )}
              </div>
            )}
            {/* Social links */}
            <div style={{ display: "flex", gap: 8 }}>
              {candidate.socialLinks?.linkedin && (
                <a href={candidate.socialLinks.linkedin} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: BRAND, textDecoration: "none" }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {candidate.socialLinks?.github && (
                <a href={candidate.socialLinks.github} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                  <Github size={14} /> GitHub
                </a>
              )}
              {candidate.socialLinks?.portfolio && (
                <a href={candidate.socialLinks.portfolio} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                  <Globe size={14} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ──────────────────────────────── */}
        <div style={{ overflowY: "auto", padding: "24px 28px", flex: 1 }}>

          {/* Bio */}
          {candidate.bio && (
            <div style={{
              background: "rgba(44,124,242,0.04)", border: "1px solid rgba(44,124,242,0.10)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 24,
            }}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {candidate.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {candidate.skills?.length > 0 && (
            <Section title="Skills" icon={<Code2 size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {candidate.skills.map((s: any, i: number) => (
                  <SkillBadge key={i} skill={s} />
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {candidate.experience?.length > 0 && (
            <Section title="Experience" icon={<Briefcase size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {candidate.experience.map((exp: any, i: number) => (
                  <div key={i} style={{
                    padding: "14px 16px", borderRadius: 12,
                    border: "1px solid #F1F5F9", background: "#FAFBFF",
                    position: "relative",
                  }}>
                    {/* Current badge */}
                    {exp.isCurrent && (
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 99, background: "rgba(44,124,242,0.10)", color: BRAND,
                      }}>
                        Current
                      </span>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 2px" }}>
                      {exp.role}
                    </p>
                    <p style={{ fontSize: 13, color: BRAND, fontWeight: 600, margin: "0 0 6px" }}>
                      {exp.company}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <Calendar size={11} color="#94A3B8" />
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>
                        {exp.startDate} — {exp.endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px", lineHeight: 1.55 }}>
                        {exp.description}
                      </p>
                    )}
                    {exp.technologies?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {exp.technologies.map((t: string, ti: number) => (
                          <span key={ti} style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                            background: "#F1F5F9", color: "#475569",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <Section title="Education" icon={<GraduationCap size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidate.education.map((edu: any, i: number) => (
                  <div key={i} style={{
                    padding: "12px 16px", borderRadius: 12,
                    border: "1px solid #F1F5F9", background: "#FAFBFF",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 2px" }}>
                        {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                      </p>
                      <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{edu.institution}</p>
                    </div>
                    <span style={{
                      fontSize: 11, color: "#94A3B8", fontWeight: 600,
                      whiteSpace: "nowrap", paddingLeft: 12,
                    }}>
                      {edu.startYear} – {edu.endYear}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {candidate.projects?.length > 0 && (
            <Section title="Projects" icon={<FolderGit2 size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidate.projects.map((proj: any, i: number) => (
                  <div key={i} style={{
                    padding: "12px 16px", borderRadius: 12,
                    border: "1px solid #F1F5F9", background: "#FAFBFF",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", margin: 0 }}>{proj.name}</p>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: BRAND, fontWeight: 700, textDecoration: "none", paddingLeft: 10, whiteSpace: "nowrap" }}>
                          View ↗
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 8px", lineHeight: 1.5 }}>
                      {proj.description}
                    </p>
                    {proj.technologies?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {proj.technologies.map((t: string, ti: number) => (
                          <span key={ti} style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px",
                            borderRadius: 6, background: "#F1F5F9", color: "#475569",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Languages */}
          {candidate.languages?.length > 0 && (
            <Section title="Languages" icon={<Languages size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {candidate.languages.map((lang: any, i: number) => (
                  <div key={i} style={{
                    padding: "5px 12px", borderRadius: 8,
                    border: "1px solid #E2E8F0", background: "#FAFBFF",
                    fontSize: 12, fontWeight: 700, color: "#374151",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {lang.name}
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {candidate.certifications?.length > 0 && (
            <Section title="Certifications" icon={<Star size={14} color={BRAND} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {candidate.certifications.map((cert: any, i: number) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #F1F5F9", background: "#FAFBFF",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={14} color="#16a34a" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>{cert.name}</p>
                        <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{cert.issuer}</p>
                      </div>
                    </div>
                    {cert.issueDate && (
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>{cert.issueDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes backdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.97) }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
        }
      `}</style>
    </>
  );
}