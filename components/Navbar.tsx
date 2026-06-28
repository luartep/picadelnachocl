"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function Navbar({ brand }: { brand: string }) {
  const { itemCount, openCart } = useCart();
  const [firstWord, ...rest] = brand.split(" ");
  const restOfBrand = rest.join(" ");

  return (
    <header className="fixed top-0 inset-x-0 z-50 texture-metal bg-truck-black/95 backdrop-blur-sm border-b border-truck-yellow/20">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl text-truck-yellow leading-none">
            {firstWord}
          </span>
          {restOfBrand && (
            <span className="font-display text-2xl text-truck-red leading-none">
              {restOfBrand}
            </span>
          )}
        </div>

        <button
          onClick={openCart}
          aria-label="Abrir carrito"
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-truck-charcoal border border-truck-yellow/30 active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5 text-truck-cream" strokeWidth={2} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-truck-red text-white text-[11px] font-bold flex items-center justify-center border-2 border-truck-black">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
