'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { generateAdCopy, type GenerateAdCopyInput, type GenerateAdCopyOutput } from '@/ai/flows/generate-ad-copy';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const adCopyFormSchema = z.object({
  productName: z.string().min(3, { message: 'Product name is required.' }),
  productDescription: z.string().min(10, { message: 'Product description is required.' }),
  targetAudience: z.string().min(3, { message: 'Target audience is required.' }),
  tone: z.string().optional().default('persuasive'),
  keywords: z.string().optional(),
});

type AdCopyFormValues = z.infer<typeof adCopyFormSchema>;

const TONES = ['persuasive', 'informative', 'humorous', 'urgent', 'friendly', 'professional'];

export function AdCopyGeneratorForm() {
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdCopyFormValues>({
    resolver: zodResolver(adCopyFormSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      targetAudience: '',
      tone: 'persuasive',
      keywords: '',
    },
  });

  const handleSubmit = async (data: AdCopyFormValues) => {
    setIsLoading(true);
    setGeneratedCopy(null);
    try {
      const input: GenerateAdCopyInput = {
        productName: data.productName,
        productDescription: data.productDescription,
        targetAudience: data.targetAudience,
        tone: data.tone,
        keywords: data.keywords,
      };
      const result: GenerateAdCopyOutput = await generateAdCopy(input);
      setGeneratedCopy(result.adCopy);
      toast({ title: "Ad Copy Generated!", description: "The AI has successfully generated ad copy." });
    } catch (error) {
      console.error('Error generating ad copy:', error);
      setGeneratedCopy('Failed to generate ad copy. Please try again.');
      toast({ variant: "destructive", title: "Error", description: "Failed to generate ad copy." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedCopy) {
      navigator.clipboard.writeText(generatedCopy)
        .then(() => {
          toast({ title: "Copied to clipboard!", description: "Ad copy has been copied." });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text to clipboard." });
        });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ad Copy Generation Inputs</CardTitle>
          <CardDescription>Provide details to generate compelling ad copy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Super Comfort Sneakers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the product features and benefits..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Young athletes, Fashion enthusiasts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TONES.map((tone) => (
                            <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (Optional, comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., durable, stylish, sport" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Ad Copy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedCopy && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Ad Copy</CardTitle>
                <CardDescription>Review the AI-generated ad copy below.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copy to clipboard">
                <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea value={generatedCopy} readOnly rows={6} className="bg-muted/50" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
