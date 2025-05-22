
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Zap, Star, CheckCircle, ShieldCheck, Tag } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCategory } from '@/types'; // Assuming ProductCategory is exported from types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would be fetched based on the ID
const allMockProducts: Product[] = [
  { id: '1', name: 'Maillot Sénégal Authentique 2024', description: 'Portez les couleurs des Lions de la Teranga avec fierté. Ce maillot authentique est fabriqué avec un tissu respirant haute performance, conçu pour un confort optimal sur et en dehors du terrain. Design officiel avec détails premium.', price: 45000, category: ProductCategory.Maillots, imageUrl: 'https://placehold.co/600x600.png', stock: 50, sizes: ['S', 'M', 'L', 'XL'], colors: ['Vert', 'Jaune', 'Blanc'], featured: true, imageAiHint: 'senegal football jersey' },
  { id: '2', name: 'Chaussures de Foot "Vitesse Ultime"', description: 'Dominez le terrain avec ces chaussures de football légères et réactives. Conçues pour des accélérations explosives et des changements de direction rapides. Crampons optimisés pour une adhérence maximale.', price: 62000, category: ProductCategory.Chaussures, imageUrl: 'https://placehold.co/600x600.png', stock: 30, sizes: ['40', '41', '42', '43', '44'], colors: ['Noir', 'Blanc', 'Rouge Fluo'], imageAiHint: 'soccer cleats dynamic' },
  { id: '3', name: 'Pantalon d\'Entraînement Pro', description: 'Restez au chaud et performant avec ce pantalon d\'entraînement professionnel. Tissu extensible offrant une grande liberté de mouvement et technologie de gestion de l\'humidité pour vous garder au sec.', price: 28000, category: ProductCategory.Pantalons, imageUrl: 'https://placehold.co/600x600.png', stock: 40, sizes: ['S', 'M', 'L'], colors: ['Gris Foncé', 'Noir'], imageAiHint: 'training pants athlete' },
  { id: '4', name: 'Ensemble Sportif Enfant "Champion"', description: 'L\'ensemble parfait pour les jeunes champions en herbe. Comprend un maillot et un short assortis, fabriqués dans un tissu doux et résistant. Idéal pour le sport et les loisirs.', price: 22000, category: ProductCategory.Enfants, imageUrl: 'https://placehold.co/600x600.png', stock: 25, sizes: ['6A', '8A', '10A', '12A'], colors: ['Bleu Royal', 'Rouge Vif'], imageAiHint: 'kids sports kit' },
  { id: '5', name: 'Gants de Gardien "Muraille"', description: 'Devenez un mur infranchissable avec ces gants de gardien professionnels. Paume en latex offrant une adhérence exceptionnelle par tous les temps et protection renforcée des doigts.', price: 35000, category: ProductCategory.Gardiens, imageUrl: 'https://placehold.co/600x600.png', stock: 15, sizes: ['8', '9', '10', '11'], colors: ['Noir Intense', 'Blanc Électrique'], imageAiHint: 'goalkeeper gloves' },
  { id: '6', name: 'Sac de Sport "Expédition"', description: 'Transportez tout votre équipement avec style et facilité grâce à ce sac de sport spacieux et durable. Multiples compartiments, y compris un espace ventilé pour les chaussures.', price: 18000, category: ProductCategory.EquipementsSportifs, imageUrl: 'https://placehold.co/600x600.png', stock: 30, imageAiHint: 'sports duffel bag' },
  { id: '7', name: 'Veste de Mode Sportive Urbaine', description: 'Alliez style et confort avec cette veste tendance au look athleisure. Parfaite pour un style de vie actif, elle offre une protection légère contre les éléments.', price: 55000, category: ProductCategory.Modes, imageUrl: 'https://placehold.co/600x600.png', stock: 20, sizes: ['S', 'M', 'L', 'XL'], colors: ['Noir Urbain', 'Kaki Camo', 'Gris Chiné'], imageAiHint: 'sporty fashion jacket' },
];


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch product details from an API using params.id
    const foundProduct = allMockProducts.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      if (foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    // Add to cart logic here
    console.log({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      quantity,
      price: product.price,
    });
    toast({
      title: "Produit ajouté au panier!",
      description: `${product.name} (Qté: ${quantity}) a été ajouté à votre panier.`,
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

                {product.colors && product.colors.length > 0 && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="color" className="text-base font-medium">Couleur:</Label>
                     <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger id="color" className="col-span-2 text-base">
                        <SelectValue placeholder="Choisir une couleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.colors.map(color => (
                          <SelectItem key={color} value={color} className="text-base">{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="quantity" className="text-base font-medium">Quantité:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="col-span-2 text-base"
                    disabled={product.stock === 0}
                  />
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

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';
