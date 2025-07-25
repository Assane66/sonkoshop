
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
import type { Product, SiteCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, X, Tag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dm6yuokre';
const CLOUDINARY_UPLOAD_PRESET = 'sonko_shop';

const productFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  promotionPrice: z.coerce.number().optional().nullable(),
  category: z.string().min(1, "Une catégorie est requise."),
  stock: z.coerce.number().min(0, "Le stock doit être positif ou nul."),
  imageUrls: z.array(z.string()).min(1, "Au moins une image est requise."),
  imageAiHint: z.string().optional().default(''),
  sizes: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  originalPrice: z.coerce.number().optional().nullable(),
}).refine(data => {
    if (data.promotionPrice && data.promotionPrice >= data.price) {
        return false;
    }
    return true;
}, {
    message: "Le prix promotionnel doit être inférieur au prix d'origine.",
    path: ["promotionPrice"],
});


type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'Taille unique'];

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      promotionPrice: null,
      category: '',
      stock: 0,
      imageUrls: [],
      imageAiHint: '',
      sizes: [],
      featured: false,
    },
  });


  useEffect(() => {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: SiteCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SiteCategory));
      setCategories(fetchedCategories);
      setIsLoadingCategories(false);
      if (!product && fetchedCategories.length > 0 && !watch('category')) {
        setValue('category', fetchedCategories[0].name);
      }
    }, (error) => {
      console.error("Error fetching categories for product form:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les catégories." });
      setIsLoadingCategories(false);
    });
    return () => unsubscribe();
  }, [toast, product, setValue, watch]);

  useEffect(() => {
    if (product) {
      const defaultValues = {
        ...product,
        price: product.price || 0,
        promotionPrice: product.promotionPrice || null,
        stock: product.stock || 0,
        sizes: product.sizes || [],
        featured: product.featured || false,
        category: product.category || (categories.length > 0 ? categories[0].name : ''),
        imageUrls: product.imageUrls || [],
        imageAiHint: product.imageAiHint || '',
      };
      reset(defaultValues);
      setImagePreviews(product.imageUrls || []);
      setValue('imageUrls', product.imageUrls || [], { shouldValidate: true });
    } else {
       const defaultValues = {
        name: '', description: '', price: 0, promotionPrice: null,
        category: categories.length > 0 ? categories[0].name : '',
        stock: 0, imageUrls: [], imageAiHint: '', sizes: [], featured: false,
      };
      reset(defaultValues);
      setImagePreviews([]);
      setValue('imageUrls', [], { shouldValidate: true });
    }
    setImageFiles([]);
  }, [product, reset, categories, setValue]);


  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      const allPreviews = [...imagePreviews, ...newPreviews];
      setImagePreviews(allPreviews);
      setValue('imageUrls', allPreviews, { shouldValidate: true });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const removedUrl = imagePreviews[indexToRemove];
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(newPreviews);
    setValue('imageUrls', newPreviews, { shouldValidate: true });

    if (removedUrl.startsWith('blob:')) {
      // It's a preview for a new file, find and remove the corresponding file from state
      const newImageFiles = imageFiles.filter(file => URL.createObjectURL(file) !== removedUrl);
      setImageFiles(newImageFiles);
    }
  };


  const selectedSizes = watch('sizes') || [];

  const handleSizeToggle = (size: string) => {
    const currentSizes = selectedSizes;
    if (currentSizes.includes(size)) {
      setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true });
    } else {
      setValue('sizes', [...currentSizes, size], { shouldValidate: true });
    }
  };

  const processSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsUploading(true);
    try {
      const uploadPromises = imageFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
        return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        }).then(response => response.json());
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImageUrls = uploadedImages.map(result => {
        if (result.secure_url) {
          return result.secure_url;
        }
        throw new Error(result.error?.message || 'Cloudinary upload failed');
      });

      const existingUrls = imagePreviews.filter(url => !url.startsWith('blob:'));
      const finalImageUrls = [...existingUrls, ...newImageUrls];
      
      const finalProductData = {
        ...data,
        imageUrls: finalImageUrls,
      };
      
      if (product?.id) {
        (finalProductData as Product).id = product.id;
      }
      
      await onSubmit(finalProductData as any);
    } catch (error: any) {
        console.error("Erreur lors de la soumission du produit (depuis ProductForm):", error);
        toast({ variant: 'destructive', title: 'Erreur de Sauvegarde', description: `Impossible de sauvegarder le produit. ${error.message}` });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" {...register('name')} className="mt-1" disabled={isUploading || isLoadingCategories} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" disabled={isUploading || isLoadingCategories} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>
      
       <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 space-y-4">
            <h4 className="text-md font-semibold text-blue-800 flex items-center"><Tag className="mr-2 h-5 w-5"/>Prix et Promotion</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <Label htmlFor="price">Prix d'origine (FCFA)</Label>
                <Input id="price" type="number" {...register('price')} className="mt-1" disabled={isUploading || isLoadingCategories} />
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                </div>
                <div>
                <Label htmlFor="promotionPrice">Prix Promotionnel (Optionnel)</Label>
                <Input id="promotionPrice" type="number" {...register('promotionPrice')} className="mt-1" placeholder="Laisser vide si pas de promo" disabled={isUploading || isLoadingCategories} />
                {errors.promotionPrice && <p className="text-sm text-destructive mt-1">{errors.promotionPrice.message}</p>}
                </div>
            </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingCategories || categories.length === 0 || isUploading}
              >
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder={isLoadingCategories ? "Chargement..." : (categories.length === 0 ? "Aucune catégorie" : "Sélectionner une catégorie")} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : categories.length > 0 ? (
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
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock')} className="mt-1" disabled={isUploading || isLoadingCategories} />
          {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="imageFile">Images du Produit</Label>
        <Input
          id="imageFile"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageFileChange}
          className="mt-1"
          disabled={isUploading || isLoadingCategories}
        />
        <input type="hidden" {...register('imageUrls')} />
        {errors.imageUrls && <p className="text-sm text-destructive mt-1">{errors.imageUrls.message}</p>}

        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {imagePreviews.map((previewUrl, index) => (
              <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                <Image src={previewUrl} alt={`Aperçu ${index + 1}`} fill sizes="96px" className="object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0.5 right-0.5 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">La première image sera l'image principale du produit.</p>
      </div>

      <div>
        <Label htmlFor="imageAiHint">Indice IA pour l'image (1-2 mots)</Label>
        <Input id="imageAiHint" {...register('imageAiHint')} className="mt-1" placeholder="ex: chaussure sport" disabled={isUploading || isLoadingCategories} />
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
                disabled={isUploading || isLoadingCategories}
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
              disabled={isUploading || isLoadingCategories}
            />
          )}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mettre en vedette sur la page d'accueil
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading || isLoadingCategories}>
          Annuler
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isUploading || isLoadingCategories}>
          {isUploading ? (
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

    