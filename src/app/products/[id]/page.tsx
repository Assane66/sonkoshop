
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input as ShadcnInput } from '@/components/ui/input';
import { ShoppingCart, Zap, Star, CheckCircle, ShieldCheck, Tag, Minus, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import type { Product } from '@/types';
import { categoryIcons } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const Label = ({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className || ''}`}>
    {children}
  </label>
);


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const cart = useCart();

  useEffect(() => {
    if (!params.id) {
      console.error("ProductDetailPage: No product ID provided.");
      toast({ variant: "destructive", title: "Erreur", description: "ID de produit manquant." });
      setIsLoading(false);
      setProduct(null);
      return;
    }

    setIsLoading(true);
    setQuantity(1);
    console.log(`ProductDetailPage: Setting up Firestore listener for product ID: ${params.id}`);
    const productDocRef = doc(db, 'products', params.id);

    const unsubscribe = onSnapshot(productDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const productData = docSnap.data();
        console.log("ProductDetailPage: Product data fetched:", productData);
        const mappedProduct = {
          id: docSnap.id,
          name: productData.name || 'Nom manquant',
          description: productData.description || 'Description manquante',
          price: productData.price || 0,
          category: productData.category || 'Catégorie manquante',
          imageUrl: productData.imageUrl || '',
          stock: productData.stock || 0,
          sizes: productData.sizes || [],
          featured: productData.featured || false,
          imageAiHint: productData.imageAiHint || '',
          promotionPercentage: productData.promotionPercentage || null,
          promotionEndDate: productData.promotionEndDate instanceof Timestamp ? productData.promotionEndDate : null,
        } as Product;
        setProduct(mappedProduct);
        console.log("ProductDetailPage: Product state updated:", mappedProduct);
      } else {
        console.warn(`ProductDetailPage: No product found with ID: ${params.id}`);
        setProduct(null);
        toast({ variant: "destructive", title: "Produit non trouvé", description: "Ce produit n'existe pas ou plus." });
      }
      setIsLoading(false);
    }, (error) => {
      console.error(`ProductDetailPage: Error fetching product ID ${params.id}:`, error);
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de charger les détails du produit: ${error.message}` });
      setProduct(null);
      setIsLoading(false);
    });

    return () => {
      console.log(`ProductDetailPage: Unsubscribing from Firestore listener for product ID: ${params.id}`);
      unsubscribe();
    }
  }, [params.id, toast]);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      if (!selectedSize || !product.sizes.includes(selectedSize)) {
        setSelectedSize(product.sizes[0]);
      }
    } else if (product && (!product.sizes || product.sizes.length === 0)) {
        setSelectedSize(undefined);
    }
  }, [product, selectedSize]);

  const getDisplayPrice = () => {
    if (!product) return { currentPrice: 0, originalPrice: null, promotionActive: false, promotionPercentage: null };
    
    let currentPrice = product.price;
    let originalPrice = null;
    let promotionActive = false;

    if (product.promotionPercentage && product.promotionPercentage > 0) {
      if (product.promotionEndDate) {
        const endDate = product.promotionEndDate instanceof Timestamp ? product.promotionEndDate.toDate().getTime() : new Date(product.promotionEndDate as any).getTime();
        if (new Date().getTime() < endDate) {
          originalPrice = product.price;
          currentPrice = product.price * (1 - product.promotionPercentage / 100);
          promotionActive = true;
        }
      } else {
        originalPrice = product.price;
        currentPrice = product.price * (1 - product.promotionPercentage / 100);
        promotionActive = true;
      }
    }
    return { currentPrice, originalPrice, promotionActive, promotionPercentage: product.promotionPercentage };
  };

  const { currentPrice, originalPrice, promotionActive, promotionPercentage } = getDisplayPrice();


  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Produit épuisé",
        description: "Ce produit n'est actuellement pas en stock.",
      });
      return;
    }
     if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Veuillez sélectionner une taille",
        description: "Une taille est requise pour ce produit.",
      });
      return;
    }

    cart.addToCart(product, quantity, selectedSize);
    toast({
      title: "Produit ajouté au panier!",
      description: `${product.name} (Qté: ${quantity}${selectedSize ? ', Taille: ' + selectedSize : ''}) a été ajouté.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground text-xl">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Zap className="mx-auto h-24 w-24 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Produit Non Trouvé</h1>
        <p className="text-muted-foreground">Désolé, le produit que vous recherchez n'est pas disponible.</p>
        <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
          <Link href="/products" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux produits
          </Link>
        </Button>
      </div>
    );
  }
  
  const displayImageUrl = product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : 'https://placehold.co/600x600.png';
  const displayImageAiHint = product.imageUrl && product.imageUrl.trim() !== '' ? (product.imageAiHint || 'product image detail') : 'placeholder image';

  const CategoryIconComponent = product.category ? categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"] : categoryIcons["Default"];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products" className="flex items-center text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tous les produits
        </Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl overflow-hidden rounded-lg group">
          <div className="relative w-full aspect-square">
            <Image
              src={displayImageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={displayImageAiHint}
              onError={(e) => {
                console.warn("ProductDetailPage: Error loading image:", displayImageUrl);
                e.currentTarget.src = 'https://placehold.co/600x600.png';
              }}
            />
             {promotionActive && promotionPercentage && (
                <Badge className="absolute top-2 left-2 bg-red-600 text-white text-base px-3 py-1" variant="destructive">
                  -{promotionPercentage}%
                </Badge>
            )}
             {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">ÉPUISÉ</Badge>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  {product.category && (
                    <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5 py-1 px-2.5 text-xs">
                      {CategoryIconComponent && <CategoryIconComponent className="h-3.5 w-3.5" />}
                      {product.category}
                    </Badge>
                  )}
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</CardTitle>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"} className={`text-sm py-1 px-3 ${product.stock > 0 && product.stock <=10 && product.stock > 0 ? 'bg-yellow-500 text-black' : ''}`}>
                  {product.stock > 0 ? `En Stock (${product.stock})` : "Épuisé"}
                </Badge>
              </div>
               <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(4.0 / 12 Avis)</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {originalPrice && (
                  <p className="text-xl lg:text-2xl text-muted-foreground line-through">
                    {originalPrice.toLocaleString('fr-FR')} FCFA
                  </p>
                )}
                <p className={`text-2xl lg:text-3xl font-semibold ${promotionActive ? 'text-red-600' : 'text-accent'}`}>
                  {currentPrice.toLocaleString('fr-FR')} FCFA
                  {promotionActive && promotionPercentage && (
                     <Badge variant="destructive" className="ml-2 text-sm">-{promotionPercentage}%</Badge>
                  )}
                </p>
              </div>
              <CardDescription className="text-base text-foreground/80 leading-relaxed">
                {product.description}
              </CardDescription>

              <Separator className="my-6" />

              <div className="space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="size" className="text-base font-medium">Taille:</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize} disabled={product.stock === 0}>
                      <SelectTrigger id="size" className="col-span-2 text-base">
                        <SelectValue placeholder="Choisir une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map(size => (
                          <SelectItem key={size} value={size} className="text-base">{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="quantity" className="text-base font-medium">Quantité:</Label>
                  <div className="flex items-center space-x-1 col-span-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || product.stock === 0}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <ShadcnInput
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) {
                          setQuantity(1);
                        } else {
                           const maxStock = product.stock === 0 ? 1 : product.stock;
                           setQuantity(Math.max(1, Math.min(maxStock, val)));
                        }
                      }}
                      className="w-16 text-center text-base h-9"
                      min="1"
                      max={product.stock === 0 ? 1 : product.stock}
                      disabled={product.stock === 0}
                    />
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock === 0 ? 1 : product.stock, q + 1))} disabled={quantity >= product.stock || product.stock === 0}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full mt-8 text-lg py-3 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au Panier
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardContent className="p-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Produit authentique garanti</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="h-5 w-5 mr-2 text-primary" />
                    <span>Meilleur prix & Qualité</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
