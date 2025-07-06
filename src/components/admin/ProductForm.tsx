
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
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, serverTimestamp, deleteField } from 'firebase/firestore';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dm6yuokre';
const CLOUDINARY_UPLOAD_PRESET = 'sonko_shop';

const productFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.string().min(1, "Une catégorie est requise."),
  stock: z.coerce.number().min(0, "Le stock doit être positif ou nul."),
  imageUrl: z.string().optional().or(z.literal('')),
  imageAiHint: z.string().optional().default(''),
  sizes: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  promotionPercentage: z.coerce.number().min(0).max(100).optional().nullable().default(null),
  isPromotion24h: z.boolean().optional().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'promotionEndDate'> & { promotionEndDate?: Date | null | typeof deleteField }) => Promise<void>;
  onCancel: () => void;
}

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'Taille unique'];
const promotionOptions = [
  { label: "Aucune", value: 0 },
  { label: "10%", value: 10 },
  { label: "20%", value: 20 },
  { label: "30%", value: 30 },
];

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
      promotionPercentage: null,
      isPromotion24h: false,
    },
  });

  const promotionPercentageValue = watch('promotionPercentage');

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
      reset({
        ...product,
        price: product.price || 0,
        stock: product.stock || 0,
        sizes: product.sizes || [],
        featured: product.featured || false,
        category: product.category || (categories.length > 0 ? categories[0].name : ''),
        imageUrl: product.imageUrl || '',
        imageAiHint: product.imageAiHint || '',
        promotionPercentage: product.promotionPercentage || null,
        isPromotion24h: !!(product.promotionPercentage && product.promotionEndDate), // Approx. Needs better logic if editing non-24h promo
      });
      setImagePreview(product.imageUrl || null);
    } else {
       reset({
        name: '', description: '', price: 0,
        category: categories.length > 0 ? categories[0].name : '',
        stock: 0, imageUrl: '', imageAiHint: '', sizes: [], featured: false,
        promotionPercentage: null, isPromotion24h: false,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, reset, categories]);


  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('imageUrl', '', { shouldValidate: true });
    } else {
      setImageFile(null);
      setImagePreview(product?.imageUrl || null);
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
      console.log("ProductForm: Submitting data:", data);
      let finalImageUrl = data.imageUrl;
  
      if (imageFile) {
        console.log("ProductForm: Uploading image to Cloudinary...");
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const cloudinaryData = await response.json();
        if (cloudinaryData.secure_url) {
          finalImageUrl = cloudinaryData.secure_url;
          console.log("ProductForm: Cloudinary upload successful, URL:", finalImageUrl);
        } else {
          console.error("ProductForm: Cloudinary upload failed, response:", cloudinaryData);
          throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
        }
      } else if (!finalImageUrl && product?.imageUrl) {
          finalImageUrl = product.imageUrl; // Keep existing image if no new one is uploaded
      }
  
      const isEditing = !!product?.id;
      let promotionEndDateValue: Date | null | typeof deleteField;
  
      if (data.promotionPercentage && data.promotionPercentage > 0) {
          if (data.isPromotion24h) {
              promotionEndDateValue = new Date(Date.now() + 24 * 60 * 60 * 1000);
          } else {
              promotionEndDateValue = null; // Infinite promotion
          }
      } else {
          data.promotionPercentage = null; // Ensure percentage is nullified
          if (isEditing) {
              // If editing an existing product, we want to remove the field.
              promotionEndDateValue = deleteField();
          } else {
              // If creating a new product, it should be null as addDoc can't handle deleteField().
              promotionEndDateValue = null;
          }
      }
  
      const finalProductData = {
        ...data,
        imageUrl: finalImageUrl || '',
        promotionPercentage: data.promotionPercentage || null,
        promotionEndDate: promotionEndDateValue,
      };
      
      delete (finalProductData as any).isPromotion24h;
  
      if (product?.id) {
        (finalProductData as Product).id = product.id;
      }
      
      console.log("ProductForm: Final product data to submit:", finalProductData);
  
      await onSubmit(finalProductData as any);
    } catch (error: any) {
        console.error("Erreur lors de la soumission du produit (depuis ProductForm):", error);
        toast({ variant: 'destructive', title: 'Erreur de Sauvegarde', description: `Impossible de sauvegarder le produit. ${error.message}` });
    } finally {
        setIsUploading(false);
    }
  };
  
  const displayPreview = imagePreview || watch('imageUrl');

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input id="price" type="number" {...register('price')} className="mt-1" disabled={isUploading || isLoadingCategories} />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock')} className="mt-1" disabled={isUploading || isLoadingCategories} />
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
      
      <div className="border p-4 rounded-md space-y-4">
        <h4 className="text-md font-medium">Promotion</h4>
        <div>
          <Label htmlFor="promotionPercentage">Pourcentage de Réduction</Label>
          <Controller
            name="promotionPercentage"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10) === 0 ? null : parseInt(value, 10))}
                value={field.value === null || field.value === undefined ? "0" : String(field.value)}
                disabled={isUploading || isLoadingCategories}
              >
                <SelectTrigger id="promotionPercentage" className="mt-1">
                  <SelectValue placeholder="Aucune promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotionOptions.map(option => (
                    <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.promotionPercentage && <p className="text-sm text-destructive mt-1">{errors.promotionPercentage.message}</p>}
        </div>
        {(promotionPercentageValue && promotionPercentageValue > 0) && (
           <div className="flex items-center space-x-2">
            <Controller
              name="isPromotion24h"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isPromotion24h"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isUploading || isLoadingCategories}
                />
              )}
            />
            <Label htmlFor="isPromotion24h" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Promotion pour 24 heures
            </Label>
          </div>
        )}
      </div>


      <div>
        <Label htmlFor="imageFile">Image du Produit</Label>
        <Input
          id="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="mt-1"
          disabled={isUploading || isLoadingCategories}
        />
        {displayPreview && (
          <div className="mt-4 relative w-32 h-32 border rounded-md overflow-hidden">
            <Image src={displayPreview} alt="Aperçu" fill sizes="128px" className="object-cover" data-ai-hint={watch('imageAiHint') || "product preview"} onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">Si aucune nouvelle image n'est sélectionnée et qu'une image existe, l'image actuelle sera conservée.</p>
        {errors.imageUrl && !imageFile && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
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
