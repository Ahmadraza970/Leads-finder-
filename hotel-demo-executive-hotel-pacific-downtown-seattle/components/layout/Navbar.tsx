"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { HOTEL } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Nearby", href: "#attractions" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

function resolveHref(href: string, pathname: string): string {
  if (pathname === "/") return href;
  return `/${href}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !isHome || scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "glass shadow-soft" : "bg-transparent",
        )}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            aria-label="The Grand Orion Hotel home"
            onClick={() => setOpen(false)}
          >
            <Logo variant={solid ? "dark" : "light"} />
          </Link>

          {/* Desktop */}
          <ul className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={resolveHref(l.href, pathname)}
                  className={cn(
                    "group relative text-sm font-medium tracking-wide transition-colors",
                    solid ? "text-dark hover:text-soft" : "text-cream/90 hover:text-white",
                  )}
                >
                  {l.label}
                  <span
                    className="absolute -bottom-1 left-0 h-px w-0 bg-fawn transition-all duration-300 group-hover:w-full"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={HOTEL.phoneHref}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold transition-colors",
                solid ? "text-dark hover:text-soft" : "text-cream/90 hover:text-white",
              )}
            >
              <Phone size={16} aria-hidden="true" />
              {HOTEL.phone}
            </a>
            <Link
              href="/book"
              className="rounded-full bg-dark px-6 py-2.5 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-soft hover:shadow-lift"
            >
              Book Now
            </Link>
          </div>

          <button
            type="button"
            className={cn(
              "grid size-11 place-items-center rounded-full transition-colors lg:hidden",
              solid ? "text-dark" : "text-cream",
            )}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="glass-dark absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto px-7 py-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-cream">
                  Menu
                </span>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full text-cream"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <ul className="mt-8 space-y-1">
                {NAV_LINKS.map((l, i) => (
                  <li key={l.label}>
                    <motion.a
                      href={resolveHref(l.href, pathname)}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl text-cream transition-colors hover:text-almond"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                    >
                      {l.label}
                      <span className="text-xs text-cream/40" aria-hidden="true">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3 pt-8">
                <a
                  href={HOTEL.phoneHref}
                  className="block rounded-full border border-cream/30 py-3 text-center text-sm font-semibold text-cream"
                >
                  {HOTEL.phone}
                </a>
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-cream py-3 text-center text-sm font-semibold text-dark"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}