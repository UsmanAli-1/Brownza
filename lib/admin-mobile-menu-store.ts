import { create } from "zustand";

/**
 * Shared open/close state for the mobile admin sidebar drawer. The trigger
 * button lives in the header (layout.tsx) while the drawer itself is
 * rendered by AdminNav further down the tree — a tiny store avoids prop
 * drilling state between two components that aren't parent/child.
 */
interface AdminMobileMenuState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useAdminMobileMenuStore = create<AdminMobileMenuState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
