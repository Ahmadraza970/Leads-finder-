import type { Amenity, Attraction, Room, Testimonial } from "@/lib/types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotel-demo-harborside-inn-boston.vercel.app";

export const HOTEL = {
  name: "Harborside Inn",
  shortName: "Harborside Inn",
  tagline: "Waterfront comfort in historic Boston",
  address: "145 Boardman St, Boston, MA 02128",
  addressLines: [
    "145 Boardman St",
    "Boston, MA 02128",
  ],
  phone: "+1 617-886-5600",
  phoneHref: "tel:+16178865600",
  whatsapp:
    "https://wa.me/16178865600?text=Hello%20Harborside%20Inn%2C%20I%20would%20like%20to%20make%20a%20booking%20enquiry.",
  email: "info@harborsideinnboston.com",
  rating: 4.4,
  reviewCount: 980,
  checkIn: "3:00 PM",
  checkOut: "11:00 AM",
  mapEmbed:
    "https://www.google.com/maps?q=Harborside+Inn+Boston,+145+Boardman+St,+Boston,+MA+02128&output=embed",
  mapsDir:
    "https://www.google.com/maps/dir/?api=1&destination=Harborside+Inn+Boston,+145+Boardman+St,+Boston,+MA+02128",
  coordinates: { lat: 42.3757, lng: -71.0405 },
};

export const GST_RATE = 0.12;

/** Central image wiring — swap photo-XX.png for the hotel's own photos here. */
export const HERO_IMAGE = "/images/hotel/photo-07.png";
export const ABOUT_IMAGE = "/images/hotel/photo-09.png";
export const CTA_IMAGE = "/images/hotel/photo-13.png";

export const ROOMS: Room[] = [
  {
    id: "deluxe-king",
    name: "Harborside King Room",
    tagline: "Cozy room with Boston harbor views",
    pricePerNight: 209,
    sizeSqFt: 230,
    occupancy: 2,
    maxChildren: 1,
    beds: "1 King Bed",
    imageId: "/images/hotel/photo-02.png",
    facilities: ["Free WiFi", "Air Conditioning", "Smart TV", "Tea & Coffee Maker", "Daily Housekeeping", "In-room Dining"],
    description:
      "A comfortable retreat with harbor-facing windows, premium bedding, and a compact workspace — ideal for business and leisure stays near the Boston waterfront.",
  },
  {
    id: "twin-room",
    name: "Twin Room",
    tagline: "Two comfortable beds for sharing",
    pricePerNight: 189,
    sizeSqFt: 220,
    occupancy: 2,
    maxChildren: 0,
    beds: "2 Queen Beds",
    imageId: "/images/hotel/photo-14.png",
    facilities: ["Free WiFi", "Air Conditioning", "Smart TV", "Work Desk", "Daily Housekeeping", "In-room Dining"],
    description:
      "Practical and pleasant for friends or colleagues — two queen beds, a small work corner, and easy access to downtown Boston and the harbor.",
  },
  {
    id: "premium-king",
    name: "Harbor View Suite",
    tagline: "Extra space with panoramic water views",
    pricePerNight: 309,
    sizeSqFt: 310,
    occupancy: 3,
    maxChildren: 1,
    beds: "1 King Bed + Sofa Bed",
    imageId: "/images/hotel/photo-03.png",
    facilities: ["Free WiFi", "Air Conditioning", "Sitting Area", "Harbor View", "Smart TV", "In-room Dining"],
    description:
      "Bright suite with a sitting area and sweeping harbor views — perfect for longer stays, anniversaries, or quiet work trips in Boston.",
  },
  {
    id: "family-suite",
    name: "Family Suite",
    tagline: "Connected space for families and groups",
    pricePerNight: 399,
    sizeSqFt: 460,
    occupancy: 4,
    maxChildren: 2,
    beds: "1 King + 2 Twins",
    imageId: "/images/hotel/photo-04.png",
    facilities: ["Free WiFi", "Air Conditioning", "Two Rooms", "Kids Welcome", "Family Dining", "Late Check-out"],
    description:
      "Two connected rooms with space for the whole family — within reach of the Boston waterfront, parks, and downtown attractions.",
  },
];

export const AMENITIES: Amenity[] = [
  { icon: "wifi", title: "Free High-Speed WiFi", description: "Reliable connectivity in every room and public area." },
  { icon: "coffee", title: "Continental Breakfast", description: "Fresh local coffee, pastries, and seasonal fruit each morning." },
  { icon: "pool", title: "Harbor Lounge", description: "Low-key lobby lounge with water-view seating and refreshments." },
  { icon: "car", title: "Parking Nearby", description: "Nearby public parking and rideshare access." },
  { icon: "air-vent", title: "Air Conditioning", description: "Individually controlled climate control in every room." },
  { icon: "accessibility", title: "Accessible Stay", description: "Accessible rooms and facilities for every guest." },
  { icon: "bell", title: "24×7 Front Desk", description: "Friendly front desk support around the clock." },
  { icon: "zap", title: "Power Backup", description: "Uninterrupted power backup across the property." },
  { icon: "clock", title: "Late Check-in", description: "Flexible late check-in for arriving guests." },
  { icon: "sparkles", title: "Daily Housekeeping", description: "Immaculate rooms refreshed every day." },
  { icon: "utensils", title: "In-house Dining", description: "Seasonal menu with Boston-local flavors." },
  { icon: "shield", title: "24×7 Security", description: "CCTV surveillance and on-site security coverage." },
];

export const ATTRACTIONS: Attraction[] = [
  { name: "Boston Harborwalk", description: "Scenic waterfront trail with harbor views and nearby dining.", distanceKm: 1.2, driveMinutes: 4, icon: "trees" },
  { name: "Faneuil Hall Marketplace", description: "Historic marketplace with shops, food halls, and street performers.", distanceKm: 2.5, driveMinutes: 7, icon: "shopping-bag" },
  { name: "New England Aquarium", description: "Family-friendly aquarium with ocean exhibits and marine life.", distanceKm: 3.0, driveMinutes: 8, icon: "paw" },
  { name: "Logan International Airport", description: "Convenient air access for domestic and international travelers.", distanceKm: 4.5, driveMinutes: 14, icon: "plane" },
  { name: "TD Garden", description: "Home to Celtics and Bruins, plus major concerts and events.", distanceKm: 3.2, driveMinutes: 9, icon: "landmark" },
  { name: "North End", description: "Boston’s oldest neighborhood with Italian cafes and historic charm.", distanceKm: 3.8, driveMinutes: 11, icon: "store" },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Laura M.", origin: "Boston", rating: 5, stay: "Business stay · 2 nights", text: "Clean, comfortable rooms and a super convenient location near the waterfront. Check-in was easy and the front desk was genuinely helpful." },
  { name: "James & Emily", origin: "Chicago", rating: 4, stay: "Weekend getaway · 3 nights", text: "Great value for Boston. The room was quiet, the bed was comfortable, and we loved walking to nearby harbor attractions each morning." },
  { name: "Priya K.", origin: "New York", rating: 5, stay: "Solo travel · 1 night", text: "Perfect for a quick Boston trip. Fast WiFi, friendly staff, and easy access to downtown and public transit." },
  { name: "David R.", origin: "Washington, DC", rating: 4, stay: "Family stay · 4 nights", text: "We stayed with kids and the space worked well. Close to family-friendly spots around the harbor and downtown." },
  { name: "Sophie L.", origin: "San Francisco", rating: 5, stay: "Couples stay · 2 nights", text: "Cozy, well-maintained, and in a great neighborhood. The harbor area made evening walks really enjoyable." },
];

export const GALLERY = [
  { id: "/images/hotel/photo-06.png", alt: "Harborside Inn — lobby and reception area", label: "The Lobby", tall: true },
  { id: "/images/hotel/photo-05.png", alt: "Harborside Inn — guest comforts", label: "Guest Comforts", tall: false },
  { id: "/images/hotel/photo-08.png", alt: "Harborside Inn — dining and breakfast", label: "Dining", tall: true },
  { id: "/images/hotel/photo-10.png", alt: "Harborside Inn — room interior", label: "Room Interior", tall: false },
  { id: "/images/hotel/photo-11.png", alt: "Harborside Inn — facilities", label: "Facilities", tall: true },
  { id: "/images/hotel/photo-12.png", alt: "Harborside Inn — hospitality details", label: "The Details", tall: false },
  { id: "/images/hotel/photo-15.png", alt: "Harborside Inn — property view", label: "The Property", tall: false },
  { id: "/images/hotel/photo-16.png", alt: "Harborside Inn — surroundings", label: "Around Us", tall: true },
];
