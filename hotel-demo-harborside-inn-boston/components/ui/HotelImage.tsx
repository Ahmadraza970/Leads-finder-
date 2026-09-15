"use client";

import Image from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE_ID, blurDataUrl, imageSrc } from "@/lib/img";
import { cn } from "@/lib/utils";

interface HotelImageProps {
  imageId: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  quality?: number;
  fallback?: string;
  isBackground?: boolean;
}

export default function HotelImage({
  imageId,
  alt,
  width,
  height,
  sizes,
  className,
  imgClassName,
  priority = false,
  quality = 80,
  fallback,
  isBackground = false,
}: HotelImageProps) {
  const [srcId, setSrcId] = useState(imageId);
  const widthPx = width ?? 1600;
  const heightPx = height ?? 1000;

  return (
    <Image
      src={imageSrc(srcId, widthPx, quality)}
      alt={alt}
      width={widthPx}
      height={heightPx}
      className={cn(
        isBackground
          ? "absolute inset-0 h-full w-full object-cover"
          : cn("h-auto w-full", imgClassName),
        className,
      )}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={blurDataUrl(widthPx, heightPx)}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setSrcId(fallback ?? FALLBACK_IMAGE_ID)}
    />
  );
}