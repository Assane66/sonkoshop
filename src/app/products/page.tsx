
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import type { Product } from '@/types';
import { ProductCategoryEnum as CatEnum } from '@/types'; // For mock data
import { Input } from '@/components/ui/input';
import { Search, PackageOpen, Loader2 } from 'lucide-react';
// Firebase imports removed
// import { db } from '@/lib/firebase';
// import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
// import { useToast } from '@/hooks/use-toast';

// Mock products for the products page
const allMockProducts: Product[] = [
  { id: 'p1', name: 'Maillot Sénégal Domicile', description: 'Maillot officiel 2024.', price: 35000, category: CatEnum.Maillots, imageUrl: 'https://placehold.co/600x400/4CAF50/white?text=Maillot+Sénégal', stock: 20, featured: true, sizes: ['S', 'M', 'L'], imageAiHint: 'senegal home jersey' },
  { id: 'p2', name: 'Baskets Pro Max', description: 'Confort et durabilité.', price: 45000, category: CatEnum.Chaussures, imageUrl: 'https://placehold.co/600x400/FFC107/black?text=Baskets+Pro', stock: 15, sizes: ['40', '41', '42'], imageAiHint: 'pro sneakers' },
  { id: 'p3', name: 'Survêtement Club Élite', description: 'Pour l_entraînement.', price: 28000, category: CatEnum.Pantalons, imageUrl: 'https://placehold.co/600x400/9C27B0/white?text=Survêtement', stock: 0, sizes: ['M', 'L'], imageAiHint: 'elite tracksuit' },
  { id: 'p4', name: 'Ensemble Bébé Lionceau', description: 'Pour les futurs champions.', price: 18000, category: CatEnum.Enfants, imageUrl: 'https://placehold.co/600x400/00BCD4/black?text=Ensemble+Bébé', stock: 25, sizes: ['3M', '6M', '9M'], imageAiHint: 'baby lion kit' },
  { id: 'p5', name: 'Maillot Extérieur Sénégal', description: 'Design audacieux pour les matchs à l_extérieur.', price: 35000, category: CatEnum.Maillots, imageUrl: 'https://placehold.co/600x400/795548/white?text=Maillot+Sénégal+Ext', stock: 18, sizes: ['S', 'M', 'XL'], imageAiHint: 'senegal away jersey' },
  { id: 'p6', name: 'Chaussures de Running Légères', description: 'Idéales pour le jogging quotidien.', price: 52000, category: CatEnum.Chaussures, imageUrl: 'https://placehold.co/600x400/FF9800/black?text=Running+Shoes', stock: 12, sizes: ['39', '40', '43'], imageAiHint: 'light running shoes' },
];


export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({}); 
  const [isLoading, setIsLoading] = useState(true);
  // const { toast } = useToast(); // Toast not used without Firebase

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading mock products
    setTimeout(() => {
      setAllProducts(allMockProducts);
      setFilteredProducts(allMockProducts); 
      setIsLoading(false);
    }, 500);
  }, []);


  useEffect(() => {
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
  }, [searchTerm, activeFilters, allProducts]);

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };
  
  if (isLoading) {
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
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
              {allProducts.length > 0 && searchTerm && <p className="text-sm text-muted-foreground mt-2">Essayez d'élargir votre recherche.</p>}
              {allProducts.length === 0 && !isLoading && <p className="text-sm text-muted-foreground mt-2">Aucun produit n'est actuellement disponible dans la boutique.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
