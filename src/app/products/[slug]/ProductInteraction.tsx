
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Minus, Plus, Edit, CheckCircle } from 'lucide-react';
import type { Product, CustomizationData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface ProductInteractionProps {
  product: Product;
}

const CUSTOMIZATION_COST = 2000;

export default function ProductInteraction({ product }: ProductInteractionProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [mainImageUrl, setMainImageUrl] = useState(product.imageUrls?.[0] || 'https://placehold.co/600x600.png');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  
  // State for customization
  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  const [customizationName, setCustomizationName] = useState('');
  const [customizationNumber, setCustomizationNumber] = useState('');
  const [customizationBottomText, setCustomizationBottomText] = useState('');

  const isPromo = product.promotionPrice && product.promotionPrice > 0 && product.promotionPrice < product.price;
  const basePrice = isPromo ? product.promotionPrice! : product.price;
  const originalPrice = isPromo ? product.price : null;
  
  const customizationCost = customizationEnabled ? CUSTOMIZATION_COST : 0;
  const totalCartPrice = (basePrice * quantity) + (customizationCost * quantity);

  const handleAddToCart = () => {
    // For now, this button will not be fully functional for customization
    // as per the user's request to focus only on the UI first.
    // We can add the full logic later.
    if (product.stock === 0) {
      toast({ variant: "destructive", title: "Produit épuisé" });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ variant: "destructive", title: "Veuillez sélectionner une taille" });
      return;
    }
    
    let customizationData: CustomizationData | undefined = undefined;
    if (customizationEnabled) {
      if (!customizationName || !customizationNumber) {
        toast({ variant: "destructive", title: "Champs de flocage requis", description: "Veuillez entrer un nom et un numéro pour la personnalisation." });
        return;
      }
      customizationData = {
        name: customizationName,
        number: customizationNumber,
        bottomText: customizationBottomText,
      };
    }
    
    // We call the original addToCart but it won't handle the customization yet.
    // This is fine for this step.
    addToCart(product, quantity, selectedSize, customizationData, customizationCost);
    toast({ title: "Produit ajouté au panier!", action: <CheckCircle className="text-green-500" /> });
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-lg group">
        <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
          <Image src={mainImageUrl} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={product.imageAiHint || 'product image detail'} onError={(e) => e.currentTarget.src = 'https://placehold.co/600x600.png'} />
          {isPromo && <Badge className="absolute top-2 left-2 bg-red-600 text-white text-base px-3 py-1" variant="destructive">PROMO</Badge>}
          {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Badge variant="destructive" className="text-lg px-4 py-2">ÉPUISÉ</Badge></div>}
        </div>
        {product.imageUrls && product.imageUrls.length > 1 && (
          <div className="p-2 bg-muted/50 rounded-b-lg">
            <div className="flex gap-2 justify-center">
              {product.imageUrls.map((url, index) => (
                <button key={index} className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${mainImageUrl === url ? 'border-primary scale-110' : 'border-transparent hover:border-primary/50'}`} onClick={() => setMainImageUrl(url)}>
                  <Image src={url} alt={`Thumbnail ${index + 1}`} fill sizes="64px" className="object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      <Card className="shadow-lg rounded-lg">
        <CardContent className="p-6 space-y-4">
            <div className="mb-4">
                {isPromo ? (
                    <>
                    <p className="text-xl lg:text-2xl text-muted-foreground line-through">{originalPrice?.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-2xl lg:text-3xl font-semibold text-destructive">{basePrice.toLocaleString('fr-FR')} FCFA <Badge variant="destructive" className="ml-2 text-sm">PROMO</Badge></p>
                    </>
                ) : (
                    <p className="text-2xl lg:text-3xl font-semibold text-primary">{basePrice.toLocaleString('fr-FR')} FCFA</p>
                )}
            </div>

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
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} className="w-16 text-center text-base h-9" min="1" max={product.stock} disabled={product.stock === 0} />
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock || product.stock === 0}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* --- Customization Section --- */}
            {product.category === 'Maillots' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Flocage</h3>
                <RadioGroup value={customizationEnabled ? "avec" : "sans"} onValueChange={(value) => setCustomizationEnabled(value === "avec")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sans" id="sans-flocage" />
                    <Label htmlFor="sans-flocage">Sans flocage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="avec" id="avec-flocage" />
                    <Label htmlFor="avec-flocage">Avec flocage (+{CUSTOMIZATION_COST.toLocaleString('fr-FR')} FCFA)</Label>
                  </div>
                </RadioGroup>

                {customizationEnabled && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4 animate-accordion-down">
                    <div>
                      <Label htmlFor="flocage-nom">Nom (haut du maillot)</Label>
                      <Input id="flocage-nom" value={customizationName} onChange={(e) => setCustomizationName(e.target.value)} placeholder="Ex: GASSAMA" required/>
                    </div>
                     <div>
                      <Label htmlFor="flocage-numero">Numéro (centre)</Label>
                      <Input id="flocage-numero" type="number" value={customizationNumber} onChange={(e) => setCustomizationNumber(e.target.value)} placeholder="Ex: 10" required />
                    </div>
                     <div>
                      <Label htmlFor="flocage-bas">Texte en bas (optionnel)</Label>
                      <Input id="flocage-bas" value={customizationBottomText} onChange={(e) => setCustomizationBottomText(e.target.value)} placeholder="Ex: El Hadj"/>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Separator />

            <div className='text-2xl font-bold mt-4'>Total: {totalCartPrice.toLocaleString('fr-FR')} FCFA</div>

            <Button size="lg" className="w-full mt-8 text-lg py-3 bg-primary hover:bg-primary/90" onClick={handleAddToCart} disabled={product.stock === 0}><ShoppingCart className="mr-2 h-5 w-5" />Ajouter au Panier</Button>
        </CardContent>
      </Card>
    </div>
  );
}
