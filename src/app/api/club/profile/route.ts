import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  clubId: z.string().cuid(),
  name: z.string().min(3).max(100),
  category: z.string().min(2).max(50),
  logoUrl: z.string().max(500).optional(),
  schedule: z.string().max(200).optional(),
  description: z.string().min(10).max(1000)
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

  const { clubId, ...data } = parsed.data;

  const club = await prisma.club.findUnique({
    where: { id: clubId }
  });

  if (!club || club.presidentId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.club.update({
    where: { id: clubId },
    data
  });

  return NextResponse.redirect(new URL("/dashboard/club", req.url));
}

