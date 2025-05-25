
'use client';

import { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Image as ImageIconLucide } from 'lucide-react'; // Renamed Image to ImageIconLucide

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingProducts(true);
    const productsCollectionRef = collection(db, 'products');
    const qProducts = query(productsCollectionRef, where("featured", "==", true), limit(8));

    const unsubscribeProducts = onSnapshot(qProducts, (querySnapshot) => {
      const fetchedProducts: Product[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Product, 'id'>
      }));
      setFeaturedProducts(fetchedProducts);
      setIsLoadingProducts(false);
    }, (error) => {
      console.error("Erreur de récupération des produits en vedette:", error);
      toast({ variant: "destructive", title: "Erreur Produits", description: "Impossible de charger les produits en vedette." });
      setIsLoadingProducts(false);
    });

    return () => unsubscribeProducts();
  }, [toast]);

  useEffect(() => {
    setIsLoadingBanners(true);
    const bannersCollectionRef = collection(db, 'banners');
    // Vous pouvez ajouter un champ 'order' ou 'createdAt' pour trier les bannières si nécessaire
    const qBanners = query(bannersCollectionRef, orderBy("title", "asc")); 

    const unsubscribeBanners = onSnapshot(qBanners, (querySnapshot) => {
      const fetchedBanners: Banner[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Banner, 'id'>
      }));
      setBanners(fetchedBanners);
      setIsLoadingBanners(false);
    }, (error) => {
      console.error("Erreur de récupération des bannières:", error);
      toast({ variant: "destructive", title: "Erreur Bannières", description: "Impossible de charger les bannières." });
      setIsLoadingBanners(false);
    });

    return () => unsubscribeBanners();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        {isLoadingBanners ? (
          <div className="text-center py-10 h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg flex flex-col items-center justify-center">
             <div className="animate-pulse flex flex-col items-center">
                <ImageIconLucide className="h-24 w-24 text-primary mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des bannières...</p>
            </div>
          </div>
        ) : (
          <BannerCarousel banners={banners} />
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Produits en Vedette</h2>
        {isLoadingProducts ? (
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
