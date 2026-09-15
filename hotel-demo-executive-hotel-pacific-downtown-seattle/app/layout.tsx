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
  title: "The Grand Orion Hotel | Hotel in Lucknow on Faizabad Road",
  description:
    "Stay at The Grand Orion Hotel on Faizabad Road, Lucknow — opposite the New High Court. Enjoy comfortable rooms, complimentary breakfast, free WiFi, pool and parking. Book your stay today.",
  keywords: [
    "The Grand Orion Hotel",
    "hotel in Lucknow",
    "hotel near New High Court Lucknow",
    "hotel on Faizabad Road",
    "3 star hotel Lucknow",
    "best hotel near Ismailganj",
    "booking hotel Lucknow",
    "family hotel Lucknow",
  ],
  applicationName: "The Grand Orion Hotel",
  authors: [{ name: "The Grand Orion Hotel" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: HOTEL.name,
    title: "The Grand Orion Hotel | Hotel in Lucknow on Faizabad Road",
    description:
      "Comfortable rooms, tasty multi-cuisine food and warm hospitality on Faizabad Road, Lucknow. Complimentary breakfast, free WiFi and parking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grand Orion Hotel | Hotel in Lucknow on Faizabad Road",
    description:
      "Comfortable rooms, complimentary breakfast, free WiFi and parking on Faizabad Road, Lucknow.",
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
      "3-star hotel on Faizabad Road, Lucknow offering comfortable rooms, complimentary breakfast, swimming pool, free WiFi and parking.",
    url: SITE_URL,
    telephone: HOTEL.phone,
    email: HOTEL.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "V2M7+39X, Faizabad Rd, opposite New High Court, Ismailganj, Kamta",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226028",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HOTEL.coordinates.lat,
      longitude: HOTEL.coordinates.lng,
    },
    starRating: {
      "@type": "Rating",
      ratingValue: "3",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "3.9",
      reviewCount: HOTEL.reviewCount,
      bestRating: "5",
    },
    checkinTime: "14:00",
    checkoutTime: "12:00",
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
    priceCurrency: "INR",
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
