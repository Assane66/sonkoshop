
import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin - Sonko Shop',
  description: 'Section d\'administration de Sonko Shop.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--admin-content-background))]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-64"> {/* ml-64 for sidebar width */}
        {children}
      </main>
    </div>
  );
}
