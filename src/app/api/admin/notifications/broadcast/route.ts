import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(1000)
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

  const { title, message } = parsed.data;

  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  }

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message
    }))
  });

  return NextResponse.redirect(new URL("/dashboard/admin", req.url));
}

