export type PaymentMethod = "pay-at-hotel" | "upi" | "card";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Room {
  id: string;
  name: string;
  tagline: string;
  pricePerNight: number;
  sizeSqFt: number;
  occupancy: number;
  maxChildren: number;
  beds: string;
  imageId: string;
  facilities: string[];
  description: string;
}

export interface Amenity {
  icon: string;
  title: string;
  description: string;
}

export interface Attraction {
  name: string;
  description: string;
  distanceKm: number;
  driveMinutes: number;
  icon: string;
}

export interface Testimonial {
  name: string;
  origin: string;
  rating: number;
  text: string;
  stay: string;
}

export interface GuestInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  specialRequests: string;
}

export interface StayDetails {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: string;
}

export interface PriceBreakdown {
  nights: number;
  ratePerNight: number;
  roomSubtotal: number;
  gst: number;
  gstRate: number;
  total: number;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  createdAt: string;
  stay: StayDetails;
  guest: GuestInfo;
  payment: PaymentMethod;
  price: PriceBreakdown;
  hotel: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface BookingMeta {
  version: number;
  exportedAt: string;
  bookings: Booking[];
}
