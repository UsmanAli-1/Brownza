import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCATION_STORAGE_KEY } from "@/lib/constants";
import type { DeliveryArea } from "@/lib/constants";

/**
 * Persisted delivery-area selection. `area === null` means the visitor hasn't
 * chosen yet, which is what triggers the first-visit location popup.
 *
 * `label` is the raw place name from reverse geocoding (e.g. "KDA Officer
 * Society"), kept only for display — it's more specific than the coarse
 * `area` used for delivery-fee logic. `pickerOpen` lets any component (e.g.
 * the navbar) reopen the picker on demand, on top of the automatic
 * first-visit gate.
 */
interface LocationState {
  area: DeliveryArea | null;
  label: string | null;
  pickerOpen: boolean;
  setArea: (area: DeliveryArea, label?: string | null) => void;
  clearArea: () => void;
  openPicker: () => void;
  closePicker: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      area: null,
      label: null,
      pickerOpen: false,
      setArea: (area, label = null) => set({ area, label, pickerOpen: false }),
      clearArea: () => set({ area: null, label: null }),
      openPicker: () => set({ pickerOpen: true }),
      closePicker: () => set({ pickerOpen: false }),
    }),
    {
      name: LOCATION_STORAGE_KEY,
      // `pickerOpen` is transient UI state — never persist it.
      partialize: (state) => ({ area: state.area, label: state.label }),
    },
  ),
);
