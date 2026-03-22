import type {
  AuthSessionResponse,
  DashboardResponse,
  DashboardSlug,
  HealthResponse,
  IntegrationDetailResponse,
  IntegrationProvider,
  IntegrationsOverviewResponse,
  LoginRequest,
  NotificationListResponse,
  NotificationSettings,
  OperatorPreferences,
  SettingsOverviewResponse,
  UiPreferences,
  UpdateIntegrationConfigurationRequest,
  UpdateNotificationSettingsRequest,
} from '@nexus/shared';
import type { SessionResponse } from '@nexus/shared';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  token?: string;
  body?: unknown;
}

async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(
    options.body ? { 'Content-Type': 'application/json' } : {},
  );

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (body.message) {
        message = body.message;
      }
    } catch {}

    throw new Error(message);
  }

  return (await response.json()) as TResponse;
}

export const api = {
  getHealth: () => request<HealthResponse>('/health'),
  login: (credentials: LoginRequest) =>
    request<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    }),
  getSession: (token: string) =>
    request<SessionResponse>('/auth/session', { token }),
  getSettingsOverview: (token: string) =>
    request<SettingsOverviewResponse>('/settings', { token }),
  getPreferences: (token: string) =>
    request<UiPreferences>('/settings/ui', { token }),
  updatePreferences: (token: string, updates: Partial<UiPreferences>) =>
    request<UiPreferences>('/settings/ui', {
      method: 'PATCH',
      token,
      body: updates,
    }),
  getOperatorPreferences: (token: string) =>
    request<OperatorPreferences>('/settings/operator', { token }),
  updateOperatorPreferences: (
    token: string,
    updates: Partial<OperatorPreferences>,
  ) =>
    request<OperatorPreferences>('/settings/operator', {
      method: 'PATCH',
      token,
      body: updates,
    }),
  getNotificationSettings: (token: string) =>
    request<NotificationSettings>('/settings/notifications', { token }),
  updateNotificationSettings: (
    token: string,
    updates: UpdateNotificationSettingsRequest,
  ) =>
    request<NotificationSettings>('/settings/notifications', {
      method: 'PATCH',
      token,
      body: updates,
    }),
  getDashboard: (token: string, slug: DashboardSlug) =>
    request<DashboardResponse>(`/dashboards/${slug}`, { token }),
  updateDashboard: (
    token: string,
    slug: DashboardSlug,
    layout: DashboardResponse['layout'],
  ) =>
    request<DashboardResponse>(`/dashboards/${slug}/layout`, {
      method: 'PUT',
      token,
      body: { layout },
    }),
  getNotifications: (token: string) =>
    request<NotificationListResponse>('/notifications', { token }),
  markNotificationsRead: (token: string) =>
    request<NotificationListResponse>('/notifications/read', {
      method: 'POST',
      token,
    }),
  getIntegrations: (token: string) =>
    request<IntegrationsOverviewResponse>('/integrations', { token }),
  getIntegrationDetail: (token: string, provider: IntegrationProvider) =>
    request<IntegrationDetailResponse>(`/integrations/${provider}`, { token }),
  updateIntegrationConfiguration: (
    token: string,
    provider: IntegrationProvider,
    updates: UpdateIntegrationConfigurationRequest,
  ) =>
    request<IntegrationDetailResponse>(`/integrations/${provider}/config`, {
      method: 'PATCH',
      token,
      body: updates,
    }),
  syncIntegrations: (token: string) =>
    request<IntegrationsOverviewResponse>('/integrations/sync', {
      method: 'POST',
      token,
    }),
  syncIntegration: (token: string, provider: IntegrationProvider) =>
    request<IntegrationDetailResponse>(`/integrations/${provider}/sync`, {
      method: 'POST',
      token,
    }),
};

export function getWebSocketUrl(token: string) {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  url.searchParams.set('token', token);
  return url.toString();
}
