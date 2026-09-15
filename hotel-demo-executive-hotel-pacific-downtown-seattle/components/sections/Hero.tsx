"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ShieldCheck, Star } from "lucide-react";
import { useRef } from "react";
import BookingWidget from "@/components/sections/BookingWidget";
import HotelImage from "@/components/ui/HotelImage";
import { HOTEL, HERO_IMAGE } from "@/lib/data";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);

  return (
    <section id="home" ref={ref} className="relative min-h-svh overflow-hidden">
      {/* Background */}
      <motion.div style={{ y: reduced ? 0 : imageY }} className="absolute inset-0">
        <HotelImage
          imageId={HERO_IMAGE}
          alt="The Grand Orion Hotel — Faizabad Road, Lucknow"
          width={2000}
          height={1300}
          priority
          quality={85}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/70"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        style={{ y: reduced ? 0 : contentY }}
        className="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-5 pb-64 pt-36 text-center md:px-8 md:pb-72"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-center gap-2 rounded-full glass-dark px-5 py-2.5 text-sm text-cream/90"
        >
          <span className="flex" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(HOTEL.rating) ? "fill-fawn text-fawn" : "fill-cream/20 text-cream/20"} />
            ))}
          </span>
          {HOTEL.rating} / 5 · {HOTEL.reviewCount}+ Google Reviews
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-semibold leading-[1.05] text-cream text-balance sm:text-6xl md:text-7xl"
        >
          Experience Luxury &amp; Comfort in the{" "}
          <span className="italic text-almond">Heart of Lucknow</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium tracking-wide text-cream/85 md:text-base"
        >
          {["Premium Rooms", "Family Friendly", "Swimming Pool", "Complimentary Breakfast", "Free WiFi"].map(
            (item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-fawn" aria-hidden="true">
                    •
                  </span>
                )}
                {item}
              </span>
            ),
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/book"
            className="rounded-full bg-cream px-9 py-4 text-base font-semibold text-dark shadow-lift transition-all hover:-translate-y-1 hover:bg-almond"
          >
            Book Your Stay
          </Link>
          <a
            href="#rooms"
            className="rounded-full border border-cream/50 px-9 py-4 text-base font-semibold text-cream backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cream hover:bg-cream/10"
          >
            View Rooms
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cream/60"
        >
          <ShieldCheck size={14} className="text-fawn" aria-hidden="true" />
          Secure booking · No advance needed
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#rooms"
        aria-label="Scroll to rooms"
        className="absolute bottom-44 left-1/2 z-10 -translate-x-1/2 text-cream/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.span
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="block"
        >
          <ChevronDown size={26} aria-hidden="true" />
        </motion.span>
      </motion.a>

      {/* Booking widget overlapping hero */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-10 md:px-8">
        <BookingWidget />
      </div>
    </section>
  );
}