export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  label: string;
  required: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  allowsExtras: boolean;
  modifierGroups: ModifierGroup[];
  sortOrder: number;
  active: boolean;
}

export interface Category {
  id: string;
  label: string;
  sortOrder: number;
}

export interface Branch {
  id: string;
  name: string;
  active: boolean;
}

export interface AgregadoExtra {
  name: string;
  price: number;
}

export interface MenuMeta {
  brand: string;
  subtitle: string;
  whatsapp: string;
  instagram: string;
  hours: string;
  paymentMethods: string[];
}

export interface MenuData {
  meta: MenuMeta;
  categories: Category[];
  branches: Branch[];
  agregadosExtras: AgregadoExtra[];
  products: Product[];
}

// ============ CARRITO ============

export interface SelectedModifierOption {
  groupLabel: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // uuid generado en cliente, único por línea de carrito
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  selectedModifiers: SelectedModifierOption[];
  note: string;
  unitPrice: number; // basePrice + suma de recargos de modificadores
  lineTotal: number; // unitPrice * quantity
}

export type OrderType = "delivery" | "retiro";

export interface CustomerInfo {
  name: string;
  orderType: OrderType;
  address?: string;
  branchId?: string;
}
