"use client";

// src/app/signup/components/FieldInput.tsx
// Reusable styled input — focus ring, icon slot, error state

import { useState, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  error?: boolean;
}

// forwardRef so react-hook-form's {...register()} ref works correctly
export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ icon, rightSlot, error, onFocus, onBlur, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div style={{ position: "relative" }}>
        {/* Left icon */}
        {icon && (
          <div
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "#2C7CF2" : "#94A3B8",
              pointerEvents: "none",
              display: "flex",
              transition: "color 0.15s",
            }}
          >
            {icon}
          </div>
        )}

        <input
          ref={ref}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            width: "100%",
            paddingTop: 11,
            paddingBottom: 11,
            paddingLeft: icon ? 40 : 14,
            paddingRight: rightSlot ? 44 : 14,
            borderRadius: 12,
            border: error
              ? "1.5px solid #EF4444"
              : focused
              ? "1.5px solid #2C7CF2"
              : "1.5px solid #E2E8F0",
            fontSize: 14,
            color: "#0F172A",
            outline: "none",
            background: focused ? "#fff" : "#FAFAFA",
            boxSizing: "border-box" as const,
            transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
            boxShadow: focused
              ? error
                ? "0 0 0 3px rgba(239,68,68,0.10)"
                : "0 0 0 3px rgba(44,124,242,0.10)"
              : "none",
            fontFamily: "inherit",
            ...style,
          }}
        />

        {/* Right slot (e.g. show/hide password button) */}
        {rightSlot && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>
    );
  }
);

FieldInput.displayName = "FieldInput";

// ── Companion error message ────────────────────────────────────
export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 5,
        fontSize: 12,
        color: "#EF4444",
        fontWeight: 500,
      }}
    >
      <AlertCircle size={11} />
      {msg}
    </div>
  );
}