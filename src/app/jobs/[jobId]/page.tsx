"use client";

import { useParams } from "next/navigation";
import { Card } from "@/app/components/ui/Card";

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Job: {jobId}</h1>
        <p className="text-sm text-slate-600">
          Next: show applicants, screening results, and “Top 10 with reasons”.
        </p>
      </div>

      <Card title="Screening results">
        <div className="text-sm text-slate-500">
          Coming next step: call backend to fetch screening results for this job and render ranked candidates.
        </div>
      </Card>
    </div>
  );
}