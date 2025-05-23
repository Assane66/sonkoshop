
'use client'; 

import type { Product } from '@/types';
import { categoryIcons } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext'; 
import { useToast } from '@/hooks/use-toast'; 

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const CategoryIcon = product.category ? categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"] : categoryIcons["Default"];

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
    
    let sizeToAdd = undefined;
    if (product.sizes && product.sizes.length > 0) {
        // For simplicity, allow adding with undefined size if no size is pre-selected on card.
        // Product detail page handles mandatory size selection.
    }

    addToCart(product, 1, sizeToAdd);
    toast({
      title: "Produit ajouté!",
      description: `${product.name} a été ajouté à votre panier.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  // Ensure imageUrl is a valid URL or a placeholder
  const displayImageUrl = product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : 'https://placehold.co/600x400.png';
  // Adjust imageAiHint based on whether the original imageUrl was valid
  const displayImageAiHint = product.imageUrl && product.imageUrl.trim() !== '' ? (product.imageAiHint || 'product image') : 'placeholder image';


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
            />
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
        <p className="text-xl font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</p>
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
