
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermesEtConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Termes et Conditions Générales de Vente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">1. Objet</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Sonko Shop (ci-après "le Vendeur") et toute personne physique ou morale (ci-après "le Client") souhaitant procéder à un achat via le site internet de Sonko Shop (ci-après "le Site").
              L'acquisition d'un produit à travers le présent site implique une acceptation sans réserve par le Client des présentes conditions de vente dont le Client reconnaît avoir pris connaissance préalablement à sa commande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">2. Produits</h2>
            <p>
              Les produits proposés sont ceux qui figurent sur le Site du Vendeur, dans la limite des stocks disponibles. Le Vendeur se réserve le droit de modifier à tout moment l’assortiment de produits. Chaque produit est présenté sur le site internet sous forme d’un descriptif reprenant ses principales caractéristiques techniques. Les photographies sont les plus fidèles possibles mais n’engagent en rien le Vendeur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">3. Tarifs</h2>
            <p>
              Les prix figurant sur les fiches produits du catalogue internet sont des prix en Francs CFA (FCFA) toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable au Client. Les prix indiqués ne comprennent pas les frais de livraison, facturés en supplément du prix des produits achetés suivant le montant total de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">4. Commandes</h2>
            <p>
              Le Client passe commande sur le Site. Pour acheter un ou plusieurs articles, il doit obligatoirement suivre le processus de commande suivant : choix des articles et ajout au panier, validation du contenu du panier, identification sur le Site ou inscription sur la fiche d'identification sur laquelle il indiquera toutes les coordonnées demandées, choix du mode de livraison, choix du mode de paiement, validation du paiement.
              La confirmation d’une commande entraîne acceptation des présentes conditions de vente, la reconnaissance d’en avoir parfaite connaissance et la renonciation à se prévaloir de ses propres conditions d’achat.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">5. Paiement</h2>
            <p>
              Le paiement est exigible immédiatement à la commande. Le Client peut effectuer le règlement par paiement à la livraison ou par d'autres moyens qui pourraient être proposés sur le site (ex: Wave, Orange Money, si applicable). Les paiements sont sécurisés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">6. Livraison</h2>
            <p>
              Les livraisons sont faites à l’adresse indiquée sur le bon de commande qui ne peut être que dans la zone géographique convenue. Les délais de livraison ne sont donnés qu’à titre indicatif ; si ceux-ci dépassent trente jours à compter de la commande, le contrat de vente pourra être résilié et le Client remboursé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">7. Droit de Rétractation et Retours</h2>
            <p>
              Le Client dispose d'un délai de 7 jours ouvrables à compter de la réception de leur commande pour exercer son droit de rétractation et ainsi faire retour du produit au vendeur pour échange ou remboursement sans pénalité, à l’exception des frais de retour. Veuillez consulter notre <a href="/politique-de-retour" className="text-accent hover:underline">Politique de Retour</a> pour plus de détails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">8. Responsabilité</h2>
            <p>
              Le Vendeur, dans le processus de vente à distance, n’est tenu que par une obligation de moyens. Sa responsabilité ne pourra être engagée pour un dommage résultant de l’utilisation du réseau Internet tel que perte de données, intrusion, virus, rupture du service, ou autres problèmes involontaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">9. Propriété Intellectuelle</h2>
            <p>
              Tous les éléments du Site de Sonko Shop sont et restent la propriété intellectuelle et exclusive du Vendeur. Personne n’est autorisé à reproduire, exploiter, ou utiliser à quelque titre que ce soit, même partiellement, des éléments du site qu’ils soient sous forme de photo, logo, visuel ou texte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">10. Données à Caractère Personnel</h2>
            <p>
              Le Vendeur s'engage à préserver la confidentialité des informations fournies par l’acheteur, qu'il serait amené à transmettre pour l'utilisation de certains services. Toute information le concernant est soumise aux dispositions de la loi sénégalaise sur la protection des données personnelles.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">11. Règlement des Litiges</h2>
            <p>
              Les présentes conditions de vente à distance sont soumises à la loi sénégalaise. Pour tous litiges ou contentieux, le Tribunal compétent sera celui de Dakar.
            </p>
          </section>

          <p className="mt-6 text-sm text-muted-foreground">
            Pour toute question concernant ces termes et conditions, veuillez nous contacter à <a href="mailto:sonkoshop1@gmail.com" className="text-accent hover:underline">sonkoshop1@gmail.com</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
