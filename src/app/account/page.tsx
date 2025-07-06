
'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccountPage() {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossible de charger les informations du compte.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenue, {userData.fullName} !</CardTitle>
          <CardDescription>
            C'est votre espace personnel. Gérez vos informations et commandes ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Email :</strong> {userData.email}</p>
          <p><strong>Rôle :</strong> {userData.role === 'admin' ? 'Administrateur' : 'Client'}</p>
        </CardContent>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
                <CardTitle>Mes Commandes</CardTitle>
                <CardDescription>
                    Consultez l'historique et le statut de vos commandes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/account/orders">Voir mes commandes</Link>
                </Button>
            </CardContent>
        </Card>
        {/* Placeholder for future features */}
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
                <CardTitle>Mes Favoris</CardTitle>
                <CardDescription>
                    Accédez à la liste des produits que vous avez aimés. (Bientôt disponible)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button disabled>Voir mes favoris</Button>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
