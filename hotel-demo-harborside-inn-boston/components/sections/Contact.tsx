import { Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { HOTEL } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 bg-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Contact & Location"
          title="Find Us on Boston waterfront"
          subtitle="Walk out and Boston unfolds — or reach out first; we're always happy to help plan your stay."
        />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Info */}
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-5 rounded-3xl bg-white p-8 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-almond text-dark">
                  <MapPin size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Address</h3>
                  <p className="mt-1 text-sm leading-relaxed text-soft">
                    {HOTEL.addressLines[0]},<br />
                    {HOTEL.addressLines[1]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-almond text-dark">
                  <Phone size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Phone</h3>
                  <a href={HOTEL.phoneHref} className="mt-1 block text-sm text-soft transition-colors hover:text-dark">
                    {HOTEL.phone}
                  </a>
                  <p className="text-xs text-soft/70">Reception is staffed 24×7.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-almond text-dark">
                  <Mail size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Email</h3>
                  <a
                    href={`mailto:${HOTEL.email}`}
                    className="mt-1 block text-sm text-soft transition-colors hover:text-dark"
                  >
                    {HOTEL.email}
                  </a>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 border-t border-beige pt-6 sm:flex-row">
                <a
                  href={HOTEL.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  WhatsApp Us
                </a>
                <a
                  href={HOTEL.mapsDir}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-dark px-6 py-3.5 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-soft"
                >
                  <Navigation size={18} aria-hidden="true" />
                  Get Directions
                </a>
              </div>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delay={0.12} className="lg:col-span-3">
            <div className="h-full min-h-[22rem] overflow-hidden rounded-3xl shadow-soft lg:min-h-[34rem]">
              <iframe
                title="Harborside Inn on Google Maps"
                src={HOTEL.mapEmbed}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}