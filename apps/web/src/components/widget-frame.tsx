'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type {
  WidgetFocusMode,
} from '@nexus/shared';
import type {
  WidgetListItem,
  WidgetStat,
  WidgetTone,
} from '../lib/dashboard-sections';

type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

interface WidgetFrameProps {
  title: string;
  eyebrow: string;
  state: WidgetState;
  detail: string;
  metric?: string;
  tone?: WidgetTone;
  stats?: WidgetStat[];
  items?: WidgetListItem[];
  className?: string;
  updatedLabel?: string;
  focus: WidgetFocusMode;
  onFocusChange?: (focus: WidgetFocusMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  navigationHref?: string;
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

function toneClass(tone: WidgetTone = 'default') {
  if (tone === 'danger') {
    return 'text-[color:var(--danger-strong)]';
  }

  if (tone === 'warning') {
    return 'text-[color:var(--warning-strong)]';
  }

  if (tone === 'success') {
    return 'text-[color:var(--success-strong)]';
  }

  return 'text-[color:var(--text-main)]';
}

function toneSurfaceClass(tone: WidgetTone = 'default') {
  if (tone === 'danger') {
    return 'border-[color:color-mix(in_srgb,var(--danger-strong)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-strong)_10%,var(--panel-subtle))]';
  }

  if (tone === 'warning') {
    return 'border-[color:color-mix(in_srgb,var(--warning-strong)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--warning-strong)_10%,var(--panel-subtle))]';
  }

  if (tone === 'success') {
    return 'border-[color:color-mix(in_srgb,var(--success-strong)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--success-strong)_9%,var(--panel-subtle))]';
  }

  return 'border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)]';
}

export function WidgetFrame({
  title,
  eyebrow,
  state,
  detail,
  metric,
  tone = 'default',
  stats,
  items,
  className,
  updatedLabel,
  focus,
  onFocusChange,
  onRefresh,
  isRefreshing = false,
  navigationHref,
  children,
}: WidgetFrameProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const fallback = state === 'ready' ? null : stateCopy[state];

  return (
    <article
      className={clsx(
        'surface-card flex min-h-[280px] flex-col p-5 sm:p-6',
        className,
      )}
      data-state={state}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow-label">{eyebrow}</p>
          <h3 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[color:var(--text-main)]">
            {title}
          </h3>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {metric ? (
            <div
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]',
                toneSurfaceClass(state === 'ready' ? tone : 'default'),
                state === 'ready' ? toneClass(tone) : toneClass('default'),
              )}
            >
              {metric}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {onRefresh ? (
              <button
                className="widget-action-button"
                disabled={isRefreshing}
                onClick={onRefresh}
                type="button"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            ) : null}

            {onFocusChange ? (
              <div className="relative">
                <button
                  aria-expanded={isConfigOpen}
                  className="widget-action-button"
                  onClick={() => setIsConfigOpen((current) => !current)}
                  type="button"
                >
                  Configure
                </button>

                {isConfigOpen ? (
                  <div className="widget-config-panel">
                    <p className="eyebrow-label">Display Focus</p>
                    <div className="mt-3 grid gap-2">
                      {(['summary', 'attention'] as const).map((option) => (
                        <button
                          className={clsx(
                            'widget-config-option',
                            focus === option && 'widget-config-option-active',
                          )}
                          key={option}
                          onClick={() => {
                            onFocusChange(option);
                            setIsConfigOpen(false);
                          }}
                          type="button"
                        >
                          <span className="block text-sm font-medium capitalize text-[color:var(--text-main)]">
                            {option}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[color:var(--text-subtle)]">
                            {option === 'summary'
                              ? 'Balanced snapshot across the current surface.'
                              : 'Prioritize warnings and degraded items first.'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {navigationHref ? (
              <Link className="widget-action-button" href={navigationHref}>
                Open
              </Link>
            ) : null}
          </div>
        </div>
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
          <div className="space-y-4">
            {stats && stats.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((entry) => (
                  <div
                    className={clsx(
                      'rounded-[16px] border px-4 py-4',
                      toneSurfaceClass(entry.tone),
                    )}
                    key={`${entry.label}-${entry.value}`}
                  >
                    <p className="eyebrow-label">{entry.label}</p>
                    <p
                      className={clsx(
                        'mt-3 text-lg font-semibold tracking-[-0.03em]',
                        toneClass(entry.tone),
                      )}
                    >
                      {entry.value}
                    </p>
                    {entry.detail ? (
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                        {entry.detail}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {items && items.length > 0 ? (
              <div className="space-y-2">
                {items.map((entry) => (
                  <div
                    className={clsx(
                      'rounded-[16px] border px-4 py-3',
                      toneSurfaceClass(entry.tone),
                    )}
                    key={`${entry.label}-${entry.value ?? entry.detail}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={clsx(
                            'text-sm font-medium',
                            toneClass(entry.tone),
                          )}
                        >
                          {entry.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--text-subtle)]">
                          {entry.detail}
                        </p>
                      </div>
                      {entry.value ? (
                        <span className="widget-inline-value">{entry.value}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {children ? <div className="space-y-3">{children}</div> : null}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 border-t border-[color:var(--border-soft)] pt-4 text-sm leading-7 text-[color:var(--text-subtle)] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="max-w-2xl">{detail}</p>
          {updatedLabel ? (
            <p className="whitespace-nowrap text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              Updated {updatedLabel}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
