import { create } from "zustand";

/**
 * Menu search query, kept in a tiny store (not React state/props) so the
 * search input and the filtered category sections can live in different
 * parts of the page tree without threading state between them.
 */
interface MenuSearchState {
  query: string;
  setQuery: (query: string) => void;
}

export const useMenuSearchStore = create<MenuSearchState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
