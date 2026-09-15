"use client";

import { motion } from "framer-motion";
import {
  Accessibility,
  AirVent,
  Bell,
  Car,
  Clock,
  Coffee,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { AMENITIES } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  coffee: Coffee,
  pool: Waves,
  car: Car,
  "air-vent": AirVent,
  accessibility: Accessibility,
  clock: Clock,
  bell: Bell,
  zap: Zap,
  users: Users,
  sparkles: Sparkles,
  utensils: Utensils,
  shield: ShieldCheck,
};

const MARQUEE = [
  "Complimentary Breakfast",
  "Swimming Pool",
  "Free High-Speed WiFi",
  "24×7 Room Service",
  "Free Parking",
  "Power Backup",
  "Daily Housekeeping",
  "Family Friendly",
];

export default function Amenities() {
  return (
    <section id="amenities" className="scroll-mt-24 bg-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Amenities"
          title="Everything You Need, Nothing You Don't"
          subtitle="Twelve thoughtful touches that turn a hotel stay into a homecoming — from a spotless pool deck to a breakfast that feels like a feast."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {AMENITIES.map((a, i) => {
            const Icon = ICONS[a.icon] ?? Sparkles;
            return (
              <motion.article
                key={a.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-3xl bg-white/70 p-6 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-lift"
              >
                <span className="relative grid size-12 place-items-center rounded-2xl bg-almond text-dark transition-all duration-300 group-hover:scale-110 group-hover:bg-dark group-hover:text-cream">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-soft">{a.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Marquee */}
      <Reveal className="mt-16">
        <div
          className="group overflow-hidden border-y border-almond/80 py-4"
          aria-hidden="true"
        >
          <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 whitespace-nowrap font-display text-lg italic text-soft/80"
              >
                {item}
                <span className="not-italic text-fawn">✦</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}