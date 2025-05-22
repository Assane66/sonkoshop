'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { productCategories } from '@/types'; // ProductCategory enum removed as it's not directly used here

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void; // Define a proper filter type later
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];
// const COLORS = ['Noir', 'Blanc', 'Rouge', 'Vert', 'Bleu', 'Jaune', 'Gris']; // Colors removed
const MAX_PRICE = 100000; // Example max price in FCFA

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  // const [selectedColors, setSelectedColors] = useState<string[]>([]); // Colors removed
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // const handleColorChange = (color: string) => { // Colors removed
  //   setSelectedColors(prev =>
  //     prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
  //   );
  // };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      sizes: selectedSizes,
      // colors: selectedColors, // Colors removed
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
            {productCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm font-normal">{category}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Prix (FCFA)</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider
              defaultValue={[0, MAX_PRICE]}
              min={0}
              max={MAX_PRICE}
              step={1000}
              onValueChange={handlePriceChange}
              value={priceRange}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{priceRange[0].toLocaleString()}</span>
              <span>{priceRange[1].toLocaleString()}</span>
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

        {/* Colors AccordionItem removed */}
      </Accordion>
      <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90">Appliquer Filtres</Button>
    </div>
  );
}
