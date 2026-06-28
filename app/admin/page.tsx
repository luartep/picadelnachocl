"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useAdminProducts } from "@/lib/use-admin-products";
import { ProductEditorModal } from "@/components/admin/ProductEditorModal";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const {
    categories,
    products,
    isLoading,
    error,
    reload,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  function productsForCategory(categoryId: string): Product[] {
    return products
      .filter((p) => p.category === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async function handleSave(product: Product): Promise<string | null> {
    if (isCreatingNew) {
      return createProduct(product);
    }
    return updateProduct(product);
  }

  async function handleConfirmDelete(id: string) {
    setDeleteError("");
    const err = await deleteProduct(id);
    if (err) {
      setDeleteError(err);
      return;
    }
    setConfirmDeleteId(null);
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-truck-cream-dim">
        Cargando productos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-truck-orange mx-auto" />
        <p className="text-truck-cream font-semibold">{error}</p>
        <p className="text-truck-cream-dim text-sm">
          Si todavía no conectaste la base de datos Neon, hazlo desde el
          dashboard de Vercel y corre <code>schema.sql</code> y{" "}
          <code>seed.sql</code> (ver README).
        </p>
        <button
          onClick={reload}
          className="px-4 py-2 rounded-xl bg-truck-yellow text-truck-black font-bold text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-truck-cream">Productos</h1>
        <button
          onClick={() => {
            setIsCreatingNew(true);
            setEditingProduct({
              id: "",
              name: "",
              description: "",
              price: 0,
              category: sortedCategories[0]?.id ?? "",
              image: null,
              allowsExtras: false,
              modifierGroups: [],
              sortOrder: 999,
              active: true,
            });
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-truck-yellow text-truck-black font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {sortedCategories.map((category) => {
        const catProducts = productsForCategory(category.id);
        if (catProducts.length === 0) return null;

        return (
          <section key={category.id}>
            <h2 className="font-display text-xl text-truck-yellow mb-3">
              {category.label}{" "}
              <span className="text-truck-cream-dim text-sm font-body">
                ({catProducts.length})
              </span>
            </h2>
            <div className="space-y-2">
              {catProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                    product.active
                      ? "bg-truck-charcoal border-white/10"
                      : "bg-white/5 border-white/5 opacity-60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-truck-cream font-semibold truncate">
                      {product.name}
                      {!product.active && (
                        <span className="ml-2 text-xs text-truck-orange font-normal">
                          (inactivo)
                        </span>
                      )}
                    </p>
                    <p className="text-truck-cream-dim text-sm">
                      {formatPrice(product.price)}
                      {product.modifierGroups.length > 0 &&
                        ` · ${product.modifierGroups.length} modificador(es)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingProduct(product);
                      }}
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4 text-truck-cream" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-truck-red" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {editingProduct && (
        <ProductEditorModal
          product={isCreatingNew ? null : editingProduct}
          categories={sortedCategories}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full max-w-sm bg-truck-charcoal rounded-2xl border border-white/10 p-5">
            <h3 className="font-display text-xl text-truck-cream mb-2">
              ¿Eliminar producto?
            </h3>
            <p className="text-truck-cream-dim text-sm mb-4">
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="text-truck-red text-sm font-semibold mb-3">
                {deleteError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-truck-cream font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-truck-red text-white font-bold text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
