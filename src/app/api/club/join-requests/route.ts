import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  joinRequestId: z.string().cuid(),
  action: z.enum(["approve", "reject"])
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "CLUB") {
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

  const { joinRequestId, action } = parsed.data;
  const joinRequest = await prisma.joinRequest.findUnique({
    where: { id: joinRequestId },
    include: { club: true }
  });
  if (!joinRequest || joinRequest.club.presidentId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.joinRequest.update({
      where: { id: joinRequestId },
      data: { status: action === "approve" ? "approved" : "rejected" }
    });

    if (action === "approve") {
      await tx.membership.upsert({
        where: {
          userId_clubId: {
            userId: joinRequest.userId,
            clubId: joinRequest.clubId
          }
        },
        update: {
          status: "accepted"
        },
        create: {
          userId: joinRequest.userId,
          clubId: joinRequest.clubId,
          role: "member",
          status: "accepted"
        }
      });
    }
  });

  return NextResponse.redirect(new URL("/dashboard/club", req.url));
}

