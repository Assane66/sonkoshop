
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import type { Product } from '@/types';
// Removed import { ProductCategoryEnum } from '@/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data - in a real app, this would be fetched
// const allMockProducts: Product[] = [
//   { id: '1', name: 'Maillot Sénégal Authentique 2024', description: 'Portez les couleurs des Lions avec fierté. Tissu respirant haute performance.', price: 45000, category: ProductCategoryEnum.Maillots, imageUrl: 'https://placehold.co/400x400.png', stock: 50, sizes: ['S', 'M', 'L'], imageAiHint: 'senegal football jersey' },
//   { id: '2', name: 'Chaussures de Foot "Vitesse Ultime"', description: 'Légères et réactives pour des accélérations explosives.', price: 62000, category: ProductCategoryEnum.Chaussures, imageUrl: 'https://placehold.co/400x400.png', stock: 30, sizes: ['40', '41', '42'], imageAiHint: 'soccer cleats dynamic' },
//   { id: '3', name: 'Pantalon d\'Entraînement Pro', description: 'Confort thermique et liberté de mouvement pour vos sessions.', price: 28000, category: ProductCategoryEnum.Pantalons, imageUrl: 'https://placehold.co/400x400.png', stock: 40, sizes: ['M', 'L'], imageAiHint: 'training pants athlete' },
//   { id: '4', name: 'Ensemble Sportif Enfant "Champion"', description: 'Maillot et short pour les futures stars du sport.', price: 22000, category: ProductCategoryEnum.Enfants, imageUrl: 'https://placehold.co/400x400.png', stock: 25, sizes: ['6A', '8A'], imageAiHint: 'kids sports kit' },
//   { id: '5', name: 'Gants de Gardien "Muraille"', description: 'Adhérence maximale et protection supérieure pour des arrêts décisifs.', price: 35000, category: ProductCategoryEnum.Gardiens, imageUrl: 'https://placehold.co/400x400.png', stock: 15, sizes: ['8', '9', '10'], imageAiHint: 'goalkeeper gloves' },
//   { id: '6', name: 'Sac de Sport "Expédition"', description: 'Grand volume et multiples compartiments pour tous vos équipements.', price: 18000, category: ProductCategoryEnum.EquipementsSportifs, imageUrl: 'https://placehold.co/400x400.png', stock: 30, imageAiHint: 'sports duffel bag' },
//   { id: '7', name: 'Veste de Mode Sportive Urbaine', description: 'Style et confort pour un look athleisure tendance.', price: 55000, category: ProductCategoryEnum.Modes, imageUrl: 'https://placehold.co/400x400.png', stock: 20, sizes: ['S', 'M', 'L'], imageAiHint: 'sporty fashion jacket' },
// ];

export default function ProductsPage() {
  // const [filteredProducts, setFilteredProducts] = useState<Product[]>(allMockProducts);
  // For now, products will be empty until fetched from Firestore
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Will be fetched from Firestore
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // TODO: Implement fetching products from Firestore here
  useEffect(() => {
    // Placeholder: In a real app, fetch products from Firestore
    // For now, we'll keep it empty and show a loading/empty message
    setIsLoading(false); // Simulate loading finished
  }, []);


  useEffect(() => {
    let productsToFilter = allProducts;

    if (searchTerm) {
      productsToFilter = productsToFilter.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.categories && activeFilters.categories.length > 0) {
      productsToFilter = productsToFilter.filter(p => p.category && activeFilters.categories.includes(p.category));
    }
    if (activeFilters.sizes && activeFilters.sizes.length > 0) {
      productsToFilter = productsToFilter.filter(p => p.sizes && p.sizes.some(s => activeFilters.sizes.includes(s)));
    }
    if (activeFilters.priceRange) {
      productsToFilter = productsToFilter.filter(p => p.price >= activeFilters.priceRange[0] && p.price <= activeFilters.priceRange[1]);
    }

    setFilteredProducts(productsToFilter);
  }, [searchTerm, activeFilters, allProducts]);

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-muted-foreground">Chargement des produits...</p>
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
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">Aucun produit ne correspond à vos critères de recherche ou aucun produit disponible.</p>
              <p className="text-muted-foreground mt-2">Les produits seront bientôt chargés depuis la base de données.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

    