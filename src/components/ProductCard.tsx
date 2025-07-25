
'use client';

import type { Product } from '@/types';
import { categoryIcons } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle, Truck, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const getDisplayPrice = () => {
    // If a promotion is active, originalPrice will hold the base price.
    // If not, the base price is just product.price.
    const originalPrice = product.originalPrice || product.price;
    // The current price is the promotionPrice if it exists, otherwise it's the base price.
    const currentPrice = product.promotionPrice || product.price;
    const isPromo = !!product.promotionPrice;

    return { currentPrice, originalPrice: isPromo ? originalPrice : null };
  };

  const { currentPrice, originalPrice } = getDisplayPrice();

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

    addToCart(product, 1, undefined);
    toast({
      title: "Produit ajouté!",
      description: `${product.name} a été ajouté à votre panier.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const displayImageUrl = product.imageUrls?.[0] || 'https://placehold.co/600x400.png';
  const displayImageAiHint = product.imageAiHint || 'product image';

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden border-none shadow-none rounded-lg h-full flex flex-col bg-secondary">
        <div className="relative w-full aspect-[4/5] bg-white">
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
            data-ai-hint={displayImageAiHint}
            onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             <Badge variant="secondary" className="text-xs bg-white text-black border border-gray-200">NEW</Badge>
             <Badge variant="secondary" className="text-xs bg-white text-cyan-600 border border-gray-200 flex items-center gap-1"><Truck className="h-3 w-3" /> 24h</Badge>
             {originalPrice && <Badge variant="destructive">PROMO</Badge>}
          </div>
        </div>
        <CardContent className="p-3 text-center flex-grow flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase">{product.category}</p>
            <h3 className="font-semibold text-sm leading-tight mt-1">{product.name}</h3>
          </div>
          <div className="mt-2">
            {originalPrice && (
              <p className="text-sm text-muted-foreground line-through">{originalPrice.toLocaleString('fr-FR')} FCFA</p>
            )}
            <p className="text-md font-bold text-foreground">
              {currentPrice.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
