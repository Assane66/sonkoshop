
'use client';

import type { Banner } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    if (banners.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, banners.length]);

  const goToNext = useCallback(() => {
    if (banners.length === 0) return;
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setTimeout(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentIndex, banners.length, goToNext]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted flex items-center justify-center text-muted-foreground rounded-lg shadow-md">
        Aucune bannière à afficher.
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg shadow-xl group">
      <div className="w-full h-full relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              data-ai-hint={banner.imageAiHint || 'promotional banner'}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg animate-fade-in-down">{currentBanner.title}</h2>
        {currentBanner.subtitle && <p className="text-lg md:text-xl mb-6 drop-shadow-md animate-fade-in-up">{currentBanner.subtitle}</p>}
        <Link href={currentBanner.link}>
          <Button size="lg" variant="secondary" className="bg-primary/80 hover:bg-primary text-primary-foreground border-primary-foreground/50 border animate-fade-in">
            Découvrir
          </Button>
        </Link>
      </div>
      
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/30 hover:bg-background/70 text-foreground"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/30 hover:bg-background/70 text-foreground"
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
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-primary scale-125' : 'bg-white/70 hover:bg-white'}`}
            aria-label={`Aller à la bannière ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
