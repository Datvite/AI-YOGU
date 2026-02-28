import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JoinClubButton } from "@/components/JoinClubButton";

interface Props {
  params: { slug: string };
}

export default async function ClubDetailPage({ params }: Props) {
  const club = await prisma.club.findUnique({
    where: { slug: params.slug, status: "APPROVED" },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!club) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="card-inner space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="section-title">Club</p>
              <h1 className="page-title text-2xl sm:text-3xl">
                {club.name}
              </h1>
              <p className="chip mt-1 inline-flex">{club.category}</p>
            </div>
            <div className="shrink-0">
              <JoinClubButton clubId={club.id} />
            </div>
          </div>

          <p className="text-sm text-slate-300">{club.description}</p>
          {club.schedule && (
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-200">Schedule:</span>{" "}
              {club.schedule}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-title">Announcements</p>
          <p className="text-xs text-slate-500">
            Recent posts from this club
          </p>
        </div>
        <div className="space-y-3">
          {club.posts.map((post) => (
            <article
              key={post.id}
              className="card"
            >
              <div className="card-inner space-y-2">
                <h3 className="text-sm font-semibold text-slate-50">
                  {post.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  By {post.author?.name ?? "Unknown"} on{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-200">
                  {post.content}
                </p>
              </div>
            </article>
          ))}
          {club.posts.length === 0 && (
            <div className="card">
              <div className="card-inner text-sm text-slate-400">
                No posts yet. Club managers can create posts from their dashboard.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

