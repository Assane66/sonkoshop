
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input as ShadcnInput } from '@/components/ui/input';
import { ShoppingCart, Zap, CheckCircle, ShieldCheck, Tag, Minus, Plus, ArrowLeft, Loader2, Edit } from 'lucide-react';
import type { Product, Review, CustomizationData } from '@/types';
import { categoryIcons } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { doc, onSnapshot, getDoc, Timestamp, collection, query, where, limit, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import ProductReviews from '@/components/ProductReviews';
import { Checkbox } from '@/components/ui/checkbox';
import { Label as ShadcnLabel } from '@/components/ui/label';

const CUSTOMIZATION_COST = 2000;

// Client component for all interactive logic
export default function ProductDetailClient({ initialProduct }: { initialProduct: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isCustomizationActive, setIsCustomizationActive] = useState(false);
  const [customization, setCustomization] = useState<CustomizationData>({
    name: '',
    numberTop: '',
    numberBottom: '',
  });

  const { toast } = useToast();
  const cart = useCart();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    setMainImageUrl(product.imageUrls?.[0] || 'https://placehold.co/600x600.png');
  }, [product.imageUrls]);

  useEffect(() => {
    if (!product.id) return;

    // Real-time listener for product updates
    const productDocRef = doc(db, 'products', product.id);
    const unsubscribeProduct = onSnapshot(productDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
         let imageUrls: string[] = [];
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
            imageUrls = data.imageUrls;
        } else if (data.imageUrl && typeof data.imageUrl === 'string') {
            imageUrls = [data.imageUrl];
        }
        const updatedProduct = { id: docSnap.id, ...data, imageUrls: imageUrls } as Product;
        setProduct(updatedProduct);
      }
    });

    // Fetch reviews
    setIsLoadingReviews(true);
    const reviewsCollection = collection(db, 'reviews');
    const qReviews = query(reviewsCollection, where('productId', '==', product.id), orderBy('createdAt', 'desc'));
    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      setIsLoadingReviews(false);
    }, (error) => {
       console.error("Error fetching reviews:", error);
       setIsLoadingReviews(false);
    });

    return () => {
      unsubscribeProduct();
      unsubscribeReviews();
    };
  }, [product.id]);
  
  useEffect(() => {
    if (!product || !product.category) return;

    setIsLoadingSuggestions(true);
    const productsCollection = collection(db, 'products');
    const q = query(
        productsCollection,
        where('category', '==', product.category),
        limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProducts: Product[] = snapshot.docs
            .map(doc => {
              const data = doc.data();
              let imageUrls: string[] = [];
              if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
                  imageUrls = data.imageUrls;
              } else if (data.imageUrl && typeof data.imageUrl === 'string') {
                  imageUrls = [data.imageUrl];
              }
              return {
                id: doc.id,
                ...data,
                imageUrls
              } as Product;
            })
            .filter(p => p.id !== product.id)
            .slice(0, 4);

        setSuggestedProducts(fetchedProducts);
        setIsLoadingSuggestions(false);
    }, (error) => {
        console.error("Error fetching suggested products:", error);
        setIsLoadingSuggestions(false);
    });

    return () => unsubscribe();
  }, [product]);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      if (!selectedSize || !product.sizes.includes(selectedSize)) {
        setSelectedSize(product.sizes[0]);
      }
    } else if (product && (!product.sizes || product.sizes.length === 0)) {
        setSelectedSize(undefined);
    }
  }, [product, selectedSize]);

  useEffect(() => {
    if (!isCustomizationActive) {
      setCustomization({ name: '', numberTop: '', numberBottom: '' });
    }
  }, [isCustomizationActive]);
  
  const isPromo = product && product.promotionPrice && product.promotionPrice > 0 && product.promotionPrice < product.price;
  const basePrice = isPromo ? product.promotionPrice! : (product ? product.price : 0);
  const customizationCost = isCustomizationActive ? CUSTOMIZATION_COST : 0;
  const currentPrice = (basePrice * quantity) + (customizationCost * quantity);
  const originalPrice = isPromo ? product.price : null;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast({ variant: "destructive", title: "Produit épuisé" });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ variant: "destructive", title: "Veuillez sélectionner une taille" });
      return;
    }
    const finalCustomization = isCustomizationActive ? customization : undefined;
    const finalCustomizationCost = isCustomizationActive ? CUSTOMIZATION_COST : undefined;

    cart.addToCart(product, quantity, selectedSize, finalCustomization, finalCustomizationCost);
    toast({ title: "Produit ajouté au panier!", action: <CheckCircle className="text-green-500" /> });
  };

  const handleCustomizationInputChange = (field: keyof CustomizationData, value: string) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };
  
  const displayImageAiHint = product.imageAiHint || 'product image detail';
  const CategoryIconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons["Default"];
  const Label = ({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className || ''}`}>
      {children}
    </label>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products" className="flex items-center text-sm"><ArrowLeft className="mr-2 h-4 w-4" />Tous les produits</Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl rounded-lg group">
          <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
            <Image src={mainImageUrl} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={displayImageAiHint} onError={(e) => e.currentTarget.src = 'https://placehold.co/600x600.png'} />
            {isPromo && <Badge className="absolute top-2 left-2 bg-red-600 text-white text-base px-3 py-1" variant="destructive">PROMO</Badge>}
            {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Badge variant="destructive" className="text-lg px-4 py-2">ÉPUISÉ</Badge></div>}
          </div>
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="p-2 bg-muted/50 rounded-b-lg">
                <div className="flex gap-2 justify-center">
                    {product.imageUrls.map((url, index) => (
                        <button 
                            key={index} 
                            className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${mainImageUrl === url ? 'border-primary scale-110' : 'border-transparent hover:border-primary/50'}`}
                            onClick={() => setMainImageUrl(url)}
                        >
                            <Image src={url} alt={`Thumbnail ${index + 1}`} fill sizes="64px" className="object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                        </button>
                    ))}
                </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  {product.category && <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5 py-1 px-2.5 text-xs"><CategoryIconComponent className="h-3.5 w-3.5" />{product.category}</Badge>}
                  <h1 className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</h1>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"} className={`text-sm py-1 px-3 ${product.stock > 0 && product.stock <=10 ? 'bg-yellow-500 text-black' : ''}`}>{product.stock > 0 ? `En Stock (${product.stock})` : "Épuisé"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {isPromo ? (
                  <>
                    <p className="text-xl lg:text-2xl text-muted-foreground line-through">{originalPrice?.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-2xl lg:text-3xl font-semibold text-destructive">{basePrice.toLocaleString('fr-FR')} FCFA <Badge variant="destructive" className="ml-2 text-sm">PROMO</Badge></p>
                  </>
                ) : (
                  <p className="text-2xl lg:text-3xl font-semibold text-primary">{basePrice.toLocaleString('fr-FR')} FCFA</p>
                )}
                 {isCustomizationActive && (
                  <p className="text-sm text-green-600 font-medium">+ {CUSTOMIZATION_COST.toLocaleString('fr-FR')} FCFA (Flocage)</p>
                )}
              </div>
              <CardDescription className="text-base text-foreground/80 leading-relaxed">{product.description}</CardDescription>
              <Separator className="my-6" />
              <div className="space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="size" className="text-base font-medium">Taille:</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize} disabled={product.stock === 0}>
                      <SelectTrigger id="size" className="col-span-2 text-base"><SelectValue placeholder="Choisir une taille" /></SelectTrigger>
                      <SelectContent>{product.sizes.map(size => <SelectItem key={size} value={size} className="text-base">{size}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="quantity" className="text-base font-medium">Quantité:</Label>
                  <div className="flex items-center space-x-1 col-span-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || product.stock === 0}><Minus className="h-4 w-4" /></Button>
                    <ShadcnInput id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} className="w-16 text-center text-base h-9" min="1" max={product.stock} disabled={product.stock === 0} />
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock || product.stock === 0}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              
              {product.category === 'Maillots' && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="customization-toggle" checked={isCustomizationActive} onCheckedChange={(checked) => setIsCustomizationActive(checked as boolean)} />
                      <ShadcnLabel htmlFor="customization-toggle" className="text-base font-semibold text-primary flex items-center gap-2 cursor-pointer"><Edit className="h-5 w-5" /> Personnaliser mon maillot (+{CUSTOMIZATION_COST.toLocaleString('fr-FR')} FCFA)</ShadcnLabel>
                    </div>
                    {isCustomizationActive && (
                       <div className="space-y-4 pt-2 animate-in fade-in-50">
                          <div>
                            <ShadcnLabel htmlFor="custom-name">Nom en haut du maillot (max 12 caractères)</ShadcnLabel>
                            <ShadcnInput id="custom-name" placeholder="Ex: MANÉ" maxLength={12} value={customization.name} onChange={(e) => handleCustomizationInputChange('name', e.target.value.toUpperCase())} />
                          </div>
                          <div>
                            <ShadcnLabel htmlFor="custom-number-top">Numéro au centre (max 2 chiffres)</ShadcnLabel>
                            <ShadcnInput id="custom-number-top" type="text" placeholder="Ex: 10" maxLength={2} value={customization.numberTop} onChange={(e) => handleCustomizationInputChange('numberTop', e.target.value.replace(/[^0-9]/g, ''))} />
                          </div>
                          <div>
                            <ShadcnLabel htmlFor="custom-number-bottom">Texte supplémentaire en bas (facultatif)</ShadcnLabel>
                            <ShadcnInput id="custom-number-bottom" type="text" placeholder="Ex: BARÇA" maxLength={12} value={customization.numberBottom} onChange={(e) => handleCustomizationInputChange('numberBottom', e.target.value.toUpperCase())} />
                          </div>
                       </div>
                    )}
                  </div>
                </>
              )}

              <div className='text-2xl font-bold mt-4'>Total: {currentPrice.toLocaleString('fr-FR')} FCFA</div>


              <Button size="lg" className="w-full mt-8 text-lg py-3 bg-primary hover:bg-primary/90" onClick={handleAddToCart} disabled={product.stock === 0}><ShoppingCart className="mr-2 h-5 w-5" />Ajouter au Panier</Button>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /><span>Produit authentique garanti</span></div>
              <div className="flex items-center text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 mr-2 text-blue-500" /><span>Paiement sécurisé</span></div>
              <div className="flex items-center text-sm text-muted-foreground"><Tag className="h-5 w-5 mr-2 text-primary" /><span>Meilleur prix & Qualité</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator className="my-12" />
      <ProductReviews reviews={reviews} isLoading={isLoadingReviews} />
      <Separator className="my-12" />
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Vous aimerez aussi</h2>
        {isLoadingSuggestions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-48 md:h-60 w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        ) : suggestedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {suggestedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Aucun produit similaire trouvé.</p>
        )}
      </section>
    </div>
  );
}
