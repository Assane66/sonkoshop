
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Package, Download, Loader2, Hourglass, XCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Order, OrderItem } from '@/types';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { verifyWavePayment } from '@/lib/wave';
import { useCart } from '@/context/CartContext';


function SuccessPageContent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed' | 'cod'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();


  useEffect(() => {
    const waveSessionId = searchParams.get('session_id');

    const handleVerification = async (sessionId: string) => {
      try {
        const result = await verifyWavePayment(sessionId);
        if (result.success && result.order) {
          setOrder(result.order);
          setVerificationStatus('success');
          // Clear cart and session storage only on successful verification
          clearCart();
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('lastSuccessfulOrder', JSON.stringify(result.order));
          }
        } else {
          setVerificationStatus('failed');
          setErrorMessage(result.error || "La vérification du paiement a échoué. Veuillez contacter le support.");
        }
      } catch (error: any) {
        setVerificationStatus('failed');
        setErrorMessage(error.message || "Une erreur critique est survenue lors de la vérification.");
      } finally {
        setIsLoading(false);
      }
    };

    // If waveSessionId is present, it's a Wave payment callback
    if (waveSessionId) {
      handleVerification(waveSessionId);
    } else {
      // It's a COD/Pickup order, load from sessionStorage
      setIsLoading(true);
      try {
        if (typeof window !== 'undefined') {
          const storedOrder = sessionStorage.getItem('lastSuccessfulOrder');
          if (storedOrder) {
            const parsedOrder = JSON.parse(storedOrder) as Order;
            setOrder(parsedOrder);
            setVerificationStatus('cod');
             // The WhatsApp notification is now handled on the checkout page, so we don't need to do anything here.
          } else {
            console.warn("CheckoutSuccessPage: No order data found in sessionStorage for non-Wave payment.");
            setVerificationStatus('failed');
            setErrorMessage("Détails de la commande non trouvés. Votre session a peut-être expiré.");
          }
        }
      } catch (error) {
        console.error("Failed to retrieve or parse order from sessionStorage:", error);
        setVerificationStatus('failed');
        setErrorMessage("Impossible de récupérer les détails de la commande.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchParams, toast, clearCart]);


  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || !order) {
      toast({ variant: "destructive", title: "Erreur PDF", description: "Contenu de la facture non disponible."});
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

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
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2 text-xl mt-4 text-muted-foreground">Vérification du paiement en cours...</p>
      </div>
    );
  }
  
  if (verificationStatus === 'failed') {
     return (
       <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
              <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">Échec de la Transaction</CardTitle>
              <CardDescription>{errorMessage || "Une erreur est survenue."}</CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                  <Link href="/cart">Retour au panier</Link>
              </Button>
          </CardContent>
      </Card>
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

  // --- Display logic for success states ---
  let title = "Merci pour votre commande!";
  let description = "Votre commande a été enregistrée avec succès. Nous préparons votre colis.";
  let icon = <CheckCircle className="h-12 w-12 text-green-600" />;
  let iconBg = "bg-green-100";

  if (verificationStatus === 'success' && order.paymentMethod === 'wave') {
      title = "Paiement confirmé !";
      description = "Merci ! Votre paiement a été validé et votre commande est maintenant en cours de traitement.";
  } else if (order.paymentMethod === 'cod') {
    title = "Commande (Paiement à la livraison) Réussie!";
    description = "Votre commande a été enregistrée. Vous serez contacté(e) sous peu pour la confirmation et la livraison. Merci de préparer le montant exact.";
  } else if (order.paymentMethod === 'pickup') {
    title = "Commande (Retrait en boutique) Enregistrée!";
    description = "Votre commande est en cours de préparation. Nous vous informerons dès qu'elle sera prête à être récupérée.";
  }


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
                                <td className="py-2 px-3 text-right">{(item.price + (item.customizationCost || 0)).toLocaleString('fr-FR')} FCFA</td>
                                <td className="py-2 px-3 text-right">{((item.price + (item.customizationCost || 0)) * item.quantity).toLocaleString('fr-FR')} FCFA</td>
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
        <div className="flex flex-col justify-center items-center py-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-2 text-xl mt-4 text-muted-foreground">Chargement...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
