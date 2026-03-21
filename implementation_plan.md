# Nexus Implementation Plan

## Overview

This implementation plan breaks Nexus into phased deliverables with clear checkpoints. Each phase is intended to produce a usable increment while preserving a clean path toward more advanced integrations, historical insights, and write-capable controls.

## Phase 0: Project Foundation

### Objectives

- Establish the monorepo and baseline architecture for the frontend, backend, and shared contracts.
- Define coding standards, deployment defaults, and local developer workflows.

### Deliverables

- [ ] Initialize Next.js frontend with TypeScript and Tailwind CSS
- [ ] Initialize NestJS backend with TypeScript
- [ ] Set up shared TypeScript types or a shared package for common contracts
- [ ] Define environment variable strategy for local and deployed environments
- [ ] Add Docker Compose for local self-hosted development
- [ ] Configure SQLite persistence for the backend
- [ ] Add linting, formatting, and test runners
- [ ] Create initial README setup instructions
- [ ] Define folder structure for integrations, dashboards, metrics, alerts, and actions
- [ ] Add a basic CI workflow for linting and tests

### Exit Criteria

- [ ] Frontend and backend both run locally
- [ ] Docker Compose boots the full stack successfully
- [ ] Shared contracts and environment configuration patterns are documented

## Phase 1: App Shell and Core Platform

### Objectives

- Build the foundational user experience and platform services required for all later features.

### Deliverables

- [ ] Implement macOS-inspired design tokens, theme system, and layout primitives
- [ ] Build the app shell with collapsible left sidebar and top bar
- [ ] Add routes for Overview, Home Lab, Media, DevOps, Metrics, and Alerts
- [ ] Implement JWT-backed authentication flow for the single-admin user
- [ ] Add settings persistence for theme and basic UI preferences
- [ ] Create widget container components with loading, empty, and error states
- [ ] Add a dashboard configuration model for saving widget layouts
- [ ] Implement WebSocket infrastructure for real-time updates
- [ ] Build a notification center UI surface
- [ ] Create a backend health endpoint and frontend connectivity status indicator

### Exit Criteria

- [ ] User can log in and access a functional dashboard shell
- [ ] Real-time events can be delivered from backend to frontend
- [ ] Dashboard routes and layout state persist correctly

## Phase 2: Integration Framework and Read-Only Data

### Objectives

- Build the provider abstraction and ingest pipeline needed to normalize external systems into a unified model.

### Deliverables

- [ ] Define provider adapter interfaces for inventory, metrics, and actions
- [ ] Implement integration credential storage and sync-state tracking
- [ ] Create normalized asset and metric models
- [ ] Add scheduled polling infrastructure with provider-specific intervals
- [ ] Add integration status endpoints and error reporting
- [ ] Implement Proxmox read-only integration
- [ ] Implement TrueNAS read-only integration
- [ ] Implement UniFi read-only integration
- [ ] Implement Home Assistant read-only integration
- [ ] Implement Plex read-only integration
- [ ] Implement GitHub and GitHub Actions read-only integration
- [ ] Store normalized assets and current-state snapshots in SQLite
- [ ] Broadcast asset and metric changes over WebSocket

### Exit Criteria

- [ ] All target providers can sync successfully with valid credentials
- [ ] Assets from each provider appear in a normalized backend model
- [ ] Frontend can display current-state data from multiple providers at once

## Phase 3: Overview Dashboard and Core Widgets

### Objectives

- Turn normalized backend data into a usable dashboard experience for daily operations.

### Deliverables

- [ ] Build overview KPI cards for compute, storage, network, media, and CI/CD
- [ ] Build Proxmox cluster and VM status widgets
- [ ] Build TrueNAS pool health and capacity widgets
- [ ] Build UniFi network health and client widgets
- [ ] Build Home Assistant entity and automation summary widgets
- [ ] Build Plex session and library summary widgets
- [ ] Build GitHub workflow and PR status widgets
- [ ] Build global alert summary widget
- [ ] Build recent events and activity feed widget
- [ ] Add per-widget refresh, configuration, and navigation actions
- [ ] Add responsive layout behavior for desktop and smaller screens

### Exit Criteria

- [ ] Overview page surfaces key health and activity across all integrated services
- [ ] Each core domain has at least one usable widget in the UI
- [ ] UI reflects real-time updates without full-page refreshes

## Phase 4: Historical Metrics, Graphs, and KPI Rollups

### Objectives

- Add historical context so Nexus becomes useful for trend analysis, not only current state.

### Deliverables

- [ ] Implement metric definition, sample, and rollup persistence
- [ ] Define retention jobs for raw, hourly, and daily metrics
- [ ] Add backend metric query endpoints for time-series charts
- [ ] Build reusable ApexCharts-based time-series widget components
- [ ] Add server resource graphs for Proxmox nodes and VMs
- [ ] Add storage growth and pool utilization graphs for TrueNAS
- [ ] Add WAN latency, throughput, and client trend graphs for UniFi
- [ ] Add device and automation activity trends for Home Assistant where meaningful
- [ ] Add Plex usage and stream history charts
- [ ] Add GitHub workflow success/failure trend charts
- [ ] Add dashboard-wide time-range filtering

### Exit Criteria

- [ ] Historical charts render correctly for short and long time windows
- [ ] Metric retention and rollups operate without corrupting current-state data
- [ ] KPI summaries can be derived from historical data where needed

## Phase 5: Alerts and Notifications

### Objectives

- Add actionable alerting and outbound notifications for operational awareness.

### Deliverables

- [ ] Define alert rule model and rule evaluation engine
- [ ] Implement alert event lifecycle: open, deduplicate, acknowledge, resolve
- [ ] Build alert list, detail view, and filtering UI
- [ ] Add global alert banner and widget integration
- [ ] Implement Discord notification delivery
- [ ] Implement Telegram notification delivery
- [ ] Implement SMTP/email notification delivery
- [ ] Add notification channel settings and test-send workflows
- [ ] Add silencing, cooldown, and deduplication controls
- [ ] Record notification delivery outcomes for observability

### Exit Criteria

- [ ] Alerts are raised and resolved based on defined conditions
- [ ] Notifications are delivered reliably to at least one configured channel
- [ ] Users can inspect alert history and notification outcomes

## Phase 6: Safe Control Actions

### Objectives

- Enable high-value state-changing operations with strong safety controls and auditability.

### Deliverables

- [ ] Implement action execution service and provider action registry
- [ ] Add audit logging for all state-changing operations
- [ ] Add action confirmation flows in the UI
- [ ] Add role/scope checks even if the initial release is single-admin
- [ ] Implement Proxmox VM/LXC start, stop, reboot, and shutdown actions
- [ ] Implement Home Assistant automation, script, scene, and toggle actions
- [ ] Implement GitHub workflow dispatch and rerun actions where supported
- [ ] Implement Plex library scan trigger and supported session controls
- [ ] Add action cooldowns and idempotency protections
- [ ] Show action status and completion events in the UI

### Exit Criteria

- [ ] Supported actions can be triggered successfully from the dashboard
- [ ] Every action is confirmed, authorized, logged, and surfaced back to the user
- [ ] Failed actions return clear error states without corrupting dashboard data

## Phase 7: Dashboard Customization and Operator Experience

### Objectives

- Improve day-to-day usability and make Nexus feel like a polished control center.

### Deliverables

- [ ] Implement drag-and-drop widget management
- [ ] Implement resizable widgets with persisted layout
- [ ] Add widget add/remove flows
- [ ] Add saved filters and custom dashboard views
- [ ] Add command palette for quick navigation and actions
- [ ] Add richer transitions and interaction polish
- [ ] Add per-dashboard settings and layout presets
- [ ] Improve mobile and tablet responsiveness where feasible

### Exit Criteria

- [ ] Users can personalize dashboards without manual configuration changes
- [ ] Layout changes persist reliably across sessions
- [ ] The app feels polished and efficient for repeated daily use

## Phase 8: Hardening, Extensibility, and Future-Proofing

### Objectives

- Prepare Nexus for broader adoption, safer operation, and future feature growth.

### Deliverables

- [ ] Add encrypted secret storage for integration credentials at rest
- [ ] Add structured audit views for security-sensitive actions
- [ ] Add import/export support for dashboard configuration
- [ ] Add incoming webhook support for external event ingestion
- [ ] Add optional Prometheus or Netdata adapter support
- [ ] Abstract persistence so Postgres migration is low-risk
- [ ] Document reverse proxy, TLS, and VPN deployment recommendations
- [ ] Add backup and restore guidance for SQLite and app configuration
- [ ] Expand automated test coverage across integration and action flows
- [ ] Add operational dashboards for Nexus itself

### Exit Criteria

- [ ] Security-sensitive data handling is documented and implemented responsibly
- [ ] The system can evolve toward Postgres and additional integrations cleanly
- [ ] Operators have clear guidance for safe deployment and maintenance

## Cross-Phase Testing Strategy

### Automated Testing

- [ ] Unit tests for provider adapters, metric normalization, alert rules, and action guards
- [ ] Integration tests for backend modules and persistence flows
- [ ] API tests for read endpoints, action endpoints, and auth flows
- [ ] Frontend component tests for widgets, layout state, and interaction patterns
- [ ] End-to-end smoke tests for login, dashboard load, and core workflows

### Manual Validation

- [ ] Validate each upstream integration with representative real-world credentials
- [ ] Validate degraded behavior when upstream providers are offline or rate-limited
- [ ] Validate theme parity in light and dark modes
- [ ] Validate real-time updates under reconnect and browser refresh scenarios
- [ ] Validate action safeguards and audit logging for all supported write operations

## Recommended Delivery Sequence

- [ ] Complete Phases 0 through 3 before enabling any write actions
- [ ] Complete Phase 4 before marketing historical insights as a primary feature
- [ ] Complete Phase 5 before relying on Nexus for operational alerting
- [ ] Complete Phase 6 before positioning Nexus as a true control plane
- [ ] Use Phase 8 to harden the platform before expanding beyond single-admin private use
