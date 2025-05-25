
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Banner } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

const bannerFormSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  subtitle: z.string().optional(),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  link: z.string().min(1, { message: "Un lien de destination est requis." }),
  imageAiHint: z.string().optional(),
});

type BannerFormValues = z.infer<typeof bannerFormSchema>;

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      imageUrl: '',
      link: '/',
      imageAiHint: '',
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const bannersCollectionRef = collection(db, 'banners');
    const q = query(bannersCollectionRef, orderBy("title", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedBanners: Banner[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Banner, 'id'>
      }));
      setBanners(fetchedBanners);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur de récupération des bannières:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les bannières." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (editingBanner) {
      form.reset(editingBanner);
    } else {
      form.reset({ title: '', subtitle: '', imageUrl: '', link: '/', imageAiHint: '' });
    }
  }, [editingBanner, form, isFormOpen]);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsFormOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const handleDeleteBanner = async (bannerId: string, bannerTitle: string) => {
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      toast({ title: "Bannière supprimée", description: `La bannière "${bannerTitle}" a été supprimée.` });
    } catch (error) {
      console.error("Erreur de suppression de bannière:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la bannière." });
    }
  };

  const onSubmit: SubmitHandler<BannerFormValues> = async (data) => {
    try {
      if (editingBanner) {
        const bannerDocRef = doc(db, 'banners', editingBanner.id);
        await updateDoc(bannerDocRef, data);
        toast({ title: "Bannière modifiée", description: `La bannière "${data.title}" a été mise à jour.` });
      } else {
        await addDoc(collection(db, 'banners'), data);
        toast({ title: "Bannière ajoutée", description: `La bannière "${data.title}" a été ajoutée.` });
      }
      setIsFormOpen(false);
      setEditingBanner(null);
    } catch (error) {
      console.error("Erreur de sauvegarde de bannière:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder la bannière." });
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Chargement des bannières...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Bannières</h1>
        <Button onClick={handleAddBanner} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Bannière
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingBanner(null);}}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Modifier la Bannière' : 'Ajouter une Nouvelle Bannière'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...form.register('title')} className="mt-1" />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre (Optionnel)</Label>
              <Input id="subtitle" {...form.register('subtitle')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="imageUrl">URL de l'Image</Label>
              <Input id="imageUrl" {...form.register('imageUrl')} className="mt-1" placeholder="https://example.com/image.png" />
              {form.formState.errors.imageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrl.message}</p>}
            </div>
             {form.watch('imageUrl') && (
                <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                    <Image src={form.watch('imageUrl')} alt="Aperçu bannière" fill sizes="300px" className="object-contain" data-ai-hint={form.watch('imageAiHint') || 'banner preview'} onError={(e) => e.currentTarget.style.display='none'}/>
                </div>
            )}
            <div>
              <Label htmlFor="link">Lien de Destination</Label>
              <Input id="link" {...form.register('link')} className="mt-1" placeholder="/products/category-name" />
              {form.formState.errors.link && <p className="text-sm text-destructive mt-1">{form.formState.errors.link.message}</p>}
            </div>
            <div>
              <Label htmlFor="imageAiHint">Indice IA pour l'image (1-2 mots)</Label>
              <Input id="imageAiHint" {...form.register('imageAiHint')} className="mt-1" placeholder="ex: maillot foot" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingBanner ? 'Sauvegarder' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Lien</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length > 0 ? banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="relative h-12 w-20 rounded-md overflow-hidden border">
                      <Image src={banner.imageUrl} alt={banner.title} fill sizes="80px" className="object-cover" data-ai-hint={banner.imageAiHint || 'banner thumbnail'}/>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell><a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs block">{banner.link}</a></TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditBanner(banner)} title="Modifier">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Confirmer la suppression</DialogTitle>
                              <DialogDescription>
                                  Êtes-vous sûr de vouloir supprimer la bannière "{banner.title}" ?
                              </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                              <DialogClose asChild>
                                  <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <Button variant="destructive" onClick={() => handleDeleteBanner(banner.id, banner.title)}>
                                  Supprimer
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    Aucune bannière trouvée. Ajoutez-en une pour commencer!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
