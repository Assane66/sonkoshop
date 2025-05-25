
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Order, OrderStatus, OrderItem as AppOrderItem, CustomerInfo, orderStatusList } from '@/types'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
// Firebase imports removed
// import { db } from '@/lib/firebase';
// import { collection, onSnapshot, doc, updateDoc, orderBy, query, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Delivered: return 'bg-green-100 text-green-700 border border-green-200';
    case OrderStatus.Shipped: return 'bg-blue-100 text-blue-700 border border-blue-200';
    case OrderStatus.Processing: return 'bg-purple-100 text-purple-700 border border-purple-200';
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case OrderStatus.Cancelled: return 'bg-red-100 text-red-700 border border-red-200';
    default: return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerInfo: { fullName: 'Aminata Fall', address: 'Cité Keur Gorgui, Dakar', phone: '771234567' },
    items: [{ productId: 'p1', productName: 'Maillot Sénégal Domicile', quantity: 1, price: 35000, selectedSize: 'M' }],
    totalAmount: 35000,
    status: OrderStatus.Processing,
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    paymentMethod: 'cod',
    shippingAddress: 'Cité Keur Gorgui, Dakar',
  },
  {
    id: 'ORD002',
    customerInfo: { fullName: 'Babacar Diop', address: 'Sacré Coeur 3, Dakar', phone: '781112233' },
    items: [
      { productId: 'p2', productName: 'Baskets Pro Max', quantity: 1, price: 45000, selectedSize: '42' },
      { productId: 'p3', productName: 'Survêtement Club Élite', quantity: 1, price: 28000, selectedSize: 'L' }
    ],
    totalAmount: 73000,
    status: OrderStatus.Shipped,
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    paymentMethod: 'wave',
    shippingAddress: 'Sacré Coeur 3, Dakar',
  },
];


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  // const [isLoading, setIsLoading] = useState(true); // No Firebase loading
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // useEffect for Firebase snapshot removed

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({ title: "Statut mis à jour (local)", description: `Le statut de la commande ${orderId} est maintenant ${newStatus}.`});
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // if (isLoading) { // No Firebase loading
  //   return (
  //       <div className="flex flex-col items-center justify-center h-64 space-y-3">
  //           <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //           <p className="text-muted-foreground">Chargement des commandes...</p>
  //       </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Commandes</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer (Bientôt)</Button>
          <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" /> Exporter (Bientôt)</Button>
        </div>
      </div>

       <Card className="shadow-sm">
        <CardHeader>
            <Input 
                type="search"
                placeholder="Rechercher par ID, Client, Statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3"
            />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerInfo.fullName}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric'})}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>
                     <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className={cn("h-8 text-xs w-36 border-0 focus:ring-0 focus:ring-offset-0 shadow-none p-0", getStatusBadgeClass(order.status))}>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
              <DialogTitle>Détails de la Commande : {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Date : {new Date(selectedOrder.orderDate).toLocaleString('fr-FR', {dateStyle: 'full', timeStyle: 'short'})}
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
                <p><strong>Adresse de livraison:</strong> {selectedOrder.shippingAddress}</p>
                <p><strong>Méthode de paiement:</strong> {selectedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : selectedOrder.paymentMethod}</p>
                <p className="text-lg font-bold mt-2">Total Commande: {selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</p>
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
