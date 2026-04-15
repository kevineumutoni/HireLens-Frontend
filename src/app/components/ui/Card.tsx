import React from "react";

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      {title ? <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3> : null}
      {children}
    </div>
  );
}