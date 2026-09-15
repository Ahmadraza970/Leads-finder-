"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import StayFields from "@/components/booking/StayFields";
import GuestForm from "@/components/booking/GuestForm";
import PaymentSelect from "@/components/booking/PaymentSelect";
import PriceSummary from "@/components/booking/PriceSummary";
import HotelImage from "@/components/ui/HotelImage";
import {
  calculatePrice,
  defaultStay,
  generateBookingId,
  hotelContext,
  saveBooking,
  validateGuest,
  validateStay,
} from "@/lib/booking";
import { ROOMS } from "@/lib/data";
import type { Booking, GuestInfo, PaymentMethod, StayDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Choose Room" },
  { n: 2, label: "Guest Details" },
  { n: 3, label: "Payment" },
];

const emptyGuest: GuestInfo = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  specialRequests: "",
};

export default function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [stay, setStay] = useState<StayDetails>(defaultStay());
  const [guest, setGuest] = useState<GuestInfo>(emptyGuest);
  const [payment, setPayment] = useState<PaymentMethod>("pay-at-hotel");
  const [error, setError] = useState<string | null>(null);

  // Apply booking preferences from the URL once (React-recommended pattern
  // for adjusting state when props change).
  const paramsKey = searchParams.toString();
  const [previousParamsKey, setPreviousParamsKey] = useState(paramsKey);
  if (previousParamsKey !== paramsKey) {
    setPreviousParamsKey(paramsKey);
    setStay({
      checkIn: searchParams.get("checkIn") || defaultStay().checkIn,
      checkOut: searchParams.get("checkOut") || defaultStay().checkOut,
      adults: Number(searchParams.get("adults")) || defaultStay().adults,
      children: Number(searchParams.get("children")) || defaultStay().children,
      roomId: searchParams.get("room") || defaultStay().roomId,
    });
  }

  const price = calculatePrice(stay);

  function goNext() {
    setError(null);
    if (step === 1) {
      const err = validateStay(stay);
      if (err) return setError(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateGuest(guest);
      if (err) return setError(err);
      setStep(3);
    }
  }

  function confirmBooking() {
    setError(null);
    const err = validateStay(stay) ?? validateGuest(guest);
    if (err) return setError(err);

    const booking: Booking = {
      id: generateBookingId(),
      status: "pending",
      createdAt: new Date().toISOString(),
      stay,
      guest,
      payment,
      price,
      hotel: hotelContext(),
    };
    saveBooking(booking);
    router.push(`/book/confirmation?id=${encodeURIComponent(booking.id)}`);
  }

  const activeRoom = ROOMS.find((r) => r.id === stay.roomId) ?? ROOMS[0];

  return (
    <div className="bg-cream pb-20 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-soft">
            <span className="h-px w-10 bg-fawn" aria-hidden="true" />
            Reserve Your Stay
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
            Secure your room in seconds
          </h1>
          <p className="mt-3 text-soft">
            Three simple steps, no advance payment — settle comfortably at the
            hotel. This is a demo booking flow; no real charge is made.
          </p>
        </div>

        {/* Stepper */}
        <ol className="mb-10 flex items-center gap-2 sm:gap-4" aria-label="Booking steps">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const current = step === s.n;
            return (
              <li key={s.n} className="flex flex-1 items-center gap-2 sm:gap-4">
                <span
                  className={cn(
                    "flex min-w-9 items-center gap-2",
                    current ? "text-dark" : done ? "text-fawn" : "text-soft/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                      current
                        ? "border-dark bg-dark text-cream"
                        : done
                          ? "border-fawn bg-fawn text-cream"
                          : "border-beige bg-white",
                    )}
                  >
                    {done ? <Check size={15} aria-hidden="true" /> : s.n}
                  </span>
                  <span className="hidden text-sm font-semibold sm:block">{s.label}</span>
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      done ? "bg-fawn" : "bg-beige",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Main column */}
              <div className="space-y-6 lg:col-span-2">
                {step === 1 && (
                  <>
                    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
                      <h2 className="mb-5 font-display text-xl font-semibold text-ink">
                        Your stay
                      </h2>
                      <StayFields stay={stay} onChange={setStay} />
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
                      <h2 className="mb-5 font-display text-xl font-semibold text-ink">
                        Choose your room
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {ROOMS.map((room) => {
                          const active = stay.roomId === room.id;
                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => setStay({ ...stay, roomId: room.id })}
                              aria-pressed={active}
                              className={cn(
                                "relative overflow-hidden rounded-2xl border-2 text-left transition-all",
                                active
                                  ? "border-dark shadow-lift"
                                  : "border-beige hover:border-almond",
                              )}
                            >
                              <div className="relative aspect-[16/10] overflow-hidden">
                                <HotelImage
                                  imageId={room.imageId}
                                  alt={room.name}
                                  width={600}
                                  height={375}
                                  sizes="(min-width: 640px) 50vw, 100vw"
                                  imgClassName="h-full w-full object-cover"
                                />
                                {active && (
                                  <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-dark text-cream">
                                    <Check size={16} aria-hidden="true" />
                                  </span>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="font-bold text-ink">{room.name}</p>
                                <p className="text-xs text-soft">
                                  {room.sizeSqFt} sq.ft · {room.occupancy} guests · {room.beds}
                                </p>
                                <p className="mt-2 font-display text-lg font-semibold text-dark">
                                  ₹{room.pricePerNight.toLocaleString("en-IN")}
                                  <span className="font-sans text-xs font-medium text-soft">
                                    {" "}
                                    / night
                                  </span>
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
                    <h2 className="mb-5 font-display text-xl font-semibold text-ink">
                      Guest details
                    </h2>
                    <GuestForm guest={guest} onChange={setGuest} />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
                      <h2 className="mb-5 font-display text-xl font-semibold text-ink">
                        How would you like to pay?
                      </h2>
                      <PaymentSelect
                        value={payment}
                        onChange={(v) => setPayment(v as PaymentMethod)}
                      />
                      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-beige p-4 text-xs leading-relaxed text-soft">
                        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-fawn" aria-hidden="true" />
                        Your details are stored securely on this device for a
                        frictionless check-in. No payment is collected online.
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
                      <h2 className="mb-4 font-display text-xl font-semibold text-ink">
                        Your request
                      </h2>
                      <p className="text-sm text-soft">
                        {guest.specialRequests.trim() || "No special requests."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-dark px-7 py-3.5 text-sm font-semibold text-dark transition-colors hover:bg-dark hover:text-cream"
                    >
                      <ChevronLeft size={17} aria-hidden="true" />
                      Back
                    </button>
                  ) : (
                    <span className="hidden sm:block" aria-hidden="true" />
                  )}

                  {error && (
                    <p role="alert" className="text-sm font-semibold text-red-700 sm:order-last sm:mr-auto sm:ml-6">
                      {error}
                    </p>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-dark px-9 py-3.5 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-soft"
                    >
                      Continue
                      <ChevronRight size={17} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={confirmBooking}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-dark px-9 py-3.5 text-sm font-semibold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-soft"
                    >
                      <Lock size={16} aria-hidden="true" />
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Summary rail */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <PriceSummary stay={stay} guest={guest} payment={payment} price={price} />
                  <div className="rounded-3xl bg-white p-6 shadow-soft">
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-soft">
                      Your room preview
                    </p>
                    <div className="mt-3 overflow-hidden rounded-2xl">
                      <HotelImage
                        imageId={activeRoom.imageId}
                        alt={activeRoom.name}
                        width={600}
                        height={400}
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        imgClassName="aspect-[3/2] w-full object-cover"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-ink">{activeRoom.name}</p>
                    <p className="text-xs text-soft">{activeRoom.tagline}</p>
                  </div>
                </div>
              </aside>
            </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-xs text-soft/70">
          Bookings are stored as structured data (admin-ready JSON) — demo mode, no
          real payment gateway is attached.
        </p>
      </div>
    </div>
  );
}