
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
    console.log("HomePage: Setting up Firestore listener for featured products...");
    const productsCollection = collection(db, 'products');
    // Temporarily removed orderBy('name', 'asc') to avoid needing a composite index immediately.
    // User should create the index: featured (asc), name (asc)
    const qProducts = query(productsCollection, where('featured', '==', true), limit(8));

    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      console.log("HomePage: Featured products snapshot received, docs count:", snapshot.docs.length);
      if (snapshot.empty) {
        console.log("HomePage: No featured products found in snapshot.");
      }
      const fetchedProducts: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("HomePage: Mapping product data:", data);
        return {
          id: doc.id,
          name: data.name || 'Nom manquant',
          description: data.description || 'Description manquante',
          price: data.price || 0,
          category: data.category || 'Catégorie manquante',
          imageUrl: data.imageUrl || '',
          stock: data.stock || 0,
          sizes: data.sizes || [],
          featured: data.featured || false,
          imageAiHint: data.imageAiHint || '',
        } as Product;
      });
      setFeaturedProducts(fetchedProducts);
      setIsLoadingProducts(false);
      console.log("HomePage: Featured products state updated:", fetchedProducts);
    }, (error) => {
      console.error("HomePage: Error fetching featured products:", error);
      toast({ variant: "destructive", title: "Erreur Produits", description: `Impossible de charger les produits en vedette: ${error.message}` });
      setIsLoadingProducts(false);
    });

    setIsLoadingBanners(true);
    console.log("HomePage: Setting up Firestore listener for banners...");
    const bannersCollection = collection(db, 'banners');
    const qBanners = query(bannersCollection, orderBy('title', 'asc'), limit(5)); 

    const unsubscribeBanners = onSnapshot(qBanners, (snapshot) => {
      console.log("HomePage: Banners snapshot received, docs count:", snapshot.docs.length);
      const fetchedBanners: Banner[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Banner));
      setBanners(fetchedBanners);
      setIsLoadingBanners(false);
      console.log("HomePage: Banners state updated:", fetchedBanners);
    }, (error) => {
      console.error("HomePage: Error fetching banners:", error);
      toast({ variant: "destructive", title: "Erreur Bannières", description: `Impossible de charger les bannières: ${error.message}` });
      setIsLoadingBanners(false);
    });

    return () => {
      console.log("HomePage: Unsubscribing from Firestore listeners.");
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
              <p className="text-xl text-muted-foreground">Aucune bannière à afficher.</p>
              <p className="text-sm text-muted-foreground mt-2">Ajoutez des bannières via le panneau d'administration.</p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Assurez-vous d'avoir des produits marqués comme "en vedette" dans l'administration, ou explorez tous nos <Link href="/products" className="text-primary hover:underline">produits</Link>.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
