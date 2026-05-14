'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, PackageOpen, Sparkles } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import type { Product, SiteCategory } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

interface SearchBarProps {
  onResultClick?: () => void;
  isSheet?: boolean;
  categories?: SiteCategory[];
}

export default function SearchBar({ onResultClick, isSheet = false, categories = [] }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [categoryResults, setCategoryResults] = useState<SiteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  useEffect(() => {
    if (debouncedSearchTerm.length < 1) {
      setResults([]);
      setCategoryResults([]);
      if (!isSheet) setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const productsRef = collection(db, 'products');
    
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    
    const q = query(
      productsRef,
      orderBy('name'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      const searchResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) || 
        (product.category && product.category.toLowerCase().includes(searchTermLower)) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower))
      ).slice(0, 8);

      // Filter categories
      const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTermLower)
      ).slice(0, 5);

      setResults(searchResults);
      setCategoryResults(filteredCategories);
      setIsLoading(false);
      if (!isSheet) setIsOpen(searchResults.length > 0 || filteredCategories.length > 0 || debouncedSearchTerm.length > 0);
    }, (error) => {
      console.error("Search error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedSearchTerm, isSheet, searchTerm, categories]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isSheet) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isSheet]);

  const handleResultClick = () => {
    setSearchTerm('');
    setIsOpen(false);
    onResultClick?.();
  };

  const SearchInput = (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder="Rechercher produits, catégories..."
        className="w-full rounded-full pl-11 pr-4 py-2.5 bg-secondary border-0 focus:ring-2 focus:ring-primary focus:bg-background transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        autoFocus={isSheet}
      />
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
        {isLoading ? <Loader2 className="animate-spin" /> : <Search className="h-5 w-5" />}
      </div>
    </div>
  );

  const SearchResults = (
    <div className="space-y-0">
      {isLoading && debouncedSearchTerm.length > 0 ? (
        <div className="p-8 text-center">
          <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Recherche en cours...</p>
        </div>
      ) : debouncedSearchTerm.length === 0 ? (
        <div className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Commencez à taper pour rechercher</p>
        </div>
      ) : results.length === 0 && categoryResults.length === 0 ? (
        <div className="p-8 text-center">
          <PackageOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Aucun résultat pour "{debouncedSearchTerm}"</p>
        </div>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="divide-y">
            {/* Categories */}
            {categoryResults.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Catégories</p>
                <div className="space-y-1">
                  {categoryResults.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${encodeURIComponent(category.name)}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                      onClick={handleResultClick}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{category.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {results.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Produits</p>
                <div className="space-y-1">
                  {results.map((product) => {
                    const displayImageUrl = product.imageUrls?.[0] || 'https://placehold.co/100x100.png';
                    const isPromo = product.promotionPrice && product.promotionPrice < product.price;
                    const displayPrice = isPromo ? product.promotionPrice : product.price;
                    const productLink = `/products/${product.slug || product.id}`;

                    return (
                      <Link
                        key={product.id}
                        href={productLink}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={handleResultClick}
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                          <Image
                            src={displayImageUrl}
                            alt={product.name}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-primary font-semibold">
                            {displayPrice?.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  if (isSheet) {
    return (
      <div className="space-y-4">
        {SearchInput}
        {SearchResults}
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {SearchInput}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-50 animate-fade-in-up">
          {SearchResults}
        </div>
      )}
    </div>
  );
}
