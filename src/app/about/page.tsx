
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Rocket, ShoppingBag, Goal, MapPin, Heart, Phone, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">À propos de Sonko Shop</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Bien plus qu’une simple boutique : c’est une aventure humaine, née de la passion, de l’amitié et d’une vision commune.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-4">
          
          <section className="flex flex-col md:flex-row items-center gap-8">
            <Rocket className="h-16 w-16 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Une idée née avec peu, mais portée par la volonté</h2>
              <p className="text-foreground/80">
                Créée le 28 août 2023, Sonko Shop est le fruit de la collaboration entre <strong>Mohamed Saho</strong>, l’initiateur de l’idée, et <strong>Alhassane Ba (Al Hasanba)</strong>, tous deux animés par le rêve de proposer des produits de qualité accessibles à tous. À l’origine, l’équipe comptait également Abdoulaye Sow, qui a contribué au lancement avant de se retirer. Aujourd’hui, Mohamed et Alhassane assurent ensemble la gestion et le développement de la boutique.
              </p>
              <p className="text-foreground/80 mt-2">
                Nous avons démarré avec des moyens très limités, en investissant chacun une petite part. Pas de grands fonds, pas de vitrines luxueuses. Seulement la foi en notre projet, la confiance entre nous et une détermination à toute épreuve. Petit à petit, Alhamdoulilah, nous avons grandi, élargi notre gamme et fidélisé nos premiers clients.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <div className="text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground mt-4 mb-2">Ce que nous proposons</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Au début, Sonko Shop ne proposait que des maillots. Aujourd’hui, notre offre s’est élargie pour inclure une vaste gamme de produits.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">Vêtements tendance</div>
                <div className="p-4 bg-muted/50 rounded-lg">Maillots de clubs</div>
                <div className="p-4 bg-muted/50 rounded-lg">Pantalons de sport</div>
                <div className="p-4 bg-muted/50 rounded-lg">Chaussures</div>
                <div className="p-4 bg-muted/50 rounded-lg">Accessoires de mode</div>
                <div className="p-4 bg-muted/50 rounded-lg">Équipements sportifs</div>
            </div>
             <p className="text-center text-muted-foreground mt-4">
                Notre objectif est de répondre aux besoins de tous, des passionnés de sport aux amoureux de la mode.
              </p>
          </section>
          
          <Separator />

          <section className="flex flex-col md:flex-row items-center gap-8">
             <Goal className="h-16 w-16 text-primary flex-shrink-0" />
            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Notre mission</h2>
                 <p className="text-foreground/80 mb-3">
                Nous croyons que chaque personne au Sénégal, peu importe sa ville ou son quartier, doit pouvoir acheter facilement ce dont elle a besoin — sans se ruiner, sans se déplacer loin, sans complications.
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li>Rendre les vêtements et équipements de qualité <strong>accessibles à tous</strong>.</li>
                    <li>Offrir un service <strong>proche, humain et professionnel</strong>.</li>
                    <li>Créer une marque <strong>respectée, inspirante et durable</strong>.</li>
                </ul>
            </div>
          </section>

          <Separator />

          <section className="text-center bg-primary/5 p-6 rounded-lg">
             <MapPin className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground mt-4 mb-3">Où nous trouver</h2>
            <div className="space-y-1 text-muted-foreground">
              <p><strong>Adresse :</strong> Tivaouane Peulh, Sénégal</p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" /> 
                <a href="tel:784513633" className="hover:text-primary">78 451 36 33</a> / <a href="tel:781395893" className="hover:text-primary">78 139 58 93</a>
              </p>
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> 
                <a href="mailto:sonkoshop1@gmail.com" className="hover:text-primary">sonkoshop1@gmail.com</a>
              </p>
              <p>🌐 Livraison possible partout au Sénégal</p>
            </div>
          </section>

          <Separator />
          
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-destructive fill-destructive" />
            <h2 className="text-2xl font-semibold text-foreground mt-4 mb-2">Merci à vous</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Chaque client, chaque commande, chaque mot d’encouragement nous pousse à continuer. Sonko Shop, c’est vous. Merci de faire partie de cette aventure.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
