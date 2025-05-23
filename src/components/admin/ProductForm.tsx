
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
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image'; 

const CLOUDINARY_CLOUD_NAME = 'dm6yuokre'; 
const CLOUDINARY_UPLOAD_PRESET = 'assane_eats'; 

const productFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.string().min(1, "Une catégorie est requise."),
  stock: z.coerce.number().min(0, "Le stock doit être positif ou nul."),
  imageUrl: z.string().url("L'URL de l'image n'est pas valide.").or(z.literal('')).optional().default(''),
  imageAiHint: z.string().optional().default(''),
  sizes: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'> | Product) => void; 
  onCancel: () => void;
}

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'Taille unique'];

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    },
  });

  useEffect(() => {
    setIsLoadingCategories(true);
    const categoriesCollectionRef = collection(db, 'categories');
    const unsubscribe = onSnapshot(categoriesCollectionRef, (querySnapshot) => {
      const fetchedCategories: SiteCategory[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        iconName: doc.data().iconName,
      }));
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0 && !product?.category && !watch('category')) {
        setValue('category', fetchedCategories[0].name);
      }
      setIsLoadingCategories(false);
    }, (error) => {
      console.error("Erreur de récupération des catégories pour le formulaire:", error);
      toast({ variant: "destructive", title: "Erreur Catégories", description: "Impossible de charger les catégories." });
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
        imageAiHint: product.imageAiHint || '',
      });
      const initialPreview = product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : null;
      setImagePreview(initialPreview);
    } else {
      reset({
        name: '', description: '', price: 0,
        category: categories.length > 0 ? categories[0].name : '',
        stock: 0, imageUrl: '', imageAiHint: '', sizes: [], featured: false,
      });
      setImagePreview(null);
    }
    setImageFile(null); 
  }, [product, reset, categories]);

  const selectedSizes = watch('sizes') || [];

  const handleSizeToggle = (size: string) => {
    const currentSizes = selectedSizes;
    if (currentSizes.includes(size)) {
      setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true });
    } else {
      setValue('sizes', [...currentSizes, size], { shouldValidate: true });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      const initialPreviewOnClear = product?.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : null;
      setImagePreview(initialPreviewOnClear); 
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('Uploading to Cloudinary with:', { cloudName: CLOUDINARY_CLOUD_NAME, preset: CLOUDINARY_UPLOAD_PRESET });

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Cloudinary response:', data); 
      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error('Cloudinary upload error details:', data); 
        toast({ variant: 'destructive', title: 'Erreur Cloudinary', description: data.error?.message || "Le téléversement de l'image a échoué." });
        return null;
      }
    } catch (error) {
      console.error('Failed to upload image to Cloudinary:', error);
      toast({ variant: 'destructive', title: 'Erreur Réseau Cloudinary', description: "Impossible de contacter le serveur Cloudinary." });
      return null;
    }
  };

  const processSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsUploading(true);
    let uploadedImageUrl = (product?.imageUrl && product.imageUrl.trim() !== '') ? product.imageUrl : ''; 

    if (imageFile) {
      const cloudinaryUrl = await uploadImageToCloudinary(imageFile);
      if (cloudinaryUrl) {
        uploadedImageUrl = cloudinaryUrl;
      } else {
        setIsUploading(false);
        toast({ variant: 'destructive', title: "Échec du téléversement", description: "L'image n'a pas pu être téléversée. Le produit n'a pas été sauvegardé."});
        return; 
      }
    }
    
    const finalProductData: Omit<Product, 'id'> | Product = {
      ...data,
      imageUrl: uploadedImageUrl,
      imageAiHint: data.imageAiHint || '',
    };

    if (product?.id) {
      (finalProductData as Product).id = product.id;
    }
    
    onSubmit(finalProductData);
    setIsUploading(false);
  };
  
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" {...register('name')} className="mt-1" disabled={isUploading} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" disabled={isUploading} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input id="price" type="number" {...register('price')} className="mt-1" disabled={isUploading}/>
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock')} className="mt-1" disabled={isUploading}/>
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
              disabled={isLoadingCategories || isUploading}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder={isLoadingCategories ? "Chargement..." : "Sélectionner une catégorie"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cat" disabled>Aucune catégorie trouvée</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageFile">Image du Produit</Label>
        <Input 
          id="imageFile" 
          type="file" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageChange} 
          className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          disabled={isUploading}
        />
        {imagePreview && imagePreview.trim() !== '' && (
          <div className="mt-4 relative w-32 h-32 border rounded-md overflow-hidden">
            <Image src={imagePreview} alt="Aperçu" fill sizes="128px" className="object-cover" />
          </div>
        )}
        {/* Removed hidden input for imageUrl, as it's now derived from imageFile upload or existing product data */}
        {errors.imageUrl && !imageFile && !(product?.imageUrl && product.imageUrl.trim() !== '') && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageAiHint">Indice IA pour l'image (1-2 mots)</Label>
        <Input id="imageAiHint" {...register('imageAiHint')} className="mt-1" placeholder="ex: chaussure sport" disabled={isUploading}/>
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
                disabled={isUploading}
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
                    disabled={isUploading}
                />
            )}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mettre en vedette sur la page d'accueil
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
          Annuler
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isUploading}>
          {isUploading ? 'Sauvegarde...' : (product ? 'Sauvegarder les Modifications' : 'Ajouter le Produit')}
        </Button>
      </div>
    </form>
  );
}
