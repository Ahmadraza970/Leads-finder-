"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CalendarCheck, Search, Users } from "lucide-react";
import { ROOMS } from "@/lib/data";
import {
  addDaysISO,
  defaultStay,
  parseISO,
  toISODate,
  todayISO,
  validateStay,
} from "@/lib/booking";
import type { StayDetails } from "@/lib/types";

export default function BookingWidget() {
  const router = useRouter();
  const [stay, setStay] = useState<StayDetails>(defaultStay());
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof StayDetails>(key: K, value: StayDetails[K]) {
    setStay((s) => {
      const next = { ...s, [key]: value };
      if (key === "checkIn" && next.checkOut <= next.checkIn) {
        const d = parseISO(next.checkIn);
        d.setDate(d.getDate() + 1);
        next.checkOut = toISODate(d);
      }
      return next;
    });
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStay(stay);
    if (err) {
      setError(err);
      return;
    }
    const params = new URLSearchParams({
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      adults: String(stay.adults),
      children: String(stay.children),
      room: stay.roomId,
    });
    router.push(`/book?${params.toString()}`);
  }

  const inputCls =
    "w-full rounded-xl border-0 bg-transparent px-0 pt-6 pb-1.5 text-sm font-semibold text-dark outline-none transition-colors placeholder:text-soft/60 focus:bg-cream/40";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <form
        onSubmit={submit}
        className="glass rounded-3xl p-5 shadow-lift md:p-6"
        aria-label="Search room availability"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-5">
          <label className="relative block">
            <span className="absolute left-0 top-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-soft">
              Check-in
            </span>
            <input
              type="date"
              required
              min={todayISO()}
              value={stay.checkIn}
              onChange={(e) => update("checkIn", e.target.value)}
              className={inputCls}
            />
            <CalendarDays
              size={15}
              className="absolute right-0 top-7 text-soft"
              aria-hidden="true"
            />
          </label>

          <label className="relative block">
            <span className="absolute left-0 top-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-soft">
              Check-out
            </span>
            <input
              type="date"
              required
              min={addDaysISO(1)}
              value={stay.checkOut}
              onChange={(e) => update("checkOut", e.target.value)}
              className={inputCls}
            />
            <CalendarCheck
              size={15}
              className="absolute right-0 top-7 text-soft"
              aria-hidden="true"
            />
          </label>

          <label className="relative block">
            <span className="absolute left-0 top-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-soft">
              Adults
            </span>
            <select
              value={stay.adults}
              onChange={(e) => update("adults", Number(e.target.value))}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Adult" : "Adults"}
                </option>
              ))}
            </select>
            <Users size={15} className="absolute right-0 top-7 text-soft" aria-hidden="true" />
          </label>

          <label className="relative block">
            <span className="absolute left-0 top-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-soft">
              Children
            </span>
            <select
              value={stay.children}
              onChange={(e) => update("children", Number(e.target.value))}
              className={inputCls}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Child" : "Children"}
                </option>
              ))}
            </select>
            <Users size={15} className="absolute right-0 top-7 text-soft" aria-hidden="true" />
          </label>

          <label className="relative block">
            <span className="absolute left-0 top-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-soft">
              Room Type
            </span>
            <select
              value={stay.roomId}
              onChange={(e) => update("roomId", e.target.value)}
              className={inputCls}
            >
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <span className="absolute right-0 top-7 text-soft" aria-hidden="true">
              ₹{ROOMS.find((r) => r.id === stay.roomId)?.pricePerNight ?? ""}
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          {error ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : (
            <p className="text-xs text-soft">
              Prices include taxes · Free cancellation up to 24 hours before check-in
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-dark px-9 py-3.5 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-soft hover:shadow-lift"
          >
            <Search size={17} aria-hidden="true" />
            Search Availability
          </button>
        </div>
      </form>
    </div>
  );
}