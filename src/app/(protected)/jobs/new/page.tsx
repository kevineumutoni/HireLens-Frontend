"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJobApi, listCandidatesApi } from "@/app/lib/api";
import {
  ArrowLeft, Briefcase, MapPin, Clock,
  GraduationCap, Sparkles, AlertCircle, Plus, Users,
} from "lucide-react";
import toast from "react-hot-toast";

const BRAND = "#2C7CF2";

const schema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description required"),
  location: z.string().min(2, "Location required"),
  employmentType: z.string().min(1, "Employment type required"),
  requiredSkills: z.string().min(2, "At least one skill required"),
  preferredSkills: z.string().optional().default(""),
  minYearsExperience: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return 0;
    if (num < 0)  return 0;
    if (num > 50) return 50;
    return num;
  }),
  requiredEducation: z.string().optional().default(""),
});

function Field({
  label, required, hint, error, icon, children,
}: {
  label: string; required?: boolean; hint?: string;
  error?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {label}
        {required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#94A3B8", pointerEvents: "none", display: "flex",
          }}>
            {icon}
          </div>
        )}
        {children}
      </div>
      {hint && !error && <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{hint}</p>}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#EF4444", fontWeight: 500 }}>
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

const inputStyle = (hasIcon: boolean, error: boolean): React.CSSProperties => ({
  width: "100%",
  paddingTop: 10, paddingBottom: 10,
  paddingLeft: hasIcon ? 38 : 13, paddingRight: 13,
  borderRadius: 11,
  border: `1.5px solid ${error ? "#EF4444" : "#E2E8F0"}`,
  fontSize: 14, color: "#0F172A",
  background: "#FAFAFA",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s, box-shadow 0.15s",
});

function SectionCard({
  icon, title, children, delay,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode; delay?: string;
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0",
      borderRadius: 18, overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      animation: "fadeUp 0.4s ease both",
      animationDelay: delay ?? "0s",
    }}>
      <div style={{
        padding: "14px 22px", borderBottom: "1px solid #F1F5F9",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "rgba(44,124,242,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      style={{
        width: 44, height: 24, borderRadius: 99, border: "none",
        background: on ? BRAND : "#D1D5DB",
        cursor: "pointer", flexShrink: 0,
        position: "relative",
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}

export default function NewJobPage() {
  const router = useRouter();

  const [includeMock, setIncludeMock] = useState(false);

  const [candidateCount, setCandidateCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listCandidatesApi(0, 1);
        setCandidateCount(Number(res?.total ?? res?.data?.total ?? 0));
      } catch {
        setCandidateCount(null);
      }
    })();
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      title: "", description: "", location: "", employmentType: "Full-time",
      requiredSkills: "", preferredSkills: "", minYearsExperience: "0", requiredEducation: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        location: data.location,
        employmentType: data.employmentType,
        requiredSkills: data.requiredSkills.split(",").map((s: string) => s.trim()).filter(Boolean),
        preferredSkills: (data.preferredSkills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        minYearsExperience: parseInt(data.minYearsExperience, 10) || 0,
        requiredEducation: data.requiredEducation || "Any",
        softSkills: [],
        includeMockCandidates: includeMock === true,
      };
      const job = await createJobApi(payload);
      toast.success(
        includeMock && candidateCount
          ? `Job created with ${candidateCount} candidates!`
          : "Job created successfully!"
      );
      router.push(`/jobs/${job.id || job.jobId}`);
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast.error(error?.response?.data?.detail || "Failed to create job");
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BRAND;
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(44,124,242,0.10)";
    e.currentTarget.style.background  = "#fff";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#E2E8F0";
    e.currentTarget.style.boxShadow   = "none";
    e.currentTarget.style.background  = "#FAFAFA";
  };

  const countLabel =
    candidateCount === null
      ? "loading…"
      : candidateCount === 0
      ? "no candidates yet"
      : `${candidateCount} candidate${candidateCount !== 1 ? "s" : ""} in system`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{
        background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 18, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.3s ease both",
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1.5px solid #E2E8F0", background: "#F8FAFF",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, color: "#475569",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; (e.currentTarget as HTMLElement).style.background = "rgba(44,124,242,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#F8FAFF"; }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
            Create Job
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
            Define the role and requirements for AI screening
          </p>
        </div>
        <div style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 99,
          background: "rgba(44,124,242,0.08)",
          border: "1px solid rgba(44,124,242,0.18)",
        }}>
          <Sparkles size={13} color={BRAND} />
          <span style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>AI-ready</span>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <SectionCard icon={<Briefcase size={15} color={BRAND} />} title="Basic Information" delay="0.05s">
          <Field label="Job Title" required error={errors.title?.message as string}>
            <input {...register("title")} placeholder="e.g., Backend Engineer"
              style={inputStyle(false, !!errors.title)} onFocus={onFocus} onBlur={onBlur} />
          </Field>

          <Field label="Description" required error={errors.description?.message as string}>
            <textarea {...register("description")}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              rows={4}
              style={{ ...inputStyle(false, !!errors.description), resize: "vertical", minHeight: 100, paddingTop: 11, paddingBottom: 11, lineHeight: 1.6 }}
              onFocus={onFocus} onBlur={onBlur} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Location" required icon={<MapPin size={14} />} error={errors.location?.message as string}>
              <input {...register("location")} placeholder="e.g., Kigali, Rwanda"
                style={inputStyle(true, !!errors.location)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Employment Type" required icon={<Clock size={14} />} error={errors.employmentType?.message as string}>
              <select {...register("employmentType")}
                style={{ ...inputStyle(true, !!errors.employmentType), cursor: "pointer" }}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard icon={<Sparkles size={15} color={BRAND} />} title="Requirements & Skills" delay="0.10s">
          <Field label="Required Skills" required
            hint="These will be used by Gemini AI for candidate matching — separate with commas"
            error={errors.requiredSkills?.message as string}>
            <input {...register("requiredSkills")} placeholder="e.g., Node.js, Python, React"
              style={inputStyle(false, !!errors.requiredSkills)} onFocus={onFocus} onBlur={onBlur} />
          </Field>

          <Field label="Preferred Skills" hint="Nice-to-have skills — separate with commas">
            <input {...register("preferredSkills")} placeholder="e.g., AWS, Docker, Kubernetes"
              style={inputStyle(false, false)} onFocus={onFocus} onBlur={onBlur} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Min. Years Experience" icon={<Clock size={14} />} error={errors.minYearsExperience?.message as string}>
              <input {...register("minYearsExperience")} type="number" min="0" max="50"
                style={inputStyle(true, !!errors.minYearsExperience)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Required Education" icon={<GraduationCap size={14} />}>
              <input {...register("requiredEducation")} placeholder="e.g., Bachelor's in CS"
                style={inputStyle(true, false)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
        </SectionCard>


        <div
          style={{
            background: includeMock ? "rgba(44,124,242,0.03)" : "#fff",
            border: `1.5px solid ${includeMock ? "rgba(44,124,242,0.35)" : "#E2E8F0"}`,
            borderRadius: 18, padding: "16px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            boxShadow: includeMock ? "0 0 0 3px rgba(44,124,242,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
            transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            animation: "fadeUp 0.4s ease both", animationDelay: "0.13s",
            cursor: "pointer",
          }}
          onClick={() => setIncludeMock((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: includeMock ? "rgba(44,124,242,0.12)" : "#F1F5F9",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <Users size={18} color={includeMock ? BRAND : "#94A3B8"} />
            </div>

            {/* Text */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Include existing candidates
                </p>
                {candidateCount !== null && candidateCount > 0 && (
                  <span style={{
                    padding: "1px 8px", borderRadius: 99,
                    background: includeMock ? BRAND : "#F1F5F9",
                    color: includeMock ? "#fff" : "#64748B",
                    fontSize: 11, fontWeight: 800,
                    transition: "background 0.2s, color 0.2s",
                  }}>
                    {candidateCount}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#64748B", margin: "3px 0 0", lineHeight: 1.5 }}>
                {includeMock
                  ? `All ${countLabel} will be set as applicants for this job.`
                  : `Job starts with 0 applicants. Currently ${countLabel}.`}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
            <Toggle on={includeMock} onToggle={() => setIncludeMock((v) => !v)} />
          </div>
        </div>

        {/* Actions (unchanged) */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap",
          animation: "fadeUp 0.4s ease both", animationDelay: "0.15s",
        }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1, minWidth: 140,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12, border: "none",
              background: isSubmitting ? "#7CAFF7" : BRAND,
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background 0.15s, transform 0.1s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => !isSubmitting && ((e.currentTarget as HTMLElement).style.background = "#1a65d6")}
            onMouseLeave={(e) => !isSubmitting && ((e.currentTarget as HTMLElement).style.background = BRAND)}
            onMouseDown={(e) => !isSubmitting && ((e.currentTarget as HTMLElement).style.transform = "scale(0.985)")}
            onMouseUp={(e)   => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
          >
            {isSubmitting ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Creating…
              </>
            ) : (
              <><Plus size={15} /> Create Job</>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              flex: 1, minWidth: 140,
              padding: "12px 24px", borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              background: "#fff", color: "#475569",
              fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1"; (e.currentTarget as HTMLElement).style.background = "#F8FAFF"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to { transform:rotate(360deg) } }
        * { box-sizing: border-box; }
        textarea { font-family: inherit; }
        select   { appearance: auto; }
      `}</style>
    </div>
  );
}