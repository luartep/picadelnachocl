import type { CartItem, CustomerInfo } from "./types";
import { formatPrice } from "./format";

export function buildWhatsAppMessage(params: {
  brand: string;
  items: CartItem[];
  customer: CustomerInfo;
  branchName?: string;
  total: number;
}): string {
  const { brand, items, customer, branchName, total } = params;

  const lines: string[] = [];
  lines.push(`¡Hola ${brand}! Quiero hacer un pedido:`);
  lines.push(`👤 Nombre: ${customer.name}`);
  lines.push(
    `📍 Modalidad: ${customer.orderType === "delivery" ? "Delivery" : "Retiro en Local"}`
  );

  if (customer.orderType === "delivery" && customer.address) {
    lines.push(`🏠 Dirección: ${customer.address}`);
  } else if (customer.orderType === "retiro" && branchName) {
    lines.push(`🏪 Sucursal: ${branchName}`);
  }

  lines.push("--- PEDIDO ---");

  for (const item of items) {
    lines.push(
      `${item.quantity}x ${item.productName} - ${formatPrice(item.lineTotal)}`
    );

    const groupedModifiers = new Map<string, typeof item.selectedModifiers>();
    for (const mod of item.selectedModifiers) {
      const existing = groupedModifiers.get(mod.groupLabel) ?? [];
      existing.push(mod);
      groupedModifiers.set(mod.groupLabel, existing);
    }

    for (const [groupLabel, mods] of groupedModifiers) {
      lines.push(`   ${groupLabel}:`);
      for (const mod of mods) {
        const surcharge = mod.price > 0 ? ` (+${formatPrice(mod.price)})` : "";
        lines.push(`     • ${mod.optionName}${surcharge}`);
      }
    }

    if (item.note.trim()) {
      lines.push(`   📝 Nota: ${item.note.trim()}`);
    }
  }

  lines.push("---");
  lines.push(`💰 TOTAL: ${formatPrice(total)}`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
