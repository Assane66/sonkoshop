
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PolitiqueDeRetourPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Politique de Retour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">1. Délai de Retour</h2>
            <p>
              Vous disposez d'un délai de <strong>7 jours</strong> à compter de la date de réception de votre commande pour nous retourner un article s'il ne vous convient pas ou s'il présente un défaut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">2. Conditions de Retour</h2>
            <p>Pour que votre retour soit accepté, les articles doivent respecter les conditions suivantes :</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>L'article doit être dans son état d'origine, non porté, non lavé, et avec toutes ses étiquettes attachées.</li>
              <li>L'article doit être retourné dans son emballage d'origine.</li>
              <li>Les articles personnalisés ou en promotion spéciale (mentionné explicitement) ne sont généralement pas éligibles au retour, sauf en cas de défaut avéré.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">3. Procédure de Retour</h2>
            <p>Pour retourner un article, veuillez suivre ces étapes :</p>
            <ol className="list-decimal list-inside ml-4 space-y-1 mt-2">
              <li>Contactez notre service client à <a href="mailto:sonkoshop1@gmail.com" className="text-accent hover:underline">sonkoshop1@gmail.com</a> ou par téléphone au <a href="tel:784513633" className="text-accent hover:underline">78 451 36 33</a> en indiquant votre numéro de commande et le motif du retour.</li>
              <li>Nous vous fournirons les instructions pour le retour de l'article.</li>
              <li>Emballez soigneusement l'article.</li>
              <li>Les frais de retour sont à votre charge, sauf si l'article est défectueux ou si nous avons commis une erreur dans la commande.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">4. Remboursement ou Échange</h2>
            <p>
              Une fois votre retour réceptionné et inspecté, nous vous informerons de l'approbation ou du rejet de votre demande.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li><strong>Remboursement :</strong> Si approuvé, votre remboursement sera traité, et un crédit sera automatiquement appliqué à votre méthode de paiement originale ou par un autre moyen convenu, dans un délai de 10 jours ouvrables.</li>
              <li><strong>Échange :</strong> Si vous souhaitez un échange, veuillez le préciser lors de votre contact initial. L'échange sera possible sous réserve de disponibilité des stocks.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">5. Articles Non Retournables</h2>
            <p>Certains articles ne peuvent pas être retournés, notamment :</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Cartes cadeaux</li>
              <li>Articles soldés ou en promotion avec mention "non retournable"</li>
              <li>Sous-vêtements et maillots de bain (pour des raisons d'hygiène)</li>
            </ul>
          </section>

          <p className="mt-6 text-sm text-muted-foreground">
            Pour toute question concernant notre politique de retour, n'hésitez pas à nous contacter.
            Sonko Shop se réserve le droit de modifier cette politique de retour à tout moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
