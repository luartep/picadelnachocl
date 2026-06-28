"use client";

import { useEffect, useState } from "react";
import type { Category, Branch, Product } from "./types";
import { menuData as fallbackMenuData } from "./menu-data";

interface MenuState {
  categories: Category[];
  branches: Branch[];
  products: Product[];
  isLoadingFromDb: boolean;
  isUsingFallback: boolean;
}

export function useMenuData(): MenuState {
  const [state, setState] = useState<MenuState>({
    categories: fallbackMenuData.categories,
    branches: fallbackMenuData.branches,
    products: fallbackMenuData.products,
    isLoadingFromDb: true,
    isUsingFallback: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadFromApi() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "Respuesta no exitosa");

        if (
          isMounted &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          setState({
            categories: data.categories,
            branches: data.branches,
            products: data.products,
            isLoadingFromDb: false,
            isUsingFallback: false,
          });
          return;
        }
        throw new Error("Respuesta de la API vino vacía");
      } catch {
        // Si la API falla o la DB no está conectada todavía, seguimos con el
        // fallback hardcodeado que ya está mostrando el sitio desde el inicio.
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoadingFromDb: false }));
        }
      }
    }

    loadFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
