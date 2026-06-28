"use client";

import { useState } from "react";
import { CartProvider } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { menuData } from "@/lib/menu-data";
import { useMenuData } from "@/lib/use-menu-data";
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
  const { categories, branches, products } = useMenuData();

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  function productsForCategory(categoryId: string): Product[] {
    return products
      .filter((p) => p.category === categoryId && p.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
  }

  // Los datos de marca (nombre, whatsapp, etc.) siempre vienen del fallback local:
  // no dependen de la base de datos, asi que nunca quedan en blanco.
  const meta = menuData.meta;

  return (
    <CartProvider>
      <Navbar brand={meta.brand} />
      <Hero subtitle={meta.subtitle} hours={meta.hours} />
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
            {meta.brand}
          </p>
          <p className="text-truck-cream-dim text-sm">
            {meta.subtitle} · {meta.hours}
          </p>
          <p className="text-truck-cream-dim text-xs">
            Síguenos en Instagram: @{meta.instagram}
          </p>
          <p className="text-truck-cream-dim text-xs">
            Aceptamos: {meta.paymentMethods.join(" · ")}
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
        brand={meta.brand}
        whatsappNumber={meta.whatsapp}
        branches={branches}
      />
    </CartProvider>
  );
}
