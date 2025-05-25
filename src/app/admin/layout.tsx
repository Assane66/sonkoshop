
'use client'; 

import AdminSidebar from '@/components/admin/AdminSidebar';
// import { useAuth } from '@/context/AuthContext'; // Firebase Auth removed
// import { useRouter } from 'next/navigation'; // Firebase Auth removed
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { user, loading } = useAuth(); // Firebase Auth removed
  // const router = useRouter(); // Firebase Auth removed

  useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'Admin - Sonko Shop';
    }
  }, []);

  // Firebase Auth protection removed
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  // if (loading || !user) { // Firebase Auth removed
  //   return (
  //       <div className="flex items-center justify-center min-h-screen">
  //           <p>Chargement de la section admin...</p>
  //       </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--admin-content-background))]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64"> {/* Adjusted ml-0 for mobile, md:ml-64 for desktop */}
        {children}
      </main>
    </div>
  );
}
