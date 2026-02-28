import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@prisma/client";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(roles: UserRole | UserRole[]) {
  const session = await requireSession();
  const allowed = Array.isArray(roles) ? roles : [roles];
  const role = (session.user as any).role as UserRole | undefined;
  if (!role || !allowed.includes(role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

