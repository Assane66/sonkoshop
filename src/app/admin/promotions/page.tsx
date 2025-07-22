
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Megaphone, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { SiteCategory } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the type for a Promotion
interface Promotion {
  id: string;
  name: string;
  category: string;
  discountPercentage: number;
}

const promotionFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  category: z.string().min(1, { message: "Une catégorie est requise." }),
  discountPercentage: z.coerce
    .number()
    .min(1, { message: "La réduction doit être d'au moins 1%." })
    .max(90, { message: "La réduction ne peut pas dépasser 90%." }),
});

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const { toast } = useToast();

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: '',
      category: '',
      discountPercentage: 10,
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const promotionsCollection = collection(db, 'promotions');
    const q = query(promotionsCollection, orderBy('name', 'asc'));

    const unsubscribePromotions = onSnapshot(q, (snapshot) => {
      const fetchedPromotions: Promotion[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Promotion));
      setPromotions(fetchedPromotions);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching promotions:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les promotions." });
      setIsLoading(false);
    });
    
    const categoriesCollection = collection(db, 'categories');
    const qCat = query(categoriesCollection, orderBy('name', 'asc'));
    const unsubscribeCategories = onSnapshot(qCat, (snapshot) => {
      const fetchedCategories: SiteCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SiteCategory));
      setCategories(fetchedCategories);
    });

    return () => {
        unsubscribePromotions();
        unsubscribeCategories();
    };
  }, [toast]);
  
  useEffect(() => {
    if (editingPromotion) {
      form.reset(editingPromotion);
    } else {
      form.reset({ name: '', category: '', discountPercentage: 10 });
    }
  }, [editingPromotion, form, isFormOpen]);
  
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };
  
  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleDeletePromotion = async (promotionId: string, promotionName: string) => {
    try {
      // NOTE: Here you would trigger the logic to remove the promotion from products.
      // For now, we only delete the promotion document itself.
      await deleteDoc(doc(db, 'promotions', promotionId));
      toast({ title: "Promotion supprimée", description: `La promotion "${promotionName}" a été supprimée.` });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la promotion." });
    }
  };

  const onSubmit: SubmitHandler<PromotionFormValues> = async (data) => {
    try {
        if (editingPromotion) {
            const promotionRef = doc(db, 'promotions', editingPromotion.id);
            await updateDoc(promotionRef, { ...data });
            toast({ title: "Promotion modifiée", description: "La logique d'application sera bientôt disponible." });
        } else {
            await addDoc(collection(db, 'promotions'), { ...data });
            toast({ title: "Promotion ajoutée", description: "La logique d'application sera bientôt disponible." });
        }
        setIsFormOpen(false);
        setEditingPromotion(null);
    } catch (error) {
       console.error("Error saving promotion:", error);
       toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder la promotion." });
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des promotions...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Promotions</h1>
        <Button onClick={handleAddPromotion} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Créer une Promotion
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Important</CardTitle>
          <CardDescription>
            Cette section vous permet de définir des campagnes de promotion. La logique pour appliquer automatiquement ces réductions aux produits est en cours de développement et sera disponible prochainement.
          </CardDescription>
        </CardHeader>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingPromotion(null);}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Modifier la Promotion' : 'Créer une Nouvelle Promotion'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nom de la promotion</Label>
              <Input id="name" {...form.register('name')} className="mt-1" placeholder="Ex: Soldes d'hiver" disabled={form.formState.isSubmitting} />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
             <div>
              <Label htmlFor="category">Catégorie Ciblée</Label>
               <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={categories.length === 0 || form.formState.isSubmitting}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
            </div>
            <div>
              <Label htmlFor="discountPercentage">Pourcentage de Réduction (%)</Label>
              <Input id="discountPercentage" type="number" {...form.register('discountPercentage')} className="mt-1" placeholder="Ex: 15" disabled={form.formState.isSubmitting}/>
              {form.formState.errors.discountPercentage && <p className="text-sm text-destructive mt-1">{form.formState.errors.discountPercentage.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={form.formState.isSubmitting}>Annuler</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingPromotion ? 'Sauvegarder' : 'Créer la Promotion'}
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
                <TableHead>Nom de la Promotion</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length > 0 ? promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>{promo.category}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{promo.discountPercentage}%</TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPromotion(promo)} title="Modifier" disabled>
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
                                  Êtes-vous sûr de vouloir supprimer la promotion "{promo.name}" ?
                              </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                              <DialogClose asChild>
                                  <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                  <Button variant="destructive" onClick={() => handleDeletePromotion(promo.id, promo.name)}>
                                      Supprimer
                                  </Button>
                              </DialogClose>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    Aucune promotion active. Créez-en une pour commencer!
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
