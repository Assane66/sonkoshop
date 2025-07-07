
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, Trash2 } from 'lucide-react';
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
        toast({ title: "Statut mis à jour", description: `Le statut de la commande ${orderId} est maintenant ${newStatus}.`});
    } catch (error) {
        console.error("Error updating order status:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le statut."});
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Commandes</h1>
      </div>

       <Card className="shadow-sm">
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Input 
                  type="search"
                  placeholder="Rechercher par ID, Client, Statut..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-1/2 md:w-1/3"
              />
              {selectedRows.length > 0 && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer la sélection ({selectedRows.length})
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                   <Checkbox
                    checked={selectedRows.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead>ID Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <TableRow key={order.id} data-state={selectedRows.includes(order.id) && "selected"}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(order.id)}
                      onCheckedChange={() => handleSelectRow(order.id)}
                      aria-label={`Sélectionner la commande ${order.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.customerInfo.fullName}</TableCell>
                  <TableCell>{new Date(order.orderDate as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric'})}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>
                     <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className={cn("h-8 text-xs w-auto min-w-[120px] border-0 focus:ring-0 focus:ring-offset-0 shadow-none p-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0", getStatusBadgeClass(order.status))}>
                           <SelectValue placeholder="Statut" asChild>
                             <span className="px-2 py-0.5 rounded-full font-semibold">{order.status}</span>
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
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)} title="Voir détails">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Aucune commande trouvée.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la Commande : {selectedOrder.id.substring(0,8)}...</DialogTitle>
              <DialogDescription>
                Date : {new Date(selectedOrder.orderDate as string).toLocaleString('fr-FR', {dateStyle: 'full', timeStyle: 'short'})}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold mb-1">Informations Client</h3>
                <p><strong>Nom:</strong> {selectedOrder.customerInfo.fullName}</p>
                <p><strong>Adresse:</strong> {selectedOrder.customerInfo.address}</p>
                <p><strong>Téléphone:</strong> {selectedOrder.customerInfo.phone}</p>
              </div>
              <hr/>
              <div>
                <h3 className="font-semibold mb-1">Articles Commandés</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="mb-2 p-2 border rounded-md">
                    <p><strong>Produit:</strong> {item.productName} {item.selectedSize && `(Taille: ${item.selectedSize})`}</p>
                    <p><strong>Quantité:</strong> {item.quantity}</p>
                    <p><strong>Prix unitaire:</strong> {item.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                ))}
              </div>
               <hr/>
              <div>
                <p><strong>Sous-total:</strong> {selectedOrder.subtotal ? selectedOrder.subtotal.toLocaleString('fr-FR') : 'N/A'} FCFA</p>
                <p><strong>Frais de livraison:</strong> {selectedOrder.shippingCost !== undefined ? (selectedOrder.shippingCost > 0 ? `${selectedOrder.shippingCost.toLocaleString('fr-FR')} FCFA` : 'Gratuite') : 'N/A'}</p>
                <p className="text-lg font-bold mt-2">Total Commande: {selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                 <p><strong>Adresse de livraison:</strong> {selectedOrder.shippingAddress}</p>
                <p><strong>Méthode de paiement:</strong> {
                    selectedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 
                    selectedOrder.paymentMethod === 'pickup' ? 'Retrait en boutique' : 
                    selectedOrder.paymentMethod
                }</p>
                <p><strong>Statut Actuel:</strong> <Badge className={cn("text-sm", getStatusBadgeClass(selectedOrder.status))}>{selectedOrder.status}</Badge></p>
              </div>
            </div>
            <DialogFooter>
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
