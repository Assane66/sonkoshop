import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
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
          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Panier</span>
          </Button>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" /> Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
