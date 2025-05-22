import { AdCopyGeneratorForm } from '@/components/admin/AdCopyGeneratorForm';

export default function AdCopyGeneratorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">AI Ad Copy Generator</h1>
        <p className="text-muted-foreground">
          Create compelling promotional text for your products and banners using AI.
        </p>
      </div>
      <AdCopyGeneratorForm />
    </div>
  );
}
