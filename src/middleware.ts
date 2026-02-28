import { NextResponse } from "next/server";

// Temporary no-op middleware: avoids "Response body object should not be disturbed or locked"
// while debugging NextAuth / Next.js middleware interaction in dev.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile"]
};

