
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { LayoutDashboard, Archive, LayoutGrid, ImageIcon, ShoppingCart, Settings, LogOut, Megaphone } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const sidebarNavItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits', icon: Archive },
  { href: '/admin/categories', label: 'Catégories', icon: LayoutGrid },
  { href: '/admin/banners', label: 'Bannières', icon: ImageIcon },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth(); 
  const router = useRouter(); 
  const { toast } = useToast(); 

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie', description: 'Vous avez été déconnecté.' });
      // router.push('/login'); // logout in AuthContext handles redirection
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter.' });
    }
  };

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-[hsl(var(--admin-sidebar-background))] text-[hsl(var(--admin-sidebar-foreground))] shadow-lg flex flex-col">
      <div className="px-6 py-5 text-2xl font-semibold">
        Sonko Shop
      </div>
      <nav className="flex-grow px-3 py-4 space-y-1">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--admin-sidebar-active-background))]'
                  : 'hover:bg-[hsl(var(--admin-sidebar-hover-background))]'
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
          className="w-full justify-start text-left hover:bg-[hsl(var(--admin-sidebar-hover-background))] text-[hsl(var(--admin-sidebar-foreground))]"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

    