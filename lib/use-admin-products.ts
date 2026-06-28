"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Product } from "@/lib/types";

interface AdminProductsState {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function useAdminProducts() {
  const [state, setState] = useState<AdminProductsState>({
    categories: [],
    products: [],
    isLoading: true,
    error: null,
  });

  const fetchProducts = useCallback(async (): Promise<AdminProductsState> => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        return {
          categories: [],
          products: [],
          isLoading: false,
          error: data.error ?? "No se pudieron cargar los productos.",
        };
      }

      return {
        categories: data.categories ?? [],
        products: data.products ?? [],
        isLoading: false,
        error: null,
      };
    } catch {
      return {
        categories: [],
        products: [],
        isLoading: false,
        error: "No se pudo conectar con el servidor. Intenta de nuevo.",
      };
    }
  }, []);

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const next = await fetchProducts();
    setState(next);
  }, [fetchProducts]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      const next = await fetchProducts();
      if (isMounted) setState(next);
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [fetchProducts]);

  async function createProduct(product: Product): Promise<string | null> {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return data.error ?? "No se pudo crear el producto.";
      await reload();
      return null;
    } catch {
      return "Error de conexión al crear el producto.";
    }
  }

  async function updateProduct(product: Product): Promise<string | null> {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return data.error ?? "No se pudo guardar el producto.";
      await reload();
      return null;
    } catch {
      return "Error de conexión al guardar el producto.";
    }
  }

  async function deleteProduct(id: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) return data.error ?? "No se pudo eliminar el producto.";
      await reload();
      return null;
    } catch {
      return "Error de conexión al eliminar el producto.";
    }
  }

  return {
    ...state,
    reload,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
