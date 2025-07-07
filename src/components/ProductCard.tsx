
'use client';

import type { Product } from '@/types';
import { categoryIcons } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const CategoryIcon = product.category ? categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"] : categoryIcons["Default"];

  const getDisplayPrice = () => {
    let currentPrice = product.price;
    let originalPrice = null;
    let promotionActive = false;

    if (product.promotionPercentage && product.promotionPercentage > 0) {
      if (product.promotionEndDate) {
        // Ensure promotionEndDate is a Firestore Timestamp before calling toDate()
        const endDate = product.promotionEndDate instanceof Timestamp ? product.promotionEndDate.toDate().getTime() : new Date(product.promotionEndDate as any).getTime();
        if (new Date().getTime() < endDate) {
          originalPrice = product.price;
          currentPrice = product.price * (1 - product.promotionPercentage / 100);
          promotionActive = true;
        }
      } else { // Promotion illimitée si pas de date de fin
        originalPrice = product.price;
        currentPrice = product.price * (1 - product.promotionPercentage / 100);
        promotionActive = true;
      }
    }
    return { currentPrice, originalPrice, promotionActive, promotionPercentage: product.promotionPercentage };
  };

  const { currentPrice, originalPrice, promotionActive, promotionPercentage } = getDisplayPrice();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Produit épuisé",
        description: `${product.name} n'est plus en stock.`,
      });
      return;
    }

    addToCart(product, 1, undefined); // Pass undefined for size, detail page handles mandatory selection
    toast({
      title: "Produit ajouté!",
      description: `${product.name} a été ajouté à votre panier.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const displayImageUrl = product.imageUrls?.[0] || 'https://placehold.co/600x400.png';
  const displayImageAiHint = product.imageAiHint || 'product image';


  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} legacyBehavior>
          <a className="block relative w-full h-48 md:h-60">
            <Image
              src={displayImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={displayImageAiHint}
              onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'}
            />
             {promotionActive && promotionPercentage && (
                <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs" variant="destructive">
                  -{promotionPercentage}%
                </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm">ÉPUISÉ</Badge>
              </div>
            )}
          </a>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`} legacyBehavior>
          <a>
            <CardTitle className="text-lg font-semibold mb-1 hover:text-primary transition-colors">{product.name}</CardTitle>
          </a>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">{product.description.substring(0,60)}{product.description.length > 60 ? '...' : ''}</p>
        {product.category && (
          <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">
            {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
            {product.category}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div>
          {originalPrice && (
            <p className="text-sm text-muted-foreground line-through">{originalPrice.toLocaleString('fr-FR')} FCFA</p>
          )}
          <p className={`text-xl font-bold ${promotionActive ? 'text-red-600' : 'text-primary'}`}>
            {currentPrice.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
}
