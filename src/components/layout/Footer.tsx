
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Truck, CreditCard, ShieldCheck } from "lucide-react";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Top Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center pb-8 border-b border-gray-700">
          <div className="flex flex-col items-center">
            <Truck className="h-8 w-8 mb-2" />
            <h4 className="font-semibold">LIVRAISON</h4>
            <p className="text-sm text-gray-400">Livraison partout au Sénégal</p>
          </div>
          <div className="flex flex-col items-center">
            <CreditCard className="h-8 w-8 mb-2" />
            <h4 className="font-semibold">PAIEMENT SÉCURISÉ</h4>
            <p className="text-sm text-gray-400">Paiement à la livraison ou Wave</p>
          </div>
           <div className="flex flex-col items-center">
            <ShieldCheck className="h-8 w-8 mb-2" />
            <h4 className="font-semibold">SATISFACTION GARANTIE</h4>
            <p className="text-sm text-gray-400">Retour facile sous 7 jours</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="h-8 w-8 mb-2 font-bold text-2xl">4x</div>
            <h4 className="font-semibold">PAIEMENT EN PLUSIEURS FOIS</h4>
            <p className="text-sm text-gray-400">Bientôt disponible</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-10">
          <div>
            <h3 className="font-bold mb-4">Aide</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/account" className="hover:text-white">Suivre ma commande</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contactez-nous</Link></li>
              <li><Link href="/politique-de-retour" className="hover:text-white">Retours et échanges</Link></li>
              <li><Link href="/termes-et-conditions" className="hover:text-white">Modes de paiement</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Nos boutiques</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="https://maps.app.goo.gl/vb67yYM6BqKWq6jh7" target="_blank" rel="noopener noreferrer" className="hover:text-white">Tivaouane Peulh</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-bold mb-4">ABONNEZ-VOUS À LA NEWSLETTER</h3>
            <p className="text-sm text-gray-400 mb-4">Profitez de -10% sur votre première commande.</p>
            <form className="flex">
              <Input type="email" placeholder="Votre adresse email" className="bg-gray-800 border-gray-700 rounded-r-none text-white" />
              <Button type="submit" className="bg-white text-black rounded-l-none hover:bg-gray-200">S'INSCRIRE</Button>
            </form>
            <div className="mt-6">
                <h3 className="font-bold mb-4">RESTONS CONNECTÉS</h3>
                <div className="flex space-x-4">
                    <Link href="#" className="text-gray-400 hover:text-white"><Facebook className="h-6 w-6" /></Link>
                    <Link href="#" className="text-gray-400 hover:text-white"><Twitter className="h-6 w-6" /></Link>
                    <Link href="https://www.instagram.com/sonko24shop/#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram className="h-6 w-6" /></Link>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
           <p>&copy; {new Date().getFullYear()} Sonko Shop. Tous droits réservés.</p>
           <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/termes-et-conditions" className="hover:text-white">Conditions de vente</Link>
                <Link href="/politique-de-retour" className="hover:text-white">Mentions légales</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
