import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

async function ClubsList({ search, category, page }: { search: string; category: string; page: number }) {
  const pageSize = 10;
  const where = {
    status: "APPROVED" as const,
    AND: [
      search
        ? {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        : {},
      category ? { category } : {}
    ]
  };

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" }
    }),
    prisma.club.count({ where })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{club.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {club.category}
                </p>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
              {club.description}
            </p>
          </Link>
        ))}
        {clubs.length === 0 && (
          <p className="text-sm text-slate-500">
            No clubs found. Try adjusting your filters.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page - 1}`}
              className="rounded border px-2 py-1 hover:bg-slate-100"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page + 1}`}
              className="rounded border px-2 py-1 hover:bg-slate-100"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClubsPage({
  searchParams
}: {
  searchParams: { search?: string; category?: string; page?: string };
}) {
  const search = searchParams.search ?? "";
  const category = searchParams.category ?? "";
  const page = Number(searchParams.page ?? "1") || 1;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="section-title">Club directory</p>
        <h1 className="page-title text-2xl sm:text-3xl">
          All Clubs
        </h1>
        <p className="page-subtitle">
          Search approved clubs by name or category, then open a club to see its
          details and announcements.
        </p>
      </header>

      <form className="card">
        <div className="card-inner grid gap-3 sm:grid-cols-3">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name..."
            className="input"
          />
          <input
            name="category"
            defaultValue={category}
            placeholder="Category (e.g. Sports, Arts)"
            className="input"
          />
          <button
            type="submit"
            className="btn-primary justify-center"
          >
            Apply filters
          </button>
        </div>
      </form>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading clubs...</p>}>
        {/* @ts-expect-error Async Server Component */}
        <ClubsList search={search} category={category} page={page} />
      </Suspense>
    </div>
  );
}

