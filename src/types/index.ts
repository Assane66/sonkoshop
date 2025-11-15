
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Baby, Sparkles, Shield, Dumbbell, LayoutGrid, Package, User, ShoppingCart, Star } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string; // Firestore document ID
  slug: string; // URL-friendly version of the name
  name: string;
  description: string;
  price: number;
  category: string; // This will be the name of the category
  imageUrls: string[];
  stock: number;
  sizes?: string[];
  featured?: boolean; // Pour la section "TOP PRODUITS"
  isBonPlan?: boolean; // Pour la section "BONS PLANS"
  imageAiHint?: string;
  
  // Promotion fields now managed directly on the product
  promotionPrice?: number | null; // The final price after promotion
  originalPrice?: number | null; // The price before promotion
};

export type Review = {
  id: string; // Firestore document ID
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp | string; // Use string for client-side rendering from JSON
};


export type UserData = {
  uid: string;
  email: string;
  fullName: string;
  address?: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: Timestamp;
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

export type BannerPlacement = 'top_carousel' | 'category_promo';

export type Banner = {
  id: string; // Firestore document ID
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  imageAiHint?: string;
  placement: BannerPlacement;
};

export interface SiteCategory {
  id: string; // Firestore document ID
  name: string;
  iconName?: keyof typeof categoryIcons; // Icon name string
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
  "Account": User,
  "Orders": ShoppingCart,
  "Reviews": Star,
};


export enum OrderStatus {
  Pending = "En attente",
  Processing = "En traitement",
  Shipped = "Expédiée",
  Delivered = "Livrée",
  Cancelled = "Annulé",
  WavePending = "En attente de paiement Wave",
  ReadyForPickup = "Prêt pour le retrait",
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
  userId?: string; // Link to the user who made the order
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number; // Grand total (subtotal + shipping)
  status: OrderStatus;
  orderDate: Timestamp | string;
  paymentMethod: 'cod' | 'wave' | 'pickup' | string; 
  shippingAddress: string;
  shippingCost?: number;
  subtotal?: number;
  waveSessionId?: string;
  wavePaymentStatus?: string;
  lastWaveCheck?: Timestamp;
  reviewedProductIds?: string[];
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  codEnabled: boolean;
  waveEnabled: boolean;
  wavePaymentUrl: string;
  pickupEnabled: boolean;
}
