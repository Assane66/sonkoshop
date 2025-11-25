
'use client';

import type { Banner } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
  priority?: boolean;
}

export default function BannerCarousel({ banners, priority = false }: BannerCarouselProps) {
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
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl group">
      <div className="w-full h-full relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
              }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              priority={priority && index === 0}
              sizes="100vw"
              className="object-cover"
              data-ai-hint={banner.imageAiHint || 'promotional banner'}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl animate-fade-in-down tracking-tight">
          {currentBanner.title}
        </h2>
        {currentBanner.subtitle && (
          <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-lg animate-fade-in-up max-w-2xl">
            {currentBanner.subtitle}
          </p>
        )}
        <Link href={currentBanner.link}>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
          >
            Découvrir maintenant
          </Button>
        </Link>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 h-12 w-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 h-12 w-12"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${currentIndex === index
                ? 'bg-white w-8 h-3'
                : 'bg-white/50 hover:bg-white/75 w-3 h-3'
              }`}
            aria-label={`Aller à la bannière ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
