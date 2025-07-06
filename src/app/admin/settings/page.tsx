
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Globe, CreditCard, Truck, Info, Image as ImageIconLucide, Loader2 } from 'lucide-react';
import type { SiteSettings } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const initialSettings: SiteSettings = {
  siteName: 'Sonko Shop',
  siteDescription: 'Boutique en ligne de Sonko Shop: maillots, chaussures, etc.',
  contactEmail: 'sonkoshop1@gmail.com',
  contactPhone: '784513633',
  codEnabled: true,
  waveEnabled: true,
  wavePaymentUrl: 'https://pay.wave.com/m/M_pIXmQ2smGxRM/c/sn/',
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, 'site_settings', 'config');
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        setSettings({ ...initialSettings, ...docSnap.data() });
      } else {
        // If no settings doc exists, use initialSettings
        setSettings(initialSettings);
        console.log("No settings document found, using initial default settings.");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les paramètres.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: keyof SiteSettings, checked: boolean) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const settingsDocRef = doc(db, 'site_settings', 'config');
      await setDoc(settingsDocRef, settings, { merge: true });
      toast({
        title: "Paramètres sauvegardés!",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      let description = 'Impossible de sauvegarder les paramètres.';
      if (error.code === 'permission-denied') {
        description = 'Permission refusée. Veuillez vérifier vos règles de sécurité Firestore.';
      }
      toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: description });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
    );
  }

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
              <Input id="siteName" value={settings.siteName} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description du Site (pour SEO)</Label>
              <Input id="siteDescription" value={settings.siteDescription} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email de Contact Principal</Label>
              <Input id="contactEmail" type="email" value={settings.contactEmail} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone de Contact Principal</Label>
              <Input id="contactPhone" type="tel" value={settings.contactPhone} onChange={handleInputChange} disabled={isSaving} />
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
              <Switch id="codEnabled" checked={settings.codEnabled} onCheckedChange={(checked) => handleSwitchChange('codEnabled', checked)} disabled={isSaving} />
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
                    <Switch id="waveEnabled" checked={settings.waveEnabled} onCheckedChange={(checked) => handleSwitchChange('waveEnabled', checked)} disabled={isSaving} />
                </div>
                {settings.waveEnabled && (
                     <div>
                        <Label htmlFor="wavePaymentUrl">URL de paiement Wave (base)</Label>
                        <Input id="wavePaymentUrl" value={settings.wavePaymentUrl} onChange={handleInputChange} placeholder="https://pay.wave.com/m/VOTRE_ID/c/sn/" disabled={isSaving} />
                        <p className="text-xs text-muted-foreground mt-1">L'application ajoutera `?amount=TOTAL` à cette URL.</p>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90" disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
        </Button>
      </div>
    </div>
  );
}
