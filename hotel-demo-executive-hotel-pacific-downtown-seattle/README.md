# The Grand Orion Hotel — Premium Hotel Website

A professional hotel website for **The Grand Orion Hotel**, Faizabad Road,
Lucknow (opposite the New High Court). Premium single-page marketing site +
a three-step client-side booking system.

## Tech

- Next.js 16 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (`@theme` design tokens, warm light-brown palette) ·
  Framer Motion · Lucide
- Images are the hotel's own photos served from `public/images/hotel/`
  (`next/image` with `unoptimized: true`).
- Fonts: Cormorant Garamond (display) + Manrope (body) via `next/font`.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run lint      # eslint (zero errors expected)
npm run build     # tsc + production build
npm run start     # serve the production build
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — hero, booking widget, rooms, amenities, gallery+lightbox, about, attractions, reviews, contact, CTA |
| `/book` | 3-step booking flow (room → guest details → payment) |
| `/book/confirmation?id=…` | Confirmation with Booking ID, email-preview UI, JSON export |
| `/privacy`, `/terms` | Legal pages |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO |

## Booking model

- Bookings persist in `localStorage` (`gorion_bookings_v1`) on the device they
  were created from. **This is a demo** — no payment gateway or server is
  attached. Everything is client-side, so the site deploys as static on Netlify.
- Booking IDs are `GOR-YYYY-NNNNNN`; prices are room-rate × nights + **12% GST**.
- The **Export .json** button on the confirmation page dumps all stored
  bookings in an admin-ready envelope (`version`, `exportedAt`, `bookings[]`).

## Images

All image wiring is centralised in `lib/data.ts`
(`HERO_IMAGE`, `ABOUT_IMAGE`, `CTA_IMAGE`, `ROOMS[].imageId`, `GALLERY`).
Drop the hotel's real photos into `public/images/hotel/` and update the
`photo-XX.png` references there — current mapping:

| Slot | File |
|---|---|
| Hero (front view) | `photo-05.png` |
| About | `photo-09.png` |
| CTA band | `photo-13.png` |
| Deluxe King / Twin / Premium / Family | `photo-02 / 14 / 03 / 04.png` |
| Gallery (9) | `photo-06, 07, 08, 10, 11, 12, 14, 15, 16.png` |

## Customisation

- Brand details, rooms, prices, amenities, attractions, testimonials, gallery
  → `lib/data.ts` and `lib/types.ts`.
- Colours, fonts, shadows, keyframes → `app/globals.css` (`@theme`).
- Site URL for SEO → `NEXT_PUBLIC_SITE_URL` env var (defaults to
  `https://www.grandorionhotel.com`).
