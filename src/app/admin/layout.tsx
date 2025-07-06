
'use client'; 

import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'Admin - Sonko Shop';
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'admin') {
        toast({ variant: "destructive", title: "Accès non autorisé", description: "Vous devez être administrateur." });
        router.push('/login');
      }
    }
  }, [user, userData, loading, router]);

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
    <div className="flex min-h-screen bg-[hsl(var(--admin-content-background))]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64"> 
        {children}
      </main>
    </div>
  );
}
