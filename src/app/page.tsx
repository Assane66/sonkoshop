
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
import { optimizeCloudinaryUrl } from '@/lib/utils';

const ProductCarousel = ({ products }: { products: Product[] }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, idx) => (
        <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
          <ProductCard product={product} />
        </div>
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

    // Fetch Banners
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
    const featuredQuery = query(productsCollection, where('featured', '==', true), limit(8));
    const bonsPlansQuery = query(productsCollection, where('isBonPlan', '==', true), limit(8));

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

    const timer = setTimeout(() => setIsLoading(false), 1200);

    return () => {
      unsubBanners();
      unsubFeatured();
      unsubBonsPlans();
      clearTimeout(timer);
    };
  }, [toast]);

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">

        {/* Hero Banner */}
        <section className="mb-16 md:mb-20 animate-fade-in">
          {isLoading ? (
            <div className="w-full h-80 md:h-96 lg:h-[500px] bg-secondary animate-pulse rounded-3xl" />
          ) : topCarouselBanners.length > 0 ? (
            <div className="rounded-3xl overflow-hidden">
              <BannerCarousel banners={topCarouselBanners} priority={true} />
            </div>
          ) : null}
        </section>

        {/* Featured Products Section */}
        <section className="mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                Nos Meilleures Ventes
              </h2>
              <p className="text-lg text-muted-foreground">
                Découvrez les produits les plus populaires de notre collection
              </p>
            </div>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
            >
              Voir tous les produits
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-secondary rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <ProductCarousel products={featuredProducts.slice(0, 4)} />
          ) : (
            <div className="text-center py-16">
              <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">Aucun produit en vedette pour le moment.</p>
            </div>
          )}
        </section>

        {/* Category Promotions */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Explorez nos Catégories
            </h2>
            <p className="text-lg text-muted-foreground">
              Parcourez nos collections spécialisées
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-secondary rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : categoryPromoBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryPromoBanners.slice(0, 2).map(banner => (
                <Link 
                  key={banner.id} 
                  href={banner.link} 
                  className="group relative h-80 md:h-96 rounded-3xl overflow-hidden"
                >
                  <Image 
                    src={optimizeCloudinaryUrl(banner.imageUrl)} 
                    alt={banner.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw" 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    data-ai-hint={banner.imageAiHint || 'category promotion'} 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-end p-8 md:p-10">
                    <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        {banner.title}
                      </h3>
                      {banner.subtitle && (
                        <Button 
                          className="bg-white text-foreground hover:bg-white/90 font-semibold rounded-full"
                        >
                          {banner.subtitle}
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {/* Special Offers Section */}
        <section className="mb-16 md:mb-20">
          <div className="bg-secondary rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                  Bons Plans
                </h2>
                <p className="text-lg text-muted-foreground">
                  Découvrez nos offres exclusives et réductions limitées
                </p>
              </div>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
              >
                Voir tous les bons plans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : bonsPlansProducts.length > 0 ? (
              <ProductCarousel products={bonsPlansProducts.slice(0, 4)} />
            ) : (
              <div className="text-center py-16">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">Aucun bon plan pour le moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
