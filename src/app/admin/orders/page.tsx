
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Order, OrderStatus, OrderItem, CustomerInfo } from '@/types'; // Make sure types are correctly defined
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockOrders: Order[] = [
  { id: 'ORD001', customerInfo: { fullName: 'Moussa Diop', address: 'Dakar, Sicap Liberté', phone: '771234567' }, items: [{ productId: '1', productName: 'Maillot Sénégal', quantity: 1, price: 45000, selectedSize: 'L' }], totalAmount: 45000, status: OrderStatus.Delivered, orderDate: new Date(2024, 3, 15).toISOString(), paymentMethod: 'cod', shippingAddress: 'Dakar, Sicap Liberté' },
  { id: 'ORD002', customerInfo: { fullName: 'Aissatou Fall', address: 'Thiès, Grand Standing', phone: '781234567' }, items: [{ productId: '2', productName: 'Chaussures Vitesse', quantity: 1, price: 62000, selectedSize: '42' }, { productId: '6', productName: 'Sac de Sport', quantity: 1, price: 18000 }], totalAmount: 80000, status: OrderStatus.Shipped, orderDate: new Date(2024, 4, 1).toISOString(), paymentMethod: 'wave', shippingAddress: 'Thiès, Grand Standing' },
  { id: 'ORD003', customerInfo: { fullName: 'Alioune Badara Gueye', address: 'Saint Louis, Nord', phone: '701234567' }, items: [{ productId: '4', productName: 'Ensemble Enfant', quantity: 2, price: 22000 }], totalAmount: 44000, status: OrderStatus.Processing, orderDate: new Date(2024, 4, 5).toISOString(), paymentMethod: 'cod', shippingAddress: 'Saint Louis, Nord' },
  { id: 'ORD004', customerInfo: { fullName: 'Fatou Ndiaye', address: 'Dakar, Yoff', phone: '761234567' }, items: [{ productId: '7', productName: 'Veste Mode', quantity: 1, price: 55000, selectedSize: 'M' }], totalAmount: 55000, status: OrderStatus.Pending, orderDate: new Date(2024, 4, 10).toISOString(), paymentMethod: 'wave', shippingAddress: 'Dakar, Yoff' },
  { id: 'ORD005', customerInfo: { fullName: 'Ousmane Sow', address: 'Dakar, Maristes', phone: '751234567' }, items: [{ productId: '1', productName: 'Maillot Sénégal', quantity: 1, price: 45000, selectedSize: 'M' }], totalAmount: 45000, status: OrderStatus.Cancelled, orderDate: new Date(2024, 4, 2).toISOString(), paymentMethod: 'cod', shippingAddress: 'Dakar, Maristes' },
];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // Here you would typically call an API to update the order status
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <TableCell>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</TableCell>
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
                            {Object.values(OrderStatus).map(statusVal => (
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
                <p><strong>Méthode de paiement:</strong> {selectedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Wave'}</p>
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

