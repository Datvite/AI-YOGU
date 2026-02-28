"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function JoinClubButton({ clubId }: { clubId: string }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (!session) {
      setStatus("error");
      setMessage("Please log in as a student to join.");
      return;
    }
    if ((session.user as any).role !== "STUDENT") {
      setStatus("error");
      setMessage("Only students can request to join.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    const res = await fetch("/api/student/join-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setStatus("error");
      setMessage(data?.error ?? "Failed to send request");
    } else {
      setStatus("done");
      setMessage("Join request sent.");
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading" || status === "done"}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === "done" ? "Request sent" : "Request to join"}
      </button>
      {message && (
        <p className="text-xs text-slate-600">
          {message}
        </p>
      )}
    </div>
  );
}

