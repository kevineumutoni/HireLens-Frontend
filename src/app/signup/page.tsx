"use client";

// src/app/signup/page.tsx
// UI: Split layout — left blue brand panel, right white form.
// Adds: debug logging + visible inline error banner (no UI redesign).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ShieldCheck, Zap } from "lucide-react";
import axios from "axios";

import { LensLogo } from "@/app/components/LensLogo";
import { signupApi } from "@/app/lib/api";
import { googleSignIn } from "@/app/lib/firebaseAuth";
import { TermsModal } from "./components/TermsModal";
import { PasswordStrength } from "./components/PasswordStrength";
import { FieldInput, FieldError } from "./components/FieldInput";

// ── Validation (unchanged) ─────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, "Min 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a special character");

const schema = z
  .object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Use a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password"),
    agree: z.boolean().refine((v) => v === true, { message: "You must agree to continue" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

// ── Left-panel feature row ─────────────────────────────────────
function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#fff",
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function formatAxiosError(e: unknown): string {
  if (!axios.isAxiosError(e)) {
    if (e instanceof Error) return e.message;
    return "Signup failed";
  }

  const status = e.response?.status;
  const detail = (e.response?.data as any)?.detail ?? (e.response?.data as any)?.message ?? e.message;

  return status ? `(${status}) ${detail}` : String(detail);
}

// ── Page ───────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // NEW: visible inline error (in case toast is not mounted)
  const [submitError, setSubmitError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { agree: false } });

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  // NEW: live "passwords do not match" while typing confirm password
  const confirmValue = watch("confirmPassword") ?? "";
  const confirmTouched = !!touchedFields.confirmPassword;

  const passwordsMismatchLive =
    confirmTouched &&
    confirmValue.length > 0 &&
    passwordValue.length > 0 &&
    confirmValue !== passwordValue;

  const onInvalid = (errs: FieldErrors<FormValues>) => {
    console.error("[signup] validation errors:", errs);
    setSubmitError("Please fix the highlighted fields and try again.");
    toast.error("Please fix the form errors.");
  };

  // ── Signup handler with logs ────────────────────────────────
  const onSubmit = async (v: FormValues) => {
    setSubmitError("");

    // Log safe info only (never log passwords)
    console.log("[signup] submit clicked", {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      agree: v.agree,
    });

    try {
      const res = await signupApi(v.firstName, v.lastName, v.email, v.password);
      console.log("[signup] API success:", res);

      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (e: unknown) {
      // Detailed axios logging
      if (axios.isAxiosError(e)) {
        console.error("[signup] axios error", {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
          url: e.config?.url,
          baseURL: e.config?.baseURL,
          method: e.config?.method,
        });
      } else {
        console.error("[signup] unknown error", e);
      }

      const msg = formatAxiosError(e);
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const onGoogle = async () => {
    setSubmitError("");
    setGoogleBusy(true);

    console.log("[signup] google sign-in clicked");

    try {
      await googleSignIn();
      toast.success("Google account linked. Please sign in.");
      router.push("/login");
    } catch (e: unknown) {
      console.error("[signup] google sign-in error:", e);
      const msg = e instanceof Error ? e.message : "Google sign-in failed";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setGoogleBusy(false);
    }
  };

  const pwdField = register("password");

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* LEFT */}
        <div
          style={{
            flex: "0 0 46%",
            background: "linear-gradient(145deg, #1a65d6 0%, #2C7CF2 52%, #3d8ff5 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 52px",
            position: "relative",
            overflow: "hidden",
          }}
          className="hidden lg:flex"
        >
          {[
            { w: 420, h: 420, top: -120, right: -140 },
            { w: 260, h: 260, top: -40, right: -60 },
            { w: 320, h: 320, bottom: -80, left: -100 },
            { w: 180, h: 180, top: "38%", right: "8%" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: s.w,
                height: s.h,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                pointerEvents: "none",
                ...("top" in s ? { top: s.top } : {}),
                ...("bottom" in s ? { bottom: s.bottom } : {}),
                ...("right" in s ? { right: s.right } : {}),
                ...("left" in s ? { left: s.left } : {}),
              }}
            />
          ))}

          <div style={{ position: "relative" }}>
            <LensLogo size={44} variant="full" theme="white" />
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 99,
                padding: "5px 14px",
                marginBottom: 24,
              }}
            >
              <Sparkles size={13} color="#fff" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.03em" }}>
                Powered by Gemini AI
              </span>
            </div>

            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.18,
                marginBottom: 14,
                letterSpacing: "-0.02em",
              }}
            >
              Join the future
              <br />
              of hiring.
            </h2>

            <p
              style={{
                fontSize: 14.5,
                color: "rgba(255,255,255,0.70)",
                lineHeight: 1.65,
                marginBottom: 36,
                maxWidth: 330,
              }}
            >
              Create your recruiter account and start screening candidates with AI-powered precision in minutes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FeatureRow icon={<Zap size={16} />} text="Screen 50+ candidates in seconds" />
              <FeatureRow icon={<ShieldCheck size={16} />} text="Bias-free, explainable rankings" />
              <FeatureRow icon={<Sparkles size={16} />} text="Gemini AI match scores & insights" />
            </div>

            <div
              style={{
                marginTop: 36,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 14,
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.80)",
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                "HireLens cut our screening time from 3 days to 20 minutes. The AI explanations are genuinely useful."
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "8px 0 0", fontWeight: 600 }}>
                — Recruiter, Carbon Track Startup Rwanda
              </p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", position: "relative" }}>
            © 2026 HireLens · Umurava AI Hackathon
          </p>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ marginBottom: 28, display: "flex", justifyContent: "center" }} className="lg:hidden">
              <LensLogo size={40} variant="full" />
            </div>

            <div style={{ marginBottom: 28 }}>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                  marginTop: 0,
                }}
              >
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Set up your HireLens recruiter workspace.</p>
            </div>

            {submitError && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1.5px solid #FCA5A5",
                  background: "#FEF2F2",
                  color: "#991B1B",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={onGoogle}
              disabled={googleBusy}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "11px 16px",
                borderRadius: 12,
                border: "1.5px solid #E2E8F0",
                background: "#fff",
                cursor: googleBusy ? "not-allowed" : "pointer",
                opacity: googleBusy ? 0.6 : 1,
                fontSize: 14,
                fontWeight: 600,
                color: "#0F172A",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2C7CF2")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              {googleBusy ? "Opening Google…" : "Continue with Google"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                    First name
                  </label>
                  <FieldInput icon={<User size={15} />} placeholder="Jean" error={!!errors.firstName} {...register("firstName")} />
                  <FieldError msg={errors.firstName?.message} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                    Last name
                  </label>
                  <FieldInput placeholder="Mukama" error={!!errors.lastName} {...register("lastName")} />
                  <FieldError msg={errors.lastName?.message} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                  Email address
                </label>
                <FieldInput type="email" icon={<Mail size={15} />} placeholder="you@company.com" error={!!errors.email} {...register("email")} />
                <FieldError msg={errors.email?.message} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                  Password
                </label>
                <FieldInput
                  type={showPassword ? "text" : "password"}
                  icon={<Lock size={15} />}
                  placeholder="Create a strong password"
                  error={!!errors.password}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94A3B8",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...pwdField}
                  onChange={(e) => {
                    pwdField.onChange(e);
                    setPasswordValue(e.target.value);
                  }}
                />
                <PasswordStrength password={passwordValue} />
                <FieldError msg={errors.password?.message} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                  Confirm password
                </label>
                <FieldInput
                  type={showConfirm ? "text" : "password"}
                  icon={<Lock size={15} />}
                  placeholder="Repeat your password"
                  // NEW: show red state while typing if mismatch (even before submit)
                  error={!!errors.confirmPassword || passwordsMismatchLive}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94A3B8",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...register("confirmPassword")}
                />
                {/* NEW: live mismatch message while typing; disappears when it matches */}
                {passwordsMismatchLive ? <FieldError msg="Passwords do not match" /> : <FieldError msg={errors.confirmPassword?.message} />}
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: errors.agree ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                    background: errors.agree ? "#FEF2F2" : "#FAFAFA",
                    transition: "border-color 0.15s",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginTop: 2, width: 15, height: 15, accentColor: "#2C7CF2", flexShrink: 0, cursor: "pointer" }}
                    {...register("agree")}
                  />
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                    I agree to the{" "}
                    {["Terms & Conditions", "Privacy Policy"].map((label, i) => (
                      <span key={label}>
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#2C7CF2",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontFamily: "inherit",
                          }}
                        >
                          {label}
                        </button>
                        {i === 0 && " and "}
                      </span>
                    ))}
                  </span>
                </label>
                <FieldError msg={errors.agree?.message} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: isSubmitting ? "#7CAFF7" : "#2C7CF2",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  letterSpacing: "0.01em",
                  transition: "background 0.15s, transform 0.1s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 2,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: hasAnyError ? "2px solid transparent" : undefined,
                }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = "#1a65d6")}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = "#2C7CF2")}
                onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(0.985)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{ color: "#2C7CF2", fontWeight: 700, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #94A3B8; }
      `}</style>
    </>
  );
}