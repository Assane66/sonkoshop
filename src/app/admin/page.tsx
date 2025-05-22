
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingCart, BarChart3, LineChart, ListChecks } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer, Pie, PieChart, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const monthlyRevenueData = [
  { month: "Jan", desktop: 186000, mobile: 80000 },
  { month: "Feb", desktop: 305000, mobile: 200000 },
  { month: "Mar", desktop: 237000, mobile: 120000 },
  { month: "Apr", desktop: 73000, mobile: 190000 },
  { month: "May", desktop: 209000, mobile: 130000 },
  { month: "Jun", desktop: 214000, mobile: 140000 },
];

const chartConfig: ChartConfig = {
  desktop: {
    label: "Revenu (FCFA)",
    color: "hsl(var(--primary))",
    icon: LineChart,
  },
  mobile: { // Example, can remove or rename
    label: "Objectif (FCFA)",
    color: "hsl(var(--secondary))",
    icon: LineChart,
  }
};

const salesByCategoryData = [
  { category: "Maillots", sales: 45, fill: "hsl(var(--chart-1))" },
  { category: "Chaussures", sales: 32, fill: "hsl(var(--chart-2))"  },
  { category: "Pantalons", sales: 28, fill: "hsl(var(--chart-3))"  },
  { category: "Enfants", sales: 22, fill: "hsl(var(--chart-4))"  },
  { category: "Gardiens", sales: 18, fill: "hsl(var(--chart-5))"  },
];

const salesByCategoryConfig: ChartConfig = {
  sales: {
    label: "Unités Vendues",
  },
  Maillots: { label: "Maillots", color: "hsl(var(--chart-1))" },
  Chaussures: { label: "Chaussures", color: "hsl(var(--chart-2))" },
  Pantalons: { label: "Pantalons", color: "hsl(var(--chart-3))" },
  Enfants: { label: "Enfants", color: "hsl(var(--chart-4))" },
  Gardiens: { label: "Gardiens", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


const recentActivities = [
  { id: "CMD004", customer: "Fatou Kébé", items: 2, total: "58,000 FCFA", status: "En traitement" },
  { id: "CMD005", customer: "Alioune Ndiaye", items: 1, total: "22,000 FCFA", status: "Expédiée" },
  { id: "PROD009", customer: "Nouveau Produit", items: 0, total: "Veste de Sport", status: "Ajouté" },
  { id: "USER003", customer: "Aminata Gueye", items: 0, total: "Nouveau Client", status: "Inscrit" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-primary">Tableau de Bord Admin</h1>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total (Mois)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FCFA 1,234,567</div>
            <p className="text-xs text-muted-foreground">+20.1% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Totales (Mois)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+120</div>
            <p className="text-xs text-muted-foreground">+15% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">+5 depuis la semaine dernière</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+32</div>
            <p className="text-xs text-muted-foreground">+8.2% depuis le mois dernier</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Revenu Mensuel
            </CardTitle>
            <CardDescription>Aperçu des revenus générés chaque mois.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyRevenueData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                   <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="desktop"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                    name="Revenu"
                  />
                  {/* <Line
                    dataKey="mobile"
                    type="monotone"
                    stroke="var(--color-mobile)"
                    strokeWidth={2}
                    dot={false}
                    name="Objectif"
                  /> */}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Ventes par Catégorie
            </CardTitle>
            <CardDescription>Distribution des unités vendues par catégorie de produits.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesByCategoryConfig} className="aspect-auto h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    width={80}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="sales" radius={5}>
                     {salesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Activité Récente
            </CardTitle>
            <CardDescription>Aperçu des dernières activités de la boutique.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type/ID</TableHead>
                    <TableHead>Détail</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead className="text-right">Statut/Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{activity.id.startsWith("CMD") ? "Commande" : activity.id.startsWith("PROD") ? "Produit" : "Utilisateur"}</TableCell>
                      <TableCell>{activity.customer}</TableCell>
                      <TableCell>{activity.total} {activity.items > 0 ? `(${activity.items} articles)` : ""}</TableCell>
                      <TableCell className="text-right"><Badge variant={activity.status === "En traitement" ? "default" : activity.status === "Expédiée" ? "secondary" : "outline"}>{activity.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Aucune activité récente à afficher pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
