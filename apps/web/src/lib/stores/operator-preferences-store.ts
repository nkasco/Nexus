'use client';

import type { OperatorPreferences } from '@nexus/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const defaultOperatorPreferences: OperatorPreferences = {
  defaultLandingSection: 'overview',
  autoOpenNotifications: false,
  use24HourTime: false,
};

interface OperatorPreferencesState extends OperatorPreferences {
  hydrate: (preferences: OperatorPreferences) => void;
  patch: (updates: Partial<OperatorPreferences>) => void;
}

export const useOperatorPreferencesStore =
  create<OperatorPreferencesState>()(
    persist(
      (set) => ({
        ...defaultOperatorPreferences,
        hydrate: (preferences) => set(preferences),
        patch: (updates) => set((state) => ({ ...state, ...updates })),
      }),
      {
        name: 'nexus-operator-preferences',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
