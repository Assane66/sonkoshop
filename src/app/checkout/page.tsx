
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Loader2 } from 'lucide-react'; 
import Image from 'next/image';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, OrderStatus, CustomerInfo, OrderItem } from '@/types'; 

const checkoutFormSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (minimum 3 caractères)."),
  address: z.string().min(1, "L'adresse de livraison est requise."),
  phone: z.string().regex(/^(70|75|76|77|78)\d{7}$/, "Le numéro de téléphone doit être un numéro sénégalais valide (ex: 771234567)."),
  paymentMethod: z.enum(['cod', 'wave'], {
    required_error: "Vous devez sélectionner une méthode de paiement."
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Récupérer depuis les paramètres admin plus tard si nécessaire
const WAVE_PAYMENT_BASE_URL = 'https://pay.wave.com/m/M_pIXmQ2smGxRM/c/sn/'; 

export default function CheckoutPage() {
  const { cartItems, getCartTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      phone: '',
      paymentMethod: undefined,
    },
  });

  const paymentMethod = form.watch('paymentMethod');
  const totalPrice = getCartTotalPrice();

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      if (typeof window !== 'undefined') {
        router.push('/cart');
      }
    }
  }, [cartItems, isProcessing, router]);


  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    
    const orderItems: OrderItem[] = cartItems.map(item => {
      const orderItem: OrderItem = {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      };
      if (item.selectedSize) {
        orderItem.selectedSize = item.selectedSize;
      }
      // Ensure imageUrl is either a valid string or not present
      if (item.imageUrl && item.imageUrl.trim() !== '') {
        orderItem.imageUrl = item.imageUrl;
      }
      return orderItem;
    });

    const customerInfo: CustomerInfo = {
      fullName: data.fullName,
      address: data.address, 
      phone: data.phone,
    };

    const orderData: Omit<Order, 'id'> = {
        customerInfo,
        items: orderItems,
        totalAmount: totalPrice,
        status: OrderStatus.Pending, // Default status
        orderDate: serverTimestamp(), // Firestore server timestamp
        paymentMethod: data.paymentMethod,
        shippingAddress: data.address,
    };

    if (data.paymentMethod === 'cod') {
      try {
        console.log("CheckoutPage: Attempting to save COD order to Firestore:", orderData);
        const docRef = await addDoc(collection(db, "orders"), orderData);
        console.log("CheckoutPage: COD Order saved with ID:", docRef.id);
        toast({
          title: "Commande confirmée!",
          description: "Votre commande a été enregistrée. Nous vous contacterons bientôt.",
        });
        clearCart();
        router.push(`/checkout/success?method=cod&orderId=${docRef.id}`);
      } catch (error) {
        console.error("CheckoutPage: Error saving COD order to Firestore:", error);
        let errorMessage = "Impossible d'enregistrer votre commande. Veuillez réessayer.";
        if (error instanceof Error && error.message.includes("permission-denied")) {
            errorMessage = "Erreur de permission. Veuillez contacter le support.";
        } else if (error instanceof Error) {
            errorMessage = `Erreur: ${error.message}. Veuillez contacter le support.`;
        }
        toast({
          variant: "destructive",
          title: "Échec de la commande",
          description: errorMessage,
        });
      } finally {
        setIsProcessing(false);
      }

    } else if (data.paymentMethod === 'wave') {
      if (totalPrice <= 0) {
        toast({
          variant: "destructive",
          title: "Erreur de montant",
          description: "Le total de la commande doit être supérieur à zéro pour payer avec Wave.",
        });
        setIsProcessing(false);
        return;
      }
      
      // For Wave, we might still want to save the order as 'Pending' before redirecting
      // Or handle confirmation via a webhook after payment success
      // For now, let's save it as pending then redirect
      try {
        console.log("CheckoutPage: Attempting to save Wave order (pending) to Firestore:", orderData);
        const docRef = await addDoc(collection(db, "orders"), {...orderData, status: OrderStatus.Pending}); // Explicitly pending
        console.log("CheckoutPage: Wave Order (pending) saved with ID:", docRef.id);
        
        toast({
          title: "Redirection vers Wave...",
          description: "Vous allez être redirigé pour compléter votre paiement.",
        });
        
        const wavePaymentUrl = `${WAVE_PAYMENT_BASE_URL}?amount=${totalPrice}`;
        // It's often better to clear cart after successful payment confirmation via webhook
        // But for simplicity now, we clear it optimistically or after redirect.
        clearCart(); 
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.href = wavePaymentUrl;
        }, 1500);
        // setIsProcessing(false) might not be hit if redirect happens quickly

      } catch (error) {
        console.error("CheckoutPage: Error saving Wave order to Firestore before redirect:", error);
        toast({
          variant: "destructive",
          title: "Échec de la préparation de la commande Wave",
          description: "Impossible de préparer votre commande pour le paiement Wave. Veuillez réessayer.",
        });
        setIsProcessing(false);
      }
    }
  };

  if (cartItems.length === 0 && !isProcessing) {
     // This check helps prevent users from landing on checkout with an empty cart
    // It will redirect if the cart becomes empty (e.g., after a successful order if not redirected yet)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Votre panier est vide ou la page est en cours de redirection...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Finaliser la Commande</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de Livraison et Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom Complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Modou Fall" {...field} disabled={isProcessing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse de Livraison</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cité Keur Gorgui, Villa 22B, Dakar" {...field} disabled={isProcessing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de Téléphone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Ex: 771234567" {...field} disabled={isProcessing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Méthode de Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                            disabled={isProcessing}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="cod" disabled={isProcessing} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center text-base cursor-pointer">
                                <Truck className="mr-3 h-6 w-6 text-primary" />
                                Payer à la livraison
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="wave" disabled={isProcessing} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center text-base cursor-pointer">
                                 <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wave_Logo.svg/1200px-Wave_Logo.svg.png" alt="Wave Logo" width={24} height={24} className="mr-3" data-ai-hint="wave logo" />
                                Payer avec Wave
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isProcessing || !paymentMethod || cartItems.length === 0 || (paymentMethod === 'cod' && !form.formState.isValid) }
              >
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : ''}
                {isProcessing ? 'Traitement...' : (paymentMethod === 'wave' ? 'Procéder au paiement Wave' : 'Confirmer la Commande (Paiement à la livraison)')}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Résumé de votre commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.selectedSize || 'default'}`} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.name} (x{item.quantity})</p>
                    {item.selectedSize && <p className="text-xs text-muted-foreground">Taille: {item.selectedSize}</p>}
                  </div>
                  <p>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-primary">Gratuite</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Général</span>
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
