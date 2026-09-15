import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Logo({ variant = "dark", className }: LogoProps) {
  const light = variant === "light";
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className="grid size-11 shrink-0 place-items-center rounded-full border transition-colors"
        style={{
          borderColor: light ? "rgba(255,255,255,0.4)" : "rgba(139,107,74,0.5)",
          background: light ? "rgba(255,255,255,0.1)" : "var(--color-almond)",
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" className="size-7" fill="none">
          <path
            d="M13 36V20.5a11 11 0 0 1 22 0V36"
            stroke={light ? "#FAF9F6" : "#4E342E"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M13 36h22M17 36v-10h14v10"
            stroke={light ? "#FAF9F6" : "#4E342E"}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="25" r="2.4" fill={light ? "#FAF9F6" : "#8B6B4A"} />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-xl font-semibold tracking-wide"
          style={{ color: light ? "#FAF9F6" : "#2A1F18" }}
        >
          Grand Orion
        </span>
        <span
          className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.42em]"
          style={{ color: light ? "rgba(250,249,246,0.75)" : "#8A6A4D" }}
        >
          Hotel · Lucknow
        </span>
      </span>
    </span>
  );
}