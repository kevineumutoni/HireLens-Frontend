"use client";

// ============================================================
// src/app/login/page.tsx  — UI overhaul
// Split layout: left = brand panel (blue), right = form (white)
// Colors: #2C7CF2 blue + white only.
// All functional code (hooks, API calls, validation) untouched.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Sparkles, Users, BarChart3, ArrowRight } from "lucide-react";

import { LensLogo } from "@/app/components/LensLogo";
import { useAuthStore } from "@/app/store/authStore";
import { signinApi } from "@/app/lib/api";
import { googleSignIn } from "@/app/lib/firebaseAuth";

const schema = z.object({
  email: z.string().email("Use a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

// ── Small stat card used in the left panel ────────────────────
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#fff",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // ── unchanged functional code ──────────────────────────────
  const onSubmit = async (v: FormValues) => {
    try {
      const res = await signinApi(v.email, v.password);
      setAuth(res.user, res.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Login failed");
    }
  };

  const onGoogle = async () => {
    setGoogleBusy(true);
    try {
      const { user, token } = await googleSignIn();
      setAuth(user, token);
      toast.success("Signed in with Google");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Google sign-in failed");
    } finally {
      setGoogleBusy(false);
    }
  };
  // ──────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ════════════════════════════════════════════════════
          LEFT PANEL — brand / illustration
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: "0 0 46%",
          background: "linear-gradient(145deg, #1a65d6 0%, #2C7CF2 50%, #3d8ff5 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.10)",
            top: -120,
            right: -140,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            top: -40,
            right: -60,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
            bottom: -80,
            left: -100,
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <LensLogo size={44} variant="full" theme="white" />
        </div>

        {/* Hero copy */}
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
              fontSize: 38,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Screen smarter,<br />hire better.
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 340,
            }}
          >
            AI-powered talent screening that ranks candidates in seconds — with full explainability and zero bias.
          </p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard icon={<Sparkles size={18} />} value="&lt; 8s" label="Screening time" />
            <StatCard icon={<Users size={18} />} value="50+" label="Candidates ranked" />
            <StatCard icon={<BarChart3 size={18} />} value="100%" label="Explainable AI" />
            <StatCard icon={<ArrowRight size={18} />} value="Top 10" label="Ranked shortlist" />
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", position: "relative" }}>
          © 2026 HireLens · Umurava AI Hackathon
        </p>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT PANEL — login form
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }} className="lg:hidden">
            <LensLogo size={40} variant="full" />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "#64748B" }}>
              Sign in to your recruiter workspace.
            </p>
          </div>

          {/* Google button */}
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
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2C7CF2")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {googleBusy ? "Opening Google…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email field */}
            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  style={{
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 14,
                    paddingTop: 11,
                    paddingBottom: 11,
                    borderRadius: 12,
                    border: errors.email ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                    fontSize: 14,
                    color: "#0F172A",
                    outline: "none",
                    background: "#FAFAFA",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => !errors.email && (e.currentTarget.style.borderColor = "#2C7CF2")}
                  onBlur={(e) => !errors.email && (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
              </div>
              {errors.email && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#EF4444" }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  style={{
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 44,
                    paddingTop: 11,
                    paddingBottom: 11,
                    borderRadius: 12,
                    border: errors.password ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                    fontSize: 14,
                    color: "#0F172A",
                    outline: "none",
                    background: "#FAFAFA",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => !errors.password && (e.currentTarget.style.borderColor = "#2C7CF2")}
                  onBlur={(e) => !errors.password && (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#EF4444" }}>{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
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
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#64748B" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              style={{ color: "#2C7CF2", fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Spinner keyframe — injected once */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #94A3B8; }
        input:focus { box-shadow: 0 0 0 3px rgba(44,124,242,0.12); }
      `}</style>
    </div>
  );
}