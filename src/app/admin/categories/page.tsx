
'use client';

import { useState, useEffect } from 'react';
import type { SiteCategory, ProductCategory } from '@/types';
import { productCategories as initialProductCategoriesEnum, categoryIcons, updateProductCategories } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, LayoutGrid } from 'lucide-react';
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom de la catégorie doit contenir au moins 2 caractères." }),
  description: z.string().optional(),
  iconName: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Initialize categories from the enum for the initial state
const initialCategories: SiteCategory[] = initialProductCategoriesEnum.map((catName, index) => ({
  id: `cat-${index + 1}`,
  name: catName,
  description: `Description pour ${catName}`,
  iconName: Object.keys(categoryIcons).find(key => categoryIcons[key as keyof typeof categoryIcons] === categoryIcons[catName as ProductCategory]) as keyof typeof categoryIcons || "Default"
}));


export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<SiteCategory[]>(initialCategories);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      iconName: 'Default',
    },
  });

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description || '',
        iconName: editingCategory.iconName || 'Default',
      });
    } else {
      form.reset({ name: '', description: '', iconName: 'Default' });
    }
  }, [editingCategory, form]);
  
  // Update the global productCategories array when local categories change
  useEffect(() => {
    updateProductCategories(categories.map(c => c.name));
  }, [categories]);


  const handleAddCategory = () => {
    setEditingCategory(null);
    form.reset({ name: '', description: '', iconName: 'Default' });
    setIsFormDialogOpen(true);
  };

  const handleEditCategory = (category: SiteCategory) => {
    setEditingCategory(category);
    setIsFormDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Prevent deletion if it's one of the original enum categories - for this demo
    const isInitialEnumCategory = initialProductCategoriesEnum.includes(categories.find(c=>c.id === categoryId)?.name || "");
    if (isInitialEnumCategory && categories.length <= initialProductCategoriesEnum.length) {
        toast({ variant: "destructive", title: "Suppression non autorisée", description: "Les catégories de base ne peuvent pas être supprimées dans cette démo." });
        return;
    }

    setCategories(categories.filter((c) => c.id !== categoryId));
    toast({ title: "Catégorie Supprimée", description: "La catégorie a été supprimée." });
  };

  const handleFormSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) => (c.id === editingCategory.id ? { ...editingCategory, ...data } : c))
      );
      toast({ title: "Catégorie Mise à Jour", description: "La catégorie a été mise à jour." });
    } else {
      const newCategory: SiteCategory = {
        id: `cat-${Date.now()}`,
        ...data,
        iconName: data.iconName as keyof typeof categoryIcons || "Default",
      };
      setCategories([...categories, newCategory]);
      toast({ title: "Catégorie Ajoutée", description: "La nouvelle catégorie a été ajoutée." });
    }
    setIsFormDialogOpen(false);
    setEditingCategory(null);
    form.reset({ name: '', description: '', iconName: 'Default' });
  };
  
  const availableIcons = Object.keys(categoryIcons);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gérer les Catégories</h1>
        <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Catégorie
        </Button>
      </div>

      {/* Dialog for Category Form */}
      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
          setIsFormDialogOpen(isOpen);
          if (!isOpen) setEditingCategory(null);
        }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Nouvelle Catégorie'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Mettez à jour les détails de cette catégorie.' : 'Remplissez les détails pour la nouvelle catégorie.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nouveautés" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optionnel)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Courte description de la catégorie..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icône (Optionnel)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "Default"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une icône" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableIcons.map((iconKey) => {
                          const IconComponent = categoryIcons[iconKey as keyof typeof categoryIcons];
                          return (
                            <SelectItem key={iconKey} value={iconKey}>
                              <div className="flex items-center">
                                {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                                {iconKey}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
          <CardDescription>Gérez les catégories de produits de votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icône</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category.iconName || "Default"] || LayoutGrid;
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{category.description || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <LayoutGrid className="h-16 w-16 mb-4" />
              <p className="text-lg">Aucune catégorie pour le moment.</p>
              <p className="text-sm">Ajoutez de nouvelles catégories pour les organiser.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
