"use client";

import { useState } from "react";
import { CartProvider } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { menuData } from "@/lib/menu-data";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { CategorySection } from "@/components/CategorySection";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer } from "@/components/CartDrawer";

export function MenuApp() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );

  const sortedCategories = [...menuData.categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  function productsForCategory(categoryId: string): Product[] {
    return menuData.products
      .filter((p) => p.category === categoryId && p.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function handleSelectProduct(product: Product) {
    if (product.modifierGroups.length === 0) {
      // Sin modificadores: igual abrimos el modal para permitir cantidad/nota,
      // pero podría agregarse directo. Mantenemos modal por consistencia.
      setSelectedProduct(product);
    } else {
      setSelectedProduct(product);
    }
  }

  return (
    <CartProvider>
      <Navbar brand={menuData.meta.brand} />
      <Hero subtitle={menuData.meta.subtitle} hours={menuData.meta.hours} />
      <CategoryNav categories={sortedCategories} />

      <main className="flex-1">
        {sortedCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            products={productsForCategory(category.id)}
            onSelectProduct={handleSelectProduct}
          />
        ))}
      </main>

      <footer className="px-4 py-8 border-t border-white/5 mt-6">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <p className="font-display text-xl text-truck-yellow">
            {menuData.meta.brand}
          </p>
          <p className="text-truck-cream-dim text-sm">
            {menuData.meta.subtitle} · {menuData.meta.hours}
          </p>
          <p className="text-truck-cream-dim text-xs">
            Síguenos en Instagram: @{menuData.meta.instagram}
          </p>
          <p className="text-truck-cream-dim text-xs">
            Aceptamos: {menuData.meta.paymentMethods.join(" · ")}
          </p>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer
        brand={menuData.meta.brand}
        whatsappNumber={menuData.meta.whatsapp}
        branches={menuData.branches}
      />
    </CartProvider>
  );
}
