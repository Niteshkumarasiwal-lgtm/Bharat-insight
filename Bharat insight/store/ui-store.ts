"use client";

import { create } from "zustand";
import type { DepartmentId, UserRole } from "@/lib/types";

type UIState = {
  department: DepartmentId;
  role: UserRole;
  paletteOpen: boolean;
  setDepartment: (department: DepartmentId) => void;
  setRole: (role: UserRole) => void;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  department: "health",
  role: "viewer",
  paletteOpen: false,
  setDepartment: (department) => set({ department }),
  setRole: (role) => set({ role }),
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),
}));
