"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import HotelImage from "@/components/ui/HotelImage";
import { GALLERY } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i === null ? i : (i + dir + GALLERY.length) % GALLERY.length));
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <section id="gallery" className="scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="A Calm Corner of Lucknow"
          subtitle="Wander through the spaces we've made for rest — soft light, warm wood, and the quiet confidence of a home that welcomes."
        />

        <div className="columns-2 gap-4 md:columns-3 lg:gap-5 [&>*]:mb-4 lg:[&>*]:mb-5">
          {GALLERY.map((g, i) => (
            <Reveal key={g.id} delay={(i % 3) * 0.08} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open image: ${g.alt}`}
                className="group relative block w-full overflow-hidden rounded-2xl shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft"
              >
                <HotelImage
                  imageId={g.id}
                  alt={g.alt}
                  width={760}
                  height={g.tall ? 1010 : 640}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  imgClassName={cn(
                    "w-full object-cover transition-transform duration-700 group-hover:scale-110",
                    g.tall ? "aspect-[3/4]" : "aspect-[3/2]",
                  )}
                />
                <span className="absolute inset-0 grid place-items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex w-full items-center justify-between text-left">
                    <span className="font-display text-base font-semibold text-cream">
                      {g.label}
                    </span>
                    <Expand size={18} className="text-cream" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && index !== null && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-10 grid size-12 place-items-center rounded-full text-cream transition-colors hover:bg-cream/10"
              aria-label="Close gallery"
            >
              <X size={26} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full text-cream transition-colors hover:bg-cream/10 md:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft size={30} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full text-cream transition-colors hover:bg-cream/10 md:right-6"
              aria-label="Next image"
            >
              <ChevronRight size={30} aria-hidden="true" />
            </button>

            <motion.figure
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[86vh] w-full max-w-5xl"
            >
              <HotelImage
                imageId={GALLERY[index].id}
                alt={GALLERY[index].alt}
                width={1600}
                height={1100}
                priority
                quality={90}
                imgClassName="max-h-[78vh] w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <span className="font-display text-lg font-semibold text-cream">
                  {GALLERY[index].label}
                </span>
                <span className="text-sm text-cream/60">
                  {index + 1} / {GALLERY.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}