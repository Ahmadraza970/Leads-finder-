import { Quote } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Stars from "@/components/ui/Stars";
import { avatarFallback } from "@/lib/img";
import { TESTIMONIALS } from "@/lib/data";

export default function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Guest Reviews"
          title="Kind Words From Our Guests"
          subtitle="Rated 3.9 out of 5 by more than 1,570 guests on Google — here's what a few of them had to say."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.1} className="h-full">
              <figure className="relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <Quote
                  size={40}
                  className="absolute right-6 top-6 text-almond"
                  aria-hidden="true"
                />
                <Stars rating={t.rating} />
                <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-dark text-pretty">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-beige pt-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarFallback(t.name)}
                    alt=""
                    aria-hidden="true"
                    className="size-11 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-soft">
                      {t.origin} · {t.stay}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}