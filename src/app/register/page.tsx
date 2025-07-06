
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { User, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        role: "customer", // Default role
        createdAt: new Date(),
      });

      toast({ title: 'Compte créé avec succès!', description: 'Redirection vers votre espace personnel.' });
      router.push('/account');

    } catch (err: any) {
      let errorMessage = "Une erreur est survenue lors de l'inscription.";
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = 'Cet email est déjà utilisé.';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = "Le format de l'email est invalide.";
        } else if (err.code === 'auth/weak-password') {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        }
      }
      setError(errorMessage);
      toast({ variant: 'destructive', title: "Échec de l'inscription", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Créer un compte</CardTitle>
          <CardDescription>Rejoignez Sonko Shop pour une meilleure expérience.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ex: Modou Fall"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="password">Mot de passe</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "S'inscrire"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Déjà un compte ? <Link href="/login" className="text-primary hover:underline">Connectez-vous</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
