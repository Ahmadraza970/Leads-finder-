import type { Metadata } from "next";
import { Suspense } from "react";
import Confirmation from "@/components/booking/Confirmation";

export const metadata: Metadata = {
  title: "Booking Confirmed | The Grand Orion Hotel",
  description:
    "Your reservation with The Grand Orion Hotel, Faizabad Road, Lucknow is confirmed. View your booking details and confirmation.",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-cream pt-32">
          <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-5">
            <div className="h-24 rounded-3xl bg-beige" />
            <div className="h-72 rounded-3xl bg-beige" />
          </div>
        </div>
      }
    >
      <Confirmation />
    </Suspense>
  );
}