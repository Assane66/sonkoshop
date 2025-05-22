
import type { LucideIcon } from 'lucide-react';
import { Shirt, Footprints, Layers, Child, Sparkles, Shield, Dumbbell } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: ProductCategory;
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

export const productCategories = Object.values(ProductCategory);

export type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  imageAiHint?: string;
};

// New: Category to Icon mapping
export const categoryIcons: Record<ProductCategory, LucideIcon> = {
  [ProductCategory.Maillots]: Shirt,
  [ProductCategory.Chaussures]: Footprints,
  [ProductCategory.Pantalons]: Layers,
  [ProductCategory.Enfants]: Child,
  [ProductCategory.Modes]: Sparkles,
  [ProductCategory.Gardiens]: Shield,
  [ProductCategory.EquipementsSportifs]: Dumbbell,
};
