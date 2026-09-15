import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { HOTEL, SITE_URL, ATTRACTIONS, AMENITIES, ROOMS } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageLoader from "@/components/layout/PageLoader";
import SkipLink from "@/components/layout/SkipLink";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Harborside Inn | Hotel in Boston on the Waterfront",
  description:
    "Stay at Harborside Inn in Boston — waterfront comfort near downtown Boston. Enjoy comfortable rooms, continental breakfast, free WiFi, and easy harbor access. Book your stay today.",
  keywords: [
    "Harborside Inn",
    "hotel in Boston",
    "waterfront hotel Boston",
    "boutique hotel Boston",
    "hotel near Boston Harbor",
    "hotel near North End",
    "hotel near TD Garden",
    "booking hotel Boston",
    "family hotel Boston",
  ],
  applicationName: "Harborside Inn",
  authors: [{ name: "Harborside Inn" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: HOTEL.name,
    title: "Harborside Inn | Hotel in Boston on the Waterfront",
    description:
      "Comfortable rooms, friendly service, and a convenient location near Boston Harbor. Continental breakfast, free WiFi, and 24/7 front desk.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harborside Inn | Hotel in Boston on the Waterfront",
    description:
      "Comfortable rooms, continental breakfast, free WiFi, and easy access to Boston Harbor and downtown.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: "hotel",
};

export const viewport: Viewport = {
  themeColor: "#F7EFE0",
  width: "device-width",
  initialScale: 1,
};

function HotelJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: HOTEL.name,
    description:
      "Boutique waterfront hotel in historic Boston offering comfortable rooms, continental breakfast, free WiFi, and easy harbor access.",
    url: SITE_URL,
    telephone: HOTEL.phone,
    email: HOTEL.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "145 Boardman St",
      addressLocality: "Boston",
      addressRegion: "MA",
      postalCode: "02128",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HOTEL.coordinates.lat,
      longitude: HOTEL.coordinates.lng,
    },
    starRating: {
      "@type": "Rating",
      ratingValue: "4",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(HOTEL.rating),
      reviewCount: HOTEL.reviewCount,
      bestRating: "5",
    },
    checkinTime: "15:00",
    checkoutTime: "11:00",
    amenityFeature: AMENITIES.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.title,
      value: true,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Rooms & Suites",
    },
  };

  const offers = ROOMS.map((room) => ({
    "@type": "Offer",
    name: room.name,
    price: String(room.pricePerNight),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  }));

  const roomsLd = ROOMS.map((room) => ({
    "@type": "Room",
    name: room.name,
    description: room.description,
    occupancy: {
      "@type": "Occupancy",
      maxOccupancy: room.occupancy,
      additionalProperty: [{ "@type": "PropertyValue", name: "Size in sq.ft", value: room.sizeSqFt }],
    },
  }));

  const attractionsLd = ATTRACTIONS.map((a) => ({
    "@type": "TouristAttraction",
    name: a.name,
    description: a.description,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          jsonLd,
          { "@context": "https://schema.org", "@graph": [...offers, ...roomsLd, ...attractionsLd] },
        ]),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <HotelJsonLd />
        <SkipLink />
        <PageLoader />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
