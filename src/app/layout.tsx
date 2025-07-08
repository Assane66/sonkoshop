
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
    icon: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg',
    shortcut: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg',
    apple: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1751804945/IMG-20250522-WA0007_2_dfvhk0.jpg',
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
