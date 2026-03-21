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
        'surface-panel fixed right-4 top-4 z-30 w-[min(94vw,380px)] px-4 py-4 transition duration-200 sm:right-6 sm:top-6',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
      style={{ background: 'var(--shell-surface)' }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border-soft)] pb-4">
        <div>
          <p className="eyebrow-label">Notification Center</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[color:var(--text-main)]">
            {unreadCount} unread
          </h2>
        </div>
        <button
          className="rounded-[14px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--text-subtle)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--text-main)]"
          onClick={onMarkAllRead}
          type="button"
        >
          Mark all read
        </button>
      </div>

      <div className="mt-4 max-h-[70vh] space-y-3 overflow-auto pr-1">
        {items.map((item) => (
          <article
            className={clsx(
              'rounded-[18px] border border-[color:var(--border-soft)] border-l-2 bg-[color:var(--panel-subtle)] p-4',
              severityTone(item.severity),
              !item.read && 'bg-[color:var(--panel-muted)]',
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
              <span className="rounded-full border border-[color:var(--border-soft)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                {item.source}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
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
