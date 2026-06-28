"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Category, ModifierGroup, Product } from "@/lib/types";
import { generateId } from "@/lib/format";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductEditorModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null; // null = crear nuevo
  categories: Category[];
  onClose: () => void;
  onSave: (product: Product) => Promise<string | null>;
}) {
  const isNew = product === null;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [category, setCategory] = useState(
    product?.category ?? categories[0]?.id ?? ""
  );
  const [allowsExtras, setAllowsExtras] = useState(
    product?.allowsExtras ?? false
  );
  const [active, setActive] = useState(product?.active ?? true);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(
    product?.modifierGroups ? JSON.parse(JSON.stringify(product.modifierGroups)) : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function addModifierGroup() {
    setModifierGroups((prev) => [
      ...prev,
      { label: "Nuevo grupo", required: 1, options: [] },
    ]);
  }

  function removeModifierGroup(groupIdx: number) {
    setModifierGroups((prev) => prev.filter((_, i) => i !== groupIdx));
  }

  function updateGroupLabel(groupIdx: number, label: string) {
    setModifierGroups((prev) =>
      prev.map((g, i) => (i === groupIdx ? { ...g, label } : g))
    );
  }

  function updateGroupRequired(groupIdx: number, required: number) {
    setModifierGroups((prev) =>
      prev.map((g, i) => (i === groupIdx ? { ...g, required } : g))
    );
  }

  function addOption(groupIdx: number) {
    setModifierGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, options: [...g.options, { name: "Nueva opción", price: 0 }] }
          : g
      )
    );
  }

  function removeOption(groupIdx: number, optionIdx: number) {
    setModifierGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, options: g.options.filter((_, j) => j !== optionIdx) }
          : g
      )
    );
  }

  function updateOptionName(groupIdx: number, optionIdx: number, value: string) {
    setModifierGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === optionIdx ? { ...o, name: value } : o
              ),
            }
          : g
      )
    );
  }

  function updateOptionPrice(groupIdx: number, optionIdx: number, value: number) {
    setModifierGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === optionIdx ? { ...o, price: value } : o
              ),
            }
          : g
      )
    );
  }

  async function handleSave() {
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!category) {
      setError("Selecciona una categoría.");
      return;
    }
    if (price < 0) {
      setError("El precio no puede ser negativo.");
      return;
    }

    setIsSaving(true);

    const finalProduct: Product = {
      id: product?.id ?? `${slugify(category)}-${slugify(name)}-${generateId().slice(0, 6)}`,
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      image: product?.image ?? null,
      allowsExtras,
      modifierGroups,
      sortOrder: product?.sortOrder ?? 999,
      active,
    };

    const saveError = await onSave(finalProduct);
    setIsSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] bg-truck-charcoal rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h2 className="font-display text-2xl text-truck-cream">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-truck-cream" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-truck-cream mb-1.5 block">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-truck-cream mb-1.5 block">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream resize-none focus:outline-none focus:border-truck-yellow/50"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-truck-cream mb-1.5 block">
                Precio
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-truck-cream mb-1.5 block">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-base text-truck-cream focus:outline-none focus:border-truck-yellow/50"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-truck-charcoal">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-truck-cream">
              <input
                type="checkbox"
                checked={allowsExtras}
                onChange={(e) => setAllowsExtras(e.target.checked)}
                className="w-4 h-4"
              />
              Permite adicionales
            </label>

            <label className="flex items-center gap-2 text-sm text-truck-cream">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
              Activo (visible en el menú)
            </label>
          </div>

          {/* Editor de modificadores */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-truck-cream">Grupos de modificadores</h3>
              <button
                onClick={addModifierGroup}
                className="flex items-center gap-1 text-sm font-bold text-truck-yellow"
              >
                <Plus className="w-4 h-4" />
                Agregar grupo
              </button>
            </div>

            {modifierGroups.length === 0 && (
              <p className="text-truck-cream-dim text-sm">
                Este producto no tiene modificadores.
              </p>
            )}

            <div className="space-y-4">
              {modifierGroups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <label className="text-xs text-truck-cream-dim block mb-1">
                        Label del grupo
                      </label>
                      <input
                        type="text"
                        value={group.label}
                        onChange={(e) => updateGroupLabel(groupIdx, e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-truck-cream focus:outline-none focus:border-truck-yellow/50"
                      />
                    </div>
                    <div className="w-28">
                      <label className="text-xs text-truck-cream-dim block mb-1">
                        Incluye (cant.)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={group.required}
                        onChange={(e) =>
                          updateGroupRequired(groupIdx, Number(e.target.value))
                        }
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-truck-cream focus:outline-none focus:border-truck-yellow/50"
                      />
                    </div>
                    <button
                      onClick={() => removeModifierGroup(groupIdx)}
                      className="mt-6 text-truck-cream-dim hover:text-truck-red"
                      aria-label="Eliminar grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option, optionIdx) => (
                      <div key={optionIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) =>
                            updateOptionName(groupIdx, optionIdx, e.target.value)
                          }
                          placeholder="Nombre de la opción"
                          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-truck-cream focus:outline-none focus:border-truck-yellow/50"
                        />
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) =>
                            updateOptionPrice(groupIdx, optionIdx, Number(e.target.value))
                          }
                          placeholder="Precio"
                          className="w-24 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-truck-cream focus:outline-none focus:border-truck-yellow/50"
                        />
                        <button
                          onClick={() => removeOption(groupIdx, optionIdx)}
                          className="text-truck-cream-dim hover:text-truck-red shrink-0"
                          aria-label="Eliminar opción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addOption(groupIdx)}
                    className="flex items-center gap-1 text-xs font-bold text-truck-yellow mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar opción
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-truck-red text-sm font-semibold">{error}</p>
          )}
        </div>

        <div className="p-5 border-t border-white/10 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wide bg-truck-yellow text-truck-black disabled:opacity-60 active:scale-[0.99] transition-transform"
          >
            {isSaving ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
