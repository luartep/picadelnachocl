"use client";

import { useMemo, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Branch, OrderType } from "@/lib/types";

export function CartDrawer({
  brand,
  whatsappNumber,
  branches,
}: {
  brand: string;
  whatsappNumber: string;
  branches: Branch[];
}) {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    total,
    clearCart,
  } = useCart();

  const [orderType, setOrderType] = useState<OrderType>("retiro");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const hasMultipleBranches = branches.length > 1;
  const selectedBranch = branches.find((b) => b.id === branchId);

  const isFormValid = useMemo(() => {
    if (!customerName.trim()) return false;
    if (orderType === "delivery" && !address.trim()) return false;
    return items.length > 0;
  }, [customerName, orderType, address, items.length]);

  if (!isCartOpen) return null;

  function handleSubmit() {
    if (!isFormValid || isSubmitting) {
      if (!customerName.trim()) {
        setFormError("Ingresa tu nombre para continuar.");
        return;
      }
      if (orderType === "delivery" && !address.trim()) {
        setFormError("Ingresa tu dirección para el delivery.");
        return;
      }
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    // 1. Abrir WhatsApp de forma SÍNCRONA, sin ningún await antes.
    const message = buildWhatsAppMessage({
      brand,
      items,
      customer: {
        name: customerName.trim(),
        orderType,
        address: address.trim() || undefined,
        branchId: hasMultipleBranches ? branchId : undefined,
      },
      branchName: selectedBranch?.name,
      total,
    });
    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank");

    // 2. Guardado en backend en paralelo, sin bloquear ni romper el flujo.
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName.trim(),
        orderType,
        address: address.trim() || null,
        branchId: hasMultipleBranches ? branchId : branches[0]?.id ?? null,
        items,
        total,
      }),
    }).catch(() => {
      // Silencioso: un fallo de red no debe romper la experiencia del cliente.
    });

    clearCart();
    setIsSubmitting(false);
    closeCart();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] bg-truck-charcoal rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h2 className="font-display text-2xl text-truck-cream">Tu pedido</h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-truck-cream" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {items.length === 0 ? (
            <p className="text-truck-cream-dim text-sm text-center py-10">
              Tu carrito está vacío. ¡Agrega algo rico! 🌭
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const groupedMods = new Map<
                  string,
                  typeof item.selectedModifiers
                >();
                for (const mod of item.selectedModifiers) {
                  const existing = groupedMods.get(mod.groupLabel) ?? [];
                  existing.push(mod);
                  groupedMods.set(mod.groupLabel, existing);
                }

                return (
                  <div
                    key={item.cartItemId}
                    className="rounded-xl bg-white/5 border border-white/10 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-truck-cream text-sm leading-snug">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        aria-label="Eliminar item"
                        className="shrink-0 text-truck-cream-dim"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {[...groupedMods.entries()].map(([label, mods]) => (
                      <div key={label} className="mt-1.5">
                        <span className="text-truck-cream-dim text-xs font-semibold">
                          {label}:
                        </span>
                        <ul className="text-truck-cream-dim text-xs ml-2">
                          {mods.map((m, i) => (
                            <li key={i}>
                              • {m.optionName}
                              {m.price > 0 && ` (+${formatPrice(m.price)})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {item.note && (
                      <p className="text-truck-cream-dim text-xs mt-1.5 italic">
                        📝 {item.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity - 1)
                          }
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                          aria-label="Restar"
                        >
                          <Minus className="w-3 h-3 text-truck-cream" />
                        </button>
                        <span className="text-sm text-truck-cream w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity + 1)
                          }
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                          aria-label="Sumar"
                        >
                          <Plus className="w-3 h-3 text-truck-cream" />
                        </button>
                      </div>
                      <span className="font-display text-lg text-truck-yellow">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              {/* Modalidad */}
              <div>
                <h3 className="font-bold text-truck-cream text-sm mb-2">
                  Modalidad
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["retiro", "delivery"] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide ${
                        orderType === type
                          ? "bg-truck-yellow text-truck-black"
                          : "bg-white/5 text-truck-cream-dim border border-white/10"
                      }`}
                    >
                      {type === "retiro" ? "Retiro en Local" : "Delivery"}
                    </button>
                  ))}
                </div>
              </div>

              {hasMultipleBranches && orderType === "retiro" && (
                <div>
                  <label className="font-bold text-truck-cream text-sm mb-2 block">
                    Sucursal
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-truck-charcoal">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-truck-cream text-sm mb-2 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream placeholder:text-truck-cream-dim/60 focus:outline-none focus:border-truck-yellow/50"
                />
              </div>

              {orderType === "delivery" && (
                <div>
                  <label className="font-bold text-truck-cream text-sm mb-2 block">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, número, depto/casa"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream placeholder:text-truck-cream-dim/60 focus:outline-none focus:border-truck-yellow/50"
                  />
                </div>
              )}

              {formError && (
                <p className="text-truck-red text-sm font-semibold">
                  {formError}
                </p>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-truck-cream-dim font-semibold">Total</span>
              <span className="font-display text-2xl text-truck-yellow">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wide text-base bg-truck-green text-white active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar Pedido por WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
