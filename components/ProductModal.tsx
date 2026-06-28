"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Product, SelectedModifierOption } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

const EXTRA_SURCHARGE = 1000; // recargo default por unidad sobre lo incluido

interface GroupSelection {
  [optionName: string]: number; // cuántas veces fue elegida esa opción
}

export function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selections, setSelections] = useState<GroupSelection[]>(() =>
    product.modifierGroups.map(() => ({}))
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function totalSelectedInGroup(groupIdx: number): number {
    return Object.values(selections[groupIdx] ?? {}).reduce(
      (a, b) => a + b,
      0
    );
  }

  function toggleOption(groupIdx: number, optionName: string) {
    setSelections((prev) => {
      const next = prev.map((g) => ({ ...g }));
      const current = next[groupIdx][optionName] ?? 0;
      if (current > 0) {
        delete next[groupIdx][optionName];
      } else {
        next[groupIdx][optionName] = 1;
      }
      return next;
    });
  }

  function incrementOption(groupIdx: number, optionName: string) {
    setSelections((prev) => {
      const next = prev.map((g) => ({ ...g }));
      next[groupIdx][optionName] = (next[groupIdx][optionName] ?? 0) + 1;
      return next;
    });
  }

  function decrementOption(groupIdx: number, optionName: string) {
    setSelections((prev) => {
      const next = prev.map((g) => ({ ...g }));
      const current = next[groupIdx][optionName] ?? 0;
      if (current <= 1) {
        delete next[groupIdx][optionName];
      } else {
        next[groupIdx][optionName] = current - 1;
      }
      return next;
    });
  }

  const selectedModifiers: SelectedModifierOption[] = useMemo(() => {
    const result: SelectedModifierOption[] = [];
    product.modifierGroups.forEach((group, idx) => {
      const groupSelections = selections[idx] ?? {};
      const requiredCount = group.required;
      let countedSoFar = 0;

      for (const option of group.options) {
        const timesChosen = groupSelections[option.name] ?? 0;
        for (let i = 0; i < timesChosen; i++) {
          countedSoFar++;
          const isOverIncluded = countedSoFar > requiredCount;
          const price = isOverIncluded
            ? option.price > 0
              ? option.price
              : EXTRA_SURCHARGE
            : option.price;
          result.push({
            groupLabel: group.label,
            optionName: option.name,
            price: isOverIncluded ? price : option.price > 0 ? option.price : 0,
          });
        }
      }
    });
    return result;
  }, [selections, product.modifierGroups]);

  const modifiersSurcharge = selectedModifiers.reduce(
    (sum, m) => sum + m.price,
    0
  );

  const unitPrice = product.price + modifiersSurcharge;
  const totalPrice = unitPrice * quantity;

  const canAdd = product.modifierGroups.every(
    (_, idx) => totalSelectedInGroup(idx) >= 1
  );

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity,
      selectedModifiers,
      note,
    });
    onClose();
    openCart();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] bg-truck-charcoal rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10 shrink-0">
          <div className="pr-3">
            <h2 className="font-display text-2xl text-truck-cream leading-tight">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-truck-cream-dim text-sm mt-1">
                {product.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-truck-cream" />
          </button>
        </div>

        {/* Body scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {product.modifierGroups.map((group, groupIdx) => {
            const selectedCount = totalSelectedInGroup(groupIdx);
            const required = group.required;

            let statusColor = "text-truck-cream-dim";
            let statusBg = "bg-white/5";
            if (selectedCount === required && required > 0) {
              statusColor = "text-truck-green";
              statusBg = "bg-truck-green/10";
            } else if (selectedCount < required) {
              statusColor = "text-truck-yellow";
              statusBg = "bg-truck-yellow/10";
            } else if (selectedCount > required) {
              statusColor = "text-truck-orange";
              statusBg = "bg-truck-orange/10";
            }

            return (
              <div key={group.label}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-truck-cream">{group.label}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${statusBg} ${statusColor}`}
                  >
                    {selectedCount}/{required}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const timesChosen =
                      selections[groupIdx]?.[option.name] ?? 0;
                    const isChosen = timesChosen > 0;

                    return (
                      <div
                        key={option.name}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors ${
                          isChosen
                            ? "border-truck-yellow/40 bg-truck-yellow/5"
                            : "border-white/10"
                        }`}
                      >
                        <button
                          onClick={() => toggleOption(groupIdx, option.name)}
                          className="flex-1 text-left flex items-center gap-2"
                        >
                          <span
                            className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                              isChosen
                                ? "bg-truck-yellow border-truck-yellow"
                                : "border-white/30"
                            }`}
                          />
                          <span className="text-truck-cream text-sm">
                            {option.name}
                          </span>
                          {option.price > 0 && (
                            <span className="text-truck-cream-dim text-xs">
                              (+{formatPrice(option.price)})
                            </span>
                          )}
                        </button>

                        {isChosen && (
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() =>
                                decrementOption(groupIdx, option.name)
                              }
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
                              aria-label="Quitar uno"
                            >
                              <Minus className="w-3 h-3 text-truck-cream" />
                            </button>
                            <span className="text-sm text-truck-cream w-4 text-center">
                              {timesChosen}
                            </span>
                            <button
                              onClick={() =>
                                incrementOption(groupIdx, option.name)
                              }
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
                              aria-label="Agregar uno más"
                            >
                              <Plus className="w-3 h-3 text-truck-cream" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Nota libre */}
          <div>
            <h3 className="font-bold text-truck-cream mb-2">
              Notas (opcional)
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. sin cebolla, bien cocido..."
              rows={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-truck-cream placeholder:text-truck-cream-dim/60 resize-none focus:outline-none focus:border-truck-yellow/50"
            />
          </div>
        </div>

        {/* Footer fijo */}
        <div className="p-5 border-t border-white/10 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Restar cantidad"
              >
                <Minus className="w-4 h-4 text-truck-cream" />
              </button>
              <span className="font-display text-xl text-truck-cream w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Sumar cantidad"
              >
                <Plus className="w-4 h-4 text-truck-cream" />
              </button>
            </div>
            <span className="font-display text-2xl text-truck-yellow">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wide text-base transition-colors ${
              canAdd
                ? "bg-truck-red text-white active:scale-[0.99]"
                : "bg-white/10 text-truck-cream-dim cursor-not-allowed"
            }`}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
