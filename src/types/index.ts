
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: ProductCategory | string; 
  imageUrl: string;
  stock: number;
  sizes?: string[];
  featured?: boolean;
  imageAiHint?: string;
};

export enum ProductCategory {
  Maillots = "Maillots",
  Chaussures = "Chaussures",
  Pantalons = "Pantalons",
  Enfants = "Enfants",
  Modes = "Modes",
  Gardiens = "Gardiens",
  EquipementsSportifs = "Équipements Sportifs",
}

// productCategories will now be a static list derived from the enum,
// as the admin UI for dynamic management is being removed.
export const productCategories: string[] = Object.values(ProductCategory);

export type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  imageAiHint?: string;
};

export const categoryIcons: Record<string, LucideIcon> = {
  [ProductCategory.Maillots]: Shirt,
  [ProductCategory.Chaussures]: Footprints,
  [ProductCategory.Pantalons]: Layers,
  [ProductCategory.Enfants]: Baby,
  [ProductCategory.Modes]: Sparkles,
  [ProductCategory.Gardiens]: Shield,
  [ProductCategory.EquipementsSportifs]: Dumbbell,
  "Default": LayoutGrid, // Kept for potential use in filters if a category doesn't match
};

// Types for Orders (kept for potential customer-facing features like order history)
export enum OrderStatus {
  Pending = "En attente",
  Processing = "En traitement",
  Shipped = "Expédiée",
  Delivered = "Livrée",
  Cancelled = "Annulée",
}

export const orderStatusList = Object.values(OrderStatus);

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price per unit at time of order
  selectedSize?: string;
  imageUrl?: string; // For display in order details
}

export interface CustomerInfo {
  fullName: string;
  address: string;
  phone: string;
  email?: string; // Optional
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string; // ISO string date
  paymentMethod: 'cod' | 'wave' | string;
  shippingAddress: string; 
}

// SiteCategory type removed as it was admin-specific
// updateProductCategories function removed
