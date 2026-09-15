import type { Amenity, Attraction, Room, Testimonial } from "@/lib/types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotel-demo-executive-hotel-pacific-downtown-seattle.vercel.app";

export const HOTEL = {
  name: "Executive Hotel Pacific Downtown Seattle",
  shortName: "Executive Hotel Pacific",
  tagline: "Modern comfort in the heart of downtown Seattle",
  address: "1900 6th Ave, Seattle, WA 98101",
  addressLines: [
    "1900 6th Ave",
    "Seattle, WA 98101",
  ],
  phone: "+1 206-682-3430",
  phoneHref: "tel:+12026823430",
  whatsapp:
    "https://wa.me/12026823430?text=Hello%20Executive%20Hotel%20Pacific%20Downtown%20Seattle%2C%20I%20would%20like%20to%20make%20a%20booking%20enquiry.",
  email: "frontdesk.seattle@executivehotels.net",
  rating: 4.2,
  reviewCount: 1240,
  checkIn: "3:00 PM",
  checkOut: "12:00 PM",
  mapEmbed:
    "https://www.google.com/maps?q=Executive+Hotel+Pacific+Downtown+Seattle,+1900+6th+Ave,+Seattle,+WA+98101&output=embed",
  mapsDir:
    "https://www.google.com/maps/dir/?api=1&destination=Executive+Hotel+Pacific+Downtown+Seattle,+1900+6th+Ave,+Seattle,+WA+98101",
  coordinates: { lat: 47.6135, lng: -122.3326 },
};

export const GST_RATE = 0.12;

/** Central image wiring — swap photo-XX.png for the hotel's own photos here. */
export const HERO_IMAGE = "/images/hotel/photo-07.png";
export const ABOUT_IMAGE = "/images/hotel/photo-09.png";
export const CTA_IMAGE = "/images/hotel/photo-13.png";

export const ROOMS: Room[] = [
  {
    id: "deluxe-king",
    name: "Downtown King Room",
    tagline: "City views with modern comfort",
    pricePerNight: 219,
    sizeSqFt: 260,
    occupancy: 2,
    maxChildren: 1,
    beds: "1 King Bed",
    imageId: "/images/hotel/photo-02.png",
    facilities: ["Free WiFi", "Air Conditioning", "Smart TV", "Tea & Coffee Maker", "Daily Housekeeping", "In-room Dining"],
    description:
      "Modern and inviting, this room features floor-to-ceiling windows with downtown Seattle views, premium bedding, and a sleek workspace for business travelers.",
  },
  {
    id: "twin-room",
    name: "Twin Room",
    tagline: "Two comfortable beds, ideal for sharing",
    pricePerNight: 199,
    sizeSqFt: 240,
    occupancy: 2,
    maxChildren: 0,
    beds: "2 Queen Beds",
    imageId: "/images/hotel/photo-14.png",
    facilities: ["Free WiFi", "Air Conditioning", "Smart TV", "Work Desk", "Daily Housekeeping", "In-room Dining"],
    description:
      "Perfect for friends or colleagues — two plush queen beds, a compact work area, and all the essentials for a comfortable stay near Pike Place Market.",
  },
  {
    id: "premium-king",
    name: "Premium Skyline Suite",
    tagline: "Extra space with panoramic skyline views",
    pricePerNight: 329,
    sizeSqFt: 340,
    occupancy: 3,
    maxChildren: 1,
    beds: "1 King Bed + Sofa Bed",
    imageId: "/images/hotel/photo-03.png",
    facilities: ["Free WiFi", "Air Conditioning", "Sitting Area", "Skyline View", "Smart TV", "In-room Dining"],
    description:
      "Generous space with a cozy sitting area and panoramic views of the Seattle skyline — ideal for longer stays or special occasions downtown.",
  },
  {
    id: "family-suite",
    name: "Family Suite",
    tagline: "Connected space designed for togetherness",
    pricePerNight: 419,
    sizeSqFt: 480,
    occupancy: 4,
    maxChildren: 2,
    beds: "1 King + 2 Twins",
    imageId: "/images/hotel/photo-04.png",
    facilities: ["Free WiFi", "Air Conditioning", "Two Rooms", "Kids Welcome", "Family Dining", "Late Check-out"],
    description:
      "Two thoughtfully connected rooms with space for the whole family — close to Seattle's top attractions, with easy access to the Space Needle and waterfront.",
  },
];

export const AMENITIES: Amenity[] = [
  { icon: "wifi", title: "Free High-Speed WiFi", description: "Reliable connectivity in every room and public area." },
  { icon: "coffee", title: "Complimentary Breakfast", description: "Fresh continental and local breakfast options every morning." },
  { icon: "pool", title: "Indoor Lounge & Bar", description: "Relax in our modern lobby lounge with craft drinks and light bites." },
  { icon: "car", title: "Valet Parking", description: "Secure valet parking available for guests." },
  { icon: "air-vent", title: "Air Conditioning", description: "Individually controlled climate control in every room." },
  { icon: "accessibility", title: "Accessible Stay", description: "Accessible rooms and facilities for every guest." },
  { icon: "bell", title: "24×7 Front Desk", description: "Friendly front desk support around the clock." },
  { icon: "zap", title: "Power Backup", description: "Uninterrupted power backup across the property." },
  { icon: "clock", title: "Late Check-in", description: "Flexible late check-in for arriving guests." },
  { icon: "sparkles", title: "Daily Housekeeping", description: "Immaculate rooms refreshed every day." },
  { icon: "utensils", title: "In-house Dining", description: "Seasonal menu with Pacific Northwest flavors." },
  { icon: "shield", title: "24×7 Security", description: "CCTV surveillance and on-site security coverage." },
];

export const ATTRACTIONS: Attraction[] = [
  { name: "Phoenix Palassio Mall", description: "Premier shopping, dining and entertainment.", distanceKm: 4.5, driveMinutes: 12, icon: "shopping-bag" },
  { name: "Janeshwar Mishra Park", description: "One of Asia’s largest urban parks.", distanceKm: 6.0, driveMinutes: 14, icon: "trees" },
  { name: "Ambedkar Memorial Park", description: "Grand memorial gardens and cultural museum.", distanceKm: 7.5, driveMinutes: 18, icon: "landmark" },
  { name: "Lucknow Zoo", description: "Historic Prince of Wales Zoological Gardens.", distanceKm: 9.0, driveMinutes: 22, icon: "paw" },
  { name: "Chaudhary Charan Singh Airport", description: "Convenient international and domestic gateway.", distanceKm: 10.0, driveMinutes: 25, icon: "plane" },
  { name: "Hazratganj", description: "Lucknow’s heritage shopping mile.", distanceKm: 11.0, driveMinutes: 28, icon: "store" },
  { name: "Bara Imambara", description: "The iconic Mughal-era monument & Asafi Mosque.", distanceKm: 12.5, driveMinutes: 32, icon: "landmark" },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Rohit Srivastava", origin: "New Delhi", rating: 5, stay: "Family stay · 3 nights", text: "The food is genuinely delicious and the rooms are spotless. Staff were supportive from check-in to checkout — a very comfortable stay near the High Court." },
  { name: "Priya Nair", origin: "Kochi", rating: 5, stay: "Couples stay · 2 nights", text: "Well-maintained rooms, polite staff and a tasty complimentary breakfast every morning. Great value for money on Faizabad Road." },
  { name: "Aman Verma", origin: "Lucknow", rating: 4, stay: "Business stay · 1 night", text: "Clean, well-kept room with fast WiFi — ideal for work trips. Breakfast spread was generous and the staff were quick to help." },
  { name: "Sneha Reddy", origin: "Hyderabad", rating: 5, stay: "Family stay · 4 nights", text: "Our go-to hotel in Lucknow. The restaurant serves some of the best Awadhi food we've had, and the housekeeping kept everything fresh daily." },
  { name: "Vikram Singh", origin: "Mumbai", rating: 4, stay: "Premium King · 2 nights", text: "Spacious premium room and attentive staff. Service can get a little busy at peak hours, but the warmth more than makes up for it." },
  { name: "Neha & Rohan", origin: "Pune", rating: 5, stay: "Honeymoon · 2 nights", text: "From arrival to checkout everything felt considered — clean, comfortable and close to the city's key spots. Grand Orion made our trip memorable." },
];

export const GALLERY = [
  { id: "/images/hotel/photo-06.png", alt: "The Grand Orion Hotel — lobby and reception area", label: "The Lobby", tall: true },
  { id: "/images/hotel/photo-05.png", alt: "The Grand Orion Hotel — guest comforts", label: "Guest Comforts", tall: false },
  { id: "/images/hotel/photo-08.png", alt: "The Grand Orion Hotel — dining and breakfast", label: "Dining", tall: true },
  { id: "/images/hotel/photo-10.png", alt: "The Grand Orion Hotel — room interior", label: "Room Interior", tall: false },
  { id: "/images/hotel/photo-11.png", alt: "The Grand Orion Hotel — facilities", label: "Facilities", tall: true },
  { id: "/images/hotel/photo-12.png", alt: "The Grand Orion Hotel — hospitality details", label: "The Details", tall: false },
  { id: "/images/hotel/photo-15.png", alt: "The Grand Orion Hotel — property view", label: "The Property", tall: false },
  { id: "/images/hotel/photo-16.png", alt: "The Grand Orion Hotel — surroundings", label: "Around Us", tall: true },
];
