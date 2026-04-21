"use client";
// src/app/components/ui/RecBadge.tsx
// Recommendation badge — Strong Yes / Yes / Maybe / No

const BRAND = "#2C7CF2";

const MAP: Record<string, { bg: string; color: string }> = {
  "Strong Yes": { bg: "#ECFDF5", color: "#059669" },
  "Yes":        { bg: `rgba(44,124,242,0.10)`, color: BRAND },
  "Maybe":      { bg: "#FFFBEB", color: "#D97706" },
  "No":         { bg: "#FEF2F2", color: "#DC2626" },
};

export function RecBadge({ rec }: { rec?: string }) {
  const { bg, color } = MAP[rec ?? ""] ?? { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 99,
      background: bg, color, fontSize: 11, fontWeight: 700,
    }}>
      {rec ?? "—"}
    </span>
  );
}