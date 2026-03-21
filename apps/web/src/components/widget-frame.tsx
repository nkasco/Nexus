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
  { label: string; body: string }
> = {
  loading: {
    label: 'Syncing',
    body: 'Nexus is preparing this widget from the current platform snapshot.',
  },
  empty: {
    label: 'Nothing queued',
    body: 'This area is ready for data as soon as the related integration comes online.',
  },
  error: {
    label: 'Needs attention',
    body: 'The last refresh did not complete cleanly, so the widget is holding its place.',
  },
};

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
        'flex min-h-[220px] flex-col rounded-[28px] border border-white/12 bg-[color:var(--panel-strong)] p-5 shadow-[0_22px_60px_rgba(8,15,28,0.18)] backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-subtle)]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[color:var(--text-main)]">
            {title}
          </h3>
        </div>
        {metric ? (
          <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm font-medium text-[color:var(--text-main)]">
            {metric}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-between rounded-[24px] border border-white/8 bg-[color:var(--panel-muted)] p-4">
        {fallback ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[color:var(--text-main)]">
              {fallback.label}
            </p>
            <p className="text-sm leading-6 text-[color:var(--text-subtle)]">
              {fallback.body}
            </p>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}

        <p className="mt-6 text-sm leading-6 text-[color:var(--text-subtle)]">
          {detail}
        </p>
      </div>
    </article>
  );
}
