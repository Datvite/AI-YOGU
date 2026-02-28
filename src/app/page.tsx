import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const clubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-10">
      <section className="card">
        <div className="card-inner grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-center">
          <div className="space-y-5">
            <p className="section-title">School Club Management</p>
            <h1 className="page-title">
              Discover, join, and manage{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                vibrant student communities
              </span>
              .
            </h1>
            <p className="page-subtitle">
              A central hub where students explore clubs, leaders share announcements,
              and school admins keep everything organized with real-time visibility.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/clubs" className="btn-primary">
                Browse Clubs
              </Link>
              <Link href="/auth/register" className="btn-secondary">
                Get Started
              </Link>
              <span className="text-xs text-slate-500">
                Or jump into the{" "}
                <Link href="/dashboard/admin" className="underline">
                  Admin
                </Link>{" "}
                or{" "}
                <Link href="/dashboard/club" className="underline">
                  Club Panel
                </Link>
                .
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -translate-y-4 translate-x-6 rounded-3xl bg-gradient-to-br from-blue-600/40 via-sky-500/20 to-emerald-400/30 blur-3xl" />
            <div className="relative grid gap-3 rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4 shadow-2xl shadow-slate-950/70">
              <div className="flex items-center justify-between">
                <span className="chip">Live overview</span>
                <span className="text-[11px] text-slate-400">Sample data</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-900/80 p-3">
                  <p className="text-slate-400">Clubs</p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {clubs.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/80 p-3">
                  <p className="text-slate-400">Categories</p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {new Set(clubs.map((c) => c.category)).size || 3}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/80 p-3">
                  <p className="text-slate-400">New this week</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">+3</p>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <p className="text-xs font-medium text-slate-300">
                  Upcoming meetings
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                    <span>Robotics Club · Friday</span>
                    <span className="text-sky-300">17:00</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                    <span>Drama Society · Thursday</span>
                    <span className="text-violet-300">16:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="section-title">Featured clubs</p>
            <h2 className="text-lg font-semibold text-slate-50">
              A snapshot of student life
            </h2>
          </div>
          <Link href="/clubs" className="text-xs font-medium text-slate-400 underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="card hover:border-slate-500/80 hover:bg-slate-900 transition"
            >
              <div className="card-inner space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-50">
                    {club.name}
                  </h3>
                  <span className="chip">{club.category}</span>
                </div>
                <p className="line-clamp-3 text-xs text-slate-300">
                  {club.description}
                </p>
              </div>
            </Link>
          ))}
          {clubs.length === 0 && (
            <div className="card">
              <div className="card-inner text-sm text-slate-400">
                No clubs yet. Once clubs are approved, they will show here.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

