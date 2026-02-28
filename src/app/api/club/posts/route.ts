import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  clubId: z.string().cuid(),
  title: z.string().min(3).max(150),
  content: z.string().min(10).max(5000)
});

const deleteSchema = z.object({
  postId: z.string().cuid(),
  action: z.literal("delete")
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

  if ("action" in formData) {
    const parsed = deleteSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { postId } = parsed.data;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { club: true }
    });
    if (!post || post.club.presidentId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.redirect(new URL("/dashboard/club", req.url));
  }

  const parsed = createSchema.safeParse(formData);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { clubId, title, content } = parsed.data;
  const club = await prisma.club.findUnique({
    where: { id: clubId }
  });
  if (!club || club.presidentId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.create({
    data: {
      clubId,
      title,
      content,
      authorId: user.id
    }
  });

  return NextResponse.redirect(new URL("/dashboard/club", req.url));
}

