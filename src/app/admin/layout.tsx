
'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Admin - Sonko Shop';
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not logged in, redirect silently
        router.push('/login');
      } else if (userData?.role !== 'admin') {
        // User is logged in but not an admin
        toast({
          variant: "destructive",
          title: "Accès non autorisé",
          description: "Vous devez être administrateur pour accéder à cette page."
        });
        router.push('/login');
      }
    }
  }, [user, userData, loading, router, toast]);

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--admin-content-background))]">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (userData.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--admin-content-background))]">
        <p>Redirection...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-16 md:p-8 md:pt-8 ml-0 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
