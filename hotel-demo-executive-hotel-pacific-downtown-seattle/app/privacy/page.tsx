import type { Metadata } from "next";
import Link from "next/link";
import { HOTEL } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy | The Grand Orion Hotel",
  description: "How The Grand Orion Hotel collects, uses and protects your personal information.",
  robots: { index: false },
};

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "When you book a stay, we collect the details you share with us — your name, phone number, email address and any special requests. This information is used solely to manage your reservation and to contact you about your stay.",
  },
  {
    title: "How We Use Your Information",
    body: "Your details help us confirm bookings, prepare rooms, respond to enquiries and improve our services. We never sell or rent your personal information to third parties.",
  },
  {
    title: "Demo Booking Storage",
    body: "Bookings made through this website are stored locally in your own browser as structured data. Exporting or deleting this data is entirely within your control.",
  },
  {
    title: "Cookies & Analytics",
    body: "We may use basic analytics to understand how visitors use our website. No personally identifiable information is collected through analytics.",
  },
  {
    title: "Contact Us",
    body: `Questions about privacy? Reach us at ${HOTEL.phone} or ${HOTEL.email}.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-cream pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-soft">
          Legal
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-soft">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
        </p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl font-semibold text-dark">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-soft">{s.body}</p>
            </section>
          ))}
        </div>
        <Link href="/" className="mt-12 inline-flex rounded-full bg-dark px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-soft">
          Back to home
        </Link>
      </div>
    </div>
  );
}