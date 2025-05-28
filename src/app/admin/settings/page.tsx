
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Globe, CreditCard, Truck, Info, Image as ImageIconLucide } from 'lucide-react'; // Using ImageIconLucide to avoid conflict

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Mocked initial settings state
  const [siteName, setSiteName] = useState('Sonko Shop');
  const [siteDescription, setSiteDescription] = useState('Boutique en ligne de Sonko Shop: maillots, chaussures, etc.');
  const [contactEmail, setContactEmail] = useState('sonkoshop1@gmail.com');
  const [contactPhone, setContactPhone] = useState('784513633');

  const [codEnabled, setCodEnabled] = useState(true);
  const [waveEnabled, setWaveEnabled] = useState(true);
  const [wavePaymentUrl, setWavePaymentUrl] = useState('https://pay.wave.com/m/M_pIXmQ2smGxRM/c/sn/');

  const handleSaveChanges = () => {
    // In a real app, you'd save these settings to a database or configuration file (e.g., a 'settings' document in Firestore)
    console.log("Saving settings:", {
      siteName, siteDescription, contactEmail, contactPhone,
      codEnabled, waveEnabled, wavePaymentUrl,
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

            <div className="p-3 border rounded-md space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="mr-3 h-6 w-6 flex items-center justify-center">
                           <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M13.577 109.354C8.02 109.354 3.5 104.835 3.5 99.277V10.444C3.5 4.886 8.02 0.368 13.577 0.368H95.828C101.386 0.368 105.904 4.886 105.904 10.444V99.277C105.904 104.835 101.386 109.354 95.828 109.354H13.577Z" fill="#00A9E7"></path><path d="M91.794 43.65C88.48 40.336 79.32 37.021 70.424 37.021C59.638 37.021 51.27 40.336 46.822 43.65L45.674 44.534C45.145 44.807 44.617 44.807 44.088 44.534L39.375 42.396C36.326 40.864 32.467 40.055 28.872 40.055C25.012 40.055 21.417 41.128 18.368 42.924V21.02C22.711 19.224 27.863 18.15 33.28 18.15C43.538 18.15 51.905 21.465 56.089 24.514L57.237 25.397C57.766 25.671 58.294 25.671 58.823 25.397L63.271 23.26C66.585 21.727 70.18 21.199 73.505 21.199C76.83 21.199 80.155 21.727 83.204 22.799V43.65H91.794Z" fill="#042A3A"></path><path d="M91.793 65.971C88.479 69.285 79.319 72.6 70.423 72.6C59.637 72.6 51.269 69.285 46.821 65.971L45.673 65.088C45.144 64.815 44.616 64.815 44.087 65.088L39.374 67.226C36.325 68.758 32.466 69.567 28.871 69.567C25.011 69.567 21.416 68.494 18.367 66.698V88.601C22.71 90.397 27.862 91.47 33.279 91.47C43.537 91.47 51.904 88.155 56.088 85.106L57.236 84.223C57.765 83.95 58.293 83.95 58.822 84.223L63.27 86.36C66.584 87.892 70.179 88.42 73.504 88.42C76.829 88.42 80.154 87.892 83.203 86.82V65.971H91.793Z" fill="white"></path></svg>
                        </div>
                        <div>
                        <Label htmlFor="waveEnabled" className="font-medium">Paiement par Wave</Label>
                        <p className="text-xs text-muted-foreground">Permettre aux clients de payer via Wave.</p>
                        </div>
                    </div>
                    <Switch id="waveEnabled" checked={waveEnabled} onCheckedChange={setWaveEnabled} />
                </div>
                {waveEnabled && (
                     <div>
                        <Label htmlFor="wavePaymentUrl">URL de paiement Wave (base)</Label>
                        <Input id="wavePaymentUrl" value={wavePaymentUrl} onChange={(e) => setWavePaymentUrl(e.target.value)} placeholder="https://pay.wave.com/m/VOTRE_ID/c/sn/" />
                        <p className="text-xs text-muted-foreground mt-1">L'application ajoutera `?amount=TOTAL` à cette URL.</p>
                    </div>
                )}
            </div>
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
