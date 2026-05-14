
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Truck, CreditCard, ShieldCheck, Mail } from "lucide-react";
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.98-1.59-2.02-2.18-4.72-1.6-7.25.5-2.12 2.03-3.84 3.91-4.96.86-.51 1.76-.84 2.68-1.02.01-1.32-.01-2.65.02-3.97.02-.31.06-.62.12-.92.09-.45.24-.89.43-1.3.18-.4.4-.78.68-1.14.3-.37.64-.72.99-1.03.35-.31.72-.6 1.1-.85.38-.25.78-.47 1.19-.66z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-border">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Livraison Rapide</h4>
            <p className="text-sm text-muted-foreground">Livraison partout au Sénégal en 24h</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Paiement Sécurisé</h4>
            <p className="text-sm text-muted-foreground">À la livraison ou via Wave</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Satisfaction Garantie</h4>
            <p className="text-sm text-muted-foreground">Retour facile sous 7 jours</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <span className="text-lg font-bold text-primary">✓</span>
            </div>
            <h4 className="font-semibold text-foreground mb-1">Service Client</h4>
            <p className="text-sm text-muted-foreground">Support disponible 24/7</p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-6">
              <span className="text-xl font-bold text-foreground">SONKO</span>
              <span className="text-xl font-bold text-primary">SHOP</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Votre destination pour les vêtements et équipements sportifs de qualité premium.
            </p>
            <div className="flex gap-3">
              <Link 
                href="https://www.facebook.com/profile.php?id=61556322727649" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.tiktok.com/@sonkoshop24" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.instagram.com/sonko24shop/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Aide</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contactez-nous
                </Link>
              </li>
              <li>
                <Link href="/politique-de-retour" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Retours et échanges
                </Link>
              </li>
              <li>
                <Link href="/termes-et-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Modes de paiement
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Nos Boutiques</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="https://maps.app.goo.gl/vb67yYM6BqKWq6jh7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tivaouane Peulh
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Toutes les boutiques
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/termes-et-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Conditions de vente
                </Link>
              </li>
              <li>
                <Link href="/politique-de-retour" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sonko Shop. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span>Fait avec ❤️ pour vous</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
