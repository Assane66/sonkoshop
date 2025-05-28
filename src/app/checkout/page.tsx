
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
  paymentMethod: z.enum(['cod'], {
    required_error: "Vous devez sélectionner une méthode de paiement."
  }).default('cod'),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

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
      paymentMethod: 'cod',
    },
  });

  const totalPrice = getCartTotalPrice();

  useEffect(() => {
    let currentPath = '';
    if (typeof window !== 'undefined') {
      currentPath = window.location.pathname;
    }
    console.log("CheckoutPage: useEffect triggered. cartItems.length =", cartItems.length, "isProcessing =", isProcessing, "pathname =", currentPath);

    if (cartItems.length === 0) {
      if (!isProcessing) {
        if (typeof window !== 'undefined' && !currentPath.includes('/checkout/success')) {
          console.log("CheckoutPage: Cart is empty AND NOT processing, redirecting to /cart");
          router.push('/cart');
        } else {
          console.log("CheckoutPage: Cart is empty AND NOT processing, but on success page or window undefined, no redirect to /cart.");
        }
      } else {
        console.log("CheckoutPage: Cart is empty BUT IS PROCESSING. Waiting for processing to finish.");
      }
    } else {
      console.log("CheckoutPage: Cart is NOT empty. No redirect to /cart. isProcessing =", isProcessing);
    }
  }, [cartItems, isProcessing, router]);


  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    console.log("CheckoutPage: onSubmit - START. isProcessing: true. Data:", data);

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
        status: "En attente" as OrderStatus, // Explicitly cast for safety
        orderDate: serverTimestamp(),
        paymentMethod: data.paymentMethod,
        shippingAddress: data.address,
    };

    if (data.paymentMethod === 'cod') {
      console.log("CheckoutPage: Processing COD order.");
      try {
        console.log("CheckoutPage: Attempting: await addDoc(...) with orderData:", orderData);
        const docRef = await addDoc(collection(db, "orders"), orderData);
        console.log("CheckoutPage: Success: addDoc. Order ID:", docRef.id);
        
        toast({
          title: "Commande confirmée!",
          description: "Votre commande a été enregistrée. Nous vous contacterons bientôt.",
        });
        
        clearCart();
        console.log("CheckoutPage: Cart cleared.");

        console.log("CheckoutPage: Attempting: router.push to success page.");
        // router.push an await is not strictly necessary for next/navigation but won't hurt
        await router.push(`/checkout/success?method=cod&orderId=${docRef.id}`);
        console.log("CheckoutPage: Successfully navigated to success page.");
        // Component might unmount here. State reset is primarily handled by `finally`.
      } catch (error: any) {
        console.error("CheckoutPage: CATCH block. Error saving COD order:", error);
        let errorMessage = "Impossible d'enregistrer votre commande. Veuillez réessayer.";
        if (error.message) {
            errorMessage = `Erreur: ${error.message}. Veuillez contacter le support.`;
        }
        if (error.code && error.code.includes("permission-denied")) {
            errorMessage = "Erreur de permission Firestore. Impossible de sauvegarder la commande.";
             console.error("CheckoutPage: Firestore permission denied. Check security rules for 'orders' collection.");
        } else {
            console.error("Erreur détaillée lors de l'enregistrement de la commande COD dans Firestore:", error);
        }
        toast({
          variant: "destructive",
          title: "Échec de la commande",
          description: errorMessage,
        });
        // Explicitly set isProcessing to false in catch, though finally should also do it.
        console.log("CheckoutPage: CATCH block. Setting isProcessing to false.");
        setIsProcessing(false);
      } finally {
        // This block will execute regardless of success or failure in the try block.
        console.log("CheckoutPage: FINALLY block. Setting isProcessing to false.");
        setIsProcessing(false);
      }
    } else {
        // This case should ideally not be reached if 'cod' is the only option
        console.warn("CheckoutPage: onSubmit - Reached unexpected 'else' for paymentMethod:", data.paymentMethod, ". Setting isProcessing to false as a safeguard.");
        setIsProcessing(false);
    }
    // No code should be here that might prevent isProcessing from being set to false.
    console.log("CheckoutPage: onSubmit - END.");
  };

  if (cartItems.length === 0 && !isProcessing && (typeof window !== 'undefined' && !window.location.pathname.includes('/checkout/success'))) {
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
                disabled={isProcessing || cartItems.length === 0 || !form.formState.isValid }
              >
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : ''}
                {isProcessing ? 'Traitement...' : 'Confirmer la Commande'}
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
