"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { listJobsApi } from "../lib/api";
import { Job } from "../lib/types";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listJobsApi();
        setJobs(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.filter((j) => j.status === "closed").length;
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
    return { active, closed, totalApplicants };
  }, [jobs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Overview of your screening activity and job pipeline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Active jobs">
          <div className="text-3xl font-semibold text-slate-900">{stats.active}</div>
          <div className="text-xs text-slate-500">Open roles recruiters are hiring for</div>
        </Card>

        <Card title="Total applicants">
          <div className="text-3xl font-semibold text-slate-900">{stats.totalApplicants}</div>
          <div className="text-xs text-slate-500">Across all roles</div>
        </Card>

        <Card title="Closed jobs">
          <div className="text-3xl font-semibold text-slate-900">{stats.closed}</div>
          <div className="text-xs text-slate-500">Roles closed after decision</div>
        </Card>
      </div>

      <Card title="Recent jobs">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="text-sm text-slate-500">No jobs yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 6).map((j) => (
              <div key={j.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500">
                    {j.status.toUpperCase()} • {j.location} • Applicants: {j.applicantsCount}
                  </div>
                </div>
                <div className="text-xs text-slate-400">{new Date(j.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}