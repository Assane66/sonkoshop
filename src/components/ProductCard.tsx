import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} legacyBehavior>
          <a className="block relative w-full h-48 md:h-60">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              data-ai-hint={product.imageAiHint || 'product image'}
            />
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
        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</p>
        <Button size="sm" variant="default">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
}
