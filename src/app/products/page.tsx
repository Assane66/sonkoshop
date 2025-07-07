
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import type { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Search, PackageOpen, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, where, QueryConstraint } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    console.log("ProductsPage: Setting up Firestore listener for all products...");
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, orderBy('name', 'asc')); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("ProductsPage: All products snapshot received, docs count:", snapshot.docs.length);
      if (snapshot.empty) {
        console.log("ProductsPage: No products found in snapshot.");
      }
      const fetchedProducts: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        let imageUrls: string[] = [];
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
            imageUrls = data.imageUrls;
        } else if (data.imageUrl && typeof data.imageUrl === 'string') {
            imageUrls = [data.imageUrl];
        }

        console.log("ProductsPage: Mapping product data:", data);
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
        } as Product;
      });
      setAllProducts(fetchedProducts);
      console.log("ProductsPage: All products state updated:", fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("ProductsPage: Error fetching products:", error);
      toast({ variant: "destructive", title: "Erreur Produits", description: `Impossible de charger les produits: ${error.message}` });
      setIsLoading(false);
    });

    return () => {
      console.log("ProductsPage: Unsubscribing from Firestore listener.");
      unsubscribe();
    }
  }, [toast]);


  useEffect(() => {
    console.log("ProductsPage: Applying filters. SearchTerm:", searchTerm, "ActiveFilters:", activeFilters, "AllProducts count:", allProducts.length);
    let productsToFilter = [...allProducts];

    if (searchTerm) {
      productsToFilter = productsToFilter.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeFilters.categories && activeFilters.categories.length > 0) {
      productsToFilter = productsToFilter.filter(p => p.category && activeFilters.categories.includes(p.category));
    }
    if (activeFilters.sizes && activeFilters.sizes.length > 0) {
      productsToFilter = productsToFilter.filter(p => p.sizes && p.sizes.some((s: string) => activeFilters.sizes.includes(s)));
    }
    if (activeFilters.priceRange) {
      productsToFilter = productsToFilter.filter(p => p.price >= activeFilters.priceRange[0] && p.price <= activeFilters.priceRange[1]);
    }

    setFilteredProducts(productsToFilter);
    console.log("ProductsPage: Filtered products count:", productsToFilter.length);
  }, [searchTerm, activeFilters, allProducts]);

  const handleFilterChange = (filters: any) => {
    console.log("ProductsPage: Filters changed:", filters);
    setActiveFilters(filters);
  };
  
  if (isLoading && allProducts.length === 0) { // Show loader only if truly loading initial data
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary">Nos Produits</h1>

      <div className="mb-8 relative">
        <Input
          type="search"
          placeholder="Rechercher un produit..."
          className="pl-10 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <ProductFilters onFilterChange={handleFilterChange} />
        </aside>
        <main className="w-full md:w-3/4 lg:w-4/5">
          {(!isLoading && allProducts.length === 0) ? ( // No products at all
             <div className="text-center py-10">
              <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Aucun produit disponible dans la boutique pour le moment.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : ( // Products exist, but filters yield no results
            <div className="text-center py-10">
              <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
              {(searchTerm || Object.keys(activeFilters).length > 0) && <p className="text-sm text-muted-foreground mt-2">Essayez d'élargir votre recherche ou de modifier vos filtres.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
