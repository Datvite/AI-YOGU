import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  clubId: z.string().cuid()
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can join clubs" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { clubId } = parsed.data;

  const club = await prisma.club.findUnique({
    where: { id: clubId, status: "APPROVED" }
  });
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_clubId: { userId: user.id, clubId } }
  });
  if (existingMembership) {
    return NextResponse.json(
      { error: "You already have a membership for this club" },
      { status: 400 }
    );
  }

  await prisma.joinRequest.create({
    data: {
      clubId,
      userId: user.id
    }
  });

  return NextResponse.json({ ok: true });
}

