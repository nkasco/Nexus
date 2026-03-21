export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  source: 'system' | 'dashboard' | 'realtime' | 'integration';
  createdAt: string;
  read: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}
