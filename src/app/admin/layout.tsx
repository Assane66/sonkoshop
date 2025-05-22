import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Sonko Shop',
  description: 'Administration panel for Sonko Shop.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 md:ml-64 pt-20 overflow-auto">
        <div className="container mx-auto px-4 py-8">
         {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
