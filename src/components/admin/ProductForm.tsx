
'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types';
import { productCategories } from '@/types'; // This will now be the dynamic list

const productFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.string().min(1, "Une catégorie est requise."),
  stock: z.coerce.number().min(0, "Le stock doit être positif ou nul."),
  imageUrl: z.string().url("L'URL de l'image n'est pas valide.").or(z.literal('')),
  imageAiHint: z.string().optional(),
  sizes: z.array(z.string()).optional(), // Array of strings for sizes
  featured: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
}

// Example sizes, you might want to manage these dynamically too
const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'Taille unique'];

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: '',
      imageAiHint: '',
      sizes: [],
      featured: false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        price: product.price || 0,
        stock: product.stock || 0,
        sizes: product.sizes || [],
        featured: product.featured || false,
      });
    } else {
        reset({
            name: '', description: '', price: 0, category: productCategories.length > 0 ? productCategories[0] : '', 
            stock: 0, imageUrl: '', imageAiHint: '', sizes: [], featured: false,
        });
    }
  }, [product, reset]);

  const selectedSizes = watch('sizes') || [];

  const handleSizeToggle = (size: string) => {
    const currentSizes = selectedSizes;
    if (currentSizes.includes(size)) {
      setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true });
    } else {
      setValue('sizes', [...currentSizes, size], { shouldValidate: true });
    }
  };

  const processSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSubmit({
      ...data,
      id: product?.id || '', // Keep existing ID or let parent handle new ID
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input id="price" type="number" {...register('price')} className="mt-1" />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock')} className="mt-1" />
          {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl">URL de l'Image</Label>
        <Input id="imageUrl" {...register('imageUrl')} className="mt-1" placeholder="https://placehold.co/400x400.png"/>
        {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
      </div>
       <div>
        <Label htmlFor="imageAiHint">Indice IA pour l'image (1-2 mots)</Label>
        <Input id="imageAiHint" {...register('imageAiHint')} className="mt-1" placeholder="ex: chaussure sport"/>
        {errors.imageAiHint && <p className="text-sm text-destructive mt-1">{errors.imageAiHint.message}</p>}
      </div>

      <div>
        <Label>Tailles disponibles</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2 p-3 border rounded-md">
          {availableSizes.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onCheckedChange={() => handleSizeToggle(size)}
              />
              <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">{size}</Label>
            </div>
          ))}
        </div>
        {errors.sizes && <p className="text-sm text-destructive mt-1">{errors.sizes.message}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Controller
            name="featured"
            control={control}
            render={({ field }) => (
                <Checkbox
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            )}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mettre en vedette sur la page d'accueil
        </Label>
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {product ? 'Sauvegarder les Modifications' : 'Ajouter le Produit'}
        </Button>
      </div>
    </form>
  );
}

