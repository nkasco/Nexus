'use client';

import type {
  DashboardResponse,
  DashboardSlug,
  HealthResponse,
  IntegrationDetailResponse,
  IntegrationProvider,
  IntegrationsOverviewResponse,
  NotificationItem,
  RealtimeEvent,
  UiPreferences,
} from '@nexus/shared';
import { integrationProviders } from '@nexus/shared';
import { startTransition, useEffect, useState } from 'react';
import { api, getWebSocketUrl } from '../lib/api';
import {
  buildWidgetViews,
  createPresetLayout,
} from '../lib/dashboard-sections';
import { useNotificationsStore } from '../lib/stores/notifications-store';
import { usePreferencesStore } from '../lib/stores/preferences-store';
import { useSessionStore } from '../lib/stores/session-store';
import { AppShell } from './app-shell';
import { LoginPanel } from './login-panel';

interface NexusClientAppProps {
  section: DashboardSlug;
}

function toDetailMap(
  details: IntegrationDetailResponse[],
): Partial<Record<IntegrationProvider, IntegrationDetailResponse>> {
  return Object.fromEntries(
    details.map((detail) => [detail.integration.provider, detail] as const),
  );
}

async function loadIntegrationData(activeToken: string) {
  const [overview, ...details] = await Promise.all([
    api.getIntegrations(activeToken),
    ...integrationProviders.map((provider) =>
      api.getIntegrationDetail(activeToken, provider),
    ),
  ]);

  return {
    overview,
    details: toDetailMap(details),
  };
}

export function NexusClientApp({ section }: NexusClientAppProps) {
  const { token, user, setSession, clearSession } = useSessionStore();
  const {
    accent,
    compactMode,
    hydrate: hydratePreferences,
    patch: patchPreferences,
    sidebarCollapsed,
    theme,
  } = usePreferencesStore();
  const {
    items: notificationItems,
    markAllRead,
    prepend,
    replace: replaceNotifications,
    unreadCount,
  } = useNotificationsStore();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [integrationsOverview, setIntegrationsOverview] =
    useState<IntegrationsOverviewResponse | null>(null);
  const [integrationDetails, setIntegrationDetails] = useState<
    Partial<Record<IntegrationProvider, IntegrationDetailResponse>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshingWidgetIds, setRefreshingWidgetIds] = useState<
    Record<string, boolean>
  >({});
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
    useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >(token ? 'connecting' : 'disconnected');
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  const preferences: UiPreferences = {
    accent,
    compactMode,
    sidebarCollapsed,
    theme,
  };

  function applyDocumentTheme(nextPreferences: UiPreferences) {
    const resolvedTheme =
      nextPreferences.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : nextPreferences.theme;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.accent = nextPreferences.accent;
  }

  async function savePreferences(updates: Partial<UiPreferences>) {
    if (!token) {
      return;
    }

    setIsSaving(true);

    try {
      const nextPreferences = await api.updatePreferences(token, updates);
      startTransition(() => {
        hydratePreferences(nextPreferences);
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLayout(nextDashboard: DashboardResponse) {
    if (!token) {
      return;
    }

    setIsSaving(true);

    try {
      const savedDashboard = await api.updateDashboard(
        token,
        section,
        nextDashboard.layout,
      );
      startTransition(() => {
        setDashboard(savedDashboard);
      });
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const nextHealth = await api.getHealth();
        setHealth(nextHealth);
      } catch {
        setHealth(null);
      }
    };

    void loadHealth();

    const interval = window.setInterval(() => {
      void loadHealth();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    applyDocumentTheme({
      accent,
      compactMode,
      sidebarCollapsed,
      theme,
    });
  }, [accent, compactMode, sidebarCollapsed, theme]);

  useEffect(() => {
    if (!token) {
      setDashboard(null);
      setIntegrationsOverview(null);
      setIntegrationDetails({});
      setRefreshingWidgetIds({});
      return;
    }

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setErrorMessage(undefined);

      try {
        const [
          session,
          nextPreferences,
          nextDashboard,
          nextNotifications,
          integrationData,
        ] = await Promise.all([
          api.getSession(token),
          api.getPreferences(token),
          api.getDashboard(token, section),
          api.getNotifications(token),
          loadIntegrationData(token),
        ]);

        startTransition(() => {
          hydratePreferences(nextPreferences);
          replaceNotifications(
            nextNotifications.items,
            nextNotifications.unreadCount,
          );
          setIntegrationsOverview(integrationData.overview);
          setIntegrationDetails(integrationData.details);
          setSession({
            token,
            user: session.user,
            expiresAt: session.expiresAt,
          });
          setDashboard(nextDashboard);
        });
      } catch (error) {
        clearSession();
        setDashboard(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not restore the session.',
        );
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [
    clearSession,
    hydratePreferences,
    replaceNotifications,
    section,
    setSession,
    token,
  ]);

  useEffect(() => {
    if (!token) {
      setWebsocketStatus('disconnected');
      return;
    }

    const refreshIntegrations = async () => {
      const integrationData = await loadIntegrationData(token);
      startTransition(() => {
        setIntegrationsOverview(integrationData.overview);
        setIntegrationDetails(integrationData.details);
      });
    };

    const socket = new WebSocket(getWebSocketUrl(token));
    setWebsocketStatus('connecting');

    socket.addEventListener('open', () => {
      setWebsocketStatus('connected');
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data) as RealtimeEvent;
      setLastEventAt(message.sentAt);

      if (message.type === 'notification.created') {
        prepend(message.payload as NotificationItem);
      }

      if (message.type === 'settings.updated') {
        hydratePreferences(message.payload as UiPreferences);
      }

      if (message.type === 'dashboard.updated') {
        const nextDashboard = message.payload as DashboardResponse;
        if (nextDashboard.slug === section) {
          setDashboard(nextDashboard);
        }
      }

      if (
        message.type === 'integration.synced' ||
        message.type === 'integration.sync_failed' ||
        message.type === 'assets.updated' ||
        message.type === 'metrics.updated'
      ) {
        void refreshIntegrations();
      }
    });

    socket.addEventListener('close', () => {
      setWebsocketStatus('disconnected');
    });

    return () => {
      socket.close();
    };
  }, [hydratePreferences, prepend, section, token]);

  if (!token || !user) {
    return (
      <LoginPanel
        apiHealthy={health?.status === 'ok'}
        errorMessage={errorMessage}
        isSubmitting={isBootstrapping}
        onSubmit={async (credentials) => {
          setIsBootstrapping(true);
          setErrorMessage(undefined);

          try {
            const session = await api.login(credentials);
            setSession(session);
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : 'Login failed.',
            );
          } finally {
            setIsBootstrapping(false);
          }
        }}
      />
    );
  }

  if (isBootstrapping || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-[color:var(--text-main)]">
        <div className="surface-panel px-6 py-5 text-sm text-[color:var(--text-subtle)]">
          Restoring the authenticated shell...
        </div>
      </main>
    );
  }

  return (
    <AppShell
      dashboard={dashboard}
      health={health}
      isNotificationCenterOpen={isNotificationCenterOpen}
      isSaving={isSaving}
      lastEventAt={lastEventAt}
      notifications={notificationItems}
      onAccentChange={(accent) => {
        patchPreferences({ accent });
        void savePreferences({ accent });
      }}
      onCompactToggle={() => {
        const nextCompactMode = !compactMode;
        patchPreferences({ compactMode: nextCompactMode });
        void savePreferences({ compactMode: nextCompactMode });
      }}
      onLayoutPresetChange={(preset) => {
        const nextDashboard = {
          ...dashboard,
          layout: createPresetLayout(dashboard, preset),
        };
        setDashboard(nextDashboard);
        void saveLayout(nextDashboard);
      }}
      onMarkAllRead={async () => {
        markAllRead();
        setIsNotificationCenterOpen(false);

        if (token) {
          const updated = await api.markNotificationsRead(token);
          replaceNotifications(updated.items, updated.unreadCount);
        }
      }}
      onNotificationToggle={() =>
        setIsNotificationCenterOpen((current) => !current)
      }
      onSidebarToggle={() => {
        const nextSidebarCollapsed = !sidebarCollapsed;
        patchPreferences({ sidebarCollapsed: nextSidebarCollapsed });
        void savePreferences({ sidebarCollapsed: nextSidebarCollapsed });
      }}
      onSignOut={() => {
        clearSession();
        setDashboard(null);
        setIntegrationDetails({});
        setLastEventAt(null);
      }}
      onWidgetFocusChange={(widgetId, focus) => {
        const nextDashboard = {
          ...dashboard,
          layout: {
            ...dashboard.layout,
            widgets: dashboard.layout.widgets.map((widget) =>
              widget.id === widgetId
                ? {
                    ...widget,
                    settings: {
                      ...widget.settings,
                      focus,
                    },
                  }
                : widget,
            ),
          },
        };

        setDashboard(nextDashboard);
        void saveLayout(nextDashboard);
      }}
      onWidgetRefresh={async (widgetId) => {
        if (!token) {
          return;
        }

        const targetWidget = buildWidgetViews(
          dashboard,
          health,
          integrationsOverview,
          integrationDetails,
        ).find((widget) => widget.id === widgetId);

        if (!targetWidget?.refreshScope) {
          return;
        }

        setRefreshingWidgetIds((current) => ({
          ...current,
          [widgetId]: true,
        }));

        try {
          if (targetWidget.refreshScope === 'all') {
            const nextOverview = await api.syncIntegrations(token);
            const refreshed = await loadIntegrationData(token);

            startTransition(() => {
              setIntegrationsOverview(nextOverview);
              setIntegrationDetails(refreshed.details);
            });
          } else {
            const detail = await api.syncIntegration(
              token,
              targetWidget.refreshScope,
            );
            const nextOverview = await api.getIntegrations(token);

            startTransition(() => {
              setIntegrationsOverview(nextOverview);
              setIntegrationDetails((current) => ({
                ...current,
                [detail.integration.provider]: detail,
              }));
            });
          }
        } finally {
          setRefreshingWidgetIds((current) => ({
            ...current,
            [widgetId]: false,
          }));
        }
      }}
      onThemeChange={(theme) => {
        patchPreferences({ theme });
        void savePreferences({ theme });
      }}
        preferences={preferences}
        section={section}
        unreadCount={unreadCount}
        userName={user.displayName}
        websocketStatus={websocketStatus}
        refreshingWidgetIds={refreshingWidgetIds}
        widgets={buildWidgetViews(
          dashboard,
          health,
          integrationsOverview,
          integrationDetails,
        )}
      />
    );
  }
