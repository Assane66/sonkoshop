// For now, using mock data. This would typically come from an API or database.
// This page should be a server component if data fetching is done server-side.
// For mock data and client-side components like BannerCarousel, it's fine as is.

import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import type { Banner, Product } from '@/types';
import { ProductCategory } from '@/types';

// Mock data - in a real app, this would be fetched.
const mockBanners: Banner[] = [
  { id: '1', title: 'Nouvelle Collection Maillots 2024!', subtitle: 'Découvrez les derniers styles et supportez votre équipe.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Maillots', imageAiHint: 'football jersey stadium' },
  { id: '2', title: 'Promo Chaussures de Sport', subtitle: 'Jusqu\'à -30% sur une sélection.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Chaussures', imageAiHint: 'sports shoes running' },
  { id: '3', title: 'Équipements Pro pour Gardiens', subtitle: 'Performance et protection maximales.', imageUrl: 'https://placehold.co/1200x500.png', link: '/products?category=Gardiens', imageAiHint: 'goalkeeper gloves save' },
];

const mockProducts: Product[] = [
  { id: '1', name: 'Maillot Sénégal Authentique', description: 'Portez les couleurs des Lions avec fierté. Tissu respirant haute performance.', price: 45000, category: ProductCategory.Maillots, imageUrl: 'https://placehold.co/400x400.png', stock: 50, featured: true, imageAiHint: 'senegal football jersey' },
  { id: '2', name: 'Chaussures de Foot "Vitesse Ultime"', description: 'Légères et réactives pour des accélérations explosives.', price: 62000, category: ProductCategory.Chaussures, imageUrl: 'https://placehold.co/400x400.png', stock: 30, featured: true, imageAiHint: 'soccer cleats dynamic' },
  { id: '3', name: 'Pantalon d\'Entraînement Pro', description: 'Confort thermique et liberté de mouvement pour vos sessions.', price: 28000, category: ProductCategory.Pantalons, imageUrl: 'https://placehold.co/400x400.png', stock: 40, featured: true, imageAiHint: 'training pants athlete' },
  { id: '4', name: 'Ensemble Sportif Enfant "Champion"', description: 'Maillot et short pour les futures stars du sport.', price: 22000, category: ProductCategory.Enfants, imageUrl: 'https://placehold.co/400x400.png', stock: 25, featured: false, imageAiHint: 'kids sports kit' },
];


export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.featured);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <BannerCarousel banners={mockBanners} />
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Produits en Vedette</h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun produit en vedette pour le moment.</p>
        )}
      </section>
    </div>
  );
}
