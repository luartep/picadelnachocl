"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-truck-black px-4">
      <div className="w-full max-w-sm bg-truck-charcoal rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-truck-yellow/15 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-truck-yellow" />
          </div>
          <h1 className="font-display text-2xl text-truck-cream">
            Panel Administrador
          </h1>
          <p className="text-truck-cream-dim text-sm">La Picá Del Nacho</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-truck-cream mb-1.5 block">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-truck-cream mb-1.5 block">
              Clave
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
              required
            />
          </div>

          {error && (
            <p className="text-truck-red text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-wide bg-truck-yellow text-truck-black disabled:opacity-60 active:scale-[0.99] transition-transform"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
