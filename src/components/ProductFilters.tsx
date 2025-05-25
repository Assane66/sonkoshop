
'use client';

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { categoryIcons, type SiteCategory, productCategoriesArray } from '@/types'; // productCategoriesArray for static categories
// Firebase imports removed
// import { db } from '@/lib/firebase';
// import { collection, onSnapshot } from 'firebase/firestore';
// import { useToast } from '@/hooks/use-toast';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];
const MAX_PRICE = 100000; 

// Use static categories for filters
const staticCategories: SiteCategory[] = productCategoriesArray.map((name, index) => ({
  id: (index + 1).toString(),
  name,
  iconName: name as keyof typeof categoryIcons,
}));


export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [availableCategories, setAvailableCategories] = useState<SiteCategory[]>(staticCategories);
  // const [isLoadingCategories, setIsLoadingCategories] = useState(false); // No loading from Firebase
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  
  const [minPriceDisplay, setMinPriceDisplay] = useState<string>(priceRange[0].toString());
  const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(priceRange[1].toString());
  // const { toast } = useToast(); // Toast not used without Firebase

  // useEffect for Firebase categories removed

  useEffect(() => {
    setMinPriceDisplay(priceRange[0].toLocaleString('fr-FR'));
    setMaxPriceDisplay(priceRange[1].toLocaleString('fr-FR'));
  }, [priceRange]);

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
  
  const handlePriceChange = (value: number[]) => {
    if (Array.isArray(value) && value.length === 2) {
        setPriceRange([value[0], value[1]]);
    } else if (typeof value === 'number') { 
        setPriceRange([value, priceRange[1]]); 
    }
  };

  const applyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      sizes: selectedSizes,
      priceRange,
    });
  };

  return (
    <div className="w-full md:w-64 lg:w-72 space-y-6 p-4 border rounded-lg bg-card shadow-sm">
      <h3 className="text-xl font-semibold text-primary">Filtres</h3>
      <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">Catégories</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {/* {isLoadingCategories ? ( // No loading
              <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
            ) :  */}
            {availableCategories.length > 0 ? (
              availableCategories.map(category => {
                const IconComponent = category.iconName ? categoryIcons[category.iconName] : categoryIcons["Default"];
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-filter-${category.id}`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => handleCategoryChange(category.name)}
                    />
                    {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                    <Label htmlFor={`category-filter-${category.id}`} className="text-sm font-normal">{category.name}</Label>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Aucune catégorie disponible.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Prix (FCFA)</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider
              min={0}
              max={MAX_PRICE}
              step={1000}
              onValueChange={handlePriceChange} 
              value={priceRange} 
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{minPriceDisplay} FCFA</span>
              <span>{maxPriceDisplay} FCFA</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sizes">
          <AccordionTrigger className="text-base font-medium">Tailles</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
            {SIZES.map(size => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => handleSizeChange(size)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm font-normal">{size}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

      </Accordion>
      <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90">Appliquer Filtres</Button>
    </div>
  );
}
