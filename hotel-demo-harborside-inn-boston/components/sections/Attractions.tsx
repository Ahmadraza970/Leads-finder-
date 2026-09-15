"use client";

import {
  Car,
  Clock,
  Landmark,
  PawPrint,
  Plane,
  ShoppingBag,
  Store,
  Trees,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ATTRACTIONS } from "@/lib/data";
import type { Attraction } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  trees: Trees,
  "shopping-bag": ShoppingBag,
  store: Store,
  paw: PawPrint,
  plane: Plane,
};

export default function Attractions() {
  return (
    <section id="attractions" className="scroll-mt-24 bg-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Nearby Attractions"
          title="Boston, All Within Reach"
          subtitle="From gardens and heritage monuments to shopping and the airport — Harborside Inn puts the city's highlights a short drive away."
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIONS.map((a: Attraction, i) => {
            const Icon = ICONS[a.icon] ?? Landmark;
            return (
              <motion.li
                key={a.name}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group flex h-full items-start gap-5 rounded-3xl bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-almond text-dark transition-colors duration-300 group-hover:bg-dark group-hover:text-cream">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-ink">{a.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-soft">{a.description}</p>
                    <p className="mt-3 flex items-center gap-4 text-xs font-semibold text-dark">
                      <span className="inline-flex items-center gap-1.5">
                        <Car size={14} className="text-fawn" aria-hidden="true" />
                        {a.distanceKm} km
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className="text-fawn" aria-hidden="true" />
                        {a.driveMinutes} min drive
                      </span>
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <Reveal className="mt-10 text-center" delay={0.1}>
          <p className="text-sm text-soft">
            Complimentary airport &amp; station pick-up available on request.
          </p>
        </Reveal>
      </div>
    </section>
  );
}