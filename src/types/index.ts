
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid, Package } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: string; // Now a string, should refer to a category ID/name from Firestore
  imageUrl: string;
  stock: number;
  sizes?: string[];
  featured?: boolean;
  imageAiHint?: string;
};

// This enum can still be useful for initial default categories if you populate them
// or for defining structure, but the actual list comes from Firestore.
export enum ProductCategoryEnum {
  Maillots = "Maillots",
  Chaussures = "Chaussures",
  Pantalons = "Pantalons",
  Enfants = "Enfants",
  Modes = "Modes",
  Gardiens = "Gardiens",
  EquipementsSportifs = "Équipements Sportifs",
}

export type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  imageAiHint?: string;
};

// SiteCategory now reflects what would be stored in Firestore
export interface SiteCategory {
  id: string; // Firestore document ID
  name: string;
  iconName?: keyof typeof categoryIcons;
}

export const categoryIcons: Record<string, LucideIcon> = {
  [ProductCategoryEnum.Maillots]: Shirt,
  [ProductCategoryEnum.Chaussures]: Footprints,
  [ProductCategoryEnum.Pantalons]: Layers,
  [ProductCategoryEnum.Enfants]: Baby,
  [ProductCategoryEnum.Modes]: Sparkles,
  [ProductCategoryEnum.Gardiens]: Shield,
  [ProductCategoryEnum.EquipementsSportifs]: Dumbbell,
  "Default": LayoutGrid,
  "Chemise": Shirt,
  "Baskets": Footprints,
  "Accessoires": LayoutGrid,
  "Package": Package, // Added Package icon for potential use
};


// Types for Orders 
export enum OrderStatus {
  Pending = "En attente",
  Processing = "En traitement",
  Shipped = "Expédiée",
  Delivered = "Livrée",
  Cancelled = "Annulé",
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
  id: string; // Firestore document ID
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string; // ISO string date, or Firebase Timestamp
  paymentMethod: 'cod' | 'wave' | string;
  shippingAddress: string; 
}
