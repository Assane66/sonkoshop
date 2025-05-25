
'use client';

import { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { ProductCategoryEnum as CatEnum } from '@/types'; // For mock data
// Firebase imports removed
// import { db } from '@/lib/firebase';
// import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Image as ImageIconLucide, Loader2 } from 'lucide-react';

// Mock data
const mockBanners: Banner[] = [
  { id: '1', title: 'Collection Maillots 2024!', subtitle: 'Supportez votre équipe.', imageUrl: 'https://placehold.co/1200x500/E91E63/white?text=Nouveaux+Maillots', link: '/products', imageAiHint: 'football jersey stadium' },
  { id: '2', title: 'Chaussures de Sport', subtitle: 'Performance et style.', imageUrl: 'https://placehold.co/1200x500/2196F3/white?text=Chaussures+Sport', link: '/products', imageAiHint: 'sports shoes running' },
];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Maillot Sénégal Domicile', description: 'Maillot officiel 2024.', price: 35000, category: CatEnum.Maillots, imageUrl: 'https://placehold.co/600x400/4CAF50/white?text=Maillot+Sénégal', stock: 20, featured: true, imageAiHint: 'senegal jersey' },
  { id: 'p2', name: 'Baskets Pro Max', description: 'Confort et durabilité.', price: 45000, category: CatEnum.Chaussures, imageUrl: 'https://placehold.co/600x400/FFC107/black?text=Baskets+Pro', stock: 15, featured: true, imageAiHint: 'pro sneakers' },
  { id: 'p3', name: 'Survêtement Club Élite', description: 'Pour l_entraînement.', price: 28000, category: CatEnum.Pantalons, imageUrl: 'https://placehold.co/600x400/9C27B0/white?text=Survêtement', stock: 10, imageAiHint: 'tracksuit' },
  { id: 'p4', name: 'Ensemble Bébé Lionceau', description: 'Pour les futurs champions.', price: 18000, category: CatEnum.Enfants, imageUrl: 'https://placehold.co/600x400/00BCD4/black?text=Ensemble+Bébé', stock: 25, featured: true, imageAiHint: 'baby clothes' },
];


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true); // Keep for consistency, though mock data loads instantly
  // const { toast } = useToast(); // Toast not used without Firebase

  useEffect(() => {
    setIsLoadingProducts(true);
    // Simulate loading mock products
    setTimeout(() => {
      setFeaturedProducts(mockProducts.filter(p => p.featured).slice(0, 8));
      setIsLoadingProducts(false);
    }, 500);

    setIsLoadingBanners(true);
    // Simulate loading mock banners
     setTimeout(() => {
      setBanners(mockBanners);
      setIsLoadingBanners(false);
    }, 300);
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        {isLoadingBanners ? (
          <div className="text-center py-10 h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg flex flex-col items-center justify-center">
             <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des bannières...</p>
            </div>
          </div>
        ) : banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
           <div className="text-center py-10 h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg flex flex-col items-center justify-center">
              <ImageIconLucide className="h-24 w-24 text-primary mb-4" />
              <p className="text-xl text-muted-foreground">Aucune bannière disponible.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Produits en Vedette</h2>
        {isLoadingProducts ? (
          <div className="text-center py-10">
             <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-xl text-muted-foreground">Chargement des produits...</p>
            </div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <PackageOpen className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucun produit en vedette pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Revenez bientôt ou explorez tous nos <a href="/products" className="text-primary hover:underline">produits</a>.</p>
          </div>
        )}
      </section>
    </div>
  );
}
