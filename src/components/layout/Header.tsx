
'use client'; 

import Link from 'next/link';
import { Search, MapPin, User, Heart, ShoppingBag, Menu } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { SiteCategory } from '@/types';


export default function Header() {
  const { getCartTotalItems } = useCart();
  const { user, userData, logout, loading } = useAuth();
  const totalItems = getCartTotalItems();
  const { toast } = useToast();
  const router = useRouter();
  const [navCategories, setNavCategories] = useState<SiteCategory[]>([]);

  useEffect(() => {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: SiteCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SiteCategory));
      setNavCategories(fetchedCategories);
    }, (error) => {
      console.error("Error fetching categories for header:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les catégories de navigation." });
    });

    return () => unsubscribe();
  }, [toast]);
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Déconnexion réussie" });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: "Erreur lors de la déconnexion" });
    }
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-6 w-6" />
          <span className="sr-only">Compte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {loading ? (
            <DropdownMenuItem disabled>Chargement...</DropdownMenuItem>
        ) : user ? (
            <>
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/account">Mon Compte</Link></DropdownMenuItem>
            {userData?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin">Administration</Link></DropdownMenuItem>}
            <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
            </>
        ) : (
            <>
            <DropdownMenuItem asChild><Link href="/login">Se connecter</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/register">S'inscrire</Link></DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                    {navCategories.map(category => (
                        <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className="text-muted-foreground hover:text-foreground">
                            {category.name}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="mr-auto md:mr-0 md:flex-none">
             <span className="text-2xl font-bold text-red-600">SONKO</span>
             <span className="text-2xl font-bold text-gray-800">SHOP</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-8 max-w-lg">
             <div className="relative w-full">
               <Input type="search" placeholder="Rechercher..." className="w-full rounded-full" />
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <MapPin className="h-6 w-6" />
              <span className="sr-only">Trouver un magasin</span>
            </Button>
            <UserMenu />
             <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Heart className="h-6 w-6" />
              <span className="sr-only">Favoris</span>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Panier</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="hidden md:flex h-12 items-center justify-center space-x-6">
            {navCategories.map(category => (
                <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {category.name}
                </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
