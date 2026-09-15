import type { Metadata } from "next";
import Link from "next/link";
import { HOTEL } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Conditions | The Grand Orion Hotel",
  description: "Terms and conditions for bookings at The Grand Orion Hotel, Faizabad Road, Lucknow.",
  robots: { index: false },
};

const SECTIONS = [
  {
    title: "Reservations",
    body: "All reservations are subject to availability. A booking reference is generated at the time of booking; please quote it at check-in.",
  },
  {
    title: "Check-in & Check-out",
    body: `Check-in begins at ${HOTEL.checkIn} and check-out is by ${HOTEL.checkOut}. Early check-in and late check-out are subject to availability.`,
  },
  {
    title: "Cancellations",
    body: "Bookings can be cancelled free of charge up to 24 hours before check-in. No-shows or late cancellations may incur a charge equal to the first night's stay.",
  },
  {
    title: "Payments",
    body: "This website is a demonstration of our booking experience — no online payment is collected. Payment is settled at the hotel by cash, card or UPI.",
  },
  {
    title: "House Rules",
    body: "Smoking is not permitted inside rooms. Pets are not allowed. The hotel is not responsible for loss of valuables not deposited in the in-room safe or front desk.",
  },
  {
    title: "Liability",
    body: `While we strive for a flawless stay, the hotel is not liable for events beyond our reasonable control, including power disruptions or natural events. For assistance, call ${HOTEL.phone}.`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-cream pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-soft">
          Legal
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
          Terms &amp; Conditions
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