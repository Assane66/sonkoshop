import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Fetch all products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productPages: MetadataRoute.Sitemap = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;

      // Boost priority for Senegal jerseys to help with Google sitelinks
      const isSenegalJersey = data.name?.toLowerCase().includes('sénégal') ||
        data.name?.toLowerCase().includes('senegal') ||
        slug.includes('senegal');

      return {
        url: `${baseUrl}/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: isSenegalJersey ? 0.95 : 0.8,
      };
    });

    // Fetch all categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoryPages: MetadataRoute.Sitemap = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/products?category=${encodeURIComponent(data.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic fetching fails
    return staticPages;
  }
}
