
'use client';

import { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen } from 'lucide-react';

const mockBanners: Banner[] = [
  { id: '1', title: 'Nouvelle Collection Maillots 2024!', subtitle: 'Découvrez les derniers styles et supportez votre équipe.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Maillots', imageAiHint: 'football jersey stadium' },
  { id: '2', title: 'Promo Chaussures de Sport', subtitle: 'Jusqu\'à -30% sur une sélection.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Chaussures', imageAiHint: 'sports shoes running' },
  { id: '3', title: 'Équipements Pro pour Gardiens', subtitle: 'Performance et protection maximales.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Gardiens', imageAiHint: 'goalkeeper gloves save' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, where("featured", "==", true), limit(8)); // Fetch up to 8 featured products

    // Using onSnapshot for real-time updates, though getDocs might be sufficient if real-time isn't critical here.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedProducts: Product[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Product, 'id'>
      }));
      setFeaturedProducts(fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur de récupération des produits en vedette:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les produits en vedette." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <BannerCarousel banners={mockBanners} />
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Produits en Vedette</h2>
        {isLoading ? (
          <div className="text-center py-10">
             <div className="animate-pulse flex flex-col items-center">
                <PackageOpen className="h-24 w-24 text-primary mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des produits en vedette...</p>
            </div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucun produit en vedette pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Revenez bientôt ou explorez tous nos <a href="/products" className="text-primary hover:underline">produits</a>.</p>
          </div>
        )}
      </section>
    </div>
  );
}
    