// src/app/components/ui/Card.tsx
import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}