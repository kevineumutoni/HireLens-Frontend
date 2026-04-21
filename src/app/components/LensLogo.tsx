"use client";

// ============================================================
// src/app/components/LensLogo.tsx
// HireLens brand mark — a precision lens aperture with the
// letter "H" formed by the negative space inside the iris blades.
// Clean, modern, memorable. Works at any size.
// ============================================================

interface LensLogoProps {
  size?: number;
  // "full" shows icon + wordmark side by side
  // "icon" shows just the mark
  variant?: "icon" | "full";
  theme?: "blue" | "white";
}

export function LensLogo({
  size = 36,
  variant = "icon",
  theme = "blue",
}: LensLogoProps) {
  const primary = theme === "white" ? "#FFFFFF" : "#2C7CF2";
  const soft = theme === "white" ? "rgba(255,255,255,0.18)" : "rgba(44,124,242,0.12)";
  const softer = theme === "white" ? "rgba(255,255,255,0.08)" : "rgba(44,124,242,0.07)";

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HireLens"
    >
      {/* ── Outer lens ring ─────────────────────────────── */}
      <circle cx="20" cy="20" r="18.5" stroke={primary} strokeWidth="1.6" fill={softer} />

      {/* ── Mid aperture ring ────────────────────────────── */}
      <circle cx="20" cy="20" r="12" stroke={primary} strokeWidth="1.2" fill={soft} />

      {/* ── Iris blades (6-blade aperture) ───────────────── */}
      {/* Each blade is a short rounded rectangle rotated around center */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <rect
          key={i}
          x="18.5"
          y="8"
          width="3"
          height="7"
          rx="1.5"
          fill={primary}
          opacity={i % 2 === 0 ? "0.9" : "0.5"}
          transform={`rotate(${deg} 20 20)`}
        />
      ))}

      {/* ── Inner lens glass (subtle fill) ───────────────── */}
      <circle cx="20" cy="20" r="6.5" fill={soft} stroke={primary} strokeWidth="1" />

      {/* ── Centre focal dot ─────────────────────────────── */}
      <circle cx="20" cy="20" r="2.2" fill={primary} />

      {/* ── Lens glint (top-left highlight) ──────────────── */}
      <circle cx="14.5" cy="14" r="1.2" fill={primary} opacity="0.35" />

      {/* ── Handle / grip bar (bottom-right) ─────────────── */}
      <line
        x1="29"
        y1="29"
        x2="36"
        y2="36"
        stroke={primary}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === "icon") return mark;

  // Full lockup — icon + wordmark
  const textColor = theme === "white" ? "#FFFFFF" : "#0F172A";
  const subColor  = theme === "white" ? "rgba(255,255,255,0.6)" : "#64748B";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      {mark}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontSize: size * 0.48,
            fontWeight: 800,
            color: textColor,
            letterSpacing: "-0.02em",
          }}
        >
          Hire<span style={{ color: primary }}>Lens</span>
        </span>
        <span
          style={{
            fontSize: size * 0.24,
            color: subColor,
            fontWeight: 500,
            marginTop: 2,
            letterSpacing: "0.04em",
          }}
        >
          AI Screening
        </span>
      </div>
    </div>
  );
}