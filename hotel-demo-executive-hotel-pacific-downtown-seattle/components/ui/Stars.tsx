import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsProps {
  rating?: number;
  className?: string;
  size?: number;
}

export default function Stars({ rating = 5, className, size = 16 }: StarsProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-fawn text-fawn" : "fill-beige text-beige"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}