
'use client';

import { Review } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProductReviewsProps {
  reviews: Review[];
  isLoading: boolean;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function ProductReviews({ reviews, isLoading }: ProductReviewsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des avis...</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-8 text-primary">Avis des Clients</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-muted/50 rounded-lg">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Aucun avis pour ce produit pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-2">Soyez le premier à laisser un avis !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
                  <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 pl-16">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
