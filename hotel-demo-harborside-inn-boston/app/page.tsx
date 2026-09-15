import Hero from "@/components/sections/Hero";
import Rooms from "@/components/sections/Rooms";
import Amenities from "@/components/sections/Amenities";
import Gallery from "@/components/sections/Gallery";
import About from "@/components/sections/About";
import Attractions from "@/components/sections/Attractions";
import Testimonials from "@/components/sections/Testimonials";
import CtaBand from "@/components/sections/CtaBand";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Rooms />
      <Amenities />
      <Gallery />
      <About />
      <Attractions />
      <Testimonials />
      <CtaBand />
      <Contact />
    </>
  );
}