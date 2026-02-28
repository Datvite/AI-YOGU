import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clubCreateRequestSchema } from "@/lib/zodSchemas";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT" && user.role !== "CLUB") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData =
    req.headers.get("content-type")?.includes("application/json")
      ? await req.json()
      : Object.fromEntries(await req.formData());

  const parsed = clubCreateRequestSchema.safeParse(formData);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, description, category, schedule } = parsed.data;

  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let slug = slugBase;
  let i = 1;
  while (
    await prisma.club.findUnique({
      where: { slug }
    })
  ) {
    slug = `${slugBase}-${i++}`;
  }

  await prisma.club.create({
    data: {
      name,
      description,
      category,
      schedule,
      slug,
      presidentId: user.id,
      status: "PENDING"
    }
  });

  return NextResponse.redirect(new URL("/profile", req.url));
}

