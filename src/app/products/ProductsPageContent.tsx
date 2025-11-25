
'use client';

import { useState, useEffect, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import type { Product, SiteCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, PackageOpen, Loader2, ArrowUpDown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export default function ProductsPageContent({ initialCategories }: { initialCategories: SiteCategory[] }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    sizes: [] as string[],
    priceRange: [0, 100000] as [number, number],
  });
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Effect to fetch all products from Firestore
  useEffect(() => {
    setIsLoading(true);
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        let imageUrls: string[] = [];
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          imageUrls = data.imageUrls;
        } else if (data.imageUrl && typeof data.imageUrl === 'string') {
          imageUrls = [data.imageUrl];
        }
        return {
          id: doc.id,
          name: data.name || 'Nom manquant',
          description: data.description || 'Description manquante',
          price: data.price || 0,
          category: data.category || 'Catégorie manquante',
          imageUrls: imageUrls,
          stock: data.stock || 0,
          sizes: data.sizes || [],
          featured: data.featured || false,
          imageAiHint: data.imageAiHint || '',
          promotionPrice: data.promotionPrice || null,
          slug: data.slug || '',
        } as Product;
      });
      setAllProducts(fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("ProductsPage: Error fetching products:", error);
      toast({ variant: "destructive", title: "Erreur Produits", description: `Impossible de charger les produits: ${error.message}` });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  // Effect to handle initial category filter from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setActiveFilters(prev => ({
        ...prev,
        categories: [decodeURIComponent(categoryFromUrl)],
      }));
    }
  }, [searchParams]);

  // Effect to apply filters whenever products, search term, or active filters change
  useEffect(() => {
    let productsToFilter = [...allProducts];

    // Search term filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      productsToFilter = productsToFilter.filter(p =>
        p.name.toLowerCase().includes(searchTermLower) ||
        (p.description && p.description.toLowerCase().includes(searchTermLower)) ||
        (p.category && p.category.toLowerCase().includes(searchTermLower)) ||
        (p.imageAiHint && p.imageAiHint.toLowerCase().includes(searchTermLower))
      );
    }

    // Category filter
    if (activeFilters.categories.length > 0) {
      productsToFilter = productsToFilter.filter(p =>
        p.category && activeFilters.categories.includes(p.category)
      );
    }

    // Size filter
    if (activeFilters.sizes.length > 0) {
      productsToFilter = productsToFilter.filter(p =>
        p.sizes && p.sizes.some((s: string) => activeFilters.sizes.includes(s))
      );
    }

    // Price range filter
    if (activeFilters.priceRange) {
      productsToFilter = productsToFilter.filter(p => {
        const currentPrice = (p.promotionPrice && p.promotionPrice > 0) ? p.promotionPrice : p.price;
        return currentPrice >= activeFilters.priceRange[0] && currentPrice <= activeFilters.priceRange[1];
      });
    }

    // Apply sorting
    const sortedProducts = [...productsToFilter].sort((a, b) => {
      const priceA = (a.promotionPrice && a.promotionPrice > 0) ? a.promotionPrice : a.price;
      const priceB = (b.promotionPrice && b.promotionPrice > 0) ? b.promotionPrice : b.price;

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(sortedProducts);
  }, [searchTerm, activeFilters, allProducts, sortBy]);

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  if (isLoading && allProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-xl text-muted-foreground">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nos Produits
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez notre collection complète de vêtements et équipements sportifs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="search"
              placeholder="Rechercher un produit, une catégorie..."
              className="pl-12 pr-4 h-14 text-base rounded-full border-2 border-slate-200 focus:border-primary shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-24 bg-white rounded-2xl shadow-md p-6 border border-slate-100">
              <ProductFilters
                onFilterChange={handleFilterChange}
                initialCategory={searchParams.get('category')}
                initialCategories={initialCategories}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="w-full lg:w-3/4">
            {/* Sorting and Results Count */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Prix croissant</SelectItem>
                      <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(!isLoading && allProducts.length === 0) ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4 opacity-50" />
                <p className="text-xl font-semibold text-foreground mb-2">Aucun produit disponible</p>
                <p className="text-muted-foreground">La boutique sera bientôt approvisionnée</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4 opacity-50" />
                <p className="text-xl font-semibold text-foreground mb-2">Aucun résultat</p>
                <p className="text-muted-foreground">Aucun produit ne correspond à vos critères</p>
                {(searchTerm || activeFilters.categories.length > 0) && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Essayez d'élargir votre recherche ou de modifier vos filtres
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
