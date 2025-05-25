
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, LayoutGrid, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { categoryIcons, SiteCategory } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  iconName: z.string().min(1, "Une icône est requise.").default('Default'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const iconOptions = Object.keys(categoryIcons)
  .filter(name => name !== "Package") // Exclude "Package" icon specific to product display
  .map(name => ({
    name: name as keyof typeof categoryIcons,
    Icon: categoryIcons[name as keyof typeof categoryIcons]
  }));

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', iconName: 'Default' },
  });

  useEffect(() => {
    setIsLoading(true);
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: SiteCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SiteCategory));
      setCategories(fetchedCategories);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ variant: "destructive", title: "Erreur de chargement", description: "Impossible de charger les catégories." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (editingCategory) {
      form.reset({ name: editingCategory.name, iconName: editingCategory.iconName || 'Default' });
    } else {
      form.reset({ name: '', iconName: 'Default' });
    }
  }, [editingCategory, form, isFormOpen]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: SiteCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      toast({ title: "Catégorie supprimée", description: `La catégorie "${categoryName}" a été supprimée.` });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ variant: "destructive", title: "Erreur de suppression", description: "Impossible de supprimer la catégorie." });
    }
  };

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      if (editingCategory) {
        const categoryRef = doc(db, 'categories', editingCategory.id);
        await updateDoc(categoryRef, { ...data /*, updatedAt: serverTimestamp() */ });
        toast({ title: "Catégorie modifiée", description: `La catégorie "${data.name}" a été mise à jour.` });
      } else {
        await addDoc(collection(db, 'categories'), { ...data /*, createdAt: serverTimestamp() */ });
        toast({ title: "Catégorie ajoutée", description: `La catégorie "${data.name}" a été ajoutée.` });
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ variant: "destructive", title: "Erreur de sauvegarde", description: "Impossible de sauvegarder la catégorie." });
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des catégories...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Catégories</h1>
        <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Catégorie
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingCategory(null);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input id="name" {...form.register('name')} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="iconName">Icône</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-1 border p-2 rounded-md max-h-48 overflow-y-auto">
                    {iconOptions.map(({ name: iconKey, Icon }) => (
                        <button
                            type="button"
                            key={iconKey}
                            onClick={() => form.setValue('iconName', iconKey, { shouldValidate: true })}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent hover:text-accent-foreground aspect-square",
                                form.watch('iconName') === iconKey && "bg-accent text-accent-foreground ring-2 ring-primary"
                            )}
                            title={iconKey}
                        >
                            <Icon className="h-5 w-5 mb-1 sm:h-6 sm:w-6" />
                            <span className="text-xs truncate w-full text-center">{iconKey}</span>
                        </button>
                    ))}
                </div>
                {form.formState.errors.iconName && <p className="text-sm text-destructive mt-1">{form.formState.errors.iconName.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingCategory ? 'Sauvegarder' : 'Ajouter'}
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
                <TableHead className="w-16">Icône</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? categories.map((category) => {
                const IconComponent = category.iconName ? categoryIcons[category.iconName] : LayoutGrid;
                return (
                  <TableRow key={category.id}>
                    <TableCell className="flex justify-center items-center">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)} title="Modifier">
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
                                      Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ? Cette action est irréversible.
                                  </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={() => handleDeleteCategory(category.id, category.name)}>
                                      Supprimer
                                  </Button>
                              </DialogFooter>
                          </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Aucune catégorie trouvée.
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
