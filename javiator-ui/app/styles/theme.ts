/** Map + route tokens — control-tower look (reference-tuned). */

const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "";

const cartoTile = (path: string) =>
  cartoKey
    ? `https://{s}.basemaps.cartocdn.com/${path}/{z}/{x}/{y}{r}.png?key=${cartoKey}`
    : `https://{s}.basemaps.cartocdn.com/${path}/{z}/{x}/{y}{r}.png`;

export const mapTokens = {
  dark: {
    tileUrl: cartoTile("dark_all"),
    route: "#FAFAFA",
    routeWeight: 5,
    routeOpacity: 0.92,
    routeHalo: "rgba(255,255,255,0.14)",
    routeHaloWeight: 11,
    routeHaloOpacity: 0.45,
    pulseFill: "rgba(250,250,250,0.08)",
    pulseStroke: "rgba(250,250,250,0.35)",
  },
  light: {
    tileUrl: cartoTile("light_all"),
    route: "#1F2937",
    routeWeight: 4,
    routeOpacity: 0.88,
    routeHalo: "rgba(17,24,39,0.12)",
    routeHaloWeight: 10,
    routeHaloOpacity: 0.5,
    pulseFill: "rgba(17,24,39,0.06)",
    pulseStroke: "rgba(17,24,39,0.2)",
  },
} as const;
