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

/** Match a free-text place/suburb name to one of our delivery areas. */
export function matchArea(text: string | undefined | null): DeliveryArea {
  if (!text) return DEFAULT_DELIVERY_AREA;
  const haystack = text.toLowerCase();
  for (const area of DELIVERY_AREAS) {
    if (area === "Other") continue;
    if (haystack.includes(area.toLowerCase())) return area;
  }
  // Common aliases.
  if (haystack.includes("defence")) return "DHA";
  if (haystack.includes("gulistan")) return "Johar";
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
