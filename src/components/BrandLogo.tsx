/** Explicit theme variants derive from the supplied raster. No generative redraw or CSS inversion. */
export default function BrandLogo({ theme = "light", lazy = false, className = "" }: { theme?: "light" | "dark"; lazy?: boolean; className?: string }) {
  return <img className={`civic-logo ${className}`} src={theme === "dark" ? "/brand/logo-light.svg" : "/brand/logo-primary.webp"} alt="BetterNegrosIsland — Negros Island Region Transparency Portal" width="2167" height="726" loading={lazy ? "lazy" : undefined} decoding="async" />;
}
