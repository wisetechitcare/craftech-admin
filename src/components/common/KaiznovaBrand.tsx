import { cn } from "@/utils/utils";

interface BrandClassProps {
  className?: string;
}

/** KZ mark asset (transparent). */
export function KaiznovaMark({ className }: BrandClassProps) {
  return (
    <img
      src="/kaiznova-kz.png"
      alt="KAIZNOVA"
      className={cn("size-20 object-contain shrink-0", className)}
      draggable={false}
    />
  );
}

/** Full wordmark + tagline (transparent). */
export function KaiznovaLogo({ className }: BrandClassProps) {
  return (
    <img
      src="/kaiznova-wordmark.png"
      alt="KAIZNOVA — Improve. Innovate. Evolve."
      className={cn("h-auto w-full max-w-sm object-contain", className)}
      draggable={false}
    />
  );
}

interface KaiznovaTaglineProps extends BrandClassProps {
  onDark?: boolean;
}

export function KaiznovaTagline({ className, onDark }: KaiznovaTaglineProps) {
  return (
    <p
      className={cn(
        "text-sm font-normal tracking-wide",
        onDark ? "text-paper/55" : "text-black bold text-3xl",
        className,
      )}
    >
      Improve. Innovate. Evolve.
    </p>
  );
}
