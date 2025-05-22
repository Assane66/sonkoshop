
'use client';

import { useState } from 'react';
import type { Banner } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BannerForm } from '@/components/admin/BannerForm';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialBanners: Banner[] = [
  { id: '1', title: 'Nouvelle Collection Maillots!', subtitle: 'Découvrez les derniers styles.', imageUrl: 'https://placehold.co/80x40.png', link: '/products?category=Maillots', imageAiHint: 'football jersey' },
  { id: '2', title: 'Équipements pour Champions', subtitle: 'Tout pour la performance.', imageUrl: 'https://placehold.co/80x40.png', link: '/products?category=EquipementsSportifs', imageAiHint: 'sports equipment' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(banners.filter((b) => b.id !== bannerId));
    toast({ title: "Bannière Supprimée", description: "La bannière a été supprimée avec succès." });
  };

  const handleFormSubmit = (data: any) => {
    if (editingBanner) {
      setBanners(
        banners.map((b) => (b.id === editingBanner.id ? { ...b, ...data } : b))
      );
      toast({ title: "Bannière Mise à Jour", description: "La bannière a été mise à jour avec succès." });
    } else {
      setBanners([...banners, { ...data, id: String(Date.now()) }]);
      toast({ title: "Bannière Ajoutée", description: "La nouvelle bannière a été ajoutée avec succès." });
    }
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gérer les Bannières</h1>
        <Button onClick={handleAddBanner} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Bannière
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Modifier la Bannière' : 'Ajouter une Nouvelle Bannière'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'Mettez à jour les détails de cette bannière.' : 'Remplissez les détails pour la nouvelle bannière.'}
            </DialogDescription>
          </DialogHeader>
          <BannerForm
            banner={editingBanner}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingBanner(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="bg-card p-6 rounded-lg shadow-md">
        {banners.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Lien</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {banners.map((banner) => (
                <TableRow key={banner.id}>
                    <TableCell>
                    <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={80}
                        height={40}
                        className="rounded object-cover"
                        data-ai-hint={banner.imageAiHint || 'banner preview'}
                    />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{banner.link}</TableCell>
                    <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditBanner(banner)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteBanner(banner.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <p className="text-center py-4 text-muted-foreground">Aucune bannière trouvée. Ajoutez de nouvelles bannières pour les afficher sur la page d'accueil.</p>
        )}
      </div>
    </div>
  );
}
