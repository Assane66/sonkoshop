
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock } from "lucide-react";

export default function ContactPage() {
    
  const WHATSAPP_NUMBER = "221784513633";
  const WHATSAPP_MESSAGE = "Bonjour Sonko Shop, j'ai une question concernant...";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">Contactez-nous</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Une question ? Une suggestion ? Nous sommes à votre écoute.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-foreground">Envoyez-nous un message</h2>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nom complet</Label>
                            <Input id="name" placeholder="Votre nom complet" />
                        </div>
                         <div>
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input id="phone" type="tel" placeholder="Votre numéro de téléphone" />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Écrivez votre message ici..." rows={5}/>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Envoyer le message</Button>
                    </form>
                </div>
                {/* Contact Info */}
                <div className="space-y-6">
                     <h2 className="text-2xl font-semibold text-foreground">Nos Coordonnées</h2>
                     <div className="space-y-4 text-foreground/80">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-primary/10 transition-colors">
                            <Phone className="h-6 w-6 text-primary" />
                            <div>
                                <span className="font-semibold">WhatsApp & Téléphone</span>
                                <p className="text-sm">78 451 36 33 / 78 139 58 93</p>
                            </div>
                        </a>
                         <a href="mailto:sonkoshop1@gmail.com" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-primary/10 transition-colors">
                            <Mail className="h-6 w-6 text-primary" />
                             <div>
                                <span className="font-semibold">Email</span>
                                <p className="text-sm">sonkoshop1@gmail.com</p>
                            </div>
                        </a>
                         <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Clock className="h-6 w-6 text-primary" />
                             <div>
                                <span className="font-semibold">Horaires de service</span>
                                <p className="text-sm">Lundi - Samedi : 09h00 - 20h00</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
             {/* Google Maps Embed */}
            <div className="mt-12">
                 <h2 className="text-2xl font-semibold text-foreground text-center mb-4">Notre Boutique</h2>
                 <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30858.68110870231!2d-17.318556789160123!3d14.806437199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec1a1d8282d2fa7%3A0x2b3c5eb9f8c3e3d2!2sSonko%20Shop!5e0!3m2!1sfr!2ssn!4v1763213371519!5m2!1sfr!2ssn"
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
