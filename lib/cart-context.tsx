"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { CartItem, SelectedModifierOption } from "./types";
import { generateId } from "./format";

interface CartContextValue {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (params: {
    productId: string;
    productName: string;
    basePrice: number;
    quantity: number;
    selectedModifiers: SelectedModifierOption[];
    note: string;
  }) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function computeUnitPrice(
  basePrice: number,
  selectedModifiers: SelectedModifierOption[]
): number {
  return (
    basePrice + selectedModifiers.reduce((sum, m) => sum + m.price, 0)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback(
    (params: {
      productId: string;
      productName: string;
      basePrice: number;
      quantity: number;
      selectedModifiers: SelectedModifierOption[];
      note: string;
    }) => {
      const unitPrice = computeUnitPrice(
        params.basePrice,
        params.selectedModifiers
      );
      const newItem: CartItem = {
        cartItemId: generateId(),
        productId: params.productId,
        productName: params.productName,
        basePrice: params.basePrice,
        quantity: params.quantity,
        selectedModifiers: params.selectedModifiers,
        note: params.note,
        unitPrice,
        lineTotal: unitPrice * params.quantity,
      };
      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId !== cartItemId) return i;
        const safeQty = Math.max(1, quantity);
        return { ...i, quantity: safeQty, lineTotal: i.unitPrice * safeQty };
      })
    );
  }, []);

  const updateNote = useCallback((cartItemId: string, note: string) => {
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, note } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    updateNote,
    clearCart,
    itemCount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return ctx;
}
