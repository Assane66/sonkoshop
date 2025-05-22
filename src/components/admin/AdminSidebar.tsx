'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ImageIcon,
  Users,
  Settings,
  PenSquare,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { href: '/admin/ad-copy-generator', label: 'Ad Copy Tool', icon: PenSquare },
    // { href: '/admin/orders', label: 'Orders', icon: Package },
    // { href: '/admin/users', label: 'Users', icon: Users },
    // { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform -translate-x-full md:translate-x-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <ScrollArea className="h-full py-4 px-3">
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} legacyBehavior>
                <a
                  className={cn(
                    'flex items-center p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group',
                    pathname === item.href
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn(
                      'w-5 h-5 transition duration-75',
                      pathname === item.href ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground'
                    )} />
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        <div className="pt-4 mt-4 space-y-2 border-t border-sidebar-border/50">
            <Link href="/" legacyBehavior>
                <a className="flex items-center p-2 text-sidebar-foreground/80 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group">
                    <Home className="w-5 h-5 transition duration-75 text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground" />
                    <span className="ml-3">Retour au site</span>
                </a>
            </Link>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AdminSidebar;
