'use client';

import clsx from 'clsx';
import type { NotificationItem } from '@nexus/shared';

interface NotificationCenterProps {
  isOpen: boolean;
  unreadCount: number;
  items: NotificationItem[];
  onMarkAllRead: () => void;
}

function severityTone(severity: NotificationItem['severity']) {
  switch (severity) {
    case 'warning':
      return 'border-l-[color:var(--warning-strong)]';
    case 'success':
      return 'border-l-[color:var(--success-strong)]';
    default:
      return 'border-l-[color:var(--accent-strong)]';
  }
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
        'tray-panel surface-panel fixed right-2 top-2 z-30 w-[min(92vw,340px)] px-3 py-3 transition duration-150 sm:right-3 sm:top-3',
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'pointer-events-none translate-x-4 opacity-0',
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--border-soft)] pb-2.5">
        <div>
          <p className="eyebrow-label">Notification center</p>
          <h2 className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.04em] text-[color:var(--text-main)]">
            {unreadCount} unread
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[color:var(--text-subtle)]">
            Recent operator-visible events across the platform.
          </p>
        </div>
        <button
          className="widget-action-button"
          onClick={onMarkAllRead}
          type="button"
        >
          Mark all read
        </button>
      </div>

      <div className="mt-2.5 max-h-[68vh] space-y-2 overflow-auto pr-1">
        {items.map((item) => (
          <article
            className={clsx(
              'rounded-[10px] border border-[color:var(--border-soft)] border-l-2 bg-[color:var(--panel-subtle)] px-2.5 py-2.5',
              severityTone(item.severity),
              !item.read && 'bg-[color:var(--panel-muted)]',
            )}
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[color:var(--text-main)]">
                    {item.title}
                  </p>
                  <span className="status-badge">{item.source}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-[color:var(--text-subtle)]">
                  {item.message}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
