"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: searchParams.get("callbackUrl") ?? "/"
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="card-inner space-y-6">
          <div className="space-y-2 text-center">
            <p className="section-title">Welcome back</p>
            <h1 className="text-xl font-semibold text-slate-50">
              Sign in to your account
            </h1>
            <p className="text-xs text-slate-400">
              Access your profile, clubs, dashboards, and notifications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-blue-300 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

