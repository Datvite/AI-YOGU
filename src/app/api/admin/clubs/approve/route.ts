import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  clubId: z.string().cuid(),
  decision: z.enum(["APPROVED", "REJECTED"])
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData =
    req.headers.get("content-type")?.includes("application/json")
      ? await req.json()
      : Object.fromEntries(await req.formData());

  const parsed = schema.safeParse(formData);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { clubId, decision } = parsed.data;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { president: true }
  });
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.club.update({
      where: { id: clubId },
      data: { status: decision }
    });

    if (decision === "APPROVED") {
      await tx.user.update({
        where: { id: club.presidentId },
        data: { role: "CLUB" }
      });
      await tx.membership.upsert({
        where: { userId_clubId: { userId: club.presidentId, clubId } },
        update: {
          role: "president",
          status: "accepted"
        },
        create: {
          userId: club.presidentId,
          clubId,
          role: "president",
          status: "accepted"
        }
      });
    }
  });

  return NextResponse.redirect(new URL("/dashboard/admin", req.url));
}

