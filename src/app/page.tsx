
'use client';

import { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Image as ImageIconLucide, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from 'firebase/firestore';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingProducts(true);
    console.log("HomePage: Fetching featured products...");
    const productsCollection = collection(db, 'products');
    // Query for featured products, ordered by name, limit to 8
    // Add orderBy('createdAt', 'desc') if you have timestamps and want newest featured
    const qProducts = query(productsCollection, where('featured', '==', true), orderBy('name', 'asc'), limit(8));

    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const fetchedProducts: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setFeaturedProducts(fetchedProducts);
      setIsLoadingProducts(false);
      console.log("HomePage: Featured products fetched:", fetchedProducts.length);
    }, (error) => {
      console.error("HomePage: Error fetching featured products:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les produits en vedette." });
      setIsLoadingProducts(false);
    });

    setIsLoadingBanners(true);
    console.log("HomePage: Fetching banners...");
    const bannersCollection = collection(db, 'banners');
    // Add orderBy('createdAt', 'desc') if you want to order banners
    const qBanners = query(bannersCollection, limit(5)); // Limit to 5 banners for example

    const unsubscribeBanners = onSnapshot(qBanners, (snapshot) => {
      const fetchedBanners: Banner[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Banner));
      setBanners(fetchedBanners);
      setIsLoadingBanners(false);
      console.log("HomePage: Banners fetched:", fetchedBanners.length);
    }, (error) => {
      console.error("HomePage: Error fetching banners:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les bannières." });
      setIsLoadingBanners(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBanners();
    };
  }, [toast]);


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        {isLoadingBanners ? (
          <div className="text-center py-10 h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg flex flex-col items-center justify-center">
             <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des bannières...</p>
            </div>
          </div>
        ) : banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
           <div className="text-center py-10 h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg flex flex-col items-center justify-center">
              <ImageIconLucide className="h-24 w-24 text-primary mb-4" />
              <p className="text-xl text-muted-foreground">Aucune bannière disponible pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Revenez bientôt ou configurez des bannières dans le panneau d'administration.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Produits en Vedette</h2>
        {isLoadingProducts ? (
          <div className="text-center py-10">
             <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des produits...</p>
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
