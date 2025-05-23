
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, AlertTriangle, LineChart as LineChartIcon, ShoppingCart, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Product, Order, OrderStatus } from '@/types'; // Ajout de l'importation OrderStatus

// Mock data for Sales Report - can be replaced with real data later
const monthlyRevenueData = [
  { month: "Jan", sales: 0 },
  { month: "Fév", sales: 15000 },
  { month: "Mar", sales: 20000 },
  { month: "Avr", sales: 22000 },
  { month: "Mai", sales: 38000 },
  { month: "Juin", sales: 30000 },
  { month: "Juil", sales: 25000 },
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


export default function AdminDashboardPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [stockAlerts, setStockAlerts] = useState(0);
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    // Fetch products for count and stock alerts
    setIsLoadingProducts(true);
    const productsCollectionRef = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(productsCollectionRef, (querySnapshot) => {
      const productsData: Product[] = querySnapshot.docs.map(doc => doc.data() as Product);
      setTotalProducts(productsData.length);
      setStockAlerts(productsData.filter(p => p.stock < 5 && p.stock > 0).length); // Example: alert if stock < 5
      setIsLoadingProducts(false);
    }, (error) => {
      console.error("Erreur de récupération des produits pour le dashboard:", error);
      setIsLoadingProducts(false);
    });

    // Fetch latest orders
    setIsLoadingOrders(true);
    const ordersCollectionRef = collection(db, 'orders');
    const qOrders = query(ordersCollectionRef, orderBy("orderDate", "desc"), limit(5));
    const unsubscribeOrders = onSnapshot(qOrders, (querySnapshot) => {
      const fetchedOrders: Order[] = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          orderDate: (data.orderDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Order;
      });
      setLatestOrders(fetchedOrders);
      setIsLoadingOrders(false);
    }, (error) => {
      console.error("Erreur de récupération des dernières commandes:", error);
      setIsLoadingOrders(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {isLoadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts}
            </CardTitle>
            {/* <Archive className="h-6 w-6 text-primary-foreground/80" /> */}
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Produits Totaux</p>
          </CardContent>
        </Card>
        <Card className="border-destructive border-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-destructive">
              {isLoadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : stockAlerts}
            </CardTitle>
            <div className="relative">
               <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs h-5 w-5 flex items-center justify-center">
                {isLoadingProducts ? '...' : stockAlerts}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm font-medium text-destructive">Alertes de Stock (Stock &lt; 5)</p>
          </CardContent>
        </Card>
         {/* Placeholder for Total Orders and Total Revenue cards if needed */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Rapport des Ventes (Fictif)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2 pr-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${(value / 1000)}k`}
                domain={[0, 40000]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
                formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, "Ventes"]}
              />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth:0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Dernières Commandes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingOrders ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
           ) : latestOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Commande ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0,6)}...</TableCell>
                    <TableCell>{order.customerInfo.fullName}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Badge 
                         className={cn(
                          "text-xs py-1 px-2.5 font-semibold rounded-full",
                           getStatusBadgeClass(order.status)
                         )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.totalAmount.toLocaleString('fr-FR')} FCFA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune commande récente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
