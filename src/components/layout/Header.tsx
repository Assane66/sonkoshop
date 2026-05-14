
'use client'; 

import Link from 'next/link';
import { MapPin, User, ShoppingBag, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { SiteCategory } from '@/types';
import SearchBar from '@/components/SearchBar';


export default function Header() {
  const { getCartTotalItems } = useCart();
  const { user, userData, logout, loading } = useAuth();
  const totalItems = getCartTotalItems();
  const { toast } = useToast();
  const router = useRouter();
  const [navCategories, setNavCategories] = useState<SiteCategory[]>([]);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  useEffect(() => {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: SiteCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SiteCategory));

      const customOrder = ["Maillots", "Chaussures", "Pantalons", "Modes", "SAISON 2026", "trophée", "Équipements sportifs", "Accessoires"];
      
      const sortedCategories = [...fetchedCategories].sort((a, b) => {
        const indexA = customOrder.indexOf(a.name);
        const indexB = customOrder.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) {
          return -1;
        }
        if (indexB !== -1) {
          return 1;
        }
        return 0;
      });
      
      setNavCategories(sortedCategories);
    }, (error) => {
      console.error("Error fetching categories for header:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les catégories de navigation." });
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Déconnexion réussie" });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: "Erreur lors de la déconnexion" });
    }
  };
  
  const handleMobileLinkClick = () => {
    setIsMenuSheetOpen(false);
  };
  
  const onSearchResultClick = () => {
    setIsSearchSheetOpen(false);
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
          <User className="h-5 w-5" />
          <span className="sr-only">Compte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {loading ? (
            <DropdownMenuItem disabled>Chargement...</DropdownMenuItem>
        ) : user ? (
            <>
            <DropdownMenuLabel className="font-semibold">
                <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{userData?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/account" className="cursor-pointer">Mon Compte</Link></DropdownMenuItem>
            {userData?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin" className="cursor-pointer">Administration</Link></DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">Déconnexion</DropdownMenuItem>
            </>
        ) : (
            <>
            <DropdownMenuItem asChild><Link href="/login" className="cursor-pointer">Se connecter</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/register" className="cursor-pointer">S'inscrire</Link></DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-0">
        {/* Main Header */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={isMenuSheetOpen} onOpenChange={setIsMenuSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-secondary">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-4">
                {navCategories.map(category => (
                  <Link 
                    key={category.id} 
                    href={`/products?category=${encodeURIComponent(category.name)}`} 
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={handleMobileLinkClick}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-2xl md:text-2xl font-bold text-foreground">SONKO</span>
            <span className="text-2xl md:text-2xl font-bold text-primary">SHOP</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 mx-6 max-w-md">
            <SearchBar categories={navCategories} />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-secondary">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Rechercher</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader className="text-left mb-4">
                  <SheetTitle>Rechercher</SheetTitle>
                </SheetHeader>
                <SearchBar onResultClick={onSearchResultClick} isSheet={true} categories={navCategories} />
              </SheetContent>
            </Sheet>
            
            {/* Store Locator - Desktop */}
            <Button variant="ghost" size="icon" className="hidden md:inline-flex rounded-full hover:bg-secondary">
              <MapPin className="h-5 w-5" />
              <span className="sr-only">Trouver un magasin</span>
            </Button>

            {/* User Menu */}
            <UserMenu />

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-secondary">
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
                <span className="sr-only">Panier</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Navigation - Desktop */}
        <nav className="hidden md:flex h-12 items-center justify-center gap-8 border-t border-border/50">
          {navCategories.slice(0, 6).map(category => (
            <Link 
              key={category.id} 
              href={`/products?category=${encodeURIComponent(category.name)}`} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
