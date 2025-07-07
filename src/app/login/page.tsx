'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// The actual form logic is moved into this component
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles redirection after userData is loaded
    if (!authLoading && userData) {
      if (userData.role === 'admin') {
        router.push('/admin');
      } else {
        const from = searchParams.get('from') || '/account';
        router.push(from);
      }
    }
  }, [userData, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user) {
        toast({ title: 'Connexion réussie!', description: 'Redirection en cours...' });
        // The useEffect above will handle the redirection once userData is available.
      } else {
         setError('Impossible de récupérer les informations utilisateur.');
         toast({ variant: 'destructive', title: 'Échec de la connexion', description: 'Impossible de récupérer les informations utilisateur.' });
         setIsLoading(false);
      }
    } catch (err: any) {
      let errorMessage = "Une erreur est survenue lors de la connexion.";
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = "Le format de l'email est invalide.";
        }
      }
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Échec de la connexion', description: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Connexion</CardTitle>
        <CardDescription>Accédez à votre compte Sonko Shop.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nom@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Se connecter'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Pas de compte ? <Link href="/register" className="text-primary hover:underline">Inscrivez-vous</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}


// The main page component now wraps LoginForm in a Suspense boundary
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}