
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
import { Loader2, Truck } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { OrderStatus, type Order, type CustomerInfo, type OrderItem } from '@/types';

const checkoutFormSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (minimum 3 caractères)."),
  address: z.string().min(1, "L'adresse de livraison est requise."),
  phone: z.string().regex(/^(70|75|76|77|78)\d{7}$/, "Le numéro de téléphone doit être un numéro sénégalais valide (ex: 771234567)."),
  paymentMethod: z.enum(['cod', 'wave'], {
    required_error: "Vous devez sélectionner une méthode de paiement."
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;


export default function CheckoutPage() {
  const { cartItems, getCartSubtotal, getShippingCost, getCartGrandTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirectingToWave, setIsRedirectingToWave] = useState(false);
  const [hydrated, setHydrated] = useState(false);


  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      phone: '',
      paymentMethod: 'cod',
    },
  });

  const subtotal = getCartSubtotal();
  const shippingCost = getShippingCost(subtotal);
  const grandTotal = getCartGrandTotal();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Don't run this effect until client is hydrated

    let currentPath = '';
    if (typeof window !== 'undefined') {
      currentPath = window.location.pathname;
    }
    // console.log("CheckoutPage: useEffect triggered. cartItems.length =", cartItems.length, "isProcessing =", isProcessing, "isRedirectingToWave =", isRedirectingToWave, "pathname =", currentPath, "grandTotal =", grandTotal);

    if (cartItems.length === 0 && grandTotal === 0) {
      if (!isProcessing && !isRedirectingToWave) {
        if (typeof window !== 'undefined' && !currentPath.includes('/checkout/success')) {
          // console.log("CheckoutPage: Cart is empty, NOT processing, NOT redirecting to Wave. Redirecting to /cart");
          router.push('/cart');
        } else {
          // console.log("CheckoutPage: Cart is empty, NOT processing, NOT redirecting to Wave, but on success page or window undefined. No redirect to /cart.");
        }
      } else {
        // console.log("CheckoutPage: Cart is empty BUT IS PROCESSING or IS REDIRECTING TO WAVE. Waiting.");
      }
    } else {
      // console.log("CheckoutPage: Cart is NOT empty. No redirect to /cart. isProcessing =", isProcessing, "isRedirectingToWave =", isRedirectingToWave);
    }
  }, [cartItems, grandTotal, isProcessing, isRedirectingToWave, router, hydrated]);


  const onSubmit = async (data: CheckoutFormValues) => {
    console.log("CheckoutPage: onSubmit - START. Data:", data, "Subtotal:", subtotal, "Shipping:", shippingCost, "Grand Total:", grandTotal);
    
    setIsProcessing(true);
    console.log("CheckoutPage: onSubmit - isProcessing set to true at START.");

    const orderItems: OrderItem[] = cartItems.map(item => {
      const orderItem: OrderItem = {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.priceInCart,
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

    const orderStatus = data.paymentMethod === 'wave' ? OrderStatus.WavePending : OrderStatus.Pending;

    const orderDataPayload: Omit<Order, 'id'> = {
        customerInfo,
        items: orderItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        totalAmount: grandTotal,
        status: orderStatus,
        orderDate: serverTimestamp(),
        paymentMethod: data.paymentMethod,
        shippingAddress: data.address,
    };
    
    console.log("CheckoutPage: onSubmit - Prepared orderDataPayload (before addDoc attempt):", JSON.stringify(orderDataPayload, null, 2));


    if (data.paymentMethod === 'cod') {
      console.log("CheckoutPage: Processing COD order.");
      try {
        console.log("CheckoutPage: COD - Attempting: await addDoc(...)");
        const docRef = await addDoc(collection(db, "orders"), orderDataPayload);
        console.log("CheckoutPage: COD - Success: addDoc. Order ID:", docRef.id);
        
        clearCart();
        console.log("CheckoutPage: COD - Cart cleared.");

        toast({
          title: "Commande confirmée!",
          description: "Votre commande a été enregistrée. Nous vous contacterons bientôt.",
        });
        console.log("CheckoutPage: COD - Attempting: router.push to success page.");
        // No need to await router.push if it's the last thing.
        router.push(`/checkout/success?method=cod&orderId=${docRef.id}`);
        console.log("CheckoutPage: COD - Navigation to success page initiated.");
        // setIsProcessing will be handled in finally or if component unmounts
      } catch (error: any) {
        console.error("CheckoutPage: COD - CATCH block. Error during COD order processing:", error);
        let errorMessage = "Impossible d'enregistrer votre commande. Veuillez réessayer.";
        if (error.code) {
            errorMessage = `Erreur Firestore (${error.code}): ${error.message}. Veuillez contacter le support.`;
             console.error("CheckoutPage: COD - Firestore error details:", error.code, error.message);
        } else if (error.message) {
             errorMessage = `Erreur: ${error.message}. Veuillez contacter le support.`;
        }
        toast({ variant: "destructive", title: "Échec de la commande", description: errorMessage });
      } finally {
        setIsProcessing(false);
        console.log("CheckoutPage: onSubmit - COD FINALLY - isProcessing set to false.");
      }
    } else if (data.paymentMethod === 'wave') {
      console.log("CheckoutPage: Processing Wave payment.");
      const waveBaseUrl = 'https://pay.wave.com/m/M_pIXmQ2smGxRM/c/sn/'; 
      const wavePaymentUrl = `${waveBaseUrl}?amount=${grandTotal}`;

      try {
        console.log("CheckoutPage: Wave - Attempting: await addDoc(...)");
        const docRef = await addDoc(collection(db, "orders"), orderDataPayload);
        console.log("CheckoutPage: Wave - Success: addDoc. Order ID:", docRef.id);
        
        clearCart();
        console.log("CheckoutPage: Wave - Cart cleared.");
        
        setIsRedirectingToWave(true); 
        console.log("CheckoutPage: Wave - Order saved, isRedirectingToWave set to true before redirect timeout.");

        toast({
          title: "Redirection vers Wave...",
          description: "Vous allez être redirigé pour finaliser votre paiement.",
        });
        
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            console.log("CheckoutPage: Wave - Attempting redirect to:", wavePaymentUrl);
            window.location.href = wavePaymentUrl;
          }
        }, 1500);

      } catch (error: any) {
        console.error("CheckoutPage: Wave - CATCH block. Error during Wave order processing:", error);
        let waveErrorMessage = "Impossible d'initier le paiement Wave. Veuillez réessayer.";
         if (error.code) {
            waveErrorMessage = `Erreur Firestore (${error.code}): ${error.message}. Veuillez contacter le support.`;
             console.error("CheckoutPage: Wave - Firestore error details:", error.code, error.message);
        } else if (error.message) {
            waveErrorMessage = `Erreur Wave: ${error.message}. Veuillez contacter le support.`;
        }
        toast({ variant: "destructive", title: "Échec Paiement Wave", description: waveErrorMessage });
        setIsRedirectingToWave(false); 
      } finally {
        // Only set isProcessing to false if not redirecting to wave successfully,
        // because the page will change anyway. If wave init fails, then set to false.
        if(!isRedirectingToWave){ // Check if redirect was actually initiated.
             setIsProcessing(false);
             console.log("CheckoutPage: onSubmit - Wave FINALLY (no successful redirect initiated) - isProcessing set to false.");
        } else {
            // If redirecting to wave, isProcessing can remain true or be set to false, 
            // but the page will navigate away. If redirect fails client-side after timeout, user is stuck.
            // It's safer to set it false once redirection is handed off.
             setIsProcessing(false);
             console.log("CheckoutPage: onSubmit - Wave FINALLY (redirect to Wave initiated) - isProcessing set to false.");
        }
      }
    } else {
        console.warn("CheckoutPage: onSubmit - Reached unexpected 'else' for paymentMethod:", data.paymentMethod);
        toast({ variant: "destructive", title: "Erreur", description: "Méthode de paiement inconnue." });
        setIsProcessing(false);
        console.log("CheckoutPage: onSubmit - UNKNOWN PAYMENT METHOD - isProcessing set to false.");
    }
    console.log("CheckoutPage: onSubmit - END. Current isProcessing state:", isProcessing, "isRedirectingToWave:", isRedirectingToWave);
  };

  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0 && grandTotal === 0 && !isProcessing && !isRedirectingToWave) {
    // This condition is now less likely to cause hydration issues due to the `hydrated` check in useEffect for redirection.
    // If still reached, it means redirection hasn't happened.
    let currentPath = '';
    if (typeof window !== 'undefined') currentPath = window.location.pathname;
    if (!currentPath.includes('/checkout/success')) {
        return (
          <div className="container mx-auto px-4 py-8"> {/* Consistent className */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Votre panier est vide. Redirection...</p>
            </div>
          </div>
        );
    }
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
                                   <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6"><path d="M13.577 109.354C8.02 109.354 3.5 104.835 3.5 99.277V10.444C3.5 4.886 8.02 0.368 13.577 0.368H95.828C101.386 0.368 105.904 4.886 105.904 10.444V99.277C105.904 104.835 101.386 109.354 95.828 109.354H13.577Z" fill="#00A9E7"></path><path d="M91.794 43.65C88.48 40.336 79.32 37.021 70.424 37.021C59.638 37.021 51.27 40.336 46.822 43.65L45.674 44.534C45.145 44.807 44.617 44.807 44.088 44.534L39.375 42.396C36.326 40.864 32.467 40.055 28.872 40.055C25.012 40.055 21.417 41.128 18.368 42.924V21.02C22.711 19.224 27.863 18.15 33.28 18.15C43.538 18.15 51.905 21.465 56.089 24.514L57.237 25.397C57.766 25.671 58.294 25.671 58.823 25.397L63.271 23.26C66.585 21.727 70.18 21.199 73.505 21.199C76.83 21.199 80.155 21.727 83.204 22.799V43.65H91.794Z" fill="#042A3A"></path><path d="M91.793 65.971C88.479 69.285 79.319 72.6 70.423 72.6C59.637 72.6 51.269 69.285 46.821 65.971L45.673 65.088C45.144 64.815 44.616 64.815 44.087 65.088L39.374 67.226C36.325 68.758 32.466 69.567 28.871 69.567C25.011 69.567 21.416 68.494 18.367 66.698V88.601C22.71 90.397 27.862 91.47 33.279 91.47C43.537 91.47 51.904 88.155 56.088 85.106L57.236 84.223C57.765 83.95 58.293 83.95 58.822 84.223L63.27 86.36C66.584 87.892 70.179 88.42 73.504 88.42C76.829 88.42 80.154 87.892 83.203 86.82V65.971H91.793Z" fill="white"></path></svg>
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
                disabled={isProcessing || cartItems.length === 0 || !form.formState.isValid || !hydrated}
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
                  <p>{(item.priceInCart * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                 <span className={shippingCost === 0 ? "text-primary" : ""}>
                  {shippingCost > 0 ? `${shippingCost.toLocaleString('fr-FR')} FCFA` : 'Gratuite'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Général</span>
                <span>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
