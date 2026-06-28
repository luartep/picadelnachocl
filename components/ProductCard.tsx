"use client";

import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="text-left bg-truck-charcoal rounded-2xl border border-white/5 p-4 flex gap-4 active:scale-[0.99] transition-transform hover:border-truck-yellow/30"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-truck-cream text-base leading-snug mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-truck-cream-dim text-sm leading-snug line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-xl text-truck-yellow">
            {formatPrice(product.price)}
          </span>
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-truck-red shrink-0">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  );
}
