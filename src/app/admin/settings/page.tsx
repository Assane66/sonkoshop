
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Globe, CreditCard, Truck, Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Mocked initial settings state
  const [siteName, setSiteName] = useState('Sonko Shop');
  const [siteDescription, setSiteDescription] = useState('Boutique en ligne de Sonko Shop: maillots, chaussures, etc.');
  const [contactEmail, setContactEmail] = useState('sonkoshop1@gmail.com');
  const [contactPhone, setContactPhone] = useState('784513633');

  const [codEnabled, setCodEnabled] = useState(true);
  // Removed Wave related state

  const handleSaveChanges = () => {
    // In a real app, you'd save these settings to a database or configuration file
    console.log("Saving settings:", {
      siteName, siteDescription, contactEmail, contactPhone,
      codEnabled, // Removed Wave settings
    });
    toast({
      title: "Paramètres sauvegardés!",
      description: "Vos modifications ont été enregistrées (simulation).",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Paramètres du Site</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/> Informations Générales du Site</CardTitle>
            <CardDescription>Configurez les informations de base de votre boutique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nom du Site</Label>
              <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description du Site (pour SEO)</Label>
              <Input id="siteDescription" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email de Contact Principal</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone de Contact Principal</Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/> Options de Paiement</CardTitle>
            <CardDescription>Gérez les méthodes de paiement disponibles pour les clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <Truck className="mr-3 h-6 w-6 text-muted-foreground" />
                <div>
                  <Label htmlFor="codEnabled" className="font-medium">Paiement à la livraison (COD)</Label>
                  <p className="text-xs text-muted-foreground">Permettre aux clients de payer en espèces à la livraison.</p>
                </div>
              </div>
              <Switch id="codEnabled" checked={codEnabled} onCheckedChange={setCodEnabled} />
            </div>
            {/* Wave payment options removed */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
          Enregistrer les Modifications
        </Button>
      </div>
    </div>
  );
}

    