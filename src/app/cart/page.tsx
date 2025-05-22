
'use client';

import { useCart, type CartItem } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, XCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; // For quantity input in cart

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

  const handleRemoveItem = (productId: string, size?: string) => {
    removeFromCart(productId, size);
    toast({ title: "Produit retiré", description: "Le produit a été retiré de votre panier." });
  };

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    const quantityVal = Number(newQuantity);
    if (isNaN(quantityVal) || quantityVal < 1) {
      if (quantityVal < 1) {
        handleRemoveItem(item.id, item.selectedSize);
        return;
      }
      updateQuantity(item.id, 1, item.selectedSize);

    } else if (quantityVal > item.stock) {
      updateQuantity(item.id, item.stock, item.selectedSize);
      toast({ variant: "destructive", title: "Stock insuffisant", description: `Seulement ${item.stock} unités disponibles.`});
    }
    else {
      updateQuantity(item.id, quantityVal, item.selectedSize);
    }
  };
  
  const totalPrice = getCartTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-primary mb-6" />
        <h1 className="text-3xl font-semibold mb-4">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-8">
          Parcourez nos produits et ajoutez vos articles préférés.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link href="/products">Commencer vos achats</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Votre Panier</h1>
        {cartItems.length > 0 && (
            <Button variant="outline" onClick={() => { clearCart(); toast({title: "Panier vidé"})}} className="text-destructive hover:text-destructive border-destructive hover:border-destructive/80">
                <XCircle className="mr-2 h-4 w-4" /> Vider le panier
            </Button>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={`${item.id}-${item.selectedSize || 'default'}`} className="flex flex-col sm:flex-row items-center p-4 shadow-md gap-4">
              <div className="relative w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="100px"
                  className="rounded object-cover"
                  data-ai-hint={item.imageAiHint || 'product image cart'}
                />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                {item.selectedSize && <p className="text-sm text-muted-foreground">Taille: {item.selectedSize}</p>}
                <p className="text-sm text-primary font-medium">{item.price.toLocaleString('fr-FR')} FCFA l'unité</p>
                 <p className="text-md font-semibold mt-1">Total: {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="flex items-center space-x-2 my-2 sm:my-0">
                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1 && item.stock === 0}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value, 10))}
                    className="w-14 text-center h-9"
                    min="1"
                    max={item.stock}
                  />
                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, item.selectedSize)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Retirer</span>
              </Button>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24"> {/* Sticky summary */}
            <CardHeader>
              <CardTitle className="text-xl">Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} articles)</span>
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-primary">Gratuite</span> {/* Ou à calculer */}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Général</span>
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/checkout">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Passer à la caisse
                </Link>
              </Button>
               <Button asChild variant="outline" className="w-full">
                <Link href="/products">Continuer les achats</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
