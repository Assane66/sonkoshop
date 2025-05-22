
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Gérer les Commandes</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les commandes des clients.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commandes</CardTitle>
          <CardDescription>Voici toutes les commandes passées sur votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for orders table or list */}
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mb-4" />
            <p className="text-lg">Aucune commande pour le moment.</p>
            <p className="text-sm">Les nouvelles commandes s'afficheront ici.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
