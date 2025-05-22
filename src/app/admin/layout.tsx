
'use client'; // Required for using hooks like useAuth and useRouter

import type { Metadata } from 'next'; // Keep for static metadata if any part is server-rendered
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Static metadata can still be defined
// export const metadata: Metadata = {
//   title: 'Admin - Sonko Shop',
//   description: 'Section d\'administration de Sonko Shop.',
// };
// However, if title needs to be dynamic based on auth state, it's trickier with App Router client components.
// For simplicity, we'll keep it generic or manage via document.title in useEffect if needed.

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
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can show a loading spinner or a blank page while checking auth
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Chargement de la section admin...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--admin-content-background))]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64"> {/* Adjusted ml-0 for mobile, md:ml-64 for desktop */}
        {children}
      </main>
    </div>
  );
}
