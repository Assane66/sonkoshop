import { Mail, Phone, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Sonko Shop</h3>
            <p className="text-sm text-foreground/80">Vêtements et équipements sportifs de qualité.</p>
            <p className="text-sm text-foreground/80 mt-2">Tivaouane Peulh, Quartier Diawrine</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Contactez-nous</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <a href="tel:784513633" className="text-foreground/80 hover:text-foreground">78 451 36 33</a> / <a href="tel:781395893" className="text-foreground/80 hover:text-foreground">78 139 58 93</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <a href="mailto:sonkoshop1@gmail.com" className="text-foreground/80 hover:text-foreground">sonkoshop1@gmail.com</a>
              </li>
              <li className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                <a href="https://wa.me/221784513633" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground">WhatsApp</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="text-foreground/80 hover:text-foreground">Tous les produits</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground">Politique de retour</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground">Termes et Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-foreground/60">
          © {new Date().getFullYear()} Sonko Shop. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
