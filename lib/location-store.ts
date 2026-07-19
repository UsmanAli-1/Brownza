import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCATION_STORAGE_KEY } from "@/lib/constants";
import type { DeliveryArea } from "@/lib/constants";

/**
 * Persisted delivery-area selection. `area === null` means the visitor hasn't
 * chosen yet, which is what triggers the first-visit location popup.
 */
interface LocationState {
  area: DeliveryArea | null;
  setArea: (area: DeliveryArea) => void;
  clearArea: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      area: null,
      setArea: (area) => set({ area }),
      clearArea: () => set({ area: null }),
    }),
    { name: LOCATION_STORAGE_KEY },
  ),
);
