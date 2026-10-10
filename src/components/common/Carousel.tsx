import { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/ui/button/Button";

import { PLACEHOLDER_IMAGE } from "@/lib/constants/common";
import { cn } from "@/utils/utils";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

/** HMS list-card carousel: dots only, no thumbnail strip. */
export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const goPrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    emblaApi?.scrollPrev();
  };

  const goNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    emblaApi?.scrollNext();
  };

  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      className={cn(
        "group relative h-32 w-48 shrink-0 overflow-hidden rounded-md",
        className,
      )}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {displayImages.map((src, index) => (
            <div key={src} className="min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={src}
                alt={`Image ${index + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {displayImages.length > 1 && (
        <div className="opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
          <Button
            type="button"
            variant="none"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gray-200 p-1.5 shadow-md transition-colors hover:bg-gray-100"
            onClick={goPrev}
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="none"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gray-200 p-1.5 shadow-md transition-colors hover:bg-gray-100"
            onClick={goNext}
          >
            <ChevronRight size={16} className="text-gray-700" />
          </Button>
        </div>
      )}

      {displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {displayImages.map((_, index) => (
            <div
              key={index}
              className={cn(
                "size-1.5 rounded-full transition-all",
                index === selectedIndex ? "w-4 bg-white" : "bg-white/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HeroCarouselProps {
  images: string[];
  className?: string;
  overlay?: React.ReactNode;
}

/** HMS detail hero: arrows + bottom thumbnail strip (detail pages only). */
export function HeroCarousel({
  images,
  className,
  overlay,
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      className={cn(
        "group relative h-72 w-full overflow-hidden rounded-2xl sm:h-96",
        className,
      )}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {displayImages.map((src, index) => (
            <div key={src} className="min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={src}
                alt={`Photo ${index + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {overlay ? (
        <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
          {overlay}
        </div>
      ) : null}

      {displayImages.length > 1 && (
        <div className="opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
          <Button
            type="button"
            variant="none"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="none"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight size={18} className="text-gray-700" />
          </Button>
        </div>
      )}

      {displayImages.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-linear-to-t from-black/60 to-transparent p-3">
          {displayImages.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === selectedIndex
                  ? "border-brand"
                  : "border-white/50 opacity-70 hover:opacity-100",
              )}
            >
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
