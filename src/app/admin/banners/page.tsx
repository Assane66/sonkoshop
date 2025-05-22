
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminBannersPage() {
  // Placeholder content
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Bannières</h1>
        <Button disabled className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Bannière (Bientôt)
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Liste des Bannières</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La fonctionnalité de gestion des bannières sera bientôt disponible. Vous pourrez ajouter, modifier et supprimer les bannières promotionnelles de votre page d'accueil.
          </p>
          {/* Placeholder for table or list of banners */}
        </CardContent>
      </Card>
    </div>
  );
}
