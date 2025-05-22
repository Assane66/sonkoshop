
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, CreditCard } from 'lucide-react';
import Image from 'next/image';

const checkoutFormSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (minimum 3 caractères)."),
  address: z.string().min(10, "L'adresse de livraison est requise (minimum 10 caractères)."),
  phone: z.string().regex(/^(70|75|76|77|78)\d{7}$/, "Le numéro de téléphone doit être un numéro sénégalais valide (ex: 771234567)."),
  paymentMethod: z.enum(['cod', 'wave'], {
    required_error: "Vous devez sélectionner une méthode de paiement."
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

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

  if (cartItems.length === 0 && !isProcessing) {
     // Redirect to cart if it's empty and not in a processing state (e.g. after successful order)
    if (typeof window !== 'undefined') {
      router.push('/cart');
    }
    return <div className="container mx-auto px-4 py-12 text-center">Chargement ou panier vide...</div>;
  }


  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    
    if (data.paymentMethod === 'cod') {
      // Simulate COD order placement
      console.log('Commande (Paiement à la livraison):', data, cartItems);
      toast({
        title: "Commande confirmée!",
        description: "Votre commande avec paiement à la livraison a été enregistrée. Nous vous contacterons bientôt.",
      });
      clearCart();
      router.push('/checkout/success?method=cod');
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
      // Simulate Wave redirection
      console.log('Redirection vers Wave pour paiement:', data, cartItems);
      toast({
        title: "Redirection vers Wave...",
        description: "Vous allez être redirigé pour compléter votre paiement.",
      });
      
      const wavePaymentUrl = `${WAVE_PAYMENT_BASE_URL}?amount=${totalPrice}`;
      
      // Clear cart optimistically, assuming payment will be completed
      // In a real scenario, you'd clear cart after webhook confirmation
      clearCart();
      // Wait a bit for toast to show before redirecting
      setTimeout(() => {
        window.location.href = wavePaymentUrl;
      }, 1500);
      // Note: User will leave the site here. For a success page after Wave,
      // Wave would need to redirect back to a success URL you provide them.
      // For now, we won't have a specific Wave success page within this app flow.
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Finaliser la Commande</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de Livraison</CardTitle>
                  <CardDescription>Ces informations sont requises pour le paiement à la livraison.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom Complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Modou Fall" {...field} />
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
                          <Input placeholder="Ex: Cité Keur Gorgui, Villa 22B, Dakar" {...field} />
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
                          <Input type="tel" placeholder="Ex: 771234567" {...field} />
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
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="cod" />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center text-base cursor-pointer">
                                <Truck className="mr-3 h-6 w-6 text-primary" />
                                Payer à la livraison
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="wave" />
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
                disabled={isProcessing || !paymentMethod || (paymentMethod === 'cod' && !form.formState.isValid) }
              >
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
