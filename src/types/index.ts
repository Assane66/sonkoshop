
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid, Package } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string; // Firestore document ID
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  sizes?: string[];
  featured?: boolean;
  imageAiHint?: string;
  promotionPercentage?: number | null; // ex: 10, 20, 30
  promotionEndDate?: Timestamp | null; // Firestore Timestamp
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
};

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
  price: number; // Prix au moment de l'achat (peut être promotionnel)
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
  paymentMethod: 'cod' | string;
  shippingAddress: string;
}
