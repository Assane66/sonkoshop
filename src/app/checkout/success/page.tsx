
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get('method');

  // Basic effect to prevent direct access if no method is specified, or for other future logic
  useEffect(() => {
    if (!paymentMethod) {
      // Optionally redirect or handle if no payment method is specified
      // For now, it will just render a generic message if method is null
    }
  }, [paymentMethod]);

  let title = "Merci pour votre commande!";
  let description = "Votre commande a été enregistrée avec succès. Nous préparons votre colis.";

  if (paymentMethod === 'cod') {
    title = "Commande (Paiement à la livraison) Réussie!";
    description = "Votre commande a été enregistrée. Vous serez contacté(e) sous peu pour la confirmation et la livraison. Merci de préparer le montant exact.";
  } else if (paymentMethod === 'wave') {
    // This case might not be hit directly if Wave redirects elsewhere and doesn't return to this specific page.
    // This is a fallback or for future integration if Wave provides a return URL.
    title = "Paiement via Wave Initié!";
    description = "Si votre paiement avec Wave a été effectué avec succès, votre commande sera traitée. Vous recevrez une confirmation par email ou téléphone.";
  }


  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{title}</CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Package className="h-5 w-5 mr-2" />
            <span>Suivi de commande bientôt disponible.</span>
          </div>
          <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
            <Link href="/products">Continuer les achats</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
