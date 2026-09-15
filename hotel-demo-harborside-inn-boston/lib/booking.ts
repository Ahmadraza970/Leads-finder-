import { GST_RATE, HOTEL, ROOMS } from "@/lib/data";
import type { Booking, BookingMeta, PaymentMethod, PriceBreakdown, StayDetails } from "@/lib/types";

const STORAGE_KEY = "gorion_bookings_v1";
const BOOKINGS_EVENT = "gorion:bookings-changed";

export function notifyBookingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKINGS_EVENT));
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISO(checkIn).getTime();
  const b = parseISO(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function formatDate(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateBookingId(): string {
  const prefix = "GOR";
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rand}`;
}

export function getRoom(id: string | null) {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0];
}

export function calculatePrice(stay: StayDetails): PriceBreakdown {
  const room = getRoom(stay.roomId);
  const nights = Math.max(1, nightsBetween(stay.checkIn, stay.checkOut));
  const subtotal = room.pricePerNight * nights;
  const gst = Math.round(subtotal * GST_RATE);
  return {
    nights,
    ratePerNight: room.pricePerNight,
    roomSubtotal: subtotal,
    gst,
    gstRate: GST_RATE,
    total: subtotal + gst,
  };
}

export function defaultStay(): StayDetails {
  return {
    checkIn: addDaysISO(1),
    checkOut: addDaysISO(2),
    adults: 2,
    children: 0,
    roomId: ROOMS[0].id,
  };
}

export function validateStay(stay: StayDetails): string | null {
  if (!stay.checkIn || !stay.checkOut) return "Please choose check-in and check-out dates.";
  if (parseISO(stay.checkOut) <= parseISO(stay.checkIn)) return "Check-out must be after check-in.";
  if (nightsBetween(stay.checkIn, stay.checkOut) > 30) return "Bookings are limited to 30 nights.";
  if (stay.adults < 1 || stay.adults > 6) return "Adults must be between 1 and 6.";
  if (stay.children < 0 || stay.children > 4) return "Children must be between 0 and 4.";
  return null;
}

export function validateGuest(input: {
  fullName: string;
  phone: string;
  email: string;
}): string | null {
  if (input.fullName.trim().length < 3) return "Please enter the guest's full name.";
  const phoneDigits = input.phone.replace(/[^0-9]/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 13) return "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "Please enter a valid email address.";
  return null;
}

export function buildBookingMeta(bookings: Booking[]): BookingMeta {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bookings,
  };
}

export function getSavedBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): Booking[] {
  const all = [booking, ...getSavedBookings()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable — booking still returned to the UI
  }
  notifyBookingsChanged();
  return all;
}

export function getBookingById(id: string): Booking | null {
  return getSavedBookings().find((b) => b.id === id) ?? null;
}

export function downloadBookingsJson(bookings: Booking[]) {
  const blob = new Blob([JSON.stringify(buildBookingMeta(bookings), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `grand-orion-bookings-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function hotelContext() {
  return {
    name: HOTEL.name,
    address: HOTEL.address,
    phone: HOTEL.phone,
    email: HOTEL.email,
  };
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "pay-at-hotel", label: "Pay at Hotel", hint: "Pay cash, card or UPI at the front desk on arrival." },
  { id: "upi", label: "UPI", hint: "Quick payment via any UPI app — you'll receive a collect link." },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay & Amex accepted." },
];
