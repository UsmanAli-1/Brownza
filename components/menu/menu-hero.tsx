"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/images/products/cover_1.png", alt: "Brownza fresh bakes" },
  { src: "/images/products/cover_2.png", alt: "Brownza fresh bakes" },
  { src: "/images/products/cover_3.png", alt: "Brownza fresh bakes" },
];

const INTERVAL_MS = 4500;

/**
 * Auto-rotating cover carousel, inset with a page gutter so it reads as a
 * floating rounded card rather than a full-bleed banner. The box uses a
 * fixed aspect ratio matching the source images (~7:3) with object-cover,
 * so there is never letterboxing — only a negligible crop between the
 * three (very similarly proportioned) source photos. Client Component:
 * drives the slide interval and manual prev/next/dot controls.
 */
export function MenuHero() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const goTo = (next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  };

  return (
    <section className="pt-3 sm:pt-4">
      <Container>
        <div className="relative aspect-[7/3] w-full overflow-hidden rounded-2xl bg-cocoa-gradient md:rounded-3xl">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-lux",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-dark/40 text-white backdrop-blur-sm transition-colors hover:bg-dark/60 sm:left-4 sm:size-10"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-dark/40 text-white backdrop-blur-sm transition-colors hover:bg-dark/60 sm:right-4 sm:size-10"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
