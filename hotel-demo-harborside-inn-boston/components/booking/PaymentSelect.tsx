"use client";

import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 1, label: "Choose Room" },
  { id: 2, label: "Guest Details" },
  { id: 3, label: "Payment" },
];

interface PaymentSelectProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function PaymentSelect({ value, onChange, disabled }: PaymentSelectProps) {
  const methods = [
    { id: "pay-at-hotel", title: "Pay at Hotel", desc: "Settle with cash, card or UPI at the front desk on arrival. No advance needed.", icon: "" },
    { id: "upi", title: "UPI Payment", desc: "Receive a secure collect link on your phone from any UPI app — GPay, PhonePe, Paytm.", icon: "" },
    { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay and Amex accepted at checkout or on arrival.", icon: "" },
  ];
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold text-soft">Preferred Payment Method</legend>
      {methods.map((m) => {
        const active = value === m.id;
        return (
          <label
            key={m.id}
            className={cn(
              "flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all",
              active
                ? "border-dark bg-cream shadow-soft"
                : "border-beige bg-white hover:border-almond",
            )}
          >
            <input
              type="radio"
              name="payment"
              value={m.id}
              checked={active}
              onChange={() => onChange(m.id)}
              className="mt-1 h-4 w-4 accent-dark"
            />
            <span>
              <span className="block text-sm font-bold text-ink">{m.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-soft">{m.desc}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}