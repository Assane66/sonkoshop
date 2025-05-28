
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid, Package } from 'lucide-react';

export type Product = {
  id: string; // Firestore document ID
  name: string;
  description: string;
  price: number;
  category: string; // Category name or ID, to be linked with SiteCategory
  imageUrl: string;
  stock: number;
  sizes?: string[];
  featured?: boolean;
  imageAiHint?: string;
  // Timestamps for Firestore if needed
  // createdAt?: any;
  // updatedAt?: any;
};

export enum ProductCategoryEnum {
  Maillots = "Maillots",
  Chaussures = "Chaussures",
  Pantalons = "Pantalons",
  Enfants = "Enfants",
  Modes = "Modes",
  Gardiens = "Gardiens",
  EquipementsSportifs = "Équipements Sportifs",
  Chemise = "Chemise",
  Baskets = "Baskets",
  Accessoires = "Accessoires",
}
export const productCategoriesArray: string[] = Object.values(ProductCategoryEnum);


export type Banner = {
  id: string; // Firestore document ID
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  imageAiHint?: string;
  // createdAt?: any;
};

export interface SiteCategory {
  id: string; // Firestore document ID
  name: string;
  iconName?: keyof typeof categoryIcons; // Should match keys in categoryIcons
  // createdAt?: any;
}

export const categoryIcons: Record<string, LucideIcon> = {
  [ProductCategoryEnum.Maillots]: Shirt,
  [ProductCategoryEnum.Chaussures]: Footprints,
  [ProductCategoryEnum.Pantalons]: Layers,
  [ProductCategoryEnum.Enfants]: Baby,
  [ProductCategoryEnum.Modes]: Sparkles,
  [ProductCategoryEnum.Gardiens]: Shield,
  [ProductCategoryEnum.EquipementsSportifs]: Dumbbell,
  [ProductCategoryEnum.Chemise]: Shirt, 
  [ProductCategoryEnum.Baskets]: Footprints,
  [ProductCategoryEnum.Accessoires]: LayoutGrid,
  "Default": LayoutGrid, 
  "Package": Package, 
};


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
  orderDate: any; // Will be a Firestore Timestamp or string after conversion
  paymentMethod: 'cod' | string; // Removed 'wave' as an explicit option
  shippingAddress: string;
  // userId?: string; // Optional: if you want to link orders to users
}

    