
import React, { Suspense } from 'react';
import type { Product, Review } from '@/types';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import ProductInteraction from './ProductInteraction';
import ProductCard from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Tag } from 'lucide-react';
import { categoryIcons } from '@/types';
import { Badge } from '@/components/ui/badge';


type Props = {
  params: Promise<{ slug: string }>
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
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

async function getSuggestedProducts(product: Product | null): Promise<Product[]> {
  if (!product || !product.category) return [];
  try {
    const productsCollection = collection(db, 'products');
    const q = query(
      productsCollection,
      where('category', '==', product.category),
      limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        let imageUrls: string[] = [];
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          imageUrls = data.imageUrls;
        } else if (data.imageUrl && typeof data.imageUrl === 'string') {
          imageUrls = [data.imageUrl];
        }
        return { id: doc.id, ...data, imageUrls } as Product;
      })
      .filter(p => p.id !== product.id)
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
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
    description: product.description.substring(0, 155),
    openGraph: {
      title: `${product.name} | Sonko Shop`,
      description: product.description,
      images: [mainImageUrl, ...previousImages],
    },
  }
}


export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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

  const suggestedProducts = await getSuggestedProducts(product);

  const CategoryIconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products" className="flex items-center text-sm"><ArrowLeft className="mr-2 h-4 w-4" />Tous les produits</Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">

        <ProductInteraction product={product} />

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              {product.category && <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5 py-1 px-2.5 text-xs"><CategoryIconComponent className="h-3.5 w-3.5" />{product.category}</Badge>}
              <h1 className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</h1>
            </div>
            <Badge variant={product.stock > 0 ? "default" : "destructive"} className={`text-sm py-1 px-3 ${product.stock > 0 && product.stock <= 10 ? 'bg-yellow-500 text-black' : ''}`}>{product.stock > 0 ? `En Stock (${product.stock})` : "Épuisé"}</Badge>
          </div>
          <p className="text-base text-foreground/80 leading-relaxed">{product.description}</p>
          <Card className="rounded-lg">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /><span>Produit authentique garanti</span></div>
              <div className="flex items-center text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 mr-2 text-blue-500" /><span>Paiement sécurisé</span></div>
              <div className="flex items-center text-sm text-muted-foreground"><Tag className="h-5 w-5 mr-2 text-primary" /><span>Meilleur prix & Qualité</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Vous aimerez aussi</h2>
        {suggestedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun produit similaire trouvé.</p>
        )}
      </section>
    </div>
  );
}
