"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import HotelImage from "@/components/ui/HotelImage";
import { HOTEL, CTA_IMAGE } from "@/lib/data";

export default function CtaBand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-36">
      <motion.div style={{ y: reduced ? 0 : y }} className="absolute inset-0">
        <HotelImage
          isBackground
          imageId={CTA_IMAGE}
          alt="Harborside Inn — property and facilities"
          width={2000}
          height={1100}
          quality={85}
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-almond">
          Reserve Your Escape
        </p>
        <h2 className="font-display text-4xl font-semibold leading-tight text-cream text-balance md:text-6xl">
          Your Boston story begins with one unforgettable night
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-cream/80 text-pretty">
          Complimentary breakfast, free WiFi and honest Luxe pricing included with
          every stay. No advance payment required — just arrive and be welcomed.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/book"
            className="rounded-full bg-almond px-10 py-4 text-base font-semibold text-dark shadow-lift transition-all hover:-translate-y-1 hover:bg-cream"
          >
            Book Your Stay
          </Link>
          <a
            href={HOTEL.phoneHref}
            className="rounded-full border border-cream/50 px-10 py-4 text-base font-semibold text-cream transition-all hover:-translate-y-1 hover:bg-cream/10"
          >
            {HOTEL.phone}
          </a>
        </div>
      </div>
    </section>
  );
}