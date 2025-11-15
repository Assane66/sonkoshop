import { Suspense } from 'react';
import type { Product, SiteCategory } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { Metadata } from 'next';
import ProductsPageContent from './ProductsPageContent';
import { Loader2 } from 'lucide-react';

// Re-enabling generateMetadata in a Server Component context at the page level
export async function generateMetadata({ searchParams }: { searchParams: { category?: string } }): Promise<Metadata> {
  const categoryName = searchParams?.category;

  if (categoryName) {
    return {
      title: `${decodeURIComponent(categoryName)} - Sonko Shop`,
      description: `Découvrez notre sélection de ${decodeURIComponent(categoryName)} chez Sonko Shop. Qualité et meilleurs prix garantis.`,
    };
  }

  return {
    title: 'Tous nos produits - Sonko Shop',
    description: 'Parcourez toute la collection de produits de Sonko Shop. Maillots, chaussures, équipements sportifs et bien plus encore.',
  };
}

async function getCategories(): Promise<SiteCategory[]> {
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteCategory));
  } catch (error) {
    console.error("Error fetching categories for server component:", error);
    return [];
  }
}

// The main export is now a Server Component
export default async function ProductsPage() {
    const categories = await getCategories();

    return (
        <Suspense fallback={
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-xl text-muted-foreground">Chargement...</p>
            </div>
        </div>
        }>
            <ProductsPageContent initialCategories={categories} />
        </Suspense>
    );
}