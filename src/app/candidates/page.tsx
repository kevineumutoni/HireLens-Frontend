import { Card } from "../components/ui/Card";

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Candidates</h1>
        <p className="text-sm text-slate-600">
          Next: list candidates and which jobs they applied to (Scenario 1 + Scenario 2 ingestion).
        </p>
      </div>

      <Card title="Candidate list (placeholder)">
        <div className="text-sm text-slate-500">
          We’ll wire this to your backend after we define endpoints for applicants/resumes/CSV ingestion.
        </div>
      </Card>
    </div>
  );
}