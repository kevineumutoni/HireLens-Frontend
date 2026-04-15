"use client";

import { clsx } from "clsx";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-brand-200",
        variant === "primary" && "bg-brand text-white hover:bg-brand-600",
        variant === "secondary" && "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}