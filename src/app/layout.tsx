
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
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sonko Shop - Vêtements et Équipements Sportifs',
  description: 'Boutique en ligne de Sonko Shop: maillots, chaussures, pantalons, équipements sportifs et plus encore.',
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212302/favicon_t8p7ny.ico', type: 'image/x-icon' },
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212330/favicon-16x16_eqxmlo.png', sizes: '16x16', type: 'image/png' },
      { url: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212346/favicon-32x32_aqqk1y.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212302/favicon_t8p7ny.ico',
    apple: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1763212290/apple-touch-icon_in8brp.png',
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
    "url": "https://sinkoshop.com",
    "logo": "https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg"
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
