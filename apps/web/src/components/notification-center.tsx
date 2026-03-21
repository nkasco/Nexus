'use client';

import clsx from 'clsx';
import type { NotificationItem } from '@nexus/shared';

interface NotificationCenterProps {
  isOpen: boolean;
  unreadCount: number;
  items: NotificationItem[];
  onMarkAllRead: () => void;
}

export function NotificationCenter({
  isOpen,
  unreadCount,
  items,
  onMarkAllRead,
}: NotificationCenterProps) {
  return (
    <aside
      className={clsx(
        'fixed right-4 top-4 z-30 w-[min(92vw,360px)] rounded-[28px] border border-white/18 bg-[color:var(--shell-surface)] p-5 shadow-[0_24px_80px_rgba(6,14,28,0.24)] backdrop-blur-xl transition duration-300',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-4 opacity-0',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-subtle)]">
            Notification Center
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[color:var(--text-main)]">
            {unreadCount} unread
          </h2>
        </div>
        <button
          className="rounded-full border border-white/12 px-3 py-2 text-xs font-medium text-[color:var(--text-subtle)] transition hover:border-white/25 hover:text-[color:var(--text-main)]"
          onClick={onMarkAllRead}
          type="button"
        >
          Mark all read
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article
            className={clsx(
              'rounded-[22px] border p-4',
              item.read
                ? 'border-white/10 bg-white/5'
                : 'border-[color:var(--accent-soft)]/35 bg-[color:var(--accent-soft)]/12',
            )}
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[color:var(--text-main)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                  {item.message}
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                {item.source}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}
