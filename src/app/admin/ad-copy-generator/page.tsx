
import { AdCopyGeneratorForm } from '@/components/admin/AdCopyGeneratorForm';

export default function AdCopyGeneratorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Générateur de Textes Publicitaires IA</h1>
        <p className="text-muted-foreground">
          Créez des textes promotionnels percutants pour vos produits et bannières en utilisant l'IA.
        </p>
      </div>
      <AdCopyGeneratorForm />
    </div>
  );
}
