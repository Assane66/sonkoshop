
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, AlertTriangle, LineChart as LineChartIcon, ShoppingCart, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Product, Order } from '@/types';
import { OrderStatus } from '@/types';

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
  const [salesData, setSalesData] = useState<{ month: string; sales: number }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    setIsLoadingData(true);
    const unsubscribes: (() => void)[] = [];

    // Fetch total products and stock alerts
    const productsCollection = collection(db, 'products');
    unsubscribes.push(onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map(doc => doc.data() as Product);
      setTotalProducts(productsData.length);
      setStockAlerts(productsData.filter(p => p.stock > 0 && p.stock < 5).length);
    }, (error) => {
      console.error("Error fetching products:", error);
    }));

    // Consolidated listener for all orders data to prevent indexing issues and improve efficiency
    const ordersCollection = collection(db, 'orders');
    const allOrdersQuery = query(ordersCollection, orderBy('orderDate', 'desc'));

    unsubscribes.push(onSnapshot(allOrdersQuery, (snapshot) => {
      const allFetchedOrders: Order[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : data.orderDate,
        } as Order
      });

      // 1. Set latest orders from the fetched list
      setLatestOrders(allFetchedOrders.slice(0, 5));

      // 2. Process sales data from delivered orders
      const deliveredOrders = allFetchedOrders.filter(order => order.status === OrderStatus.Delivered);

      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

      const currentYearSales = new Array(12).fill(0).map((_, i) => ({
        month: monthNames[i],
        sales: 0
      }));

      const currentYear = new Date().getFullYear();

      deliveredOrders.forEach(order => {
        const orderDate = order.orderDate instanceof Timestamp
          ? order.orderDate.toDate()
          : new Date(order.orderDate as string);

        if (orderDate.getFullYear() === currentYear) {
          const monthIndex = orderDate.getMonth();
          currentYearSales[monthIndex].sales += order.totalAmount;
        }
      });
      setSalesData(currentYearSales);

    }, (error) => {
      console.error("Error fetching orders for dashboard. This may be a permissions issue.", error);
    }));

    // Using a timeout to prevent flash of loader on fast connections
    const timer = setTimeout(() => setIsLoadingData(false), 1200);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, []);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Vue d'ensemble de votre boutique.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add date range picker or actions here if needed */}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Products Card */}
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Archive className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">
              Produits Totaux
            </CardTitle>
            <Archive className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">
              {isLoadingData ? <Loader2 className="h-8 w-8 animate-spin" /> : totalProducts}
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Articles référencés
            </p>
          </CardContent>
        </Card>

        {/* Stock Alerts Card */}
        <Card className="border-none shadow-md bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Alertes Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {isLoadingData ? <Loader2 className="h-8 w-8 animate-spin" /> : stockAlerts}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Produits avec stock &lt; 5
            </p>
          </CardContent>
        </Card>

        {/* Sales Card (Placeholder for now, could be real total sales) */}
        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Ventes (Année)
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {isLoadingData ? <Loader2 className="h-8 w-8 animate-spin" /> :
                (salesData.reduce((acc, curr) => acc + curr.sales, 0)).toLocaleString('fr-FR') + " FCFA"
              }
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Aperçu des Ventes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingData ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000)}k`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, "Ventes"]}
                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-md border-slate-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Dernières Commandes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-auto">
            {isLoadingData ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : latestOrders.length > 0 ? (
              <div className="overflow-x-auto">
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
                        <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                        <TableCell>{order.customerInfo.fullName}</TableCell>
                        <TableCell>{new Date(typeof order.orderDate === 'string' ? order.orderDate : order.orderDate.toDate()).toLocaleDateString('fr-FR')}</TableCell>
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-500">
                <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                <p>Aucune commande récente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
