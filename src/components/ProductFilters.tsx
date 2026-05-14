
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { categoryIcons, type SiteCategory } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { debounce } from 'lodash';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  initialCategory?: string | null;
  initialCategories: SiteCategory[];
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];
const MAX_PRICE = 100000; 

export default function ProductFilters({ onFilterChange, initialCategory, initialCategories = [] }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([decodeURIComponent(initialCategory)]);
    }
  }, [initialCategory]);

  const debouncedFilterChange = useCallback(debounce(onFilterChange, 300), [onFilterChange]);

  useEffect(() => {
    debouncedFilterChange({
      categories: selectedCategories,
      sizes: selectedSizes,
      priceRange,
    });
    return () => debouncedFilterChange.cancel();
  }, [selectedCategories, selectedSizes, priceRange, debouncedFilterChange]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName) ? prev.filter(c => c !== categoryName) : [...prev, categoryName]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };
  
  const handlePriceSliderChange = (value: number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([0, MAX_PRICE]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSizes.length > 0 || 
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE;

  return (
    <div className="w-full md:w-64 lg:w-72 space-y-4">
      {/* Header with Reset */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary rounded-xl">
        <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filters Accordion */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
          {/* Categories */}
          <AccordionItem value="categories" className="border-0">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:text-primary transition-colors py-3 px-0">
              Catégories
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2 pb-4 px-0">
              {initialCategories.length > 0 ? (
                initialCategories.map(category => {
                  const IconComponent = category.iconName ? categoryIcons[category.iconName] : categoryIcons["Default"];
                  return (
                    <div key={category.id} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={`category-filter-${category.id}`}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => handleCategoryChange(category.name)}
                        className="rounded-md"
                      />
                      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                      <Label 
                        htmlFor={`category-filter-${category.id}`} 
                        className="text-sm font-normal text-foreground cursor-pointer group-hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Label>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Aucune catégorie disponible.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price" className="border-0">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:text-primary transition-colors py-3 px-0">
              Prix (FCFA)
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-4 px-0">
              <Slider
                min={0}
                max={MAX_PRICE}
                step={1000}
                onValueChange={handlePriceSliderChange} 
                value={priceRange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm font-medium text-foreground bg-secondary p-3 rounded-lg">
                <span>{priceRange[0].toLocaleString('fr-FR')} FCFA</span>
                <span>{priceRange[1].toLocaleString('fr-FR')} FCFA</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sizes */}
          <AccordionItem value="sizes" className="border-0">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:text-primary transition-colors py-3 px-0">
              Tailles
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-0">
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map(size => (
                  <div key={size} className="flex items-center">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => handleSizeChange(size)}
                      className="rounded-md"
                    />
                    <Label 
                      htmlFor={`size-${size}`} 
                      className="text-sm font-normal text-foreground cursor-pointer ml-2"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
