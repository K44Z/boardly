import Image from "next/image";
import { cn } from "@/lib/utils";

// Public-domain watercolors from Wikimedia Commons (see credits in the footer).
const art = {
  hero: { src: "/art/hero.webp", alt: "Oxford from a hay field, watercolor" },
  arrange: { src: "/art/ch1.webp", alt: "Landscape with trees, watercolor" },
  gather: { src: "/art/ch2.webp", alt: "San Vigilio, lakeshore watercolor" },
  notice: { src: "/art/ch3.webp", alt: "Olive grove on Corfu, watercolor" },
  close: { src: "/art/close.webp", alt: "Cottage at Fairford, watercolor" },
} as const;

export type ArtKey = keyof typeof art;

export function Landscape({
  art: key,
  className,
  veil = false,
  priority = false,
}: {
  art: ArtKey;
  className?: string;
  // Washes the painting toward the page color so text on top stays readable.
  veil?: boolean;
  priority?: boolean;
}) {
  const { src, alt } = art[key];
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
      {veil && <div className="absolute inset-0 bg-[var(--paper)]/45" />}
    </div>
  );
}
