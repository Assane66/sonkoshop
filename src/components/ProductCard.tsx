
'use client';

import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const isPromo = product.promotionPrice && product.promotionPrice > 0 && product.promotionPrice < product.price;
  const displayPrice = isPromo ? product.promotionPrice! : product.price;
  const originalPrice = isPromo ? product.price : null;
  const discountPercent = isPromo ? Math.round(((originalPrice! - displayPrice) / originalPrice!) * 100) : 0;

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

  const displayImageUrl = product.imageUrls?.[0] ? optimizeCloudinaryUrl(product.imageUrls[0], 400) : 'https://placehold.co/600x400.png';
  const displayImageAiHint = product.imageAiHint || 'product image';
  const productLink = `/products/${product.slug || product.id}`;

  return (
    <Link href={productLink} className="block group h-full">
      <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-secondary overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-6"
            data-ai-hint={displayImageAiHint}
            onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isPromo && (
              <Badge className="bg-destructive text-white border-0 font-semibold px-3 py-1 text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {product.stock > 0 && (
              <Badge className="bg-primary text-primary-foreground border-0 font-medium px-3 py-1 text-xs flex items-center gap-1">
                <Truck className="h-3 w-3" /> 24h
              </Badge>
            )}
          </div>

          {/* Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-base px-4 py-2 font-semibold">
                Épuisé
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4">
          {/* Category */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {product.category}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 flex-grow">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="mt-auto mb-4">
            {isPromo ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground line-through">
                  {originalPrice?.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-lg font-bold text-foreground">
                  {displayPrice.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-foreground">
                {displayPrice.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? 'Épuisé' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
