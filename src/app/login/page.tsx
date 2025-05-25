
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react'; // Added Loader2

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (user) {
    router.push('/admin'); // Redirect if already logged in
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("LoginPage: Attempting login with email:", email);
    try {
      await login(email, password);
      toast({ title: 'Connexion réussie!', description: 'Redirection vers le tableau de bord...' });
      router.push('/admin');
    } catch (error: any) {
      console.error("LoginPage: Erreur de connexion:", error);
      console.error("LoginPage: Firebase Error Code:", error.code);
      console.error("LoginPage: Firebase Error Message:", error.message);
      
      let errorMessage = "Une erreur est survenue lors de la connexion.";
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = "Email ou mot de passe incorrect.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Format d'email invalide.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
            break;
          default:
            errorMessage = `Erreur: ${error.message || 'Veuillez réessayer.'}`;
        }
      }
      toast({ variant: 'destructive', title: 'Échec de la connexion', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Connexion Administrateur</CardTitle>
          <CardDescription>Accédez à votre tableau de bord Sonko Shop</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Se Connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
