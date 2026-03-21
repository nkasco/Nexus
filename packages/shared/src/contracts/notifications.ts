export type NotificationSeverity = 'info' | 'success' | 'warning';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  source: 'system' | 'dashboard' | 'realtime';
  createdAt: string;
  read: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}
