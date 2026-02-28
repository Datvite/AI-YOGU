import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const [notifications, memberships] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.membership.findMany({
      where: { userId: user.id, status: "accepted" },
      include: { club: { select: { id: true, name: true, slug: true } } }
    })
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="section-title">Account</p>
        <h1 className="page-title text-2xl sm:text-3xl">Profile</h1>
        <p className="page-subtitle">
          View your account information, clubs you belong to, and important
          notifications from school staff and club leaders.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <div className="card-inner space-y-2">
            <h2 className="text-sm font-semibold text-slate-50">Account</h2>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">Name:</span>{" "}
              {user.name}
            </p>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">Email:</span>{" "}
              {user.email}
            </p>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">Role:</span>{" "}
              {user.role}
            </p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="card-inner space-y-2">
            <h2 className="text-sm font-semibold text-slate-50">Your Clubs</h2>
            <div className="space-y-1 text-sm">
            {memberships.map((m) => (
              <Link
                key={m.clubId}
                href={`/clubs/${m.club.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-slate-500 hover:bg-slate-900"
              >
                <span className="text-slate-50">{m.club.name}</span>
                <span className="text-xs capitalize text-slate-400">
                  {m.role}
                </span>
              </Link>
            ))}
            {memberships.length === 0 && (
              <p className="text-sm text-slate-400">
                You are not a member of any clubs yet.
              </p>
            )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form
          className="card"
          action="/api/student/club-request"
          method="post"
        >
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Request New Club
            </h2>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Name
              </label>
              <input
                name="name"
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Category
              </label>
              <input
                name="category"
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Schedule
              </label>
              <input
                name="schedule"
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="textarea"
              />
            </div>
            <button className="btn-primary">
              Submit request
            </button>
            <p className="text-[11px] text-slate-400">
              Admin will review and approve or reject your request.
            </p>
          </div>
        </form>

        <div className="card">
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Notifications
            </h2>
            <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
              >
                <p className="text-xs font-semibold text-slate-50">
                  {n.title}
                </p>
                <p className="mt-1 text-sm text-slate-200">{n.message}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-slate-400">
                No notifications yet.
              </p>
            )}
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}

