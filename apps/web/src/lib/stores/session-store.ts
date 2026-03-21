'use client';

import type { AuthSessionResponse, AuthUser } from '@nexus/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionState {
  token: string | null;
  user: AuthUser | null;
  expiresAt: string | null;
  setSession: (session: AuthSessionResponse) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      setSession: (session) =>
        set({
          token: session.token,
          user: session.user,
          expiresAt: session.expiresAt,
        }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          expiresAt: null,
        }),
    }),
    {
      name: 'nexus-session',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
