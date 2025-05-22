
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input as ShadcnInput } from '@/components/ui/input'; // Renamed to avoid conflict
import { ShoppingCart, Zap, Star, CheckCircle, ShieldCheck, Tag, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCategory } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext'; // Import useCart

// Mock data - in a real app, this would be fetched based on the ID
const allMockProducts: Product[] = [
  { id: '1', name: 'Maillot Sénégal Authentique 2024', description: 'Portez les couleurs des Lions de la Teranga avec fierté. Ce maillot authentique est fabriqué avec un tissu respirant haute performance, conçu pour un confort optimal sur et en dehors du terrain. Design officiel avec détails premium.', price: 45000, category: ProductCategory.Maillots, imageUrl: 'https://placehold.co/600x600.png', stock: 50, sizes: ['S', 'M', 'L', 'XL'], featured: true, imageAiHint: 'senegal football jersey' },
  { id: '2', name: 'Chaussures de Foot "Vitesse Ultime"', description: 'Dominez le terrain avec ces chaussures de football légères et réactives. Conçues pour des accélérations explosives et des changements de direction rapides. Crampons optimisés pour une adhérence maximale.', price: 62000, category: ProductCategory.Chaussures, imageUrl: 'https://placehold.co/600x600.png', stock: 30, sizes: ['40', '41', '42', '43', '44'], imageAiHint: 'soccer cleats dynamic' },
  { id: '3', name: 'Pantalon d\'Entraînement Pro', description: 'Restez au chaud et performant avec ce pantalon d\'entraînement professionnel. Tissu extensible offrant une grande liberté de mouvement et technologie de gestion de l\'humidité pour vous garder au sec.', price: 28000, category: ProductCategory.Pantalons, imageUrl: 'https://placehold.co/600x600.png', stock: 40, sizes: ['S', 'M', 'L'], imageAiHint: 'training pants athlete' },
  { id: '4', name: 'Ensemble Sportif Enfant "Champion"', description: 'L\'ensemble parfait pour les jeunes champions en herbe. Comprend un maillot et un short assortis, fabriqués dans un tissu doux et résistant. Idéal pour le sport et les loisirs.', price: 22000, category: ProductCategory.Enfants, imageUrl: 'https://placehold.co/600x600.png', stock: 25, sizes: ['6A', '8A', '10A', '12A'], imageAiHint: 'kids sports kit' },
  { id: '5', name: 'Gants de Gardien "Muraille"', description: 'Devenez un mur infranchissable avec ces gants de gardien professionnels. Paume en latex offrant une adhérence exceptionnelle par tous les temps et protection renforcée des doigts.', price: 35000, category: ProductCategory.Gardiens, imageUrl: 'https://placehold.co/600x600.png', stock: 15, sizes: ['8', '9', '10', '11'], imageAiHint: 'goalkeeper gloves' },
  { id: '6', name: 'Sac de Sport "Expédition"', description: 'Transportez tout votre équipement avec style et facilité grâce à ce sac de sport spacieux et durable. Multiples compartiments, y compris un espace ventilé pour les chaussures.', price: 18000, category: ProductCategory.EquipementsSportifs, imageUrl: 'https://placehold.co/600x600.png', stock: 30, imageAiHint: 'sports duffel bag' },
  { id: '7', name: 'Veste de Mode Sportive Urbaine', description: 'Alliez style et confort avec cette veste tendance au look athleisure. Parfaite pour un style de vie actif, elle offre une protection légère contre les éléments.', price: 55000, category: ProductCategory.Modes, imageUrl: 'https://placehold.co/600x600.png', stock: 20, sizes: ['S', 'M', 'L', 'XL'], imageAiHint: 'sporty fashion jacket' },
];


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  // const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined); // Color selection removed
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const cart = useCart(); // Use cart context

  useEffect(() => {
    const foundProduct = allMockProducts.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      // Color selection removed
      // if (foundProduct.colors && foundProduct.colors.length > 0) {
      //   setSelectedColor(foundProduct.colors[0]);
      // }
      setQuantity(1); // Reset quantity when product changes
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Produit épuisé",
        description: "Ce produit n'est actuellement pas en stock.",
      });
      return;
    }
     if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Veuillez sélectionner une taille",
        description: "Une taille est requise pour ce produit.",
      });
      return;
    }
    
    cart.addToCart(product, quantity, selectedSize);
    toast({
      title: "Produit ajouté au panier!",
      description: `${product.name} (Qté: ${quantity}${selectedSize ? ', Taille: ' + selectedSize : ''}) a été ajouté à votre panier.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Zap className="mx-auto h-24 w-24 text-primary mb-4 animate-pulse" />
        <h1 className="text-2xl font-semibold text-muted-foreground">Chargement du produit...</h1>
        <p className="text-muted-foreground">Veuillez patienter pendant que nous récupérons les détails.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl overflow-hidden">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageAiHint || 'product image detail'}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">{product.category}</Badge>
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</CardTitle>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-sm py-1 px-3">
                  {product.stock > 0 ? `En Stock (${product.stock})` : "Épuisé"}
                </Badge>
              </div>
               <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(12 avis)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl lg:text-3xl font-semibold text-accent mb-4">
                {product.price.toLocaleString('fr-FR')} FCFA
              </p>
              <CardDescription className="text-base text-foreground/80 leading-relaxed">
                {product.description}
              </CardDescription>
              
              <Separator className="my-6" />

              <div className="space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="size" className="text-base font-medium">Taille:</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger id="size" className="col-span-2 text-base">
                        <SelectValue placeholder="Choisir une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map(size => (
                          <SelectItem key={size} value={size} className="text-base">{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color select removed */}
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="quantity" className="text-base font-medium">Quantité:</Label>
                  <div className="flex items-center space-x-1 col-span-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || product.stock === 0}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <ShadcnInput
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) {
                          setQuantity(1);
                        } else {
                          setQuantity(Math.max(1, Math.min(product.stock === 0 ? 1 : product.stock, val)));
                        }
                      }}
                      className="w-16 text-center text-base"
                      min="1"
                      max={product.stock === 0 ? 1 : product.stock}
                      disabled={product.stock === 0}
                    />
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock === 0 ? 1 : product.stock, q + 1))} disabled={quantity >= product.stock || product.stock === 0}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full mt-8 text-lg py-3 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au Panier
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Produit authentique garanti</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="h-5 w-5 mr-2 text-primary" />
                    <span>Meilleur prix & Qualité</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* TODO: Add related products section or reviews section */}
    </div>
  );
}

// Helper component that might be defined elsewhere
const Label = ({ htmlFor, children, className }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

// Input component removed as ShadcnInput is used directly from ui/input

