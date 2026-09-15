import Link from "next/link";
import { BedDouble, Maximize, Users } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import HotelImage from "@/components/ui/HotelImage";
import { formatUSD } from "@/lib/booking";
import { ROOMS } from "@/lib/data";
import type { Room } from "@/lib/types";

function RoomCard({ room, index }: { room: Room; index: number }) {
  return (
    <Reveal delay={index * 0.12} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
        <div className="relative aspect-[4/3] overflow-hidden">
          <HotelImage
            imageId={room.imageId}
            alt={`${room.name} at Harborside Inn`}
            width={900}
            height={675}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span className="glass absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-dark">
            {formatUSD(room.pricePerNight)}
            <span className="font-medium normal-case text-soft"> / night</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <h3 className="font-display text-2xl font-semibold text-ink">
            {room.name}
          </h3>
          <p className="mt-1.5 text-sm text-soft">{room.tagline}</p>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-beige py-4 text-center">
            <div>
              <dt className="sr-only">Room size</dt>
              <Maximize size={16} className="mx-auto text-fawn" aria-hidden="true" />
              <dd className="mt-1 text-xs font-semibold text-dark">{room.sizeSqFt} sq.ft</dd>
            </div>
            <div>
              <dt className="sr-only">Occupancy</dt>
              <Users size={16} className="mx-auto text-fawn" aria-hidden="true" />
              <dd className="mt-1 text-xs font-semibold text-dark">
                {room.occupancy} Guests
              </dd>
            </div>
            <div>
              <dt className="sr-only">Beds</dt>
              <BedDouble size={16} className="mx-auto text-fawn" aria-hidden="true" />
              <dd className="mt-1 text-xs font-semibold text-dark">{room.beds}</dd>
            </div>
          </dl>

          <ul className="mt-5 flex flex-wrap gap-2">
            {room.facilities.slice(0, 4).map((f) => (
              <li
                key={f}
                className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-soft"
              >
                {f}
              </li>
            ))}
            {room.facilities.length > 4 && (
              <li className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-soft">
                +{room.facilities.length - 4} more
              </li>
            )}
          </ul>

          <Link
            href={`/book?room=${room.id}`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-dark px-7 py-3 text-sm font-semibold text-dark transition-all duration-300 group-hover:border-dark group-hover:bg-dark group-hover:text-cream hover:bg-dark hover:text-cream"
          >
            Book Now
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export default function Rooms() {
  return (
    <section id="rooms" className="scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Rooms & Suites"
          title="Stay in Quiet Luxury"
          subtitle="Every room is designed around rest — plush bedding, soft neutral palettes, climate control and thoughtful amenities, all at honest Boston prices."
        />
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {ROOMS.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
        <Reveal className="mt-12 text-center" delay={0.1}>
          <p className="text-sm text-soft">
            Prices include 12% GST · Children up to 6 years stay free in the same room
          </p>
        </Reveal>
      </div>
    </section>
  );
}