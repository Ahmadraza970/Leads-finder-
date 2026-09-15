"use client";

import { CalendarCheck, CalendarDays, Users } from "lucide-react";
import { parseISO, toISODate } from "@/lib/booking";
import type { StayDetails } from "@/lib/types";

const inputCls =
  "relative block rounded-xl border-2 border-beige bg-white px-4 pt-4 pb-2 transition-colors focus-within:border-dark";
const labelCls =
  "pointer-events-none absolute left-4 top-2 text-[0.62rem] font-bold uppercase tracking-widest text-soft";
const fieldCls =
  "w-11/12 bg-transparent text-sm font-semibold text-dark outline-none";

interface StayFieldsProps {
  stay: StayDetails;
  onChange: (stay: StayDetails) => void;
}

export default function StayFields({ stay, onChange }: StayFieldsProps) {
  function update<K extends keyof StayDetails>(key: K, value: StayDetails[K]) {
    const next = { ...stay, [key]: value };
    if (key === "checkIn" && next.checkOut <= next.checkIn) {
      const d = parseISO(next.checkIn);
      d.setDate(d.getDate() + 1);
      next.checkOut = toISODate(d);
    }
    onChange(next);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className={inputCls}>
        <span className={labelCls}>Check-in</span>
        <input
          type="date"
          value={stay.checkIn}
          min={toISODate(new Date())}
          onChange={(e) => update("checkIn", e.target.value)}
          className={fieldCls}
        />
        <CalendarCheck
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft"
          aria-hidden="true"
        />
      </label>
      <label className={inputCls}>
        <span className={labelCls}>Check-out</span>
        <input
          type="date"
          value={stay.checkOut}
          min={stay.checkIn}
          onChange={(e) => update("checkOut", e.target.value)}
          className={fieldCls}
        />
        <CalendarDays
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft"
          aria-hidden="true"
        />
      </label>
      <label className={inputCls}>
        <span className={labelCls}>Adults</span>
        <select
          value={stay.adults}
          onChange={(e) => update("adults", Number(e.target.value))}
          className={fieldCls}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Adult" : "Adults"}
            </option>
          ))}
        </select>
        <Users
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft"
          aria-hidden="true"
        />
      </label>
      <label className={inputCls}>
        <span className={labelCls}>Children</span>
        <select
          value={stay.children}
          onChange={(e) => update("children", Number(e.target.value))}
          className={fieldCls}
        >
          {[0, 1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Child" : "Children"}
            </option>
          ))}
        </select>
        <Users
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft"
          aria-hidden="true"
        />
      </label>
    </div>
  );
}