
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Archive, AlertTriangle, LineChart as LineChartIcon, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for Sales Report
const monthlyRevenueData = [
  { month: "Jan", sales: 0 },
  { month: "Fév", sales: 15000 },
  { month: "Mar", sales: 20000 },
  { month: "Avr", sales: 22000 },
  { month: "Mai", sales: 38000 },
  { month: "Juin", sales: 30000 },
  { month: "Juil", sales: 25000 },
];

// Mock data for Latest Orders
const mockLatestOrders = [
  { id: '#1806', customer: 'Alice Brown', date: '23 Avr, 2024', status: 'Payé', total: 45000 },
  { id: '#1805', customer: 'Bob Smith', date: '23 Avr, 2024', status: 'En attente', total: 62000 },
  { id: '#1804', customer: 'Charlie Green', date: '22 Avr, 2024', status: 'En attente', total: 28000 },
  { id: '#1803', customer: 'David Lee', date: '22 Avr, 2024', status: 'Annulé', total: 18000 },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'payé':
      return 'default'; // Will be styled by className
    case 'en attente':
      return 'secondary'; // Will be styled by className
    case 'annulé':
      return 'destructive'; // Will be styled by className
    default:
      return 'outline';
  }
};


export default function AdminDashboardPage() {
  // Mock values
  const totalProducts = 234;
  const stockAlerts = 3;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{totalProducts}</CardTitle>
            {/* <Archive className="h-6 w-6 text-primary-foreground/80" /> */}
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Produits Totaux</p>
          </CardContent>
        </Card>
        <Card className="border-destructive border-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-destructive">{stockAlerts}</CardTitle>
            <div className="relative">
              {/* <AlertTriangle className="h-6 w-6 text-destructive/80" /> */}
               <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs h-5 w-5 flex items-center justify-center">
                {stockAlerts}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm font-medium text-destructive">Alertes de Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Rapport des Ventes</CardTitle>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLatestOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge 
                       variant={getStatusBadgeVariant(order.status) as any}
                       className={cn(
                        "text-xs py-1 px-2.5 font-semibold rounded-full",
                        order.status.toLowerCase() === 'payé' && 'bg-green-100 text-green-700 border border-green-200',
                        order.status.toLowerCase() === 'en attente' && 'bg-yellow-100 text-yellow-700 border border-yellow-200',
                        order.status.toLowerCase() === 'annulé' && 'bg-red-100 text-red-700 border border-red-200'
                       )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.total.toLocaleString('fr-FR')} FCFA</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
