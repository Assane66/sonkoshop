
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import type { Product, SiteCategory } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageOpen, Loader2, ArrowUpDown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export default function ProductsPageContent({ initialCategories }: { initialCategories: SiteCategory[] }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    sizes: [] as string[],
    priceRange: [0, 100000] as [number, number],
  });
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Fetch all products from Firestore
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

  // Handle initial category filter from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setActiveFilters(prev => ({
        ...prev,
        categories: [decodeURIComponent(categoryFromUrl)],
      }));
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let productsToFilter = [...allProducts];

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
        case 'newest':
          return 0; // Would need createdAt field
        case 'relevance':
        default:
          return 0;
      }
    });

    setFilteredProducts(sortedProducts);
  }, [activeFilters, allProducts, sortBy]);

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  if (isLoading && allProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Nos Produits
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Découvrez notre collection complète de vêtements et équipements sportifs de qualité premium.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                onFilterChange={handleFilterChange}
                initialCategory={searchParams.get('category')}
                initialCategories={initialCategories}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Top Bar: Results Count & Sorting */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground text-base">{filteredProducts.length}</span>
                    {' '}
                    produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-medium">Trier par</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 rounded-lg border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Pertinence</SelectItem>
                      <SelectItem value="newest">Plus récent</SelectItem>
                      <SelectItem value="price-asc">Prix: bas à haut</SelectItem>
                      <SelectItem value="price-desc">Prix: haut à bas</SelectItem>
                      <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Empty States */}
            {(!isLoading && allProducts.length === 0) ? (
              <div className="text-center py-24">
                <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-40" />
                <p className="text-2xl font-semibold text-foreground mb-2">Aucun produit disponible</p>
                <p className="text-muted-foreground">La boutique sera bientôt approvisionnée</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="animate-fade-in">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-40" />
                <p className="text-2xl font-semibold text-foreground mb-2">Aucun résultat</p>
                <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères</p>
                {(activeFilters.categories.length > 0 || activeFilters.sizes.length > 0) && (
                  <p className="text-sm text-muted-foreground">
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
