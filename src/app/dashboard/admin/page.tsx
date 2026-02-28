import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/dashboard/admin");
  }

  const [stats, pendingClubs] = await Promise.all([
    prisma.$transaction([
      prisma.club.count(),
      prisma.membership.count({ where: { status: "accepted" } }),
      prisma.post.count()
    ]),
    prisma.club.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const [totalClubs, totalMembers, totalPosts] = stats;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="section-title">Admin</p>
        <h1 className="page-title text-2xl sm:text-3xl">Admin Dashboard</h1>
        <p className="page-subtitle">
          Approve new clubs, monitor activity, and broadcast important updates to
          every user.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="card-inner space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Total Clubs
          </p>
            <p className="text-2xl font-semibold text-slate-50">
              {totalClubs}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Total Members
          </p>
            <p className="text-2xl font-semibold text-slate-50">
              {totalMembers}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Total Posts
          </p>
            <p className="text-2xl font-semibold text-slate-50">
              {totalPosts}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Pending Club Requests
            </h2>
          <div className="space-y-3">
            {pendingClubs.map((club) => (
              <form
                key={club.id}
                className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2 last:border-b-0 last:pb-0"
                action={`/api/admin/clubs/approve`}
                method="post"
              >
                <div>
                  <p className="font-medium text-sm text-slate-50">
                    {club.name}
                  </p>
                  <p className="text-xs text-slate-400">{club.category}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {club.description}
                  </p>
                  <input type="hidden" name="clubId" value={club.id} />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    name="decision"
                    value="APPROVED"
                    className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-400"
                  >
                    Approve
                  </button>
                  <button
                    name="decision"
                    value="REJECTED"
                    className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-400"
                  >
                    Reject
                  </button>
                </div>
              </form>
            ))}
            {pendingClubs.length === 0 && (
              <p className="text-sm text-slate-400">
                No pending club requests.
              </p>
            )}
          </div>
          </div>
        </div>

        <form
          className="card"
          action="/api/admin/notifications/broadcast"
          method="post"
        >
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Send Notification to All Users
            </h2>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Title
              </label>
              <input
                name="title"
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={4}
                className="textarea"
              />
            </div>
            <button className="btn-primary">
              Send notification
            </button>
            <p className="text-[11px] text-slate-400">
              Notifications will appear in each user&apos;s{" "}
              <Link href="/profile" className="underline">
                profile
              </Link>{" "}
              page.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

