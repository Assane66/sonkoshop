'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailSent(false);

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (err: any) {
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
      // Firebase hides "user-not-found" for security. We'll show a generic message.
      // So we only really need to handle invalid-email format.
      if (err instanceof FirebaseError && err.code === 'auth/invalid-email') {
        errorMessage = "Le format de l'email est invalide.";
      }
      toast({ variant: 'destructive', title: 'Échec', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Mot de passe oublié</CardTitle>
          <CardDescription>
            {emailSent
              ? "Vérifiez votre boîte de réception pour les instructions."
              : "Entrez votre email pour recevoir un lien de réinitialisation."}
          </CardDescription>
        </CardHeader>
        {emailSent ? (
          <CardContent className="text-center">
            <MailCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <p className="text-muted-foreground">
              Si un compte est associé à <strong>{email}</strong>, un email a été envoyé. Pensez à vérifier votre dossier de courrier indésirable.
            </p>
          </CardContent>
        ) : (
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !email}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Envoyer le lien'}
              </Button>
            </CardFooter>
          </form>
        )}
        <CardFooter className="flex flex-col gap-4 border-t pt-6 mt-2">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">Retour à la page de connexion</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
