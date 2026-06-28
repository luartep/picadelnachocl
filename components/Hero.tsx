export function Hero({
  subtitle,
  hours,
}: {
  subtitle: string;
  hours: string;
}) {
  return (
    <section className="relative pt-28 pb-10 px-4 overflow-hidden">
      {/* Líneas tipo banner de food truck en el fondo */}
      <div className="absolute inset-0 -z-10 opacity-[0.06] pointer-events-none">
        <div className="absolute top-10 -left-10 w-72 h-16 bg-truck-yellow rotate-[-6deg]" />
        <div className="absolute bottom-8 -right-10 w-72 h-16 bg-truck-red rotate-[6deg]" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-truck-green/15 border border-truck-green/40 text-truck-green text-xs font-bold uppercase tracking-wide mb-5">
          <span className="w-2 h-2 rounded-full bg-truck-green animate-pulse" />
          {hours}
        </span>

        <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] mb-3">
          <span className="block text-truck-cream">Sandwichería</span>
          <span className="block text-truck-yellow">Haz tu pedido aquí</span>
        </h1>

        <p className="text-truck-cream-dim text-base max-w-md mx-auto">
          {subtitle} · Delivery o retiro en local. Completos, sándwiches,
          hamburguesas y papas a la chilena, hechas al momento.
        </p>
      </div>
    </section>
  );
}
