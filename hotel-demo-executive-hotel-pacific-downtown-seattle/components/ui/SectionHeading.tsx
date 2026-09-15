import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-3xl md:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-soft">
        <span className="h-px w-10 bg-fawn" aria-hidden="true" />
        {eyebrow}
        {align === "center" && <span className="h-px w-10 bg-fawn" aria-hidden="true" />}
      </p>
      <h2 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-soft md:text-lg text-pretty">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}