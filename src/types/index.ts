
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, ListOrdered, LayoutGrid } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: ProductCategory | string; // Allow string for dynamically added categories
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

// This will be managed in the admin UI, but keep initial values
export let productCategories: string[] = Object.values(ProductCategory);

export const updateProductCategories = (newCategories: string[]) => {
  productCategories = newCategories;
};


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
  // Add a default or placeholder icon for new categories if needed
  "Default": LayoutGrid,
};

// Types for Orders
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

// Type for Categories in Admin
export interface SiteCategory {
  id: string;
  name: string;
  description?: string;
  iconName?: keyof typeof categoryIcons | "Default"; // Optional: reference to an icon key
}
