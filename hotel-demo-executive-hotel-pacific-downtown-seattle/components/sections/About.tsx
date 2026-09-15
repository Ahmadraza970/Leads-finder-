"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Award, BedDouble, BadgeCheck, ThumbsUp } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import HotelImage from "@/components/ui/HotelImage";
import Stars from "@/components/ui/Stars";
import { HOTEL, ABOUT_IMAGE } from "@/lib/data";

function Counter({
  to,
  suffix = "",
  label,
}: {
  to: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl font-semibold text-dark md:text-5xl">
        {reduced ? to : value}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-soft">
        {label}
      </p>
    </div>
  );
}

const CHECKMARKS = [
  "Homely hospitality with genuine warmth",
  "Renowned for delicious, tasty food",
  "Well-maintained rooms with premium linen",
  "Opposite the New High Court, off Faizabad Road",
  "Supportive staff who treat you like family",
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 overflow-hidden bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Imagery */}
          <Reveal direction="right" className="relative">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-lift">
                <HotelImage
                  imageId={ABOUT_IMAGE}
                  alt="Guest room at The Grand Orion Hotel"
                  width={1000}
                  height={1240}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  imgClassName="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="glass absolute -bottom-8 -right-3 rounded-3xl p-6 shadow-lift sm:-right-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-dark text-cream">
                    <Award size={26} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-3xl font-semibold text-ink">
                      {HOTEL.rating}
                    </p>
                    <Stars size={14} />
                    <p className="mt-1 text-xs text-soft">
                      {HOTEL.reviewCount}+ Google Reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="About the Hotel"
              title={`A Heritage of Welcome, in the ${"Heart"} of Faizabad Road`}
              className="mb-8"
            />
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-soft text-pretty">
                On the city&rsquo;s busiest artery, <strong className="font-semibold text-dark">Faizabad Road</strong>,
                just opposite the New High Court, The Grand Orion Hotel is where
                Lucknow&rsquo;s famed hospitality meets everyday comfort. Our
                thoughtfully appointed rooms and suites pair plush bedding with
                warm earthy tones — a calm, well-maintained retreat that guests
                keep returning to.
              </p>
              <p className="mt-4 leading-relaxed text-soft text-pretty">
                Mornings begin with a generous complimentary breakfast; evenings
                unwind in our restaurant, known for delicious multi-cuisine food,
                or by the pool after a long day. With round-the-clock reception,
                room service and a supportive staff who know you by name, every
                stay feels less like a hotel visit and more like coming home.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <ul className="mt-7 space-y-3">
                {CHECKMARKS.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm text-dark">
                    <BadgeCheck size={19} className="mt-0.5 shrink-0 text-fawn" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.3} className="mt-9 flex flex-wrap gap-4">
              <a
                href={HOTEL.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-dark px-8 py-3.5 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-soft"
              >
                Call {HOTEL.phone}
              </a>
              <a
                href="#rooms"
                className="inline-flex items-center gap-2 rounded-full border-2 border-dark px-8 py-3.5 text-sm font-semibold text-dark transition-all hover:bg-dark hover:text-cream"
              >
                <BedDouble size={17} aria-hidden="true" />
                Explore Rooms
              </a>
            </Reveal>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass mt-20 grid grid-cols-2 gap-8 rounded-3xl px-8 py-10 shadow-lift md:grid-cols-4"
        >
          <Counter to={20} label="Rooms & Suites" />
          <Counter to={3.9} suffix="★" label="Guest Rating" />
          <Counter to={1570} suffix="+" label="Google Reviews" />
          <Counter to={8} suffix="+" label="Years of Warmth" />
        </motion.div>

        <Reveal className="mt-10 flex items-center justify-center gap-2 text-xs text-soft" delay={0.15}>
          <ThumbsUp size={14} className="text-fawn" aria-hidden="true" />
          Trusted by families, couples and business travellers across India.
        </Reveal>
      </div>
    </section>
  );
}