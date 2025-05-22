
'use client'; 

import Link from 'next/link';
import { ShoppingBag, UserCircle } from 'lucide-react'; // Added UserCircle for Admin
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext'; 

export default function Header() {
  const { getCartTotalItems } = useCart(); 
  const totalItems = getCartTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Sonko Shop</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Link href="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Accueil
          </Link>
          <Link href="/products" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Produits
          </Link>
          {/* TODO: Add other categories or a dropdown */}
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Administration">
            <Link href="/admin">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
