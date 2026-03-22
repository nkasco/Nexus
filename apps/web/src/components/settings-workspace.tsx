'use client';

import clsx from 'clsx';
import Link from 'next/link';
import type {
  ConfigurationAuditItem,
  IntegrationDetailResponse,
  IntegrationProvider,
  NotificationSettings,
  OperatorPreferences,
  UiPreferences,
  UpdateIntegrationConfigurationRequest,
  UpdateNotificationSettingsRequest,
} from '@nexus/shared';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { integrationProviderOrder } from '../lib/integration-providers';

interface SettingsWorkspaceProps {
  userName: string;
  uiPreferences: UiPreferences;
  operatorPreferences: OperatorPreferences;
  notificationSettings: NotificationSettings;
  configurationAudit: ConfigurationAuditItem[];
  integrations: IntegrationDetailResponse[];
  onSaveUi: (updates: Partial<UiPreferences>) => Promise<UiPreferences>;
  onSaveOperator: (
    updates: Partial<OperatorPreferences>,
  ) => Promise<OperatorPreferences>;
  onSaveNotifications: (
    updates: UpdateNotificationSettingsRequest,
  ) => Promise<NotificationSettings>;
  onSaveIntegration: (
    provider: IntegrationProvider,
    updates: UpdateIntegrationConfigurationRequest,
  ) => Promise<IntegrationDetailResponse>;
  onSignOut: () => void;
}

function SectionBadge({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <span
      className={clsx(
        'status-badge',
        tone === 'success' && 'text-[color:var(--success-strong)]',
        tone === 'warning' && 'text-[color:var(--warning-strong)]',
      )}
    >
      {label}
    </span>
  );
}

function ToggleField({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="workspace-tile flex items-start justify-between gap-4 p-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[color:var(--text-main)]">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-6 text-[color:var(--text-subtle)]">
          {description}
        </span>
      </span>
      <input
        checked={checked}
        className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--accent-strong)]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

function MessageBanner({
  error = false,
  message,
}: {
  message: string | null;
  error?: boolean;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={clsx(
        'workspace-tile px-4 py-3 text-sm',
        error
          ? 'text-[color:var(--danger-strong)]'
          : 'text-[color:var(--text-subtle)]',
      )}
    >
      {message}
    </div>
  );
}

function buildNotificationUpdate(
  settings: NotificationSettings,
): UpdateNotificationSettingsRequest {
  return {
    notificationsEnabled: settings.notificationsEnabled,
    minimumSeverity: settings.minimumSeverity,
    defaultChannel: settings.defaultChannel,
    channels: settings.channels.map((channel) => ({
      channel: channel.channel,
      enabled: channel.enabled,
      fieldValues: Object.fromEntries(
        channel.fields
          .filter((field) => field.editable)
          .map((field) => [field.key, field.value]),
      ),
    })),
  };
}

function ownershipSummary(items: ConfigurationAuditItem[]) {
  return {
    inApp: items.filter((item) => item.ownership === 'in-app').length,
    environment: items.filter((item) => item.ownership === 'environment').length,
    deferred: items.filter((item) => item.ownership === 'deferred').length,
  };
}

function orderedIntegrations(integrations: IntegrationDetailResponse[]) {
  const byProvider = new Map(
    integrations.map((integration) => [integration.integration.provider, integration]),
  );

  return integrationProviderOrder
    .map((provider) => byProvider.get(provider))
    .filter((integration): integration is IntegrationDetailResponse =>
      Boolean(integration),
    );
}

function IntegrationSettingsCard({
  detail,
  onSave,
}: {
  detail: IntegrationDetailResponse;
  onSave: (
    provider: IntegrationProvider,
    updates: UpdateIntegrationConfigurationRequest,
  ) => Promise<IntegrationDetailResponse>;
}) {
  const [enabled, setEnabled] = useState(detail.integration.enabled);
  const [pollingIntervalSeconds, setPollingIntervalSeconds] = useState(
    String(detail.integration.pollingIntervalSeconds),
  );
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        detail.credentials
          .filter((credential) => credential.editable)
          .map((credential) => [credential.key, credential.value]),
      ),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(detail.integration.enabled);
    setPollingIntervalSeconds(String(detail.integration.pollingIntervalSeconds));
    setCredentialValues(
      Object.fromEntries(
        detail.credentials
          .filter((credential) => credential.editable)
          .map((credential) => [credential.key, credential.value]),
      ),
    );
    setMessage(null);
    setErrorMessage(null);
  }, [detail]);

  const editableCredentials = detail.credentials.filter(
    (credential) => credential.editable,
  );
  const environmentCredentials = detail.credentials.filter(
    (credential) => !credential.editable,
  );

  async function handleSave() {
    const parsedInterval = Number.parseInt(pollingIntervalSeconds, 10);

    if (!Number.isInteger(parsedInterval) || parsedInterval < 15 || parsedInterval > 900) {
      setErrorMessage('Polling must stay between 15 and 900 seconds.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const nextDetail = await onSave(detail.integration.provider, {
        enabled,
        pollingIntervalSeconds: parsedInterval,
        credentialValues,
      });

      startTransition(() => {
        setEnabled(nextDetail.integration.enabled);
        setPollingIntervalSeconds(
          String(nextDetail.integration.pollingIntervalSeconds),
        );
        setCredentialValues(
          Object.fromEntries(
            nextDetail.credentials
              .filter((credential) => credential.editable)
              .map((credential) => [credential.key, credential.value]),
          ),
        );
      });
      setMessage('Integration settings saved.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not save integration settings.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="surface-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow-label">{detail.integration.provider}</p>
          <h3 className="mt-2 text-xl font-semibold">
            {detail.integration.displayName}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
            {detail.integration.headline}
          </p>
        </div>
        <SectionBadge
          label={detail.integration.enabled ? 'Enabled' : 'Disabled'}
          tone={detail.integration.enabled ? 'success' : 'warning'}
        />
      </div>

      <ToggleField
        checked={enabled}
        description="Disable a provider to stop scheduled collection without removing its saved snapshot."
        label="Provider enabled"
        onChange={setEnabled}
      />

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Polling interval</span>
        <input
          className="shell-input"
          onChange={(event) => setPollingIntervalSeconds(event.target.value)}
          type="number"
          value={pollingIntervalSeconds}
        />
        <span className="mt-2 block text-sm text-[color:var(--text-subtle)]">
          Keep collection cadence between 15 and 900 seconds.
        </span>
      </label>

      {editableCredentials.length > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Editable connection details</p>
            <p className="mt-1 text-sm text-[color:var(--text-subtle)]">
              Leave a field blank to keep using the environment value instead.
            </p>
          </div>
          {editableCredentials.map((credential) => (
            <label className="block" key={credential.key}>
              <span className="mb-2 block text-sm font-medium">
                {credential.label}
              </span>
              <input
                className="shell-input"
                onChange={(event) =>
                  setCredentialValues((current) => ({
                    ...current,
                    [credential.key]: event.target.value,
                  }))
                }
                placeholder={`Use ${credential.envVar} from the environment`}
                type="text"
                value={credentialValues[credential.key] ?? ''}
              />
            </label>
          ))}
        </div>
      ) : null}

      {environmentCredentials.length > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Environment-only secrets</p>
            <p className="mt-1 text-sm text-[color:var(--text-subtle)]">
              Sensitive values stay deployment-managed until encrypted secret storage is added.
            </p>
          </div>
          {environmentCredentials.map((credential) => (
            <div className="workspace-tile p-4" key={credential.key}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{credential.label}</span>
                <SectionBadge
                  label={credential.configured ? 'Configured' : 'Missing'}
                  tone={credential.configured ? 'success' : 'warning'}
                />
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-subtle)]">
                Managed through <code>{credential.envVar}</code>.
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <MessageBanner error message={errorMessage} />
      <MessageBanner message={message} />

      <button
        className="widget-action-button h-11 justify-center text-sm"
        disabled={isSaving}
        onClick={() => {
          void handleSave();
        }}
        type="button"
      >
        {isSaving ? 'Saving…' : 'Save integration'}
      </button>
    </article>
  );
}

export function SettingsWorkspace({
  userName,
  uiPreferences,
  operatorPreferences,
  notificationSettings,
  configurationAudit,
  integrations,
  onSaveUi,
  onSaveOperator,
  onSaveNotifications,
  onSaveIntegration,
  onSignOut,
}: SettingsWorkspaceProps) {
  const [uiDraft, setUiDraft] = useState(uiPreferences);
  const [operatorDraft, setOperatorDraft] = useState(operatorPreferences);
  const [notificationDraft, setNotificationDraft] =
    useState(notificationSettings);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [isSavingOperator, setIsSavingOperator] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [appearanceMessage, setAppearanceMessage] = useState<string | null>(null);
  const [operatorMessage, setOperatorMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null,
  );
  const [appearanceError, setAppearanceError] = useState<string | null>(null);
  const [operatorError, setOperatorError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    setUiDraft(uiPreferences);
  }, [uiPreferences]);

  useEffect(() => {
    setOperatorDraft(operatorPreferences);
  }, [operatorPreferences]);

  useEffect(() => {
    setNotificationDraft(notificationSettings);
  }, [notificationSettings]);

  const ownership = useMemo(
    () => ownershipSummary(configurationAudit),
    [configurationAudit],
  );

  const integrationCards = useMemo(
    () => orderedIntegrations(integrations),
    [integrations],
  );

  async function handleAppearanceSave() {
    setIsSavingAppearance(true);
    setAppearanceMessage(null);
    setAppearanceError(null);

    try {
      const nextPreferences = await onSaveUi(uiDraft);
      startTransition(() => {
        setUiDraft(nextPreferences);
      });
      setAppearanceMessage('Appearance preferences saved.');
    } catch (error) {
      setAppearanceError(
        error instanceof Error ? error.message : 'Could not save appearance settings.',
      );
    } finally {
      setIsSavingAppearance(false);
    }
  }

  async function handleOperatorSave() {
    setIsSavingOperator(true);
    setOperatorMessage(null);
    setOperatorError(null);

    try {
      const nextPreferences = await onSaveOperator(operatorDraft);
      startTransition(() => {
        setOperatorDraft(nextPreferences);
      });
      setOperatorMessage('Operator behavior saved.');
    } catch (error) {
      setOperatorError(
        error instanceof Error ? error.message : 'Could not save operator settings.',
      );
    } finally {
      setIsSavingOperator(false);
    }
  }

  async function handleNotificationSave() {
    const invalidEmailPort = notificationDraft.channels.some((channel) =>
      channel.channel === 'email'
        ? channel.fields.some((field) => {
            if (field.key !== 'port' || field.value.trim().length === 0) {
              return false;
            }

            const parsedPort = Number.parseInt(field.value, 10);
            return !Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535;
          })
        : false,
    );

    if (invalidEmailPort) {
      setNotificationError('SMTP port must be between 1 and 65535.');
      return;
    }

    setIsSavingNotifications(true);
    setNotificationMessage(null);
    setNotificationError(null);

    try {
      const nextSettings = await onSaveNotifications(
        buildNotificationUpdate(notificationDraft),
      );
      startTransition(() => {
        setNotificationDraft(nextSettings);
      });
      setNotificationMessage('Notification settings saved.');
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Could not save notification settings.',
      );
    } finally {
      setIsSavingNotifications(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-3 text-[color:var(--text-main)] sm:px-4 sm:py-4">
      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute left-[-10rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,var(--accent-soft)_0%,transparent_70%)] opacity-48"
      />
      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute bottom-[-10rem] right-[-9rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_72%)] opacity-24"
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4">
        <section className="surface-panel relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-soft)_58%,transparent),transparent_80%)] opacity-70" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <SectionBadge label="Phase 3.6" tone="success" />
                <SectionBadge label="Phase 3.6 shell refresh" />
                <SectionBadge label="Configuration ownership mapped" />
              </div>
              <h1 className="mt-4 text-[2.35rem] font-semibold tracking-[-0.06em] sm:text-[2.9rem]">
                Settings
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-subtle)]">
                One operational surface for what Nexus owns in-app, what still belongs to the deployment environment, and what remains intentionally deferred.
              </p>

              <div className="mt-5 grid gap-2.5 md:grid-cols-3">
                <div className="hero-stat">
                  <p className="eyebrow-label">In-app</p>
                  <p className="mt-2.5 text-[1.1rem] font-semibold tracking-[-0.04em]">
                    {ownership.inApp}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                    Managed directly through Nexus.
                  </p>
                </div>
                <div className="hero-stat">
                  <p className="eyebrow-label">Environment</p>
                  <p className="mt-2.5 text-[1.1rem] font-semibold tracking-[-0.04em]">
                    {ownership.environment}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                    Still deployment-managed for safety or secret handling.
                  </p>
                </div>
                <div className="hero-stat">
                  <p className="eyebrow-label">Deferred</p>
                  <p className="mt-2.5 text-[1.1rem] font-semibold tracking-[-0.04em]">
                    {ownership.deferred}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                    Explicitly held for a later product phase.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-card grid gap-2 p-3.5 sm:grid-cols-2 lg:w-[392px]">
              <div className="toolbar-control">
                <span className="eyebrow-label">Signed in as</span>
                <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                  {userName}
                </span>
              </div>
              <div className="toolbar-control">
                <span className="eyebrow-label">Ownership</span>
                <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                  {ownership.inApp} in-app / {ownership.environment} env / {ownership.deferred} deferred
                </span>
              </div>
              <Link className="toolbar-button" href={`/${operatorDraft.defaultLandingSection}`}>
                <span className="eyebrow-label">Default landing</span>
                <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                  Open {operatorDraft.defaultLandingSection}
                </span>
              </Link>
              <button
                className="toolbar-button"
                onClick={onSignOut}
                type="button"
              >
                <span className="eyebrow-label">Session</span>
                <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                  Sign out
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <article className="surface-card p-4 sm:p-5">
            <p className="eyebrow-label">Configuration Audit</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Ownership map
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
              Every required configuration path now has a named home: in-app, environment-driven, or intentionally deferred.
            </p>

            <div className="mt-4 grid gap-2.5 md:grid-cols-2">
              {configurationAudit.map((item) => (
                <div className="workspace-tile p-4" key={item.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.label}</p>
                    <SectionBadge
                      label={item.ownership}
                      tone={
                        item.ownership === 'in-app'
                          ? 'success'
                          : item.ownership === 'environment'
                            ? 'default'
                            : 'warning'
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                    {item.summary}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                    {item.phaseCoverage}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4">
            <article className="surface-card p-4 sm:p-5">
              <p className="eyebrow-label">Appearance</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Shell preferences
              </h2>
              <div className="mt-4 grid gap-2.5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Theme</span>
                  <select
                    className="shell-input"
                    onChange={(event) =>
                      setUiDraft((current) => ({
                        ...current,
                        theme: event.target.value as UiPreferences['theme'],
                      }))
                    }
                    value={uiDraft.theme}
                  >
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Accent</span>
                  <select
                    className="shell-input"
                    onChange={(event) =>
                      setUiDraft((current) => ({
                        ...current,
                        accent: event.target.value as UiPreferences['accent'],
                      }))
                    }
                    value={uiDraft.accent}
                  >
                    <option value="graphite">Graphite</option>
                    <option value="aurora">Aurora</option>
                  </select>
                </label>
                <ToggleField
                  checked={uiDraft.compactMode}
                  description="Use the tighter dashboard density across widget surfaces."
                  label="Compact mode"
                  onChange={(checked) =>
                    setUiDraft((current) => ({
                      ...current,
                      compactMode: checked,
                    }))
                  }
                />
                <ToggleField
                  checked={uiDraft.sidebarCollapsed}
                  description="Keep the navigation rail collapsed by default."
                  label="Collapsed sidebar"
                  onChange={(checked) =>
                    setUiDraft((current) => ({
                      ...current,
                      sidebarCollapsed: checked,
                    }))
                  }
                />
              </div>
              <div className="mt-4 space-y-3">
                <MessageBanner error message={appearanceError} />
                <MessageBanner message={appearanceMessage} />
              </div>
              <button
                className="widget-action-button mt-4 h-10 justify-center text-sm"
                disabled={isSavingAppearance}
                onClick={() => {
                  void handleAppearanceSave();
                }}
                type="button"
              >
                {isSavingAppearance ? 'Saving…' : 'Save appearance'}
              </button>
            </article>

            <article className="surface-card p-4 sm:p-5">
              <p className="eyebrow-label">Operator Defaults</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Behavior
              </h2>
              <div className="mt-4 grid gap-2.5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Default landing page
                  </span>
                  <select
                    className="shell-input"
                    onChange={(event) =>
                      setOperatorDraft((current) => ({
                        ...current,
                        defaultLandingSection:
                          event.target.value as OperatorPreferences['defaultLandingSection'],
                      }))
                    }
                    value={operatorDraft.defaultLandingSection}
                  >
                    <option value="overview">Overview</option>
                    <option value="home-lab">Home Lab</option>
                    <option value="media">Media</option>
                    <option value="devops">DevOps</option>
                    <option value="metrics">Metrics</option>
                    <option value="alerts">Alerts</option>
                  </select>
                </label>
                <ToggleField
                  checked={operatorDraft.autoOpenNotifications}
                  description="Open the notification center automatically when a new realtime notification arrives."
                  label="Auto-open notifications"
                  onChange={(checked) =>
                    setOperatorDraft((current) => ({
                      ...current,
                      autoOpenNotifications: checked,
                    }))
                  }
                />
                <ToggleField
                  checked={operatorDraft.use24HourTime}
                  description="Use 24-hour time for shell timestamps such as the last realtime pulse."
                  label="24-hour time"
                  onChange={(checked) =>
                    setOperatorDraft((current) => ({
                      ...current,
                      use24HourTime: checked,
                    }))
                  }
                />
              </div>
              <div className="mt-4 space-y-3">
                <MessageBanner error message={operatorError} />
                <MessageBanner message={operatorMessage} />
              </div>
              <button
                className="widget-action-button mt-4 h-10 justify-center text-sm"
                disabled={isSavingOperator}
                onClick={() => {
                  void handleOperatorSave();
                }}
                type="button"
              >
                {isSavingOperator ? 'Saving…' : 'Save behavior'}
              </button>
            </article>
          </div>
        </section>

        <section className="surface-card p-4 sm:p-5">
          <p className="eyebrow-label">Notifications</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Channel readiness
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
            Configure the non-secret delivery metadata now so Phase 5 alert fanout has a clean path to finish.
          </p>

          <div className="mt-4 grid gap-3.5 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="grid gap-2.5">
              <ToggleField
                checked={notificationDraft.notificationsEnabled}
                description="Master switch for future alert delivery once the Phase 5 engine is active."
                label="Notifications enabled"
                onChange={(checked) =>
                  setNotificationDraft((current) => ({
                    ...current,
                    notificationsEnabled: checked,
                  }))
                }
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Minimum severity
                </span>
                <select
                  className="shell-input"
                  onChange={(event) =>
                    setNotificationDraft((current) => ({
                      ...current,
                      minimumSeverity:
                        event.target.value as NotificationSettings['minimumSeverity'],
                    }))
                  }
                  value={notificationDraft.minimumSeverity}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Default channel
                </span>
                <select
                  className="shell-input"
                  onChange={(event) =>
                    setNotificationDraft((current) => ({
                      ...current,
                      defaultChannel:
                        event.target.value as NotificationSettings['defaultChannel'],
                    }))
                  }
                  value={notificationDraft.defaultChannel}
                >
                  <option value="discord">Discord</option>
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <div className="space-y-3">
                <MessageBanner error message={notificationError} />
                <MessageBanner message={notificationMessage} />
              </div>
              <button
                className="widget-action-button h-10 justify-center text-sm"
                disabled={isSavingNotifications}
                onClick={() => {
                  void handleNotificationSave();
                }}
                type="button"
              >
                {isSavingNotifications ? 'Saving…' : 'Save notifications'}
              </button>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2">
              {notificationDraft.channels.map((channel) => (
                <article className="workspace-tile p-4" key={channel.channel}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{channel.label}</p>
                    <SectionBadge
                      label={channel.configured ? 'Configured' : 'Needs setup'}
                      tone={channel.configured ? 'success' : 'warning'}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                    {channel.description}
                  </p>

                  <div className="mt-4">
                    <ToggleField
                      checked={channel.enabled}
                      description="Enable this route for future alert delivery."
                      label={`${channel.label} enabled`}
                      onChange={(checked) =>
                        setNotificationDraft((current) => ({
                          ...current,
                          channels: current.channels.map((currentChannel) =>
                            currentChannel.channel === channel.channel
                              ? {
                                  ...currentChannel,
                                  enabled: checked,
                                }
                              : currentChannel,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {channel.fields.map((field) =>
                      field.editable ? (
                        <label className="block" key={field.key}>
                          <span className="mb-2 block text-sm font-medium">
                            {field.label}
                          </span>
                          <input
                            className="shell-input"
                            onChange={(event) =>
                              setNotificationDraft((current) => ({
                                ...current,
                                channels: current.channels.map((currentChannel) =>
                                  currentChannel.channel === channel.channel
                                    ? {
                                        ...currentChannel,
                                        fields: currentChannel.fields.map((currentField) =>
                                          currentField.key === field.key
                                            ? {
                                                ...currentField,
                                                value: event.target.value,
                                                source:
                                                  event.target.value.trim().length > 0
                                                    ? 'stored'
                                                    : 'environment',
                                              }
                                            : currentField,
                                        ),
                                      }
                                    : currentChannel,
                                ),
                              }))
                            }
                            placeholder={`Use ${field.envVar} from the environment`}
                            type="text"
                            value={field.value}
                          />
                          <span className="mt-2 block text-sm leading-6 text-[color:var(--text-subtle)]">
                            {field.description}
                          </span>
                        </label>
                      ) : (
                        <div className="surface-card p-3" key={field.key}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{field.label}</span>
                            <SectionBadge
                              label={field.configured ? 'Configured' : 'Missing'}
                              tone={field.configured ? 'success' : 'warning'}
                            />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                            {field.description}
                          </p>
                          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                            Managed through <code>{field.envVar}</code>.
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3.5">
            <p className="eyebrow-label">Integrations</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Provider configuration
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
              Each adapter now exposes enablement, cadence, and non-secret connection controls in one place.
            </p>
          </div>

          <div className="grid gap-3.5 xl:grid-cols-2">
            {integrationCards.map((detail) => (
              <IntegrationSettingsCard
                detail={detail}
                key={detail.integration.provider}
                onSave={onSaveIntegration}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
