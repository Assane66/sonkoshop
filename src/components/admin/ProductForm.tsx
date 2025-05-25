
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product, SiteCategory } from '@/types'; // SiteCategory for local mock category list
import { productCategoriesArray } from '@/types'; // Using static array
// Firebase and Cloudinary imports removed
// import { db } from '@/lib/firebase';
// import { collection, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// const CLOUDINARY_CLOUD_NAME = 'dm6yuokre'; // Cloudinary removed
// const CLOUDINARY_UPLOAD_PRESET = 'sonko_shop'; // Cloudinary removed

const productFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.string().min(1, "Une catégorie est requise."),
  stock: z.coerce.number().min(0, "Le stock doit être positif ou nul."),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }).optional().or(z.literal('')), // Reverted to URL input
  imageAiHint: z.string().optional().default(''),
  sizes: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'> | Product) => Promise<void> | void; // onSubmit can be sync or async
  onCancel: () => void;
  // Added categories prop for local data
  categories: SiteCategory[]; 
}

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'Taille unique'];

export default function ProductForm({ product, onSubmit, onCancel, categories }: ProductFormProps) {
  // const [categories, setCategories] = useState<SiteCategory[]>([]); // Categories now passed as prop
  // const [isLoadingCategories, setIsLoadingCategories] = useState(true); // No loading from Firebase
  // const [imageFile, setImageFile] = useState<File | null>(null); // Cloudinary removed
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isUploading
  const { toast } = useToast();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: categories.length > 0 ? categories[0].name : '',
      stock: 0,
      imageUrl: '',
      imageAiHint: '',
      sizes: [],
      featured: false,
    },
  });

  const currentImageUrl = watch('imageUrl');

  // useEffect for Firebase categories removed

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        price: product.price || 0,
        stock: product.stock || 0,
        sizes: product.sizes || [],
        featured: product.featured || false,
        category: product.category || (categories.length > 0 ? categories[0].name : ''),
        imageUrl: product.imageUrl || '',
        imageAiHint: product.imageAiHint || '',
      });
      setImagePreview(product.imageUrl || null);
    } else {
      reset({
        name: '', description: '', price: 0,
        category: categories.length > 0 ? categories[0].name : '',
        stock: 0, imageUrl: '', imageAiHint: '', sizes: [], featured: false,
      });
      setImagePreview(null);
    }
    // setImageFile(null); // Cloudinary removed
  }, [product, reset, categories]);

  const selectedSizes = watch('sizes') || [];

  // handleImageFileChange removed (Cloudinary logic)

  const handleSizeToggle = (size: string) => {
    const currentSizes = selectedSizes;
    if (currentSizes.includes(size)) {
      setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true });
    } else {
      setValue('sizes', [...currentSizes, size], { shouldValidate: true });
    }
  };

  const processSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    // Cloudinary upload logic removed
    const finalProductData: Omit<Product, 'id'> | Product = { ...data };

    if (product?.id) {
      (finalProductData as Product).id = product.id;
    }
    
    try {
      await onSubmit(finalProductData); 
    } catch (error: any) {
        console.error("Erreur lors de la soumission du produit (depuis ProductForm):", error);
        toast({ variant: 'destructive', title: 'Erreur de Sauvegarde', description: `Impossible de sauvegarder le produit. Erreur: ${error.message}` });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const displayPreview = watch('imageUrl'); // Preview directly from imageUrl input

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" {...register('name')} className="mt-1" disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" disabled={isSubmitting} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input id="price" type="number" {...register('price')} className="mt-1" disabled={isSubmitting} />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock')} className="mt-1" disabled={isSubmitting} />
          {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={categories.length === 0 || isSubmitting}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder={categories.length === 0 ? "Aucune catégorie" : "Sélectionner une catégorie"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cat" disabled>Aucune catégorie disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl">URL de l'Image du Produit</Label>
        <Input
          id="imageUrl"
          type="text"
          {...register('imageUrl')}
          placeholder="https://example.com/image.png"
          className="mt-1"
          disabled={isSubmitting}
          onChange={(e) => {
            setValue('imageUrl', e.target.value, {shouldValidate: true});
            setImagePreview(e.target.value);
          }}
        />
        {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
         {displayPreview && (
          <div className="mt-4 relative w-32 h-32 border rounded-md overflow-hidden">
            <Image src={displayPreview} alt="Aperçu" fill sizes="128px" className="object-cover" data-ai-hint={watch('imageAiHint') || "product preview"} onError={(e) => e.currentTarget.style.display='none'}/>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="imageAiHint">Indice IA pour l'image (1-2 mots)</Label>
        <Input id="imageAiHint" {...register('imageAiHint')} className="mt-1" placeholder="ex: chaussure sport" disabled={isSubmitting} />
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
                disabled={isSubmitting}
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
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mettre en vedette sur la page d'accueil
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (product ? 'Sauvegarder les Modifications' : 'Ajouter le Produit')}
        </Button>
      </div>
    </form>
  );
}
