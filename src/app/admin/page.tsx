
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingCart, BarChart3, LineChart, ListChecks, AlertTriangle, Bell } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils'; // Ensure this import is present

// Updated data to somewhat match the visual scale of the image (0 to 40k)
const monthlyRevenueData = [
  { month: "Jan", revenue: 5000 },
  { month: "Feb", revenue: 10000 },
  { month: "Mar", revenue: 18000 },
  { month: "Apr", revenue: 25000 },
  { month: "May", revenue: 38000 },
  { month: "Jun", revenue: 30000 },
  { month: "Jul", revenue: 22000 },
];

const chartConfig: ChartConfig = {
  revenue: {
    label: "Ventes (FCFA)", // Changed label to "Ventes"
    color: "hsl(var(--primary))", // Use primary color (dark green)
    icon: LineChart,
  },
};

const latestOrdersData = [
  { id: "#1806", customer: "Alice Brown", date: "Apr 23, 2024", status: "Paid" },
  { id: "#1805", customer: "Bob Smith", date: "Apr 23, 2024", status: "Pending" },
  { id: "#1804", customer: "Charlie Green", date: "Apr 22, 2024", status: "Pending" },
  { id: "#1803", customer: "David Lee", date: "Apr 22, 2024", status: "Cancelled" },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid": return "success"; // Will add this variant or use CSS
    case "pending": return "warning"; // Will add this variant or use CSS
    case "cancelled": return "destructive";
    default: return "secondary";
  }
};

export default function AdminDashboardPage() {
  const totalProducts = 234; // From image
  const stockAlerts = 3; // From image

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        {/* Optional: Icon on the right, like a settings or notification icon */}
        {/* <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-muted-foreground" /></Button> */}
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="lg:col-span-1 bg-primary text-primary-foreground">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">{totalProducts}</div>
            <p className="text-sm text-primary-foreground/90 mt-1">Total Products</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 border-destructive">
          <CardContent className="p-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center text-xs">{stockAlerts}</Badge>
            </div>
            <div className="text-5xl font-bold text-destructive">{stockAlerts}</div>
            <p className="text-sm text-muted-foreground mt-1">Stock Alerts</p>
          </CardContent>
        </Card>
         {/* Placeholder for other cards if needed */}
        <Card className="hidden lg:block lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Example)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FCFA 1,234,567</div>
            <p className="text-xs text-muted-foreground">+20.1% vs last month</p>
          </CardContent>
        </Card>
        <Card className="hidden lg:block lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers (Example)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+32</div>
            <p className="text-xs text-muted-foreground">+5% vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mb-8"> {/* Single column for Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              {/* <LineChart className="h-5 w-5 text-primary" />  Icon removed to match image */}
              Sales Report
            </CardTitle>
            {/* <CardDescription>Monthly sales performance.</CardDescription> */}
          </CardHeader>
          <CardContent className="pl-2 pr-6 pb-6">
            <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyRevenueData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000)}k`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 40000]} // Max value from image is around 40k (assuming $4k is illustrative)
                    ticks={[0, 10000, 20000, 30000, 40000]} // Match image's y-axis
                  />
                  <ChartTooltip 
                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3'}} 
                    content={<ChartTooltipContent indicator="line" nameKey="revenue" labelKey="month" />} 
                    />
                  {/* <ChartLegend content={<ChartLegendContent />} /> Removed legend to match image */}
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="hsl(var(--primary))" // Dark green line
                    strokeWidth={3} // Thicker line
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth:0 }} // Slightly larger dots
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth:0 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Latest Orders Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Latest Orders</CardTitle>
            {/* <CardDescription>Recent orders in the store.</CardDescription> */}
          </CardHeader>
          <CardContent className="p-0"> {/* Remove padding to make table flush */}
            {latestOrdersData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-left pr-6">Status</TableHead> {/* Align left and add padding */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrdersData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium pl-6">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-left pr-6">
                        <Badge 
                           variant={getStatusBadgeVariant(order.status) as any}
                           className={cn(
                            "text-xs py-1 px-2.5",
                            order.status.toLowerCase() === 'paid' && 'bg-green-100 text-green-700 border-green-200',
                            order.status.toLowerCase() === 'pending' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                            order.status.toLowerCase() === 'cancelled' && 'bg-red-100 text-red-700 border-red-200'
                           )}
                        >
                            {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground p-6 text-center">No recent orders to display.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
