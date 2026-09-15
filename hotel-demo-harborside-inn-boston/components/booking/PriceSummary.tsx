"use client";

import { formatUSD, getRoom } from "@/lib/booking";
import type { GuestInfo, PaymentMethod, PriceBreakdown, StayDetails } from "@/lib/types";

interface PriceSummaryProps {
  stay: StayDetails;
  guest?: GuestInfo;
  payment?: PaymentMethod;
  price: PriceBreakdown;
}

export default function PriceSummary({ stay, guest, payment, price }: PriceSummaryProps) {
  const room = getRoom(stay.roomId);
  const paymentLabel =
    payment === "pay-at-hotel"
      ? "Pay at Hotel"
      : payment === "upi"
        ? "UPI"
        : payment === "card"
          ? "Credit / Debit Card"
          : null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
      <h2 className="font-display text-xl font-semibold text-ink">Booking Summary</h2>

      <div className="mt-5 flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-almond text-lg font-bold text-dark">
          {room.name.charAt(0)}
        </span>
        <div>
          <p className="font-bold text-ink">{room.name}</p>
          <p className="text-xs text-soft">
            {fmtDate(stay.checkIn)} → {fmtDate(stay.checkOut)} · {price.nights}{" "}
            {price.nights === 1 ? "night" : "nights"}
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-3 border-t border-beige pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-soft">
            Room rate ({price.nights} × {formatUSD(price.ratePerNight)})
          </dt>
          <dd className="font-semibold text-dark">{formatUSD(price.roomSubtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-soft">GST @ {Math.round(price.gstRate * 100)}%</dt>
          <dd className="font-semibold text-dark">{formatUSD(price.gst)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-beige pt-3">
          <dt className="font-bold text-ink">Total for stay</dt>
          <dd className="font-display text-2xl font-semibold text-dark">
            {formatUSD(price.total)}
          </dd>
        </div>
        <p className="pt-1 text-[0.7rem] text-soft/80">
          Taxes included · No advance charged — payable at checkout.
        </p>
      </dl>

      {guest?.fullName && (
        <div className="mt-5 rounded-2xl bg-beige p-4 text-sm">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-soft">Guest</p>
          <p className="mt-1 font-semibold text-ink">{guest.fullName}</p>
          <p className="text-soft">
            {guest.phone} · {guest.email}
          </p>
        </div>
      )}

      {paymentLabel && (
        <div className="mt-2 rounded-2xl bg-beige p-4 text-sm">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-soft">Payment</p>
          <p className="mt-1 font-semibold text-ink">{paymentLabel}</p>
        </div>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}