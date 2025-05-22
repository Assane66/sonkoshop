
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  sizes?: string[];
  // colors?: string[]; // Supprimé
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

