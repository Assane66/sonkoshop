
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Gérer les Utilisateurs</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les comptes utilisateurs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Voici tous les utilisateurs enregistrés.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for users table or list */}
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg">Aucun utilisateur trouvé.</p>
            <p className="text-sm">Les nouveaux utilisateurs enregistrés s'afficheront ici.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
