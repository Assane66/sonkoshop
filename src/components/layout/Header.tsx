
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, UserCircle, LogOut, LayoutDashboard, User } from 'lucide-react';
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

export default function Header() {
  const { getCartTotalItems } = useCart();
  const { user, userData, logout, loading } = useAuth();
  const totalItems = getCartTotalItems();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Déconnexion réussie" });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: "Erreur lors de la déconnexion" });
    }
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1751785241/logo_noqoct.png" alt="Sonko Shop Logo" width={28} height={28} data-ai-hint="shop logo" />
          <span className="font-bold text-xl text-primary">Sonko Shop</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Link href="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Accueil
          </Link>
          <Link href="/products" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Produits
          </Link>
          <Link href="/about" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            À propos
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
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
          
          {loading ? (
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                     {/* You can add user.photoURL here in the future */}
                    <AvatarImage src="" alt={userData?.fullName} />
                    <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon Compte</span>
                  </Link>
                </DropdownMenuItem>
                {userData?.role === 'admin' && (
                   <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Administration</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
