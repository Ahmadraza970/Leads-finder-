"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Users,
} from "lucide-react";
import { useBookingById, useBookings } from "@/components/booking/bookingsStore";
import { downloadBookingsJson, formatDate, formatUSD } from "@/lib/booking";
import { HOTEL } from "@/lib/data";

export default function Confirmation() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const bookings = useBookings();
  const booking = useBookingById(bookingId);
  const [copied, setCopied] = useState(false);

  async function copyId() {
    if (!booking) return;
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  }

  if (!booking) {
    return (
      <div className="grid min-h-svh place-items-center bg-cream px-5 pt-24">
        <div className="max-w-md text-center">
          <p className="font-display text-3xl font-semibold text-ink">
            We couldn&rsquo;t find that booking
          </p>
          <p className="mt-3 text-sm text-soft">
            Bookings are stored on the device you booked from. Please use the
            booking link from that device, or contact us on {""}
            <a href={HOTEL.phoneHref} className="font-semibold text-dark underline">
              {HOTEL.phone}
            </a>
            .
          </p>
          <Link
            href="/book"
            className="mt-7 inline-flex rounded-full bg-dark px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-soft"
          >
            Make a new booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
            className="mx-auto grid size-20 place-items-center rounded-full bg-dark text-cream shadow-lift"
          >
            <CheckCircle2 size={40} aria-hidden="true" />
          </motion.span>
          <h1 className="mt-6 font-display text-4xl font-semibold text-ink md:text-5xl">
            You&rsquo;re all set, {booking.guest.fullName.split(" ")[0]}!
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-soft">
            Your stay at {booking.hotel.name} is booked. A confirmation has been
            prepared and sent to{" "}
            <span className="font-semibold text-dark">{booking.guest.email}</span> —
            keep this Booking ID handy for check-in.
          </p>
        </motion.div>

        {/* Booking id */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-8 flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-fawn bg-white/80 px-6 py-7 text-center"
        >
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-soft">
            Booking ID
          </p>
          <button
            type="button"
            onClick={copyId}
            className="flex items-center gap-3 font-display text-3xl font-semibold tracking-wide text-dark transition-colors hover:text-soft md:text-4xl"
            aria-label={`Copy booking id ${booking.id}`}
          >
            {booking.id}
            <span className="grid size-9 place-items-center rounded-full bg-beige">
              {copied ? (
                <Check size={16} className="text-fawn" aria-hidden="true" />
              ) : (
                <Copy size={15} className="text-soft" aria-hidden="true" />
              )}
            </span>
          </button>
          <p className="text-xs text-soft/80">
            Status:{" "}
            <span className="rounded-full bg-almond px-2.5 py-0.5 font-semibold capitalize text-dark">
              {booking.status}
            </span>{" "}
            · No advance charged
          </p>
        </motion.div>

        {/* Details grid */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            icon={CalendarDays}
            title="Stay dates"
            lines={[`Check-in · ${formatDate(booking.stay.checkIn)}`, `Check-out · ${formatDate(booking.stay.checkOut)}`]}
          />
          <SummaryCard
            icon={Users}
            title="Your party"
            lines={[
              `${booking.stay.adults} adults · ${booking.stay.children} children`,
              booking.guest.phone,
            ]}
          />
          <SummaryCard
            icon={Receipt}
            title="Payable at hotel"
            lines={[
              `${booking.price.nights} night${booking.price.nights === 1 ? "" : "s"} · incl. 12% GST`,
              formatUSD(booking.price.total)
            ]}
          />
        </div>

        {/* Email preview UI */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-10 overflow-hidden rounded-3xl border border-beige bg-white shadow-lift"
        >
          <div className="flex items-center gap-2 border-b border-beige bg-beige/60 px-5 py-3">
            <span className="size-2.5 rounded-full bg-fawn/60" />
            <span className="size-2.5 rounded-full bg-almond" />
            <span className="size-2.5 rounded-full bg-dark/20" />
            <p className="ml-3 flex items-center gap-2 text-xs font-semibold text-soft">
              <Mail size={14} aria-hidden="true" />
              Email preview — confirmation for {booking.guest.email}
            </p>
          </div>
          <div className="space-y-4 px-6 py-7 md:px-10">
            <div>
              <p className="text-xs text-soft">From · {HOTEL.email}</p>
              <p className="text-xs text-soft">
                Subject: <span className="font-semibold text-dark">Booking confirmed — {booking.id}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-5">
              <p className="font-display text-lg font-semibold text-ink">
                Dear {booking.guest.fullName},
              </p>
              <p className="mt-2 text-sm leading-relaxed text-soft">
                Thank you for choosing {booking.hotel.name}. Your reservation is
                confirmed. We look forward to welcoming you and making your stay
                in Boston memorable.
              </p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 rounded-xl bg-white p-3">
                  <dt className="text-soft">Booking ID</dt>
                  <dd className="font-semibold text-dark">{booking.id}</dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white p-3">
                  <dt className="text-soft">Room</dt>
                  <dd className="font-semibold text-dark">{roomLabel(booking.stay.roomId)}</dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white p-3 sm:col-span-2">
                  <dt className="text-soft">Dates</dt>
                  <dd className="font-semibold text-dark">
                    {formatDate(booking.stay.checkIn)} → {formatDate(booking.stay.checkOut)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white p-3 sm:col-span-2">
                  <dt className="text-soft">Total (incl. taxes)</dt>
                  <dd className="font-semibold text-dark">{formatUSD(booking.price.total)}</dd>
                </div>
              </dl>
              {booking.guest.specialRequests.trim() && (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm text-soft">
                  <span className="font-semibold text-dark">Special requests:</span>{" "}
                  {booking.guest.specialRequests}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={HOTEL.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                WhatsApp the hotel
              </a>
              <a
                href={HOTEL.phoneHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-dark px-6 py-3 text-sm font-semibold text-dark transition-colors hover:bg-dark hover:text-cream"
              >
                <Phone size={16} aria-hidden="true" />
                Call reception
              </a>
            </div>
          </div>
        </motion.div>

        {/* Admin-ready export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl bg-dark px-7 py-6 text-cream sm:flex-row"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-cream/10">
              <Download size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">Admin-ready booking data</p>
              <p className="text-xs text-cream/60">
                {bookings.length} booking(s) stored on this device · export as JSON
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => downloadBookingsJson(bookings)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm font-semibold text-dark transition-transform hover:-translate-y-0.5"
          >
            <Download size={16} aria-hidden="true" />
            Export .json
          </button>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-soft/70">
          <MapPin size={13} aria-hidden="true" />
          {booking.hotel.address}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof CalendarDays;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-almond text-dark">
          <Icon size={18} aria-hidden="true" />
        </span>
        <p className="text-[0.68rem] font-bold uppercase tracking-widest text-soft">{title}</p>
      </div>
      <div className="mt-3 space-y-1 text-sm text-dark">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

function roomLabel(roomId: string): string {
  const label = {
    "deluxe-king": "Deluxe King Room",
    "twin-room": "Twin Room",
    "premium-king": "Premium King Room",
    "family-suite": "Family Suite",
  }[roomId];
  return label ?? "Deluxe King Room";
}