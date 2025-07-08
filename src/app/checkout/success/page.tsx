
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Package, Download, Loader2, Hourglass } from 'lucide-react';
import Link from 'next/link';
import type { Order, OrderItem } from '@/types';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

function SuccessPageContent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingOrder(true);
    try {
      if (typeof window !== 'undefined') {
        const storedOrder = sessionStorage.getItem('lastSuccessfulOrder');
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder) as Order;
          setOrder(parsedOrder);
          // Do not clear the item here, as the user might refresh the page.
          // The cart is already cleared in checkout page.
        } else {
          console.warn("CheckoutSuccessPage: No order data found in sessionStorage.");
        }
      }
    } catch (error) {
      console.error("Failed to retrieve or parse order from sessionStorage:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de récupérer les détails de la commande." });
    } finally {
      setIsLoadingOrder(false);
    }
  }, [toast]);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || !order) {
      toast({ variant: "destructive", title: "Erreur PDF", description: "Contenu de la facture non disponible."});
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`facture-${order.id.substring(0,8)}.pdf`);
      toast({ title: "Facture téléchargée", description: "Votre facture PDF a été téléchargée."});
    } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
        toast({ variant: "destructive", title: "Erreur PDF", description: "Impossible de générer le PDF."});
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  if (isLoadingOrder) {
    return (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-xl">Chargement de la confirmation...</p>
        </div>
    );
  }
  
  if (!order) {
    return (
       <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive">Commande non trouvée</CardTitle>
              <CardDescription>Aucun détail de commande n'a été trouvé. Cela peut se produire si vous accédez directement à cette page ou après un long moment. Veuillez vérifier votre historique de commandes ou nous contacter.</CardDescription>
          </CardHeader>
            <CardContent>
              <Button asChild>
                  <Link href="/">Retour à l'accueil</Link>
              </Button>
          </CardContent>
      </Card>
    );
  }

  let title = "Merci pour votre commande!";
  let description = "Votre commande a été enregistrée avec succès. Nous préparons votre colis.";
  let icon = <CheckCircle className="h-12 w-12 text-green-600" />;
  let iconBg = "bg-green-100";

  if (order.paymentMethod === 'wave') {
    title = "Paiement en attente de confirmation";
    description = "Votre commande est enregistrée. Nous attendons la confirmation de Wave. Le statut sera mis à jour automatiquement une fois le paiement reçu.";
    icon = <Hourglass className="h-12 w-12 text-orange-600" />;
    iconBg = "bg-orange-100";
  } else if (order.paymentMethod === 'cod') {
    title = "Commande (Paiement à la livraison) Réussie!";
    description = "Votre commande a été enregistrée. Vous serez contacté(e) sous peu pour la confirmation et la livraison. Merci de préparer le montant exact.";
  } else if (order.paymentMethod === 'pickup') {
    title = "Commande (Retrait en boutique) Enregistrée!";
    description = "Votre commande est en cours de préparation. Nous vous informerons dès qu'elle sera prête à être récupérée.";
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="w-full max-w-lg text-center shadow-xl mb-8">
        <CardHeader>
          <div className={`mx-auto ${iconBg} rounded-full p-3 w-fit mb-4`}>
            {icon}
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{title}</CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            {description}
            {order.id && <p className="mt-2">Votre numéro de commande est : <strong>{order.id.substring(0,8)}...</strong></p>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf || !invoiceRef.current} className="w-full bg-primary hover:bg-primary/90">
              {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isGeneratingPdf ? 'Génération...' : 'Télécharger la Facture (PDF)'}
            </Button>
          <div className="flex items-center justify-center text-muted-foreground">
            <Package className="h-5 w-5 mr-2" />
            <span>Vous pouvez suivre le statut de votre commande dans votre compte.</span>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/products">Continuer les achats</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>

      {order && (
        <div ref={invoiceRef} className="p-8 bg-white text-black w-full max-w-2xl mx-auto border rounded-lg shadow-lg my-8">
            <div className="flex justify-between items-start mb-8">
                <div className="w-1/3">
                    <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1751785241/logo_noqoct.png" alt="Sonko Shop Logo" width={150} height={75} data-ai-hint="shop logo" className="object-contain"/>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800">FACTURE</h2>
                    <p className="text-sm text-gray-600">Commande #: {order.id.substring(0,8)}...</p>
                    <p className="text-sm text-gray-600">Date: {formatDate(order.orderDate as string)}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Facturé à :</h3>
                    <p className="text-sm text-gray-600">{order.customerInfo.fullName}</p>
                    {order.customerInfo.address && <p className="text-sm text-gray-600">{order.customerInfo.address}</p>}
                    <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold text-gray-700 mb-1">Sonko Shop</h3>
                    <p className="text-sm text-gray-600">Tivaouane Peulh, Quartier Diawrine</p>
                    <p className="text-sm text-gray-600">Dakar, Sénégal</p>
                    <p className="text-sm text-gray-600">sonkoshop1@gmail.com</p>
                    <p className="text-sm text-gray-600">78 451 36 33 / 78 139 58 93</p>
                </div>
            </div>
            <div className="mb-8">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-3 font-semibold">Article</th>
                            <th className="py-2 px-3 font-semibold text-center">Taille</th>
                            <th className="py-2 px-3 font-semibold text-center">Qté</th>
                            <th className="py-2 px-3 font-semibold text-right">Prix Unitaire</th>
                            <th className="py-2 px-3 font-semibold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item: OrderItem, index: number) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 px-3">{item.productName}</td>
                                <td className="py-2 px-3 text-center">{item.selectedSize || '-'}</td>
                                <td className="py-2 px-3 text-center">{item.quantity}</td>
                                <td className="py-2 px-3 text-right">{item.price.toLocaleString('fr-FR')} FCFA</td>
                                <td className="py-2 px-3 text-right">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mb-8">
                <div className="w-full md:w-1/3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Sous-total :</span>
                        <span>{order.subtotal?.toLocaleString('fr-FR') || 0} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Livraison ({order.shippingAddress}):</span>
                        <span>{order.shippingCost !== undefined ? (order.shippingCost > 0 ? `${order.shippingCost.toLocaleString('fr-FR')} FCFA` : 'Gratuite') : 'N/A'}</span>
                    </div>
                    <hr className="my-2 border-gray-300"/>
                    <div className="flex justify-between font-bold text-md text-gray-800">
                        <span>TOTAL :</span>
                        <span>{order.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500">
                <p>Merci pour votre confiance et à bientôt sur Sonko Shop !</p>
            </div>
        </div>
      )}
    </>
  );
}


export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Suspense fallback={
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-xl">Chargement...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
