import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes = [
    '', 
    '/products', 
    '/about', 
    '/cart', 
    '/login', 
    '/register',
    '/politique-de-retour',
    '/termes-et-conditions',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic product pages
  const productsCollectionRef = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCollectionRef);
  const productRoutes = productsSnapshot.docs.map((doc) => ({
    url: `${BASE_URL}/products/${doc.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Dynamic category pages
  const categoriesCollectionRef = collection(db, 'categories');
  const categoriesSnapshot = await getDocs(categoriesCollectionRef);
  const categoryRoutes = categoriesSnapshot.docs.map((doc) => ({
    url: `${BASE_URL}/products?category=${encodeURIComponent(doc.data().name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
