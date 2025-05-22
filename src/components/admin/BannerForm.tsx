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
import type { Banner } from '@/types';

const bannerFormSchema = z.object({
  title: z.string().min(3, { message: 'Banner title must be at least 3 characters.' }),
  subtitle: z.string().optional(),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for the image.' }),
  link: z.string().url({ message: 'Please enter a valid URL for the link.' }),
  imageAiHint: z.string().optional(),
});

type BannerFormValues = z.infer<typeof bannerFormSchema>;

interface BannerFormProps {
  banner?: Banner | null;
  onSubmit: (data: BannerFormValues) => void;
  onCancel: () => void;
}

export function BannerForm({ banner, onSubmit, onCancel }: BannerFormProps) {
  const defaultValues: Partial<BannerFormValues> = banner
    ? banner
    : {
        title: '',
        subtitle: '',
        imageUrl: '',
        link: '',
        imageAiHint: '',
      };

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues,
  });

  const handleSubmit = (data: BannerFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New Collection Arrived!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Check out the latest trends." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://placehold.co/1200x400.png" {...field} />
              </FormControl>
              <FormDescription>Use placeholders like https://placehold.co/WIDTHxHEIGHT.png</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="imageAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image AI Hint (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., promotional banner" {...field} />
              </FormControl>
              <FormDescription>One or two keywords for placeholder image search.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="/products?category=new" {...field} />
              </FormControl>
              <FormDescription>Where the banner should link to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">{banner ? 'Update' : 'Create'} Banner</Button>
        </div>
      </form>
    </Form>
  );
}
