
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BannerCarousel from '@/components/BannerCarousel';

const ProductCarousel = ({ products }: { products: Product[] }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default function HomePage() {
  const [topCarouselBanners, setTopCarouselBanners] = useState<Banner[]>([]);
  const [categoryPromoBanners, setCategoryPromoBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bonsPlansProducts, setBonsPlansProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch Banners and filter them by placement
    const bannersCollection = collection(db, 'banners');
    const bannersQuery = query(bannersCollection, orderBy('title', 'asc'));
    const unsubBanners = onSnapshot(bannersQuery, (snapshot) => {
      const fetchedBanners: Banner[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      setTopCarouselBanners(fetchedBanners.filter(b => b.placement === 'top_carousel'));
      setCategoryPromoBanners(fetchedBanners.filter(b => b.placement === 'category_promo'));
    }, (error) => {
      console.error("Error fetching banners:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les bannières." });
    });

    // Fetch Products
    const productsCollection = collection(db, 'products');
    const featuredQuery = query(productsCollection, where('featured', '==', true), limit(4));
    const bonsPlansQuery = query(productsCollection, orderBy('price', 'asc'), limit(4));

    const unsubFeatured = onSnapshot(featuredQuery, (snapshot) => {
      const fetchedProducts: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(fetchedProducts);
    }, (error) => {
      console.error("Error fetching featured products:", error);
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de charger les produits en vedette.` });
    });

    const unsubBonsPlans = onSnapshot(bonsPlansQuery, (snapshot) => {
      const fetchedProducts: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setBonsPlansProducts(fetchedProducts);
    }, (error) => {
      console.error("Error fetching bons plans products:", error);
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de charger les bons plans.` });
    });

    const timer = setTimeout(() => setIsLoading(false), 1500);

    return () => {
      unsubBanners();
      unsubFeatured();
      unsubBonsPlans();
      clearTimeout(timer);
    };
  }, [toast]);

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4">

        {/* Dynamic Banner Carousel */}
        <section className="my-8">
           {isLoading ? 
            <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted animate-pulse rounded-lg shadow-md" /> :
            <BannerCarousel banners={topCarouselBanners} />
           }
        </section>

        {/* Top Produits */}
        <section className="my-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">TOP PRODUITS</h2>
            <Link href="/products" className="text-sm font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-4 w-4"/>
            </Link>
          </div>
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"><div className="h-96 bg-muted rounded-lg animate-pulse col-span-4" /></div>
          ) : featuredProducts.length > 0 ? (
            <ProductCarousel products={featuredProducts} />
          ) : (
            <div className="text-center py-10 col-span-4"><PackageOpen className="mx-auto h-12 w-12 text-muted-foreground"/><p className="mt-4 text-muted-foreground">Aucun produit en vedette.</p></div>
          )}
        </section>

        {/* Categories Grid - Now Dynamic */}
        <section className="my-16">
          <h2 className="text-2xl font-bold text-center mb-6">CATÉGORIES LES PLUS POPULAIRES</h2>
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="h-96 bg-muted rounded-lg animate-pulse" /><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>
          ) : categoryPromoBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryPromoBanners.slice(0, 2).map(banner => (
                 <Link key={banner.id} href={banner.link} className="relative h-96 rounded-lg overflow-hidden group">
                    <Image src={banner.imageUrl} alt={banner.title} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint={banner.imageAiHint || 'category promotion'} />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
                      <div>
                        <h3 className="text-4xl font-bold text-white">{banner.title}</h3>
                        {banner.subtitle && <Button variant="secondary" className="mt-2">{banner.subtitle}</Button>}
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          ) : (
             <div className="text-center py-10"><p className="text-muted-foreground">Aucune promotion de catégorie pour le moment.</p></div>
          )}
        </section>

        {/* Destockage Banner */}
        <section className="my-16">
          <Link href="/products?category=Promos" className="block relative h-80 flex items-center justify-center text-white rounded-lg overflow-hidden group">
            <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1753066980/sonko_shop_banner_1200x400_uo67kz.png" alt="Destockage" layout="fill" objectFit="cover" data-ai-hint="soccer jerseys sale" className="transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-red-800 bg-opacity-30 group-hover:bg-opacity-20 transition-all" />
          </Link>
        </section>

        {/* Bons Plans */}
        <section className="my-16">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">BONS PLANS</h2>
             <Link href="/products" className="text-sm font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-4 w-4"/>
            </Link>
          </div>
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"><div className="h-96 bg-muted rounded-lg animate-pulse col-span-4" /></div>
          ) : bonsPlansProducts.length > 0 ? (
            <ProductCarousel products={bonsPlansProducts} />
          ) : (
            <div className="text-center py-10 col-span-4"><PackageOpen className="mx-auto h-12 w-12 text-muted-foreground"/><p className="mt-4 text-muted-foreground">Aucun bon plan pour le moment.</p></div>
          )}
        </section>
      </main>
    </div>
  );
}
