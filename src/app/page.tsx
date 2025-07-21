
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Loader2, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bonsPlansProducts, setBonsPlansProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    
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
      unsubFeatured();
      unsubBonsPlans();
      clearTimeout(timer);
    };
  }, [toast]);

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4">

        {/* Hero Banner */}
        <section className="my-8 relative h-[60vh] flex items-center justify-center text-white rounded-lg overflow-hidden">
          <Image src="https://placehold.co/1200x600/000000/FFFFFF.png" alt="Fear Nothing" layout="fill" objectFit="cover" data-ai-hint="sports shoes dark" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative z-10 text-center">
            <h1 className="text-6xl font-bold tracking-tighter">FEAR NOTHING</h1>
          </div>
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

        {/* Categories Grid */}
        <section className="my-16">
          <h2 className="text-2xl font-bold text-center mb-6">CATÉGORIES LES PLUS POPULAIRES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/products?category=Maillots" className="relative h-96 rounded-lg overflow-hidden group">
              <Image src="https://placehold.co/600x800.png" alt="Prism Pack" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint="soccer jersey promotion" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
                <div>
                  <h3 className="text-4xl font-bold text-white">PRISM PACK</h3>
                  <Button variant="secondary" className="mt-2">NIKE PRISM</Button>
                </div>
              </div>
            </Link>
            <Link href="/products?category=Chaussures" className="relative h-96 rounded-lg overflow-hidden group">
              <Image src="https://placehold.co/600x800/228B22/FFFFFF.png" alt="Road to Glory" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint="soccer cleats grass" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
                <div>
                  <h3 className="text-4xl font-bold text-white">ROAD TO GLORY</h3>
                  <Button variant="secondary" className="mt-2">ADIDAS</Button>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Destockage Banner */}
        <section className="my-16 relative h-80 flex items-center justify-center text-white rounded-lg overflow-hidden">
          <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1753066980/sonko_shop_banner_1200x400_uo67kz.png" alt="Destockage" layout="fill" objectFit="cover" data-ai-hint="soccer jerseys sale" />
          <div className="absolute inset-0 bg-red-800 bg-opacity-30" />
          <div className="relative z-10 text-center">
            <h2 className="text-6xl font-black tracking-wider">DESTOCKAGE</h2>
            <h3 className="text-5xl font-black tracking-wider -mt-2">MASSIF</h3>
          </div>
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
