
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { Search, Loader2, PackageOpen } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import type { Product } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

interface SearchPopoverProps {
  onResultClick: () => void;
  isSheet?: boolean;
}

export default function SearchPopover({ onResultClick, isSheet = false }: SearchPopoverProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      if (!isSheet) setIsPopoverOpen(false);
      return;
    }

    setIsLoading(true);
    const productsRef = collection(db, 'products');
    
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    
    // We fetch a broader set of products and filter client-side.
    // For a large number of products, a dedicated search service like Algolia or Typesense is recommended.
    const q = query(
      productsRef,
      orderBy('name'),
      limit(50) // Fetch more documents to increase the chance of finding a match
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      const searchResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) || 
        (product.category && product.category.toLowerCase().includes(searchTermLower)) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower)) ||
        (product.imageAiHint && product.imageAiHint.toLowerCase().includes(searchTermLower))
      ).slice(0, 5); // Limit results to 5 for display

      setResults(searchResults);
      setIsLoading(false);
      if (!isSheet) setIsPopoverOpen(searchResults.length > 0 || searchTerm.length > 1);
    }, (error) => {
      console.error("Search error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedSearchTerm, isSheet, searchTerm]);

  const SearchInput = (
    <div className="relative w-full">
        <Input
        type="search"
        placeholder="Rechercher un produit, une catégorie..."
        className="w-full rounded-full pl-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus={isSheet}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
        {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
        </div>
    </div>
  );

  const SearchResults = (
    <ScrollArea className="max-h-80">
      <div className="space-y-2 mt-2">
        {results.length > 0 ? (
          results.map((product) => {
            const displayImageUrl = product.imageUrls?.[0] || 'https://placehold.co/100x100.png';
            const isPromo = product.promotionPrice && product.promotionPrice < product.price;
            const displayPrice = isPromo ? product.promotionPrice : product.price;
            const productLink = `/products/${product.slug || product.id}`;

            return (
              <Link
                key={product.id}
                href={productLink}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-accent"
                onClick={onResultClick}
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
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {displayPrice?.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          !isLoading && debouncedSearchTerm.length > 1 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <PackageOpen className="mx-auto h-8 w-8 mb-2" />
              Aucun résultat pour "{debouncedSearchTerm}"
            </div>
          )
        )}
      </div>
    </ScrollArea>
  );

  if (isSheet) {
    return (
      <div>
        {SearchInput}
        {SearchResults}
      </div>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor asChild>
        {SearchInput}
      </PopoverAnchor>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        {SearchResults}
      </PopoverContent>
    </Popover>
  );
}
