'use client';

import type {
  IntegrationDetailResponse,
  IntegrationProvider,
  SettingsOverviewResponse,
  UiPreferences,
  UpdateIntegrationConfigurationRequest,
  UpdateNotificationSettingsRequest,
} from '@nexus/shared';
import { startTransition, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { integrationProviderOrder } from '../lib/integration-providers';
import { useOperatorPreferencesStore } from '../lib/stores/operator-preferences-store';
import { usePreferencesStore } from '../lib/stores/preferences-store';
import { useSessionStore } from '../lib/stores/session-store';
import { LoginPanel } from './login-panel';
import { SettingsWorkspace } from './settings-workspace';

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

async function loadIntegrationDetails(activeToken: string) {
  const details = await Promise.all(
    integrationProviderOrder.map((provider) =>
      api.getIntegrationDetail(activeToken, provider),
    ),
  );

  return details;
}

export function SettingsClientPage() {
  const { token, user, clearSession, setSession } = useSessionStore();
  const {
    accent,
    compactMode,
    hydrate: hydratePreferences,
    patch: patchPreferences,
    sidebarCollapsed,
    theme,
  } = usePreferencesStore();
  const { hydrate: hydrateOperatorPreferences, patch: patchOperatorPreferences } =
    useOperatorPreferencesStore();
  const [settingsOverview, setSettingsOverview] =
    useState<SettingsOverviewResponse | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationDetailResponse[]>([]);
  const [healthOk, setHealthOk] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    applyDocumentTheme({
      accent,
      compactMode,
      sidebarCollapsed,
      theme,
    });
  }, [accent, compactMode, sidebarCollapsed, theme]);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const health = await api.getHealth();
        setHealthOk(health.status === 'ok');
      } catch {
        setHealthOk(false);
      }
    };

    void loadHealth();
  }, []);

  useEffect(() => {
    if (!token) {
      setSettingsOverview(null);
      setIntegrations([]);
      return;
    }

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setErrorMessage(undefined);

      try {
        const [session, nextSettingsOverview, nextIntegrations] = await Promise.all([
          api.getSession(token),
          api.getSettingsOverview(token),
          loadIntegrationDetails(token),
        ]);

        startTransition(() => {
          hydratePreferences(nextSettingsOverview.ui);
          hydrateOperatorPreferences(nextSettingsOverview.operator);
          setSession({
            token,
            user: session.user,
            expiresAt: session.expiresAt,
          });
          setSettingsOverview(nextSettingsOverview);
          setIntegrations(nextIntegrations);
        });
      } catch (error) {
        clearSession();
        setSettingsOverview(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not restore the settings workspace.',
        );
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [
    clearSession,
    hydrateOperatorPreferences,
    hydratePreferences,
    setSession,
    token,
  ]);

  if (!token || !user) {
    return (
      <LoginPanel
        apiHealthy={healthOk}
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

  if (isBootstrapping || !settingsOverview) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-[color:var(--text-main)]">
        <div className="surface-panel px-6 py-5 text-sm text-[color:var(--text-subtle)]">
          Restoring the settings workspace...
        </div>
      </main>
    );
  }

  return (
    <SettingsWorkspace
      configurationAudit={settingsOverview.configurationAudit}
      integrations={integrations}
      notificationSettings={settingsOverview.notifications}
      onSaveIntegration={async (
        provider: IntegrationProvider,
        updates: UpdateIntegrationConfigurationRequest,
      ) => {
        const nextDetail = await api.updateIntegrationConfiguration(
          token,
          provider,
          updates,
        );

        startTransition(() => {
          setIntegrations((current) =>
            current.map((detail) =>
              detail.integration.provider === provider ? nextDetail : detail,
            ),
          );
        });

        return nextDetail;
      }}
      onSaveNotifications={async (
        updates: UpdateNotificationSettingsRequest,
      ) => {
        const nextNotifications = await api.updateNotificationSettings(
          token,
          updates,
        );

        startTransition(() => {
          setSettingsOverview((current) =>
            current
              ? {
                  ...current,
                  notifications: nextNotifications,
                }
              : current,
          );
        });

        return nextNotifications;
      }}
      onSaveOperator={async (updates) => {
        const nextOperator = await api.updateOperatorPreferences(token, updates);

        patchOperatorPreferences(nextOperator);
        startTransition(() => {
          setSettingsOverview((current) =>
            current
              ? {
                  ...current,
                  operator: nextOperator,
                }
              : current,
          );
        });

        return nextOperator;
      }}
      onSaveUi={async (updates) => {
        const nextPreferences = await api.updatePreferences(token, updates);

        patchPreferences(nextPreferences);
        applyDocumentTheme(nextPreferences);
        startTransition(() => {
          setSettingsOverview((current) =>
            current
              ? {
                  ...current,
                  ui: nextPreferences,
                }
              : current,
          );
        });

        return nextPreferences;
      }}
      onSignOut={() => {
        clearSession();
        setSettingsOverview(null);
        setIntegrations([]);
      }}
      operatorPreferences={settingsOverview.operator}
      uiPreferences={settingsOverview.ui}
      userName={user.displayName}
    />
  );
}
