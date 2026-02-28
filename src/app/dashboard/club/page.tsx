import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ClubDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "CLUB") {
    redirect("/auth/login?callbackUrl=/dashboard/club");
  }

  const club = await prisma.club.findFirst({
    where: { presidentId: user.id },
    include: {
      memberships: {
        where: { status: "accepted" },
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      joinRequests: {
        where: { status: "pending" },
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      posts: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!club) {
    return (
      <div className="space-y-4">
        <header className="space-y-2">
          <p className="section-title">Club</p>
          <h1 className="page-title text-2xl sm:text-3xl">Club Dashboard</h1>
        </header>
        <div className="card">
          <div className="card-inner text-sm text-slate-400">
            No club is associated with this account yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="section-title">Club</p>
        <h1 className="page-title text-2xl sm:text-3xl">{club.name}</h1>
        <p className="page-subtitle">
          Manage your club profile, announcements, join requests, and members in
          one place.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <form
          className="card lg:col-span-1"
          action="/api/club/profile"
          method="post"
        >
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Club Profile
            </h2>
            <input type="hidden" name="clubId" value={club.id} />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Name
              </label>
              <input
                name="name"
                defaultValue={club.name}
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
                defaultValue={club.category}
                required
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Logo URL
              </label>
              <input
                name="logoUrl"
                defaultValue={club.logoUrl ?? ""}
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Schedule
              </label>
              <input
                name="schedule"
                defaultValue={club.schedule ?? ""}
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={club.description}
                rows={4}
                className="textarea"
              />
            </div>
            <button className="btn-primary w-full justify-center">
              Save changes
            </button>
          </div>
        </form>

        <section className="card lg:col-span-2">
          <div className="card-inner space-y-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Create Post
            </h2>
            <form action="/api/club/posts" method="post" className="space-y-3">
              <input type="hidden" name="clubId" value={club.id} />
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
                  Content
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  className="textarea"
                />
              </div>
              <button className="btn-primary">
                Publish post
              </button>
            </form>

            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Existing Posts
              </h3>
              <div className="space-y-2">
                {club.posts.map((post) => (
                  <form
                    key={post.id}
                    action="/api/club/posts"
                    method="post"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-50">
                        {post.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      name="action"
                      value="delete"
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-400"
                    >
                      Delete
                    </button>
                  </form>
                ))}
                {club.posts.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No posts yet. Create your first announcement above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Pending Join Requests
            </h2>
            <div className="space-y-2 text-sm">
              {club.joinRequests.map((jr) => (
                <form
                  key={jr.id}
                  action="/api/club/join-requests"
                  method="post"
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-50">{jr.user.name}</p>
                    <p className="text-xs text-slate-400">{jr.user.email}</p>
                  </div>
                  <input type="hidden" name="joinRequestId" value={jr.id} />
                  <div className="flex gap-1">
                    <button
                      name="action"
                      value="approve"
                      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                    <button
                      name="action"
                      value="reject"
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-400"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              ))}
              {club.joinRequests.length === 0 && (
                <p className="text-sm text-slate-400">
                  No pending join requests.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-inner space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Members
            </h2>
            <div className="space-y-1 text-sm">
              {club.memberships.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-50">{m.user.name}</p>
                    <p className="text-xs text-slate-400">{m.user.email}</p>
                  </div>
                  <p className="text-xs capitalize text-slate-400">
                    {m.role}
                  </p>
                </div>
              ))}
              {club.memberships.length === 0 && (
                <p className="text-sm text-slate-400">
                  No members yet. Approve join requests to grow your club.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

