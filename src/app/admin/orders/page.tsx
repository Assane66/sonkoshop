
'use client';

import { useState } from 'react';
import type { Order, OrderStatus, CustomerInfo, OrderItem } from '@/types';
import { orderStatusList } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Package, Filter, MoreHorizontal, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const initialOrders: Order[] = [
  {
    id: 'CMD001',
    customerInfo: { fullName: 'Moussa Diop', address: 'Dakar, Sicap Baobab', phone: '771234567' },
    items: [
      { productId: '1', productName: 'Maillot Sénégal Authentique', quantity: 1, price: 45000, selectedSize: 'L', imageUrl: 'https://placehold.co/40x40.png' },
      { productId: '2', productName: 'Chaussures "Vitesse Ultime"', quantity: 1, price: 62000, selectedSize: '42', imageUrl: 'https://placehold.co/40x40.png' },
    ],
    totalAmount: 107000,
    status: OrderStatus.Processing,
    orderDate: new Date(2024, 6, 15, 10, 30).toISOString(),
    paymentMethod: 'cod',
    shippingAddress: 'Dakar, Sicap Baobab',
  },
  {
    id: 'CMD002',
    customerInfo: { fullName: 'Awa Fall', address: 'Thiès, Randoulène Sud', phone: '781112233' },
    items: [{ productId: '3', productName: 'Pantalon d\'Entraînement Pro', quantity: 2, price: 28000, selectedSize: 'M', imageUrl: 'https://placehold.co/40x40.png' }],
    totalAmount: 56000,
    status: OrderStatus.Shipped,
    orderDate: new Date(2024, 6, 16, 14, 0).toISOString(),
    paymentMethod: 'wave',
    shippingAddress: 'Thiès, Randoulène Sud',
  },
   {
    id: 'CMD003',
    customerInfo: { fullName: 'Ibrahim Sow', address: 'Saint Louis, Sor', phone: '705556677' },
    items: [{ productId: '4', productName: 'Ensemble Sportif Enfant "Champion"', quantity: 1, price: 22000, selectedSize: '8A', imageUrl: 'https://placehold.co/40x40.png' }],
    totalAmount: 22000,
    status: OrderStatus.Delivered,
    orderDate: new Date(2024, 6, 14, 9, 15).toISOString(),
    paymentMethod: 'cod',
    shippingAddress: 'Saint Louis, Sor',
  },
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending: return 'outline';
    case OrderStatus.Processing: return 'default';
    case OrderStatus.Shipped: return 'secondary';
    case OrderStatus.Delivered: return 'default'; // Consider a success variant if added
    case OrderStatus.Cancelled: return 'destructive';
    default: return 'secondary';
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending: return <Clock className="h-3 w-3" />;
    case OrderStatus.Processing: return <Filter className="h-3 w-3" />; // Using Filter as a placeholder
    case OrderStatus.Shipped: return <Truck className="h-3 w-3" />;
    case OrderStatus.Delivered: return <CheckCircle className="h-3 w-3" />;
    case OrderStatus.Cancelled: return <XCircle className="h-3 w-3" />;
    default: return <Package className="h-3 w-3" />;
  }
};


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    // Add confirmation dialog here in a real app
    setOrders(orders.filter((o) => o.id !== orderId));
    toast({ title: "Commande Supprimée", description: `La commande ${orderId} a été supprimée.` });
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast({ title: "Statut Mis à Jour", description: `Le statut de la commande ${orderId} est maintenant ${newStatus}.` });
  };


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Gérer les Commandes</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les commandes des clients.
        </p>
      </div>

      {/* Dialog for Order Details */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la Commande: {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Informations complètes de la commande.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <Card>
                <CardHeader><CardTitle className="text-lg">Informations Client</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Nom:</strong> {selectedOrder.customerInfo.fullName}</p>
                  <p><strong>Adresse:</strong> {selectedOrder.customerInfo.address}</p>
                  <p><strong>Téléphone:</strong> {selectedOrder.customerInfo.phone}</p>
                  {selectedOrder.customerInfo.email && <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Articles Commandés</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="w-[50px]">Qté</TableHead>
                        <TableHead className="text-right">Prix Unitaire</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map(item => (
                        <TableRow key={item.productId + (item.selectedSize || '')}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Image src={item.imageUrl || 'https://placehold.co/40x40.png'} alt={item.productName} width={30} height={30} className="rounded" data-ai-hint="product thumbnail" />
                              <div>
                                {item.productName}
                                {item.selectedSize && <span className="text-xs text-muted-foreground ml-1">({item.selectedSize})</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.price.toLocaleString('fr-FR')} FCFA</TableCell>
                          <TableCell className="text-right">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle className="text-lg">Résumé Financier et Statut</CardTitle></CardHeader>
                 <CardContent className="text-sm space-y-2">
                    <p><strong>Méthode de Paiement:</strong> <Badge variant="outline">{selectedOrder.paymentMethod.toUpperCase()}</Badge></p>
                    <p><strong>Montant Total:</strong> <span className="font-semibold text-primary">{selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</span></p>
                    <p><strong>Date Commande:</strong> {format(new Date(selectedOrder.orderDate), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                    <div className="flex items-center gap-2">
                        <strong>Statut Actuel:</strong> 
                        <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="inline-flex items-center gap-1">
                            {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status}
                        </Badge>
                    </div>
                 </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Commandes</CardTitle>
          <CardDescription>Voici toutes les commandes passées sur votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerInfo.fullName}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), "dd/MM/yy HH:mm", { locale: fr })}</TableCell>
                    <TableCell className="text-right">{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                    <TableCell>
                        <Select value={order.status} onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as OrderStatus)}>
                            <SelectTrigger className="h-8 w-[150px] text-xs">
                                <SelectValue placeholder="Changer statut" />
                            </SelectTrigger>
                            <SelectContent>
                                {orderStatusList.map(statusValue => (
                                <SelectItem key={statusValue} value={statusValue} className="text-xs">
                                    <div className="flex items-center gap-2">
                                     {getStatusIcon(statusValue)} {statusValue}
                                    </div>
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" /> Voir Détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mb-4" />
              <p className="text-lg">Aucune commande pour le moment.</p>
              <p className="text-sm">Les nouvelles commandes s'afficheront ici.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
