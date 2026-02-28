import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "School Club Management",
  description: "Manage school clubs, members, and announcements"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="shell">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <a href="/" className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-500/90 text-xs font-bold text-white shadow shadow-blue-500/60">
                    SC
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-slate-50">
                    School Clubs
                  </span>
                </a>
                <nav className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-300">
                  <a href="/clubs" className="rounded-full px-3 py-1 hover:bg-slate-800/80 hover:text-white">
                    Clubs
                  </a>
                  <a href="/dashboard/admin" className="rounded-full px-3 py-1 hover:bg-slate-800/80 hover:text-white">
                    Admin
                  </a>
                  <a href="/dashboard/club" className="rounded-full px-3 py-1 hover:bg-slate-800/80 hover:text-white">
                    Club Panel
                  </a>
                  <a
                    href="/profile"
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-50 hover:border-blue-400 hover:bg-slate-900"
                  >
                    Profile
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <div className="page-container">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

