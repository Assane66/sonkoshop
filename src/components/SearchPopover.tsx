
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { Search, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import type { Product } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPopover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      setIsPopoverOpen(false);
      return;
    }

    setIsLoading(true);
    const productsRef = collection(db, 'products');
    
    // Simple prefix search on name. For more complex search, consider a third-party service like Algolia.
    const q = query(
      productsRef,
      where('name', '>=', debouncedSearchTerm),
      where('name', '<=', debouncedSearchTerm + '\uf8ff'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const searchResults: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setResults(searchResults);
      setIsLoading(false);
      setIsPopoverOpen(searchResults.length > 0);
    }, (error) => {
      console.error("Search error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedSearchTerm]);
  
  const handleLinkClick = () => {
    setIsPopoverOpen(false);
    setSearchTerm('');
  };


  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
            <Input
            type="search"
            placeholder="Rechercher un produit..."
            className="w-full rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            </div>
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        <div className="space-y-2">
          {results.map((product) => {
            const displayImageUrl = product.imageUrls?.[0] || 'https://placehold.co/100x100.png';
            const isPromo = product.promotionPrice && product.promotionPrice < product.price;
            const displayPrice = isPromo ? product.promotionPrice : product.price;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-accent"
                onClick={handleLinkClick}
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image
                    src={displayImageUrl}
                    alt={product.name}
                    fill
                    sizes="50px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {displayPrice?.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
