
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, MessageSquarePlus } from 'lucide-react';
import { Order, OrderStatus } from '@/types'; 
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import LeaveReviewDialog from '@/components/account/LeaveReviewDialog';

const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Delivered: return 'bg-green-100 text-green-700 border border-green-200';
    case OrderStatus.Shipped: return 'bg-blue-100 text-blue-700 border border-blue-200';
    case OrderStatus.Processing: return 'bg-purple-100 text-purple-700 border border-purple-200';
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case OrderStatus.ReadyForPickup: return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
    case OrderStatus.Cancelled: return 'bg-red-100 text-red-700 border border-red-200';
    case OrderStatus.WavePending: return 'bg-orange-100 text-orange-700 border border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

export default function UserOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate().toISOString() : data.orderDate,
        } as Order;
      });
      fetchedOrders.sort((a, b) => new Date(b.orderDate as string).getTime() - new Date(a.orderDate as string).getTime());
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user orders:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger vos commandes." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement de vos commandes...</p>
        </div>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Mes Commandes</CardTitle>
          <CardDescription>Voici la liste de toutes les commandes que vous avez passées.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primary">#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{new Date(order.orderDate as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", getStatusBadgeClass(order.status))}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === OrderStatus.Delivered && (
                       <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setReviewOrder(order)}
                      >
                        <MessageSquarePlus className="mr-2 h-3 w-3" />
                        Laisser un avis
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-16">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="font-semibold">Vous n'avez aucune commande.</p>
                    <p className="text-sm">Parcourez nos produits pour commencer.</p>
                    <Button asChild size="sm" className="mt-4">
                      <Link href="/products">Voir les produits</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {reviewOrder && (
        <LeaveReviewDialog
          order={reviewOrder}
          isOpen={!!reviewOrder}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setReviewOrder(null);
            }
          }}
        />
      )}
    </>
  );
}
