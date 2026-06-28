"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-truck-black">
      <header className="sticky top-0 z-30 bg-truck-charcoal border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-xl text-truck-yellow">
            Admin · La Picá Del Nacho
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-truck-cream-dim hover:text-truck-cream"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
