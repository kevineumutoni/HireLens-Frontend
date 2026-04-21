"use client";

// src/app/signup/components/PasswordStrength.tsx
// Live password strength bar + checklist

import { CheckCircle, AlertCircle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

const CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number",        test: (p: string) => /[0-9]/.test(p) },
  { label: "Special char",  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const results = CHECKS.map((c) => ({ ...c, pass: c.test(password) }));
  const passed   = results.filter((c) => c.pass).length;

  const color =
    passed <= 1 ? "#EF4444" :
    passed <= 2 ? "#F59E0B" :
    passed <= 3 ? "#2C7CF2" :
                  "#10B981";

  return (
    <div style={{ marginTop: 8 }}>
      {/* Strength bars */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i <= passed ? color : "#E2E8F0",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
        {results.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: c.pass ? "#10B981" : "#94A3B8",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
          >
            {c.pass ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}