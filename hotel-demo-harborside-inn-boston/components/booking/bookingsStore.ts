"use client";

import { useSyncExternalStore } from "react";
import type { Booking } from "@/lib/types";

export const BOOKINGS_STORAGE_KEY = "gorion_bookings_v1";
export const BOOKINGS_EVENT = "gorion:bookings-changed";

let cache: Booking[] | null = null;
const listeners = new Set<() => void>();

function read(): Booking[] {
  if (cache === null) {
    try {
      const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
      cache = raw ? (JSON.parse(raw) as Booking[]) : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === BOOKINGS_STORAGE_KEY) {
      cache = null;
      onStoreChange();
    }
  };
  const onEvent = () => {
    cache = null;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOKINGS_EVENT, onEvent);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOKINGS_EVENT, onEvent);
  };
}

export function notifyBookingsChanged() {
  cache = null;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKINGS_EVENT));
}

export function useBookings(): Booking[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

export function useBookingById(id: string | null): Booking | null {
  const bookings = useBookings();
  if (!id) return null;
  return bookings.find((b) => b.id === id) ?? null;
}