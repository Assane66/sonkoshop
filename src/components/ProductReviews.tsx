import React from 'react';
import { Review } from '@/types';
import { Star, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProductReviewsProps {
    reviews: Review[];
    isLoading: boolean;
}

export default function ProductReviews({ reviews, isLoading }: ProductReviewsProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <h3 className="text-2xl font-bold mb-4">Avis Clients</h3>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">Avis Clients</h3>
                <p className="text-muted-foreground">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold">Avis Clients ({reviews.length})</h3>
            <div className="grid gap-6">
                {reviews.map((review) => (
                    <Card key={review.id} className="border-none shadow-sm bg-muted/30">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{review.userName}</p>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {typeof review.createdAt === 'string' ? new Date(review.createdAt).toLocaleDateString() : 'Date inconnue'}
                                    </p>
                                    <p className="text-sm mt-2">{review.comment}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
