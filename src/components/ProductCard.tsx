
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

  const isPromo = product.promotionPrice && product.promotionPrice > 0 && product.promotionPrice < product.price;
  const displayPrice = isPromo ? product.promotionPrice! : product.price;
  const originalPrice = isPromo ? product.price : null;

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
  const productLink = `/products/${product.slug || product.id}`;

  return (
    <Link href={productLink} className="block group">
      <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col bg-white group-hover:scale-[1.02]">
        <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-slate-50 to-white overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-110 p-4"
            data-ai-hint={displayImageAiHint}
            onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'}
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPromo ? (
              <Badge className="bg-red-500 text-white border-0 shadow-lg font-semibold px-3 py-1">
                PROMO
              </Badge>
            ) : (
              <Badge className="bg-white text-slate-700 border border-slate-200 shadow-sm font-medium px-3 py-1">
                NEW
              </Badge>
            )}
            <Badge className="bg-white text-primary border border-primary/20 shadow-sm flex items-center gap-1.5 px-3 py-1 font-medium">
              <Truck className="h-3.5 w-3.5" /> Livraison 24h
            </Badge>
          </div>

          {/* Stock indicator */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Épuisé
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 text-center flex-grow flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              {product.category}
            </p>
            <h3 className="font-bold text-base leading-tight mb-3 text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto">
            {isPromo ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground line-through">
                  {originalPrice?.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xl font-bold text-red-600">
                  {displayPrice.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Économisez {((originalPrice! - displayPrice) / originalPrice! * 100).toFixed(0)}%
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-900">
                {displayPrice.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
