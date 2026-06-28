import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function CategorySection({
  category,
  products,
  onSelectProduct,
}: {
  category: Category;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}) {
  if (products.length === 0) return null;

  return (
    <section id={category.id} className="py-8 px-4 scroll-mt-32">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-7 rounded-full bg-truck-red shrink-0" />
          <h2 className="font-display text-2xl text-truck-cream">
            {category.label}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
