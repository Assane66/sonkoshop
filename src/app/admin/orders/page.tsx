
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, Trash2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Order, OrderStatus, OrderItem as AppOrderItem, CustomerInfo, orderStatusList } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, orderBy, query, Timestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, orderBy('orderDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate().toISOString() : data.orderDate,
        } as Order;
      });
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les commandes." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRow = (orderId: string) => {
    setSelectedRows(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedRows(filteredOrders.map(o => o.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    try {
      const batch = writeBatch(db);
      selectedRows.forEach(orderId => {
        const orderRef = doc(db, 'orders', orderId);
        batch.delete(orderRef);
      });
      await batch.commit();
      toast({ title: `${selectedRows.length} commande(s) supprimée(s)`, description: "Les commandes sélectionnées ont été supprimées avec succès." });
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected orders:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer les commandes sélectionnées." });
    }
  };


  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: "Statut mis à jour", description: `Le statut de la commande ${orderId} est maintenant ${newStatus}.` });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le statut." });
    }
  };

  const handleConfirmWavePayment = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: OrderStatus.Processing });
      toast({ title: "Paiement Wave confirmé!", description: "Le statut de la commande est passé à 'En traitement'." });
    } catch (error) {
      console.error("Error confirming Wave payment:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de confirmer le paiement de la commande." });
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Commandes</h1>
          <p className="text-slate-500 mt-1">Gérez et suivez toutes les commandes clients.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shadow-sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer ({selectedRows.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer définitivement les {selectedRows.length} commandes sélectionnées ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDeleteSelected}>
                      Supprimer
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="shadow-md border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <Input
            type="search"
            placeholder="Rechercher par ID, Client, Statut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white border-slate-200"
          />
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50 border-b border-slate-100">
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={selectedRows.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">ID Commande</TableHead>
                  <TableHead className="font-semibold text-slate-700">Client</TableHead>
                  <TableHead className="font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Total</TableHead>
                  <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id} data-state={selectedRows.includes(order.id) && "selected"} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedRows.includes(order.id)}
                        onCheckedChange={() => handleSelectRow(order.id)}
                        aria-label={`Sélectionner la commande ${order.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{order.customerInfo.fullName}</span>
                        <span className="text-xs text-slate-500">{order.customerInfo.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{new Date(order.orderDate as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="font-medium text-slate-900">{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className={cn("h-7 text-xs w-auto min-w-[130px] border-0 focus:ring-0 focus:ring-offset-0 shadow-none p-0 bg-transparent hover:bg-transparent", getStatusBadgeClass(order.status))}>
                          <SelectValue placeholder="Statut" asChild>
                            <span className={cn("px-2.5 py-0.5 rounded-full font-semibold border", getStatusBadgeClass(order.status))}>{order.status}</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatusList.map(statusVal => (
                            <SelectItem key={statusVal} value={statusVal} className="text-xs">
                              {statusVal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleViewDetails(order)} title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === OrderStatus.WavePending && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleConfirmWavePayment(order.id)}
                            title="Confirmer la réception du paiement Wave"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Confirmer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-slate-200 mb-3" />
                        <p>Aucune commande trouvée.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Commande #{selectedOrder.id.substring(0, 8)}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Passée le {new Date(selectedOrder.orderDate as string).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </DialogDescription>
                </div>
                <Badge className={cn("text-sm px-3 py-1", getStatusBadgeClass(selectedOrder.status))}>{selectedOrder.status}</Badge>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-8">
              {/* Customer Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Client</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                    <p className="font-medium text-slate-900">{selectedOrder.customerInfo.fullName}</p>
                    <p className="text-sm text-slate-600">{selectedOrder.customerInfo.email || 'Aucun email'}</p>
                    <p className="text-sm text-slate-600">{selectedOrder.customerInfo.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Livraison & Paiement</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">Adresse:</span> {selectedOrder.shippingAddress}</p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">Paiement:</span> {
                        selectedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' :
                          selectedOrder.paymentMethod === 'pickup' ? 'Retrait en boutique' :
                            selectedOrder.paymentMethod
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Articles ({selectedOrder.items.length})</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-center">Qté</TableHead>
                        <TableHead className="text-right">Prix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{item.productName}</div>
                            {item.selectedSize && <div className="text-xs text-slate-500">Taille: {item.selectedSize}</div>}
                            {item.customization && (
                              <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded text-xs text-blue-800 inline-block">
                                <p className="font-semibold mb-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Flocage</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-2.5">
                                  <span>Nom: <span className="font-medium">{item.customization.name}</span></span>
                                  <span>N°: <span className="font-medium">{item.customization.number}</span></span>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">{(item.price + (item.customizationCost || 0)).toLocaleString('fr-FR')} FCFA</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Sous-total</span>
                    <span>{selectedOrder.subtotal ? selectedOrder.subtotal.toLocaleString('fr-FR') : 'N/A'} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Livraison</span>
                    <span>{selectedOrder.shippingCost !== undefined ? (selectedOrder.shippingCost > 0 ? `${selectedOrder.shippingCost.toLocaleString('fr-FR')} FCFA` : 'Gratuite') : 'N/A'}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-primary">{selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
              <DialogClose asChild>
                <Button type="button" variant="outline">Fermer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
