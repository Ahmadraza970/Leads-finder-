"use client";

import type { GuestInfo } from "@/lib/types";

const fieldCls =
  "w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-sm font-medium text-dark outline-none transition-colors placeholder:text-soft/50 focus:border-dark";
const labelCls = "mb-1.5 block text-[0.68rem] font-bold uppercase tracking-widest text-soft";

interface GuestFormProps {
  guest: GuestInfo;
  onChange: (guest: GuestInfo) => void;
}

export default function GuestForm({ guest, onChange }: GuestFormProps) {
  const set = <K extends keyof GuestInfo>(key: K, value: GuestInfo[K]) =>
    onChange({ ...guest, [key]: value });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelCls}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g. Rahul Verma"
            value={guest.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="city" className={labelCls}>
            City
          </label>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            placeholder="e.g. Kanpur"
            value={guest.city}
            onChange={(e) => set("city", e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            required
            placeholder="+91 98XXX XXXXX"
            value={guest.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={guest.email}
            onChange={(e) => set("email", e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="specialRequests" className={labelCls}>
          Special Requests <span className="font-medium normal-case text-soft/70">(optional)</span>
        </label>
        <textarea
          id="specialRequests"
          rows={4}
          placeholder="Early check-in, high floor, extra pillows, anniversary cake, airport pickup…"
          value={guest.specialRequests}
          onChange={(e) => set("specialRequests", e.target.value)}
          className={`${fieldCls} resize-none`}
        />
      </div>
    </div>
  );
}