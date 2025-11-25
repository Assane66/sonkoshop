
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
const defaultTitle = 'Sonko Shop - Vêtements et Équipements Sportifs';
const defaultDescription = 'Boutique en ligne de Sonko Shop: maillots, chaussures, pantalons, équipements sportifs et plus encore au Sénégal.';

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  keywords: ['sonko shop', 'maillots de foot', 'chaussures de sport', 'vêtements sénégal', 'boutique en ligne dakar'],
  authors: [{ name: 'Sonko Shop' }],
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: BASE_URL,
    siteName: 'Sonko Shop',
    images: [
      {
        url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg', // OG Image
        width: 1200,
        height: 630,
        alt: 'Logo de Sonko Shop',
      },
    ],
    locale: 'fr_SN',
    type: 'website',
  },
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212302/favicon_t8p7ny.ico', type: 'image/x-icon' },
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212330/favicon-16x16_eqxmlo.png', sizes: '16x16', type: 'image/png' },
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212346/favicon-32x32_aqqk1y.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212290/apple-touch-icon_in8brp.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sonko Shop",
    "url": BASE_URL,
    "logo": "https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+221-78-451-36-33",
      "contactType": "Customer Service"
    }
  };

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
