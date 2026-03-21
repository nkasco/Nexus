export type DashboardSlug =
  | 'overview'
  | 'home-lab'
  | 'media'
  | 'devops'
  | 'metrics'
  | 'alerts';

export type LayoutPreset = 'balanced' | 'compact';

export interface DashboardWidgetLayout {
  id: string;
  title: string;
  columnSpan: number;
  rowSpan: number;
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
