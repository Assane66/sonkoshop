
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { Loader2, Star } from 'lucide-react';
import { Order, OrderItem } from '@/types';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface LeaveReviewDialogProps {
  order: Order;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReviewData = {
  rating: number;
  comment: string;
};

export default function LeaveReviewDialog({ order, isOpen, onOpenChange }: LeaveReviewDialogProps) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Record<string, ReviewData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unreviewedItems = order.items.filter(item => !(order.reviewedProductIds || []).includes(item.productId));

  const handleReviewChange = (productId: string, rating: number, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { rating, comment },
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(reviews).length === 0) {
      toast({ variant: 'destructive', title: "Aucun avis à soumettre", description: "Veuillez noter et commenter au moins un produit." });
      return;
    }
    if (!userData) {
      toast({ variant: 'destructive', title: "Erreur", description: "Utilisateur non trouvé." });
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const newReviewedIds: string[] = [];

      for (const productId in reviews) {
        if (Object.prototype.hasOwnProperty.call(reviews, productId)) {
          const reviewData = reviews[productId];
          const product = order.items.find(p => p.productId === productId);
          if (product && reviewData.rating > 0 && reviewData.comment.trim().length >= 10) {
            const reviewRef = doc(collection(db, 'reviews'));
            batch.set(reviewRef, {
              orderId: order.id,
              productId: product.productId,
              productName: product.productName,
              userId: userData.uid,
              userName: userData.fullName,
              rating: reviewData.rating,
              comment: reviewData.comment,
              createdAt: serverTimestamp(),
            });
            newReviewedIds.push(productId);
          }
        }
      }
      
      if(newReviewedIds.length > 0) {
        const orderRef = doc(db, 'orders', order.id);
        batch.update(orderRef, {
          reviewedProductIds: arrayUnion(...newReviewedIds)
        });

        await batch.commit();
        toast({ title: "Avis soumis!", description: "Merci pour votre contribution." });
        onOpenChange(false);
      } else {
         toast({ variant: 'destructive', title: "Avis incomplet", description: "Veuillez vous assurer que chaque avis a une note et un commentaire d'au moins 10 caractères." });
      }

    } catch (error) {
      console.error("Error submitting reviews:", error);
      toast({ variant: 'destructive', title: "Erreur", description: "Impossible de soumettre les avis." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Laisser un avis pour la commande #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Votre avis aide les autres clients. Vous pouvez évaluer les produits de cette commande que vous n'avez pas encore notés.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
            <div className="space-y-6 py-4">
            {unreviewedItems.length > 0 ? unreviewedItems.map(item => (
                <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative w-20 h-20 flex-shrink-0">
                    <Image src={item.imageUrl || 'https://placehold.co/100x100.png'} alt={item.productName} fill className="rounded-md object-cover" />
                </div>
                <div className="flex-grow space-y-2">
                    <p className="font-semibold">{item.productName}</p>
                    <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleReviewChange(item.productId, star, reviews[item.productId]?.comment || '')}>
                        <Star className={cn("h-6 w-6 cursor-pointer transition-colors", (reviews[item.productId]?.rating || 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                        </button>
                    ))}
                    </div>
                    <Textarea
                    placeholder="Décrivez votre expérience avec ce produit... (min 10 caractères)"
                    value={reviews[item.productId]?.comment || ''}
                    onChange={(e) => handleReviewChange(item.productId, reviews[item.productId]?.rating || 0, e.target.value)}
                    className="mt-2"
                    />
                </div>
                </div>
            )) : (
                <p className="text-center text-muted-foreground py-8">Vous avez déjà laissé un avis pour tous les produits de cette commande.</p>
            )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          {unreviewedItems.length > 0 && (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Soumettre les avis
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
