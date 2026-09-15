import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { HOTEL } from "@/lib/data";

const QUICK_LINKS = [
  { label: "Rooms & Suites", href: "/#rooms" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Gallery", href: "/#gallery" },
  { label: "About Us", href: "/#about" },
  { label: "Nearby Attractions", href: "/#attractions" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.4 1.5-1.4h1.3V5.5c-.3 0-1.1-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.1H8v2.8h2.5v7h3z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M17.7 3H21l-7.3 8.3L22 21h-6.7l-5.2-6.2L4.2 21H1l7.8-8.9L2 3h6.9l4.7 5.6L17.7 3zm-1.2 16h1.9L7.6 4.9H5.6L16.5 19z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-cream/80">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              A welcoming address on Faizabad Road — where warm hospitality
              meets modern comfort, just opposite the New High Court.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${s.label}`}
                  className="grid size-10 place-items-center rounded-full border border-cream/20 text-cream/70 transition-all hover:border-fawn hover:bg-fawn hover:text-cream"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-almond">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Reach Us</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-fawn" aria-hidden="true" />
                <span>
                  {HOTEL.addressLines[0]}
                  <br />
                  {HOTEL.addressLines[1]}
                </span>
              </li>
              <li>
                <a
                  href={HOTEL.phoneHref}
                  className="flex items-center gap-3 transition-colors hover:text-almond"
                >
                  <Phone size={17} className="shrink-0 text-fawn" aria-hidden="true" />
                  {HOTEL.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${HOTEL.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-almond"
                >
                  <Mail size={17} className="shrink-0 text-fawn" aria-hidden="true" />
                  {HOTEL.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Good to Know</h3>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              <li className="flex justify-between gap-4">
                <span>Check-in</span>
                <span className="font-semibold text-cream">{HOTEL.checkIn}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Check-out</span>
                <span className="font-semibold text-cream">{HOTEL.checkOut}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Breakfast</span>
                <span className="font-semibold text-cream">Complimentary</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Parking</span>
                <span className="font-semibold text-cream">Free for guests</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Pets</span>
                <span className="font-semibold text-cream">Not allowed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-7 text-xs text-cream/50 md:flex-row">
          <p>
            © {new Date().getFullYear()} {HOTEL.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-almond">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-almond">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}