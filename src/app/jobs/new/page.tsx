"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { createJobApi } from "@/app/lib/api";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.string().min(2, "Employment type required"),
  minYearsExperience: z.coerce.number().min(0).max(40),
  requiredSkills: z.string().min(2, "Required skills required"),
  preferredSkills: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Backend Engineer - AI Systems",
      location: "Kigali, Rwanda",
      employmentType: "Full-time",
      minYearsExperience: 3,
      requiredSkills: "Node.js, Python, REST API, Database Design",
      preferredSkills: "Gemini API, AWS, Docker",
    },
  });

  const onSubmit = async (v: FormValues) => {
    setServerError("");
    try {
      const payload = {
        title: v.title,
        location: v.location,
        employmentType: v.employmentType,
        minYearsExperience: v.minYearsExperience,
        requiredSkills: v.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        preferredSkills: (v.preferredSkills || "").split(",").map((s) => s.trim()).filter(Boolean),
      };
      const job = await createJobApi(payload as any);
      router.push(`/jobs/${job.id}`);
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to create job");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Create job</h1>
        <p className="text-sm text-slate-600">Define requirements to screen applicants against.</p>
      </div>

      <Card>
        {serverError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Job title" error={form.formState.errors.title?.message} {...form.register("title")} />
          </div>

          <Input label="Location" error={form.formState.errors.location?.message} {...form.register("location")} />
          <Input
            label="Employment type"
            error={form.formState.errors.employmentType?.message}
            {...form.register("employmentType")}
          />

          <Input
            label="Min years experience"
            type="number"
            error={form.formState.errors.minYearsExperience?.message}
            {...form.register("minYearsExperience")}
          />

          <div className="sm:col-span-2">
            <Input
              label="Required skills (comma separated)"
              error={form.formState.errors.requiredSkills?.message}
              {...form.register("requiredSkills")}
            />
          </div>

          <div className="sm:col-span-2">
            <Input label="Preferred skills (comma separated)" {...form.register("preferredSkills")} />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit">Create job</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}