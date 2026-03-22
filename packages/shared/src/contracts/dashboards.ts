export type DashboardSlug =
  | 'overview'
  | 'home-lab'
  | 'media'
  | 'devops'
  | 'metrics'
  | 'alerts';

export type LayoutPreset = 'balanced' | 'compact';

export type WidgetFocusMode = 'summary' | 'attention';

export interface DashboardWidgetSettings {
  focus?: WidgetFocusMode;
}

export interface DashboardWidgetLayout {
  id: string;
  title: string;
  columnSpan: number;
  rowSpan: number;
  settings?: DashboardWidgetSettings;
}

export interface DashboardLayout {
  preset: LayoutPreset;
  widgets: DashboardWidgetLayout[];
}

export interface DashboardResponse {
  slug: DashboardSlug;
  name: string;
  layout: DashboardLayout;
  updatedAt: string;
}

export interface UpdateDashboardLayoutRequest {
  layout: DashboardLayout;
}
