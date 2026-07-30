import {
  DEFAULT_DELIVERY_AREA,
  DELIVERY_AREAS,
  type DeliveryArea,
} from "@/lib/constants";

export interface DetectResult {
  area: DeliveryArea;
  /** Raw place name returned by the geocoder (for display). */
  label?: string;
}

/**
 * Reverse geocoding returns a general place name (e.g. "Gulshan-e-Iqbal"),
 * never a specific block — so an exact match against DELIVERY_AREAS (which
 * is now block/phase-level) essentially never happens. Instead we match a
 * broad neighborhood keyword and fall back to that neighborhood's "Other
 * block/phase" entry, letting the visitor refine it manually if needed.
 */
const AREA_KEYWORDS: { keywords: string[]; fallback: DeliveryArea }[] = [
  { keywords: ["dha", "defence"], fallback: "DHA – Other phase" },
  { keywords: ["clifton"], fallback: "Clifton" },
  { keywords: ["gulshan"], fallback: "Gulshan-e-Iqbal – Other block" },
  { keywords: ["johar", "gulistan"], fallback: "Johar – Other block" },
  { keywords: ["north nazimabad"], fallback: "North Nazimabad – Other block" },
  { keywords: ["nazimabad"], fallback: "Nazimabad – Other block" },
  { keywords: ["pechs"], fallback: "PECHS – Other block" },
  { keywords: ["bahadurabad"], fallback: "Bahadurabad" },
  { keywords: ["malir"], fallback: "Malir" },
  { keywords: ["scheme 33", "scheme-33"], fallback: "Scheme 33" },
  { keywords: ["korangi"], fallback: "Korangi" },
  { keywords: ["saddar"], fallback: "Saddar" },
];

/** Match a free-text place/suburb name to one of our delivery areas. */
export function matchArea(text: string | undefined | null): DeliveryArea {
  if (!text) return DEFAULT_DELIVERY_AREA;
  const haystack = text.toLowerCase();
  // Check "North Nazimabad" before "Nazimabad" since the list order above
  // already handles that, but exact DELIVERY_AREAS entries (single-word
  // areas like "Clifton") still get first shot at an exact match.
  for (const area of DELIVERY_AREAS) {
    if (area === "Other" || area.includes("–")) continue;
    if (haystack.includes(area.toLowerCase())) return area;
  }
  for (const { keywords, fallback } of AREA_KEYWORDS) {
    if (keywords.some((k) => haystack.includes(k))) return fallback;
  }
  return DEFAULT_DELIVERY_AREA;
}

/**
 * Browser geolocation + OpenStreetMap (Nominatim) reverse geocoding.
 * Best-effort: throws on permission denial / unsupported / network failure so
 * callers can fall back to manual area selection.
 */
export async function detectDeliveryArea(): Promise<DetectResult> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported on this device.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 9000,
      maximumAge: 60000,
    });
  });

  const { latitude, longitude } = position.coords;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
      { headers: { Accept: "application/json" }, signal: controller.signal },
    );
    if (!res.ok) throw new Error("Reverse geocoding failed.");
    const data: {
      address?: Record<string, string>;
      display_name?: string;
    } = await res.json();
    const addr = data.address ?? {};
    const candidate =
      addr.suburb ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.quarter ||
      addr.town ||
      data.display_name;
    return { area: matchArea(candidate), label: candidate };
  } finally {
    clearTimeout(timer);
  }
}
