
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Archive, LayoutGrid, ImageIcon, ShoppingCart, Settings, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits', icon: Archive },
  { href: '/admin/categories', label: 'Catégories', icon: LayoutGrid },
  { href: '/admin/banners', label: 'Bannières', icon: ImageIcon },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  // { href: '/admin/users', label: 'Utilisateurs', icon: Users }, // Removed based on previous request
  // { href: '/admin/ad-copy-generator', label: 'Gén. Contenu Pub', icon: Sparkles }, // Removed
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

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
    </aside>
  );
}
