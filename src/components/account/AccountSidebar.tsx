
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { categoryIcons } from '@/types';
import { LogOut } from 'lucide-react';

const sidebarNavItems = [
  { href: '/account', label: 'Mon Compte', icon: categoryIcons['Account'] },
  { href: '/account/orders', label: 'Mes Commandes', icon: categoryIcons['Orders'] },
  // Future items can be added here
  // { href: '/account/favorites', label: 'Mes Favoris', icon: Heart },
  // { href: '/account/reviews', label: 'Mes Avis', icon: categoryIcons['Reviews'] },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur lors de la déconnexion' });
    }
  };

  return (
    <div className="w-full p-4 border rounded-lg bg-card shadow-sm space-y-4">
      <h3 className="text-xl font-semibold text-primary px-3">Menu</h3>
       <nav className="flex-grow space-y-1">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/50'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
