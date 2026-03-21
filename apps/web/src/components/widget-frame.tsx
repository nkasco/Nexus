'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

interface WidgetFrameProps {
  title: string;
  eyebrow: string;
  state: WidgetState;
  detail: string;
  metric?: string;
  className?: string;
  children?: ReactNode;
}

const stateCopy: Record<
  Exclude<WidgetState, 'ready'>,
  { label: string; body: string; toneClass: string }
> = {
  loading: {
    label: 'Syncing',
    body: 'Nexus is preparing this widget from the current platform snapshot.',
    toneClass: 'text-[color:var(--warning-strong)]',
  },
  empty: {
    label: 'Nothing queued',
    body: 'This area is ready for data as soon as the related integration comes online.',
    toneClass: 'text-[color:var(--text-subtle)]',
  },
  error: {
    label: 'Needs attention',
    body: 'The last refresh did not complete cleanly, so the widget is holding its place.',
    toneClass: 'text-[color:var(--danger-strong)]',
  },
};

function metricTone(state: WidgetState) {
  if (state === 'error') {
    return 'text-[color:var(--danger-strong)]';
  }

  if (state === 'loading') {
    return 'text-[color:var(--warning-strong)]';
  }

  return 'text-[color:var(--text-main)]';
}

export function WidgetFrame({
  title,
  eyebrow,
  state,
  detail,
  metric,
  className,
  children,
}: WidgetFrameProps) {
  const fallback = state === 'ready' ? null : stateCopy[state];

  return (
    <article
      className={clsx(
        'surface-card flex min-h-[260px] flex-col p-5 sm:p-6',
        className,
      )}
      data-state={state}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow-label">{eyebrow}</p>
          <h3 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[color:var(--text-main)]">
            {title}
          </h3>
        </div>

        {metric ? (
          <div
            className={clsx(
              'rounded-full border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]',
              metricTone(state),
            )}
          >
            {metric}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-between border-t border-[color:var(--border-soft)] pt-5">
        {fallback ? (
          <div className="rounded-[16px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-4 py-4">
            <p className={clsx('text-sm font-medium', fallback.toneClass)}>
              {fallback.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
              {fallback.body}
            </p>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}

        <p className="mt-6 text-sm leading-7 text-[color:var(--text-subtle)]">
          {detail}
        </p>
      </div>
    </article>
  );
}
