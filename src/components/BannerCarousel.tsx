'use client';

import type { Banner } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setTimeout(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentIndex, banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[400px] bg-muted flex items-center justify-center text-muted-foreground rounded-lg shadow-md">
        Aucune bannière à afficher.
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg shadow-xl group">
      <div className="w-full h-full relative">
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          fill
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          data-ai-hint={currentBanner.imageAiHint || 'promotional banner'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">{currentBanner.title}</h2>
        {currentBanner.subtitle && <p className="text-lg md:text-xl mb-6 drop-shadow-md">{currentBanner.subtitle}</p>}
        <Link href={currentBanner.link}>
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Découvrir
          </Button>
        </Link>
      </div>
      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-white/50'}`}
            aria-label={`Aller à la bannière ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
