# Nexus Specification

## Project Overview

Nexus is a self-hosted single-pane-of-glass dashboard for homelab and DevOps operations. It centralizes monitoring, control, alerting, and historical insight across infrastructure, storage, networking, media services, smart home systems, and CI/CD pipelines.

The product is optimized for a single trusted administrator running the system in a private homelab environment. The initial deployment target is Docker Compose. The first database target is SQLite, with a clean migration path to Postgres in the future.

## Goals

- Integrate and monitor core homelab services from one interface.
- Provide real-time status, historical metrics, actionable widgets, and alerting.
- Support safe control actions for selected upstream systems.
- Present a polished macOS-inspired user experience with modular widgets.
- Offer a strong foundation for future multi-user support and Postgres adoption.

## Non-Goals For Initial Release

- Public internet exposure by default.
- Complex multi-tenant access control.
- Destructive infrastructure actions such as deleting VMs, pools, or media libraries.
- Replacing specialized tools like Grafana, Prometheus, or native admin consoles for advanced workflows.

## Target Users

- Primary user: a single trusted homelab operator.
- Secondary future audience: a small team managing shared infrastructure and CI/CD systems.

## Core Product Areas

### Homelab

- Proxmox cluster and VM/LXC health
- TrueNAS storage and pool health
- UniFi network and client health
- Home Assistant devices, automations, and sensors

### Media

- Plex library, session, and server health

### DevOps

- GitHub repositories, pull requests, workflow runs, deployments, and artifact visibility

### Platform

- Unified alerting
- Notifications
- Historical metrics and KPI summaries
- Real-time updates
- Dashboard layout management

## Functional Requirements

### Monitoring and Visibility

- Show current status across all integrated systems.
- Display KPIs for infrastructure, storage, network, media, and CI/CD.
- Provide historical charts and trend analysis.
- Surface actionable alerts and recent events.

### Control Actions

- Start, stop, reboot, and shut down VMs/LXCs in Proxmox where permitted.
- Trigger Home Assistant automations, scripts, scenes, and entity toggles.
- Trigger GitHub workflows and rerun failed jobs where supported.
- Trigger Plex scans and limited session controls where the API supports them.

### Alerts and Notifications

- Evaluate alert rules against collected metrics and system state.
- Open, deduplicate, resolve, and acknowledge alerts.
- Send notifications through Discord first, with Telegram and email as additional channels.

### Personalization

- Support drag-and-drop widget placement.
- Support widget resizing.
- Persist dashboard layouts and user display preferences.
- Support light and dark themes aligned with macOS-style system appearance.

## UI and UX Requirements

### Visual Direction

- Native macOS-inspired aesthetic
- Minimal, elegant, clean surfaces
- Subtle shadows and spacing
- Crisp typography
- Smooth transitions and polished interactions

### Layout

- Collapsible left sidebar with icons and text
- Main content area for dashboards and widgets
- Top-level sections: Overview, Home Lab, Media, DevOps, Metrics, Alerts
- Interactive widgets arranged in a modular grid

### Widget Expectations

- Modular and reusable
- Resizable and draggable where appropriate
- Capable of real-time refresh
- Consistent action menus and loading/error states

## Technical Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- ApexCharts

### Backend

- Node.js
- NestJS
- TypeScript

### Persistence

- SQLite for initial release
- Future migration path to Postgres

### Real-Time Layer

- WebSocket as the primary push mechanism
- SSE as an optional fallback if needed

### Authentication

- JWT-backed application sessions
- OAuth2-compatible architecture where future providers may be added

### Metrics Sources

- Direct API polling from integrated services
- Optional Prometheus or Netdata integration for supplemental metrics

## High-Level Architecture

```text
+-------------------------+      REST / WebSocket      +-------------------------+
| Next.js Frontend        | <------------------------> | NestJS Backend          |
| - App shell             |                            | - Auth                  |
| - Sidebar + dashboards  |                            | - Integration modules   |
| - Widgets + charts      |                            | - Metrics ingest        |
| - Theme + layout state  |                            | - Actions service       |
+-------------------------+                            | - Alert engine          |
                                                       | - Notification service  |
                                                       +-----------+-------------+
                                                                   |
                     +--------------------------+-------------------+----------------------+
                     |                          |                                          |
                     v                          v                                          v
              +-------------+            +-------------+                           +----------------+
              | SQLite      |            | Realtime    |                           | Notification   |
              | - settings  |            | broadcaster |                           | providers      |
              | - metrics   |            | - WebSocket |                           | - Discord      |
              | - alerts    |            | - event bus |                           | - Telegram     |
              | - layouts   |            +-------------+                           | - SMTP/email   |
              +------+------+                                                        +--------+-------+
                     |                                                                         |
                     +----------------------------+--------------------------------------------+
                                                  |
                                                  v
                                   +-----------------------------------+
                                   | External Integrations             |
                                   | - Proxmox                         |
                                   | - TrueNAS                         |
                                   | - UniFi                           |
                                   | - Home Assistant                  |
                                   | - Plex                            |
                                   | - GitHub / GitHub Actions         |
                                   | - Prometheus / Netdata (optional) |
                                   +-----------------------------------+
```

## Backend Architecture

### Major Modules

- `auth`: login/session management, JWT issuance, token validation
- `users`: single-admin profile and future expansion path
- `integrations`: provider registration, credentials, sync health, provider abstractions
- `inventory`: normalized assets such as VMs, nodes, pools, APs, clients, entities, workflows
- `metrics`: metric definitions, sample ingest, rollups, query endpoints
- `alerts`: rule evaluation, state transitions, acknowledgements, deduplication
- `actions`: safe execution of provider-specific write actions with audit logging
- `dashboards`: widget definitions, layouts, saved filters, dashboard composition
- `notifications`: Discord, Telegram, and email dispatch
- `github-ci`: provider-specific GitHub and Actions functionality

### Integration Model

Each provider adapter should expose a common conceptual contract:

- collect current state
- map upstream resources to normalized assets
- map upstream data to normalized metrics
- declare available actions
- execute supported actions safely

This keeps the frontend and core backend modules provider-agnostic.

## Frontend Architecture

### Application Shell

- Collapsible left sidebar
- Top bar for time range, global search, quick actions, and theme toggle
- Dashboard routes by domain
- Widget grid with persisted layout state

### State Management

- Zustand for client-side dashboard state, filters, and UI preferences
- Server-driven data for dashboard content and metrics queries
- WebSocket subscription layer for live updates

### Widget Categories

- Status summary widgets
- KPI cards
- Time-series charts
- Tables and activity feeds
- Alert lists
- Action widgets
- Media/session widgets
- CI/CD widgets

## API Design

### Core Read Endpoints

- `GET /api/overview`
- `GET /api/dashboards/:slug`
- `GET /api/assets`
- `GET /api/assets/:id`
- `GET /api/metrics/query`
- `GET /api/alerts`
- `GET /api/alerts/:id`
- `GET /api/integrations`

### Core Action Endpoints

- `POST /api/actions/:provider/:action`
- `POST /api/github/workflows/:id/dispatch`
- `POST /api/alerts/:id/acknowledge`
- `POST /api/home-assistant/automations/:id/trigger`

### Real-Time Topics

- `metric.updated`
- `asset.status_changed`
- `alert.opened`
- `alert.resolved`
- `action.completed`
- `integration.sync_failed`

## Service-by-Service Integration Plan

### Proxmox

#### Integration

- Use Proxmox API token authentication against the REST API.
- Sync cluster, node, VM, and LXC inventory on a schedule.

#### Metrics To Monitor

- Node CPU usage
- Node memory usage
- Node disk usage
- Cluster status
- VM and LXC power state
- Guest agent health
- Backup status
- Snapshot count and age
- HA state where available

#### Controls

- Start VM/LXC
- Stop VM/LXC
- Reboot VM/LXC
- Shutdown VM/LXC
- Snapshot trigger in later phase

### TrueNAS

#### Integration

- Use API key authentication via TrueNAS REST API.
- Poll pools, datasets, disks, and task status.

#### Metrics To Monitor

- Pool health
- Pool capacity and free space
- Scrub status
- Disk SMART alerts
- Disk temperature
- Dataset utilization
- Replication task status
- Snapshot task results

#### Controls

- Trigger scrub in later phase
- Trigger snapshot task in later phase
- Avoid destructive storage actions in the initial release

### UniFi

#### Integration

- Use local controller API credentials or token-based session.
- Sync devices, clients, WAN state, and AP health.

#### Metrics To Monitor

- Gateway health
- WAN latency
- Throughput
- Packet loss
- AP status
- Switch port status
- Client count
- Rogue or offline device state
- Wi-Fi performance indicators

#### Controls

- Client reconnect in later phase
- Client block/unblock in later phase
- Port cycle in later phase

### Home Assistant

#### Integration

- Use a long-lived access token.
- Prefer WebSocket subscriptions for near real-time state changes.

#### Metrics To Monitor

- Entity state
- Device availability
- Binary sensor state
- Energy readings
- Area and device summaries
- Automation status
- Script status

#### Controls

- Trigger automation
- Trigger script
- Activate scene
- Toggle supported entities
- Acknowledge automation-related alerts

### Plex

#### Integration

- Use Plex token and server API.
- Sync libraries, server status, and active sessions.

#### Metrics To Monitor

- Active streams
- Transcode sessions
- Library counts
- Recently added items
- Bandwidth usage
- Server reachability
- Failed scan or library errors where available

#### Controls

- Trigger library scan
- Play/pause/stop for active sessions where supported
- More advanced playback control in later phases

### GitHub and CI/CD

#### Integration

- Prefer GitHub App for future-proofing and tighter scopes.
- Allow PAT fallback for MVP if GitHub App setup is deferred.

#### Metrics To Monitor

- Workflow run status
- Failed jobs
- PR status and checks
- Deployment status
- Queue depth
- Recent release artifacts
- Repository activity summaries

#### Controls

- Trigger workflow dispatch
- Rerun failed jobs where supported
- Open artifact and run details
- Expand deployment operations in later phases

## Metrics, Historical Data, and Alerts

### Metrics Collection Strategy

- Poll each provider on a provider-specific schedule.
- Normalize raw data into asset-linked metric samples.
- Broadcast changes to connected clients over WebSocket.
- Store raw samples and build rollups for long-range charts.

### Retention Strategy

- Raw metric samples: 14 days
- Hourly rollups: 90 days
- Daily rollups: 1 year

### Alert Model

- Threshold- and state-based alert rules
- Deduplication by alert fingerprint
- Resolution on recovery
- Acknowledgement support
- Notification fan-out by configured channels

## Recommended Database Schema

### Identity and Settings

- `user`
- `session`
- `user_setting`

### Integrations

- `integration`
- `integration_credential_ref`
- `integration_sync_state`

### Inventory

- `asset`
  - `provider`
  - `asset_type`
  - `external_id`
  - `name`
  - `status`
  - `metadata_json`

### Metrics

- `metric_definition`
  - `key`
  - `unit`
  - `aggregation`
  - `retention_policy`
- `metric_sample`
  - `asset_id`
  - `metric_definition_id`
  - `ts`
  - `value_num`
  - `tags_json`
- `metric_rollup_hourly`
- `metric_rollup_daily`

### Alerts

- `alert_rule`
- `alert_event`
- `alert_notification`

### Dashboard Configuration

- `dashboard`
- `widget_instance`
- `widget_layout`
- `saved_filter`

### Actions and Auditing

- `action_audit`
- `webhook_endpoint`
- `webhook_delivery`

## Frontend Dashboard Mockup

```text
+----------------------------------------------------------------------------------+
| Sidebar                                                                          |
| [Nexus]                                                                          |
| Overview                                                                         |
| Home Lab                                                                         |
| Media                                                                            |
| DevOps                                                                           |
| Metrics                                                                          |
| Alerts                                                                           |
|                                                                                  |
| Theme toggle                                                                     |
+----------------------------+-----------------------------------------------------+
| Header                     | Overview | time range | search | quick actions      |
+----------------------------+-----------------------------------------------------+
| KPI Strip                  | CPU | Storage | WAN | Plex | CI health              |
+----------------------------+-------------------------------+---------------------+
| Proxmox Cluster            | GitHub Runs                   | Alert Summary       |
+----------------------------+-------------------------------+---------------------+
| TrueNAS Pools              | UniFi Network                 | Plex Sessions       |
+----------------------------+-------------------------------+---------------------+
| Home Assistant Devices     | Historical Metrics            | Recent Events       |
+----------------------------+-------------------------------+---------------------+
```

## Deployment Model

### Initial Deployment

- Docker Compose deployment on a private homelab host
- Separate frontend and backend containers
- SQLite stored on persistent volume
- Reverse proxy optional but recommended for TLS termination
- Private access via Tailscale or WireGuard strongly preferred

### Future Deployment Evolution

- Replace SQLite with Postgres
- Add Redis for queues, event buffering, or cache
- Split workers for sync, alerts, and notifications if scale increases
- Prepare service boundaries so a Kubernetes migration is straightforward later

## Security and Authentication Considerations

- Assume private-network-first access model
- Use JWT-backed sessions for app authentication
- Encrypt upstream service credentials at rest
- Keep secrets server-side only
- Use least-privilege service tokens and provider scopes
- Separate read capabilities from write capabilities
- Require action confirmation for state-changing operations
- Log all control actions in an audit trail
- Apply rate limits to authentication and action endpoints
- Prefer VPN or private overlay access instead of direct public exposure

## Optional Enhancements

- Incoming webhooks for external event ingestion
- Prometheus scrape endpoint or import adapter
- Netdata adapter for server-level metrics
- Command palette for quick actions
- Custom widget builder
- Mobile-optimized layout
- Plugin-based integration SDK
- Team roles and shared dashboards

## Roadmap Summary

### MVP

- Authentication
- App shell and theme support
- Read-only integrations
- Overview dashboard
- Core widgets
- Real-time updates
- Discord notifications

### Intermediate

- Historical charts and KPI rollups
- Write actions for safe integrations
- Drag-and-drop widget management
- Telegram and email notifications
- Alert tuning and silencing

### Full Feature

- Advanced actions and automation
- Postgres migration path
- Enhanced CI/CD views
- More notification and webhook features
- Small-team support

## Success Criteria

- A single dashboard provides meaningful visibility into all core systems.
- Operators can identify current health, recent failures, and trends within seconds.
- High-value control actions can be executed safely without visiting each native console.
- The platform remains responsive and reliable while polling multiple upstream APIs.
- The system is secure enough for private homelab use and extensible for future growth.
