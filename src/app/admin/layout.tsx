
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
  const { user, loading } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'Admin - Sonko Shop';
    }
  }, []);

  useEffect(() => {
    console.log("AdminLayout: Auth loading state:", loading, "User:", user ? user.uid : 'null');
    if (!loading && !user) {
      console.log("AdminLayout: No user, redirecting to /login");
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) { 
    return (
        <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--admin-content-background))]">
            <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Vérification de l'authentification...</p>
            </div>
        </div>
    );
  }

  if (!user) {
    // This case might be hit briefly before redirection, or if redirection fails.
    // Or if a page is accessed directly without going through the auth check properly.
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--admin-content-background))]">
        <p>Redirection vers la page de connexion...</p>
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
