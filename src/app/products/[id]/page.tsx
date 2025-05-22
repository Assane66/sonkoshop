
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input as ShadcnInput } from '@/components/ui/input';
import { ShoppingCart, Zap, Star, CheckCircle, ShieldCheck, Tag, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { categoryIcons } from '@/types'; // Removed ProductCategoryEnum import, using string category
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '@/lib/firebase'; // Import db instance

// Removed allMockProducts array

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const cart = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const productDocRef = doc(db, 'products', params.id);
        const productSnap = await getDoc(productDocRef);

        if (productSnap.exists()) {
          const fetchedProductData = productSnap.data() as Omit<Product, 'id'>;
          const fetchedProduct: Product = { id: productSnap.id, ...fetchedProductData };
          setProduct(fetchedProduct);
          if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
            setSelectedSize(fetchedProduct.sizes[0]);
          }
        } else {
          console.log("Aucun produit trouvé avec cet ID!");
          setProduct(null); // Explicitly set to null if not found
          toast({ variant: "destructive", title: "Produit non trouvé", description: "Ce produit n'existe pas ou plus." });
        }
      } catch (error) {
        console.error("Erreur de récupération du produit:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les détails du produit." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
  }, [params.id, toast]);

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
      description: `${product.name} (Qté: ${quantity}${selectedSize ? ', Taille: ' + selectedSize : ''}) a été ajouté à votre panier.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Zap className="mx-auto h-24 w-24 text-primary mb-4 animate-pulse" />
        <h1 className="text-2xl font-semibold text-muted-foreground">Chargement du produit...</h1>
        <p className="text-muted-foreground">Veuillez patienter pendant que nous récupérons les détails.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Zap className="mx-auto h-24 w-24 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Produit Non Trouvé</h1>
        <p className="text-muted-foreground">Désolé, le produit que vous recherchez n'est pas disponible.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Retour aux produits</Link>
        </Button>
      </div>
    );
  }

  const CategoryIcon = product.category ? categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"] : categoryIcons["Default"];


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl overflow-hidden">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x600.png'}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageAiHint || 'product image detail'}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  {product.category && (
                    <Badge variant="outline" className="mb-2 inline-flex items-center gap-1">
                      {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                      {product.category}
                    </Badge>
                  )}
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</CardTitle>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-sm py-1 px-3">
                  {product.stock > 0 ? `En Stock (${product.stock})` : "Épuisé"}
                </Badge>
              </div>
               <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(12 avis)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl lg:text-3xl font-semibold text-accent mb-4">
                {product.price.toLocaleString('fr-FR')} FCFA
              </p>
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
                          setQuantity(Math.max(1, Math.min(product.stock === 0 ? 1 : product.stock, val)));
                        }
                      }}
                      className="w-16 text-center text-base"
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

          <Card>
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

// Ensure Label component is defined or imported if it's a custom component
const Label = ({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

    