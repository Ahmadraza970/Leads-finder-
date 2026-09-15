import { Suspense } from "react";
import BookingFlow from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Book Your Stay | Harborside Inn",
  description:
    "Reserve your room at Harborside Inn in historic Boston waterfront. Choose dates, guests and payment — confirmation in seconds.",
};

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-cream pt-28">
          <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-5">
            <div className="h-16 rounded-3xl bg-beige" />
            <div className="h-96 rounded-3xl bg-beige" />
          </div>
        </div>
      }
    >
      <BookingFlow />
    </Suspense>
  );
}