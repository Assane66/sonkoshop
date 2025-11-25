
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Archive, LayoutGrid, ImageIcon, ShoppingCart, Settings, LogOut, Megaphone, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie', description: 'Vous avez été déconnecté.' });
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter.' });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="font-bold text-white">S</span>
        </div>
        <span className="text-xl font-bold tracking-tight">Sonko Shop</span>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2">Menu</p>
      </div>

      <nav className="flex-grow px-3 py-2 space-y-1">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 z-40 w-64 h-screen shadow-xl flex-col border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-slate-900 text-white border-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
