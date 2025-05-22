
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, LayoutGrid } from 'lucide-react';
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
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  iconName: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const iconOptions = Object.keys(categoryIcons).map(name => ({
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
    const categoriesCollectionRef = collection(db, 'categories');
    // const fetchCategories = async () => {
    //   try {
    //     const querySnapshot = await getDocs(categoriesCollectionRef);
    //     const fetchedCategories: SiteCategory[] = querySnapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data() as Omit<SiteCategory, 'id'>
    //     }));
    //     setCategories(fetchedCategories);
    //   } catch (error) {
    //     console.error("Erreur de récupération des catégories:", error);
    //     toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les catégories." });
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchCategories();

    const unsubscribe = onSnapshot(categoriesCollectionRef, (querySnapshot) => {
      const fetchedCategories: SiteCategory[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<SiteCategory, 'id'>
      }));
      setCategories(fetchedCategories);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur de récupération des catégories (snapshot):", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les catégories en temps réel." });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
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
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      toast({ title: "Catégorie supprimée", description: `La catégorie "${categoryName}" a été supprimée.` });
      // Real-time updates from onSnapshot will refresh the list
    } catch (error) {
      console.error("Erreur de suppression de catégorie:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la catégorie." });
    }
  };

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      if (editingCategory) {
        const categoryDocRef = doc(db, 'categories', editingCategory.id);
        await updateDoc(categoryDocRef, data);
        toast({ title: "Catégorie modifiée", description: `${data.name} a été mise à jour.` });
      } else {
        await addDoc(collection(db, 'categories'), data);
        toast({ title: "Catégorie ajoutée", description: `${data.name} a été ajoutée.` });
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      // Real-time updates from onSnapshot will refresh the list
    } catch (error) {
      console.error("Erreur de sauvegarde de catégorie:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder la catégorie." });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Chargement des catégories...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Catégories</h1>
        <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Catégorie
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input id="name" {...form.register('name')} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="iconName">Icône</Label>
                <div className="grid grid-cols-5 gap-2 mt-1 border p-2 rounded-md max-h-48 overflow-y-auto">
                    {iconOptions.map(({ name: iconKey, Icon }) => (
                        <button
                            type="button"
                            key={iconKey}
                            onClick={() => form.setValue('iconName', iconKey, { shouldValidate: true })}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent hover:text-accent-foreground",
                                form.watch('iconName') === iconKey && "bg-accent text-accent-foreground ring-2 ring-primary"
                            )}
                            title={iconKey}
                        >
                            <Icon className="h-6 w-6 mb-1" />
                            <span className="text-xs truncate">{iconKey}</span>
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
                                      Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ?
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
