'use client';

import type { UiPreferences } from '@nexus/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const defaultPreferences: UiPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'aurora',
};

interface PreferencesState extends UiPreferences {
  hydrate: (preferences: UiPreferences) => void;
  patch: (updates: Partial<UiPreferences>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      hydrate: (preferences) => set(preferences),
      patch: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'nexus-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
