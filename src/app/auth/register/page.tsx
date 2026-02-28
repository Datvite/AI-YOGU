"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to register");
    } else {
      setSuccess("Account created. You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="card-inner space-y-6">
          <div className="space-y-2 text-center">
            <p className="section-title">Create account</p>
            <h1 className="text-xl font-semibold text-slate-50">
              Join the student community
            </h1>
            <p className="text-xs text-slate-400">
              Create a student account to explore, join, and request new clubs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
              />
            </div>
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
            {success && <p className="text-xs text-emerald-300">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-300 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

