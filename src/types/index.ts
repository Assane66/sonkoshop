
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: string; // Now a string, managed by admin
  imageUrl: string;
  stock: number;
  sizes?: string[];
  featured?: boolean;
  imageAiHint?: string;
};

// ProductCategory enum can still be useful for initial values or strongly-typed references elsewhere if needed.
export enum ProductCategory {
  Maillots = "Maillots",
  Chaussures = "Chaussures",
  Pantalons = "Pantalons",
  Enfants = "Enfants",
  Modes = "Modes",
  Gardiens = "Gardiens",
  EquipementsSportifs = "Équipements Sportifs",
}

// This list will be managed dynamically by the admin categories page.
// It's initialized here with some default values.
export let productCategories: string[] = Object.values(ProductCategory);

// Function to update the productCategories array from admin UI
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
  "Default": LayoutGrid, // Default/Fallback icon
  // Add more mappings as needed, keys should be icon names for selection
  "Chemise": Shirt,
  "Baskets": Footprints,
  "Accessoires": LayoutGrid,
};

// Types for Orders 
export enum OrderStatus {
  Pending = "En attente",
  Processing = "En traitement",
  Shipped = "Expédiée",
  Delivered = "Livrée",
  Cancelled = "Annulé", // Corrected spelling from image
}

export const orderStatusList = Object.values(OrderStatus);

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; 
  selectedSize?: string;
  imageUrl?: string; 
}

export interface CustomerInfo {
  fullName: string;
  address: string;
  phone: string;
  email?: string; 
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

// Represents a category as managed in the admin UI
export interface SiteCategory {
  id: string;
  name: string;
  iconName?: keyof typeof categoryIcons; // Refers to a key in categoryIcons
}
