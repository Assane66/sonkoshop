
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Paramètres du Site</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres généraux de votre boutique.
        </p>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Boutique</CardTitle>
            <CardDescription>Mettez à jour les informations de base de votre boutique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="shopName">Nom de la Boutique</Label>
              <Input id="shopName" defaultValue="Sonko Shop" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shopEmail">Email de Contact</Label>
              <Input id="shopEmail" type="email" defaultValue="sonkoshop1@gmail.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shopPhone">Téléphone</Label>
              <Input id="shopPhone" defaultValue="78 451 36 33" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shopAddress">Adresse</Label>
              <Input id="shopAddress" defaultValue="Tivaouane Peulh, Quartier Diawrine" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Enregistrer les Modifications</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de Paiement</CardTitle>
            <CardDescription>Configurez vos options de paiement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="cashOnDelivery" defaultChecked />
              <Label htmlFor="cashOnDelivery">Activer le paiement à la livraison</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="wavePayment" />
              <Label htmlFor="wavePayment">Activer Wave (Indisponible pour le moment)</Label>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Sauvegarder les Paramètres de Paiement</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
