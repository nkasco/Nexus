'use client';

import type { NotificationItem } from '@nexus/shared';
import { create } from 'zustand';

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  replace: (items: NotificationItem[], unreadCount: number) => void;
  prepend: (item: NotificationItem) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unreadCount: 0,
  replace: (items, unreadCount) =>
    set({
      items,
      unreadCount,
    }),
  prepend: (item) =>
    set((state) => ({
      items: [item, ...state.items].slice(0, 12),
      unreadCount: state.unreadCount + (item.read ? 0 : 1),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    })),
}));
