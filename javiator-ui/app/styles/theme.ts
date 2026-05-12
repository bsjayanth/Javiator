/** Map + route tokens — control-tower look (reference-tuned). */

export const mapTokens = {
  dark: {
    tileUrl:
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
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
    tileUrl:
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
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
