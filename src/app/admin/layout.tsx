
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Sonko Shop',
  description: "Panneau d'administration pour Sonko Shop.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background"> {/* Use min-h-screen for full height */}
      <AdminSidebar />
      {/* Ajustement pour le desktop: ml-64 pour laisser la place à la sidebar fixe */}
      <main className="flex-1 md:ml-64 overflow-auto"> 
        <div className="container mx-auto px-6 py-8"> {/* Increased padding */}
         {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
