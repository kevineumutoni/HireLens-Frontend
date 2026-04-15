"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { deleteJobApi, listJobsApi, screenJobApi, updateJobApi } from "../lib/api";
import { Job } from "../lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string>("");

  const refresh = async () => {
    setLoading(true);
    try {
      setJobs(await listJobsApi());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCloseJob = async (jobId: string) => {
    setBusyJobId(jobId);
    try {
      await updateJobApi(jobId, { status: "closed" });
      await refresh();
    } finally {
      setBusyJobId("");
    }
  };

  const onDeleteJob = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;
    setBusyJobId(jobId);
    try {
      await deleteJobApi(jobId);
      await refresh();
    } finally {
      setBusyJobId("");
    }
  };

  const onScreenJob = async (jobId: string) => {
    setBusyJobId(jobId);
    try {
      await updateJobApi(jobId, { status: "screening" });
      await screenJobApi(jobId);
      await updateJobApi(jobId, { status: "open" });
      alert("Screening started. (Mock mode returns instantly.)");
      await refresh();
    } finally {
      setBusyJobId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-600">Create, edit, close, and screen jobs.</p>
        </div>
        <Link href="/jobs/new">
          <Button>Create job</Button>
        </Link>
      </div>

      <Card title="All jobs">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="text-sm text-slate-500">No jobs yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <div key={j.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500">
                    {j.status.toUpperCase()} • {j.location} • Applicants: {j.applicantsCount} • Created:{" "}
                    {new Date(j.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/jobs/${j.id}`}>
                    <Button variant="secondary">View</Button>
                  </Link>
                  <Button
                    variant="primary"
                    disabled={busyJobId === j.id || j.status === "closed"}
                    onClick={() => onScreenJob(j.id)}
                  >
                    {busyJobId === j.id ? "Working…" : "Screen"}
                  </Button>
                  <Button variant="secondary" disabled={busyJobId === j.id} onClick={() => onCloseJob(j.id)}>
                    Close
                  </Button>
                  <Button variant="danger" disabled={busyJobId === j.id} onClick={() => onDeleteJob(j.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}