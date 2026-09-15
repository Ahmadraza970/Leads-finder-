export const UNSPLASH_BASE = "https://images.unsplash.com";

export const FALLBACK_IMAGE_ID = "photo-1582719508461-905c673771fd";

export function unsplashUrl(id: string, w: number, q = 80): string {
  return `${UNSPLASH_BASE}/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/** Resolves an image reference to its final URL. Local `/images/...` paths
 * are returned as-is; Unsplash photo IDs are turned into CDN URLs. */
export function imageSrc(src: string, w: number, q = 80): string {
  return src.startsWith("/") ? src : unsplashUrl(src, w, q);
}

export function avatarFallback(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#E8D0AE"/><text x="48" y="58" font-family="Georgia, serif" font-size="34" fill="#5A4132" text-anchor="middle">${initials}</text></svg>`,
  )}`;
}

const shimmerSvg = (w: number, h: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#EFE1C9"/></svg>`;

export function blurDataUrl(w = 64, h = 48): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shimmerSvg(w, h))}`;
}
