
import React, { Suspense } from 'react';
import type { Product } from '@/types';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';


type Props = {
  params: { slug: string }
}

async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            let imageUrls: string[] = [];
            if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
                imageUrls = data.imageUrls;
            } else if (data.imageUrl && typeof data.imageUrl === 'string') {
                imageUrls = [data.imageUrl];
            }
            return { id: docSnap.id, ...data, imageUrls } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error fetching product for metadata:", error);
        return null;
    }
}


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé - Sonko Shop',
      description: 'Ce produit n\'est plus disponible ou le lien est incorrect.',
    }
  }

  const previousImages = (await parent).openGraph?.images || []
  const mainImageUrl = product.imageUrls?.[0] || 'https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg';

  return {
    title: `${product.name} - Sonko Shop`,
    description: product.description.substring(0, 155), // Truncate for meta description best practice
    openGraph: {
      title: `${product.name} | Sonko Shop`,
      description: product.description,
      images: [mainImageUrl, ...previousImages],
    },
  }
}

// Main page component to handle Suspense boundary
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
     return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Zap className="mx-auto h-24 w-24 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Produit Non Trouvé</h1>
        <p className="text-muted-foreground mt-2">Le produit que vous cherchez n'existe pas ou a été déplacé.</p>
        <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
          <Link href="/products" className="flex items-center"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux produits</Link>
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground text-xl">Chargement du produit...</p>
          </div>
      </div>
    }>
      <ProductDetailClient initialProduct={product} />
    </Suspense>
  )
}
