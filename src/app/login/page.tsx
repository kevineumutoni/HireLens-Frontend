"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginApi } from "../lib/api";
import { useSessionStore } from "../lib/sessionStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Min 8 characters"),
});

type FormValues = z.infer<typeof schema>;

/**
 * Demo credentials (mock mode):
 * email: recruiter@hirelens.ai
 * password: Password@123
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, hydrate, isValid } = useSessionStore();
  const [serverError, setServerError] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "recruiter@hirelens.ai", password: "Password@123" },
  });

  useEffect(() => {
    hydrate();
    if (isValid()) router.replace("/dashboard");
  }, [hydrate, isValid, router]);

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      const res = await loginApi(values.email, values.password);
      login(values.email, res.token);
      router.push("/dashboard");
    } catch (e: any) {
      setServerError(e?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-brand" />
              <h1 className="text-lg font-semibold">HireLens</h1>
            </div>
            <p className="text-sm text-slate-600">
              Sign in as a recruiter. Session expires automatically after 5 minutes for security.
            </p>
          </div>

          {serverError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <Button type="submit" className="w-full">
              Sign in
            </Button>

            <div className="text-xs text-slate-500">
              Demo: <span className="font-mono">recruiter@hirelens.ai / Password@123</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}