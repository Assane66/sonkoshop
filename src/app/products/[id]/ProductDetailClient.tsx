'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input as ShadcnInput } from '@/components/ui/input';
import { ShoppingCart, CheckCircle, ShieldCheck, Tag, Minus, Plus, ArrowLeft } from 'lucide-react';
import type { Product, Review } from '@/types';
import { categoryIcons } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import ProductReviews from '@/components/ProductReviews';

// Prix du flocage en FCFA
const FLOCAGE_PRICE = 2000;

export default function ProductDetailClient({ initialProduct }: { initialProduct: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const cart = useCart();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  // --- FLOCAGE STATES ---
  const [flocageEnabled, setFlocageEnabled] = useState(false);
  const [flocageNom, setFlocageNom] = useState('');
  const [flocageNumero, setFlocageNumero] = useState('');
  const [flocageTexteBas, setFlocageTexteBas] = useState('');

  // --- IMAGE / INIT ---
  useEffect(() => {
    setMainImageUrl(product.imageUrls?.[0] || 'https://placehold.co/600x600.png');
  }, [product.imageUrls]);

  // --- PRODUCT REAL-TIME LISTENER (safe: listen by id only) ---
  useEffect(() => {
    if (!product?.id) return;
    const productDocRef = doc(db, 'products', product.id);
    const unsubscribe = onSnapshot(productDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let imageUrls: string[] = [];
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          imageUrls = data.imageUrls;
        } else if (data.imageUrl && typeof data.imageUrl === 'string') {
          imageUrls = [data.imageUrl];
        }
        const updatedProduct = { id: docSnap.id, ...data, imageUrls } as Product;
        setProduct(updatedProduct);
      }
    }, (err) => {
      console.error('Product onSnapshot error', err);
    });

    return () => unsubscribe();
  }, [product.id]);

  // --- REVIEWS LISTENER ---
  useEffect(() => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    const reviewsCollection = collection(db, 'reviews');
    const qReviews = query(reviewsCollection, where('productId', '==', product.id), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      setIsLoadingReviews(false);
    }, (err) => {
      console.error('Reviews onSnapshot error', err);
      setIsLoadingReviews(false);
    });

    return () => unsubscribe();
  }, [product.id]);

  // --- SUGGESTED PRODUCTS: run only when category (string) changes ---
  useEffect(() => {
    if (!product?.category) {
      setSuggestedProducts([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('category', '==', product.category), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts: Product[] = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          let imageUrls: string[] = [];
          if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
            imageUrls = data.imageUrls;
          } else if (data.imageUrl && typeof data.imageUrl === 'string') {
            imageUrls = [data.imageUrl];
          }
          return { id: docSnap.id, ...data, imageUrls } as Product;
        })
        .filter(p => p.id !== product.id)
        .slice(0, 4);

      setSuggestedProducts(fetchedProducts);
      setIsLoadingSuggestions(false);
    }, (err) => {
      console.error('Suggested products onSnapshot error', err);
      setIsLoadingSuggestions(false);
    });

    return () => unsubscribe();
  }, [product.category]);

  // --- Selected size: initialize only on product.id change (avoid overwriting user selection) ---
  useEffect(() => {
    if (!product) return;
    if (!product.sizes || product.sizes.length === 0) {
      setSelectedSize(undefined);
      return;
    }
    // set default size only when product changes (id)
    setSelectedSize(prev => {
      // keep existing if still valid
      if (prev && product.sizes.includes(prev)) return prev;
      return product.sizes[0];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // --- Price computation (inclut flocage si activé) ---
  const isPromo = product && product.promotionPrice && product.promotionPrice > 0 && product.promotionPrice < product.price;
  const basePrice = isPromo ? product.promotionPrice! : (product ? product.price : 0);
  const flocageExtra = flocageEnabled ? FLOCAGE_PRICE : 0;
  const displayPrice = basePrice + flocageExtra;
  const originalPrice = isPromo ? product.price : null;

  // --- Handlers ---
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (product.stock === 0) {
      toast({ variant: 'destructive', title: 'Produit épuisé' });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ variant: 'destructive', title: 'Veuillez sélectionner une taille' });
      return;
    }

    // Validation pour le flocage : nom et numéro requis si activé
    if (flocageEnabled) {
      if (!flocageNom.trim() || !flocageNumero.trim()) {
        toast({ variant: 'destructive', title: 'Flocage incomplet', description: 'Veuillez renseigner le nom et le numéro pour le flocage.' });
        return;
      }
    }

    // Crée un objet produit enrichi avec metadata flocage
    const productWithMeta: Product & { metadata?: any } = {
      ...product,
      // on peut ajouter un champ price pour le panier (si ton panier utilise product.price)
      price: basePrice + flocageExtra,
      metadata: {
        ...(product as any).metadata, // conserve metadata existant si présent
        flocage: flocageEnabled ? {
          nom: flocageNom.trim().toUpperCase(),
          numero: flocageNumero.trim(),
          texteBas: flocageTexteBas.trim() || null,
          price: flocageExtra
        } : null,
      }
    };

    // Utilise la méthode de ton contexte panier. J'appelle addToCart(product, qty, size)
    // Si ton contexte a une autre signature, adapte ici.
    try {
      if (typeof cart.addToCart === 'function') {
        cart.addToCart(productWithMeta as any, quantity, selectedSize);
      } else {
        console.warn('Cart context: no known add function. Inspect cart object:', cart);
        toast({ variant: 'destructive', title: 'Erreur panier', description: 'Action non supportée par le contexte panier.' });
        return;
      }

      toast({
        title: 'Produit ajouté au panier !',
        action: <CheckCircle className="text-green-500" />
      });
    } catch (err) {
      console.error('Error adding to cart', err);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d’ajouter le produit au panier.' });
    }
  }, [product, selectedSize, quantity, flocageEnabled, flocageNom, flocageNumero, flocageTexteBas, basePrice, flocageExtra, cart, toast]);

  // Handler image fallback (Next Image - can't mutate event target src)
  const handleImageError = () => {
    setMainImageUrl('https://placehold.co/600x600.png');
  };

  const CategoryIconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons['Default'];

  // Small Label helper
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
            {/* Next/Image onError uses state fallback */}
            <Image
              src={mainImageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
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
                    type="button"
                  >
                    <Image src={url} alt={`Thumbnail ${index + 1}`} fill sizes="64px" className="object-cover" onError={() => { /* hide broken thumbnail */ }} />
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
                <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className={`text-sm py-1 px-3 ${product.stock > 0 && product.stock <= 10 ? 'bg-yellow-500 text-black' : ''}`}>{product.stock > 0 ? `En Stock (${product.stock})` : 'Épuisé'}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                {isPromo ? (
                  <>
                    <p className="text-xl lg:text-2xl text-muted-foreground line-through">{originalPrice?.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-2xl lg:text-3xl font-semibold text-destructive">{displayPrice.toLocaleString('fr-FR')} FCFA <Badge variant="destructive" className="ml-2 text-sm">PROMO</Badge></p>
                  </>
                ) : (
                  <p className="text-2xl lg:text-3xl font-semibold text-primary">{displayPrice.toLocaleString('fr-FR')} FCFA</p>
                )}
              </div>

              <div className="text-base text-foreground/80 leading-relaxed mb-4">{product.description}</div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="size" className="text-base font-medium">Taille:</Label>
                    <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v)} disabled={product.stock === 0}>
                      <SelectTrigger id="size" className="col-span-2 text-base"><SelectValue placeholder="Choisir une taille" /></SelectTrigger>
                      <SelectContent>{product.sizes.map(size => <SelectItem key={size} value={size} className="text-base">{size}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="quantity" className="text-base font-medium">Quantité:</Label>
                  <div className="flex items-center space-x-1 col-span-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || product.stock === 0}><Minus className="h-4 w-4" /></Button>
                    <ShadcnInput id="quantity" type="number" value={quantity} onChange={(e) => {
                      const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
                      setQuantity(val);
                    }} className="w-16 text-center text-base h-9" min={1} max={product.stock} disabled={product.stock === 0} />
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock || product.stock === 0}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>

              {/* ---- FLOCAGE ---- */}
              {product.category && product.category.toLowerCase().includes('maillot') && (
                <div className="mt-6 p-4 border rounded-md bg-muted/50">
                  <p className="font-medium mb-2">Option Flocage</p>
                  <div className="flex items-center gap-4 text-sm">
                    <label className="inline-flex items-center">
                      <input type="radio" name="flocage" checked={!flocageEnabled} onChange={() => setFlocageEnabled(false)} className="mr-2" />
                      Sans flocage
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="flocage" checked={flocageEnabled} onChange={() => setFlocageEnabled(true)} className="mr-2" />
                      Avec flocage (+{FLOCAGE_PRICE.toLocaleString('fr-FR')} FCFA)
                    </label>
                  </div>

                  {flocageEnabled && (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <input value={flocageNom} onChange={(e) => setFlocageNom(e.target.value)} placeholder="Nom (ex: DIOP)" className="input h-9 px-3 rounded border" />
                      <input value={flocageNumero} onChange={(e) => setFlocageNumero(e.target.value)} placeholder="Numéro (ex: 10)" className="input h-9 px-3 rounded border" />
                      <input value={flocageTexteBas} onChange={(e) => setFlocageTexteBas(e.target.value)} placeholder="Texte bas (optionnel)" className="input h-9 px-3 rounded border" />
                      <p className="text-xs text-muted-foreground">Le nom et le numéro sont requis pour le flocage.</p>
                    </div>
                  )}
                </div>
              )}

              <Button size="lg" className="w-full mt-8 text-lg py-3 bg-primary hover:bg-primary/90" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />Ajouter au Panier
              </Button>
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
