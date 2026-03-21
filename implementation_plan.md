# Nexus Implementation Plan

## Overview

This implementation plan breaks Nexus into phased deliverables with clear checkpoints. Each phase is intended to produce a usable increment while preserving a clean path toward more advanced integrations, historical insights, and write-capable controls.

This file should be updated after implementation work so completed items, remaining gaps, and newly introduced follow-up tasks stay accurate.

## Phase 0: Project Foundation

### Objectives

- Establish the monorepo and baseline architecture for the frontend, backend, and shared contracts.
- Define coding standards, deployment defaults, and local developer workflows.

### Deliverables

- [x] Initialize Next.js frontend with TypeScript and Tailwind CSS
- [x] Initialize NestJS backend with TypeScript
- [x] Set up shared TypeScript types or a shared package for common contracts
- [x] Define environment variable strategy for local and deployed environments
- [x] Add Docker Compose for local self-hosted development
- [x] Configure SQLite persistence for the backend
- [x] Add linting, formatting, and test runners
- [x] Create initial README setup instructions
- [x] Define folder structure for integrations, dashboards, metrics, alerts, and actions
- [x] Add a basic CI workflow for linting and tests
- [x] Add repository hygiene protections for secrets, local databases, logs, editor files, and machine-specific artifacts
- [x] Add baseline unit tests for the initial frontend and backend scaffolds

### Exit Criteria

- [x] Frontend and backend both run locally through successful install, test, and production build validation
- [ ] Docker Compose boots the full stack successfully
- [x] Shared contracts and environment configuration patterns are documented
- [x] Prisma client generation succeeds for the API scaffold

### Phase 0 Notes

- `npm install`, `npm run prisma:generate`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, and `npm run format` have been completed successfully.
- `docker-compose.yml` and both application Dockerfiles were added, but an end-to-end `docker compose up` verification is still pending.
- `npm audit --omit=dev` currently reports high-severity advisories in the Prisma tooling dependency chain and should be revisited during platform hardening.

## Phase 1: App Shell and Core Platform

### Objectives

- Build the foundational user experience and platform services required for all later features.

### Deliverables

- [x] Implement macOS-inspired design tokens, theme system, and layout primitives
- [x] Build the app shell with collapsible left sidebar and top bar
- [x] Add routes for Overview, Home Lab, Media, DevOps, Metrics, and Alerts
- [x] Implement JWT-backed authentication flow for the single-admin user
- [x] Add settings persistence for theme and basic UI preferences
- [x] Create widget container components with loading, empty, and error states
- [x] Add a dashboard configuration model for saving widget layouts
- [x] Implement WebSocket infrastructure for real-time updates
- [x] Build a notification center UI surface
- [x] Create a backend health endpoint and frontend connectivity status indicator

### Exit Criteria

- [x] User can log in and access a functional dashboard shell
- [x] Real-time events can be delivered from backend to frontend
- [x] Dashboard routes and layout state persist correctly

### Phase 1 Notes

- Phase 1 now includes a route-aware authenticated dashboard shell across `/overview`, `/home-lab`, `/media`, `/devops`, `/metrics`, and `/alerts`, with a collapsible sidebar, top bar controls, and a notification center surface.
- The root workspace now exposes a consolidated `npm run dev` command that starts both the API and web development servers together for local operator workflows.
- The API development workflow now runs through compiled watch output instead of `tsx watch`, which avoids the controller-context runtime failures seen in local Nest requests.
- Repository agent instructions now explicitly direct future work to use Playwright MCP for browser validation and Context7 MCP for documentation lookup when those tools fit the task.
- A single-admin JWT login flow was added to the API using `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME`, `JWT_SECRET`, and `SESSION_TTL_MINUTES`, and the frontend persists the authenticated session locally.
- UI preferences are stored through Prisma-backed `UserSetting` records, while per-dashboard layout presets are stored in the existing `Dashboard` model and can be changed from the shell.
- A raw WebSocket transport is attached at `/ws`, broadcasts connection and heartbeat events, and emits notification, settings, and dashboard-update events for the frontend connectivity indicator and notification center.
- Shared contracts were expanded for auth, settings, dashboards, notifications, realtime events, and enriched health status payloads to keep the frontend and backend aligned.
- The API runtime now auto-loads a repository-root `.env` file so Prisma and auth configuration work with the normal workspace dev commands.
- Controller handlers are explicitly bound so the watch/dev runtime serves health and platform routes reliably during local development.
- The API dev and start scripts now target the actual compiled entrypoint under `dist/apps/api/src/main.js`, aligning local development with the emitted TypeScript build layout.
- Prisma now bootstraps the local SQLite tables needed for Phase 1 on startup, so a fresh development database can serve login, settings, and dashboard requests without a separate manual migration step.
- The `/auth/session` endpoint now resolves its payload directly from the bearer token via `AuthService`, avoiding request-state collisions and returning stable JSON during frontend bootstrap.
- The settings service now reads Prisma `UserSetting` records through an explicit typed key/value selection, preventing strict TypeScript inference failures in CI and falling back safely when malformed persisted preference values are encountered.
- Workspace installs and API validation scripts now regenerate the Prisma client automatically, preventing CI or fresh local checkouts from typechecking against stale generated Prisma artifacts.
- The repository now uses ESLint 9 flat config for both apps, the API test suite runs on Vitest instead of Jest, and the web test environment uses `happy-dom`, which removes the old install-time deprecation warnings from the previous ESLint 8, Jest 29, and `jsdom` dependency chains.
- The web development server now probes for the next free port when `WEB_PORT` or the default `3000` is already occupied, and unit tests cover that fallback so the consolidated `npm run dev` workflow does not fail just because another local process is already bound.
- Unit tests now cover the new auth, settings, dashboard, notification, and health backend services as well as the key frontend shell, login, and widget components.
- Follow-up work introduced by this phase includes optional cookie-based auth hardening, conflict handling for simultaneous layout edits across multiple clients, and end-to-end login/dashboard smoke coverage.

## Phase 1.5: UI Refinement and Visual Cohesion

### Objectives

- Refine the Phase 1 shell so it feels closer to a clean macOS workspace blended with Notion's clarity and restraint.
- Recenter the visual system around a dark-mode-first experience instead of the current pale, washed-out presentation.
- Rethink the current blue-leaning theme treatment so both theme modes and shared UI states use a more intentional, better-balanced palette.
- Reduce the current glass-heavy, high-contrast dashboard styling in favor of calmer surfaces, stronger information hierarchy, and more native-feeling controls.
- Shift the shell away from a glossy “control center” aesthetic toward a darker, flatter, denser desktop workspace more in line with the provided reference.
- Establish a reusable visual language that later data-rich phases can build on without another broad UI redesign.

### Deliverables

- [ ] Audit the current shell, navigation, widget grid, and notification center against the target visual direction and document the specific gaps to close
- [ ] Redefine the core design tokens for background, surface, border, typography, spacing, radius, shadow, and motion so the interface reads as darker, calmer, and more desktop-native
- [ ] Establish a dark-mode-first color system with graphite, slate, ink, and muted blue-gray tones inspired by macOS dark surfaces and Notion's restrained contrast
- [ ] Rework the entire theme palette for both dark and light modes so neither mode defaults to a blue cast and all neutrals, accents, and semantic states feel deliberate
- [ ] Replace the current heavy glassmorphism treatment with a cleaner layered surface system that combines macOS softness with Notion-like editorial simplicity
- [ ] Remove the current washed-out light gray gradients and replace them with richer dark surfaces, subtle depth separation, and more intentional accent restraint
- [ ] Replace the current glossy shell framing with flatter, matte, low-glare surfaces and darker neutral backgrounds closer to a desktop productivity app
- [ ] Refine the page canvas, content width, and section spacing so the layout feels less inflated and more intentionally structured
- [ ] Redesign the sidebar to feel more like a dense desktop source list, with tighter vertical rhythm, quieter separators, clearer active rows, and reduced ornamental chrome
- [ ] Simplify the top shell header into a lighter workspace toolbar so content leads the page instead of the header controls dominating it
- [ ] Introduce a more cohesive widget/card system with consistent header structure, metadata styling, state treatments, and content rhythm
- [ ] Revisit the core component language itself, including card shapes, control chrome, panel nesting, chip usage, and grouping patterns, so the UI does not rely on the current repeated rounded-pill treatment
- [ ] Reduce border radius, outline weight, and container nesting across the shell so cards and controls feel more grounded and less inflated
- [ ] Explore section-based content grouping and mixed card/list compositions so dashboard pages feel curated and editorial rather than like a uniform grid of oversized widgets
- [ ] Restyle form controls, selects, buttons, toggles, and status pills to feel more macOS-native while preserving the existing preference and dashboard actions
- [ ] Rework typography scale and copy presentation so titles, labels, helper text, and widget details feel closer to a polished productivity app than a futuristic ops console
- [ ] Polish the notification center with better hierarchy, spacing, and read/unread treatment so it matches the refined shell instead of reading like an overlay from a different theme
- [ ] Add or standardize icon usage where it improves scanability, especially in navigation, widget metadata, and shell actions
- [ ] Tighten transitions, hover states, focus states, and loading behavior so interactions feel deliberate and subtle rather than decorative
- [ ] Validate the revised shell at desktop and smaller breakpoints with Playwright-assisted UI review and capture updated screenshots for implementation notes

### Exit Criteria

- [ ] The authenticated shell presents a visually cohesive dark-mode macOS-plus-Notion direction across the sidebar, header, widgets, and notification center
- [ ] The revised palette feels intentional across both theme modes, with no pervasive blue tint unless it is used selectively as an accent or semantic state
- [ ] Theme, density, layout preset, and notification interactions still work after the visual refactor without introducing behavior regressions
- [ ] The design token system is stable enough that later phases can add real widgets and charts without inventing one-off styling rules
- [ ] Playwright-assisted review confirms the refined shell is visually consistent at the main supported viewport sizes

### Phase 1.5 Notes

- This phase is intentionally a visual refinement pass, not a feature expansion phase; it should improve the perceived quality of the existing shell before provider integrations and richer widgets arrive.
- The current implementation already has a strong shell foundation, but it leans more toward glossy futuristic dashboard styling than the cleaner desktop-productivity blend described in the specification.
- The target outcome is a dark-mode-first UI that combines macOS-inspired materials, spacing, and controls with Notion-like typography, calm hierarchy, and editorial restraint.
- The provided reference sharpens that target: dense left navigation, matte dark surfaces, restrained accent use, lower-contrast chrome, and content sections that feel curated rather than heavily framed.
- A live Playwright review of `/overview` was completed after the initial browser-session issue was cleared, and it confirmed that the current shell already has the right high-level information architecture but needs calmer visual treatment.
- Specific UI issues observed in the live shell include colors that skew too pale and silvery, oversized corner radii, heavy frosted gradients, too many pill-shaped containers in the header, weak differentiation between primary and secondary controls, and widget cards that feel tall and sparse instead of compact and editorial.
- The current theme system also applies a noticeable blue cast across large parts of the interface, which makes both modes feel less neutral and less premium than intended; Phase 1.5 should treat palette design as a first-class redesign task rather than a small token tweak.
- The sidebar layout is structurally good, but its current presentation reads more like a concept dashboard than a native desktop source list; Phase 1.5 should make the active item, icon treatment, spacing, and account panel feel more grounded, denser, and more utility-driven.
- The header control cluster currently competes with the page title for attention; the refinement pass should reduce visual noise, improve grouping, and make settings feel like lightweight toolbar controls rather than feature cards.
- The visual refresh should prioritize dark graphite and ink surfaces with restrained cool accents, avoiding bright white panels, milky overlays, or neon color pops unless they serve a state or action cue.
- This phase should not assume the existing component forms are correct; if cards, chips, select wrappers, or grouped controls need different shapes or hierarchy to achieve the target look, the redesign should update those patterns instead of only recoloring them.
- The redesign should favor flatter cards, tighter list rows, subtle separators, and more content-first composition, using stronger hierarchy and spacing instead of relying on large glass panels and repeated bordered capsules.

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
- [x] Frontend component tests for widgets, layout state, and interaction patterns
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
