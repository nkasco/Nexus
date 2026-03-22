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

- [x] Audit the current shell, navigation, widget grid, and notification center against the target visual direction and document the specific gaps to close
- [x] Redefine the core design tokens for background, surface, border, typography, spacing, radius, shadow, and motion so the interface reads as darker, calmer, and more desktop-native
- [x] Establish a dark-mode-first color system with graphite, slate, ink, and muted blue-gray tones inspired by macOS dark surfaces and Notion's restrained contrast
- [x] Rework the entire theme palette for both dark and light modes so neither mode defaults to a blue cast and all neutrals, accents, and semantic states feel deliberate
- [x] Replace the current heavy glassmorphism treatment with a cleaner layered surface system that combines macOS softness with Notion-like editorial simplicity
- [x] Remove the current washed-out light gray gradients and replace them with richer dark surfaces, subtle depth separation, and more intentional accent restraint
- [x] Replace the current glossy shell framing with flatter, matte, low-glare surfaces and darker neutral backgrounds closer to a desktop productivity app
- [x] Refine the page canvas, content width, and section spacing so the layout feels less inflated and more intentionally structured
- [x] Redesign the sidebar to feel more like a dense desktop source list, with tighter vertical rhythm, quieter separators, clearer active rows, and reduced ornamental chrome
- [x] Simplify the top shell header into a lighter workspace toolbar so content leads the page instead of the header controls dominating it
- [x] Introduce a more cohesive widget/card system with consistent header structure, metadata styling, state treatments, and content rhythm
- [x] Revisit the core component language itself, including card shapes, control chrome, panel nesting, chip usage, and grouping patterns, so the UI does not rely on the current repeated rounded-pill treatment
- [x] Reduce border radius, outline weight, and container nesting across the shell so cards and controls feel more grounded and less inflated
- [x] Explore section-based content grouping and mixed card/list compositions so dashboard pages feel curated and editorial rather than like a uniform grid of oversized widgets
- [x] Restyle form controls, selects, buttons, toggles, and status pills to feel more macOS-native while preserving the existing preference and dashboard actions
- [x] Rework typography scale and copy presentation so titles, labels, helper text, and widget details feel closer to a polished productivity app than a futuristic ops console
- [x] Polish the notification center with better hierarchy, spacing, and read/unread treatment so it matches the refined shell instead of reading like an overlay from a different theme
- [x] Add or standardize icon usage where it improves scanability, especially in navigation, widget metadata, and shell actions
- [x] Tighten transitions, hover states, focus states, and loading behavior so interactions feel deliberate and subtle rather than decorative
- [x] Validate the revised shell at desktop and smaller breakpoints with Playwright-assisted UI review and capture updated screenshots for implementation notes

### Exit Criteria

- [x] The authenticated shell presents a visually cohesive dark-mode macOS-plus-Notion direction across the sidebar, header, widgets, and notification center
- [x] The revised palette feels intentional across both theme modes, with no pervasive blue tint unless it is used selectively as an accent or semantic state
- [x] Theme, density, layout preset, and notification interactions still work after the visual refactor without introducing behavior regressions
- [x] The design token system is stable enough that later phases can add real widgets and charts without inventing one-off styling rules
- [x] Playwright-assisted review confirms the refined shell is visually consistent at the main supported viewport sizes

### Phase 1.5 Notes

- Phase 1.5 shipped as a frontend visual-system refactor across the global tokens, authenticated shell, widget cards, notification center, login experience, and loading states.
- The redesign moved Nexus from a pale blue, glass-heavy dashboard aesthetic to a darker matte workspace with denser navigation, quieter controls, lower radii, flatter cards, and more editorial spacing.
- Default UI preferences now start in `dark` theme with the `graphite` accent so new sessions land in the intended visual direction without depending on system theme or earlier blue-toned defaults.
- Both the login route and `/overview` were reviewed in Playwright during implementation, and the live shell was validated with the graphite accent applied after sign-in.
- A follow-up shell adjustment widened the sidebar, docked the sidebar frame flush to the left edge with a square left side, removed the top gap above the shell, and preserved an internal gutter so the rounded active-row selection still has margin around it.
- A final visual pass slightly reduced the shell, card, and control corner radii so the interface feels less pill-heavy and more crisp without losing the Phase 1.5 desktop-productivity direction.
- A later polish pass removed the rounded outer sidebar shell entirely and tightened the active-row gutter so the sidebar reads as a flatter docked rail while keeping the selected item visually distinct.
- Unit tests were updated for the redesigned shell and widget fallbacks, and the repository-wide `npm run test`, `npm run typecheck`, and `npm run lint` checks passed after the refactor.
- Playwright validation still surfaced the existing `favicon.ico` 404 in the Next.js dev environment, but it is unrelated to the Phase 1.5 UI work.
- The root `npm run dev` workflow still has a pre-existing web port-resolution bug in `apps/web/scripts/dev-server.mjs`; local browser validation for this phase used direct server startup commands instead.
- Follow-up work introduced by this phase includes adding a proper favicon, deciding whether the `aurora` accent should be further softened or replaced, and extending the same visual system to future data-rich widgets and chart surfaces in Phases 2 through 4.

## Phase 2: Integration Framework and Read-Only Data

### Objectives

- Build the provider abstraction and ingest pipeline needed to normalize external systems into a unified model.

### Deliverables

- [x] Define provider adapter interfaces for inventory, metrics, and actions
- [x] Implement integration credential storage and sync-state tracking
- [x] Create normalized asset and metric models
- [x] Add scheduled polling infrastructure with provider-specific intervals
- [x] Add integration status endpoints and error reporting
- [x] Implement Proxmox read-only integration
- [x] Implement TrueNAS read-only integration
- [x] Implement UniFi read-only integration
- [x] Implement Home Assistant read-only integration
- [x] Implement Plex read-only integration
- [x] Implement GitHub and GitHub Actions read-only integration
- [x] Store normalized assets and current-state snapshots in SQLite
- [x] Broadcast asset and metric changes over WebSocket

### Exit Criteria

- [ ] All target providers can sync successfully with valid credentials
- [x] Assets from each provider appear in a normalized backend model
- [x] Frontend can display current-state data from multiple providers at once

### Phase 2 Notes

- Phase 2 shipped a shared integration contract set, Prisma-backed persistence for credential references, sync state, normalized assets, and current metric snapshots, plus a new authenticated `/integrations` API surface for overview, detail, and manual sync flows.
- The backend now registers provider adapters for Proxmox, TrueNAS, UniFi, Home Assistant, Plex, and GitHub, seeds integration credential references from environment-variable placeholders, polls each provider on a provider-specific interval, stores the resulting normalized snapshot in SQLite, and broadcasts sync, asset, and metric updates over WebSocket.
- The current provider adapters use deterministic provider-specific snapshot data so the integration framework, persistence, realtime transport, and frontend can be exercised end to end in this repository without requiring live homelab credentials during development.
- The existing dashboard shell now consumes the integration overview and renders current-state data across Overview, Home Lab, Media, DevOps, and Metrics widgets instead of only Phase 1 placeholder copy.
- Shared notification and realtime contracts were extended so integration sync results and warnings surface through the existing notification center and websocket event stream.
- `.env.example` now documents the Phase 2 provider credential environment variables for future live adapter work and local configuration.
- `npm run test`, `npm run lint`, and `npm run typecheck` all passed after the Phase 2 work.
- Playwright validation confirmed the Phase 2 data surfaces render on `/overview` and `/home-lab` when the API and web dev servers are started directly; the existing `apps/web/scripts/dev-server.mjs` port-resolution bug still prevents using the normal web dev wrapper for that validation path.
- Playwright also surfaced the pre-existing `favicon.ico` 404 in the Next.js dev environment and a Next.js dev warning about cross-origin requests from `127.0.0.1`; neither issue blocks the Phase 2 data flow itself.
- Follow-up work introduced by this phase includes replacing the deterministic adapter snapshots with live upstream API collection, encrypting credential material at rest instead of storing only references/placeholders, adding operator controls for enabling/disabling integrations and editing credentials, and extending the new normalized data layer into the richer widget set planned for Phase 3.

## Phase 3: Overview Dashboard and Core Widgets

### Objectives

- Turn normalized backend data into a usable dashboard experience for daily operations.

### Deliverables

- [x] Build overview KPI cards for compute, storage, network, media, and CI/CD
- [x] Build Proxmox cluster and VM status widgets
- [x] Build TrueNAS pool health and capacity widgets
- [x] Build UniFi network health and client widgets
- [x] Build Home Assistant entity and automation summary widgets
- [x] Build Plex session and library summary widgets
- [x] Build GitHub workflow and PR status widgets
- [x] Build global alert summary widget
- [x] Build recent events and activity feed widget
- [x] Add per-widget refresh, configuration, and navigation actions
- [x] Add responsive layout behavior for desktop and smaller screens

### Exit Criteria

- [x] Overview page surfaces key health and activity across all integrated services
- [x] Each core domain has at least one usable widget in the UI
- [x] UI reflects real-time updates without full-page refreshes

### Phase 3 Notes

- Phase 3 shipped a richer dashboard surface across Overview, Home Lab, Media, DevOps, Metrics, and Alerts by consuming per-provider integration detail payloads instead of only the higher-level Phase 2 overview summaries.
- The default dashboard layouts were expanded to include overview KPI cards for compute, storage, network, media, and CI/CD, plus synthesized attention and recent activity widgets, and existing persisted layouts now normalize forward onto the new Phase 3 widget set automatically.
- Home Lab now includes dedicated Proxmox cluster and guest runtime widgets, TrueNAS pool and capacity widgets, and UniFi network and client-load widgets built from the normalized asset and metric snapshot data.
- Media now includes Home Assistant entity and automation summaries alongside Plex playback and library widgets, and DevOps now includes workflow, pull request, repository, and delivery-attention widgets sourced from the GitHub integration detail surface.
- The Alerts and Metrics routes were upgraded from placeholders into usable current-state views, with alert-style summaries synthesized from degraded providers and warning or offline assets until the formal Phase 5 alert engine exists.
- Widget cards now support per-widget refresh actions, persistent focus-mode configuration through the saved dashboard layout model, and quick navigation into the relevant dashboard route.
- The authenticated shell now refreshes its dashboard data from the provider detail endpoints during bootstrap and on realtime integration events, so widget content updates without a full-page reload.
- Unit tests were expanded for the new dashboard normalization path, widget rendering controls, and Phase 3 widget view builders, and `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build` all completed successfully after the implementation.
- Playwright validation confirmed the authenticated Phase 3 surfaces render on `/overview`, `/home-lab`, `/media`, `/devops`, and `/alerts`, and the overview layout was also reviewed at a narrow mobile viewport.
- During Playwright review, direct browser `fetch` login to `http://localhost:4000/auth/login` succeeded, but submitting the visible login form via automation returned `Invalid credentials`; the authenticated UI validation therefore proceeded by seeding a valid session into local storage. This appears to be an automation-path quirk rather than an API outage, but it should be revisited with dedicated end-to-end coverage.

## Phase 3.5: Settings Panel and Required Configuration Coverage

### Objectives

- Confirm that every required operator-facing configuration path has an intentional home, whether that remains environment-driven or becomes editable in the app.
- Expand the existing settings experience into a coherent control surface for all configuration that should be managed from Nexus itself.
- Close the gap between backend capabilities and operator configuration workflows before later phases add more alerts, actions, and customization complexity.

### Deliverables

- [x] Audit all required configuration surfaces across authentication, appearance, dashboards, integrations, notifications, polling/sync behavior, and other operator-managed platform settings
- [x] Document which settings are intentionally deployment-time or environment-only versus which must be editable in the Nexus UI
- [x] Confirm whether the current Phase 1 settings implementation already covers any required areas and explicitly note any gaps that still need UI support
- [x] Add or expand a dedicated settings panel or settings routes for all in-app managed configuration domains
- [x] Add integration configuration management for enabling/disabling providers, editing non-secret connection details, and clearly handling credential requirements
- [x] Add UI flows for managing notification-related configuration that is required before Phase 5 alert delivery can be considered complete
- [x] Add dashboard and operator preference controls for any remaining required personalization or default behavior not already covered by the existing settings model
- [x] Add guardrails, validation, help text, and empty/error states so operators can understand what is configurable in-app versus elsewhere
- [x] Update backend/frontend contracts and persistence models as needed to support newly surfaced settings domains
- [x] Add or update unit tests covering the settings panel state, validation, and persistence behavior for each newly introduced configuration workflow

### Exit Criteria

- [x] Every required configuration item has a documented ownership path: in-app settings, deployment-time environment configuration, or intentionally deferred future work
- [x] Operators can reach a single clear settings experience for all configuration that Nexus expects them to manage through the product
- [x] Newly added settings flows persist correctly, handle invalid input safely, and communicate secret/configuration boundaries clearly

### Phase 3.5 Notes

- Phase 3.5 introduced a dedicated authenticated `/settings` route that centralizes appearance, operator behavior, notification readiness, and per-provider integration configuration instead of scattering those controls across header shortcuts alone.
- The settings surface now includes an explicit configuration ownership audit that maps each required operator-facing setting to one of three states: managed in-app, intentionally environment-driven, or intentionally deferred to later phases.
- Phase 1 coverage is now called out directly inside the settings audit: the original quick shell controls for theme, accent, compact mode, and sidebar state remain available, while the missing operator defaults and delivery-configuration workflows were added in this phase.
- Operator preferences now persist a default landing page, auto-open notification behavior, and 24-hour time formatting, and the application root route now honors the saved default landing page from persisted operator preferences.
- Integrations now support in-app enable or disable control, per-provider polling interval overrides, editable non-secret connection fields, and explicit env-only treatment for sensitive credentials until encrypted secret storage lands.
- Notification readiness now has persisted in-app controls for channel enablement, minimum severity, default routing, and non-secret delivery metadata, while Discord, Telegram, and SMTP secrets remain clearly marked as environment-only.
- Shared contracts, Prisma persistence, SQLite bootstrap behavior, API endpoints, and the dashboard shell were updated together so the settings UI, backend validation, and runtime sync behavior stay aligned.
- Unit coverage now includes the new settings service domains, integration configuration updates, and the web settings workspace validation paths.
- `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build` all completed successfully after the Phase 3.5 implementation.
- Playwright validation confirmed the authenticated `/settings` route renders the new ownership audit, appearance controls, notification channel configuration, and integration management cards, and an operator preference save flow was exercised successfully in the rendered UI.
- The pre-existing `apps/web/scripts/dev-server.mjs` port-resolution failure is still present, so browser validation again used the direct Next.js dev command instead of the wrapper script.
- Follow-up work introduced by this phase includes encrypting secrets at rest before allowing in-app secret editing, adding test-send flows once notification delivery exists in Phase 5, and addressing the known web dev wrapper port bug separately from the settings surface itself.

## Visual Overhaul Track

### Phase 0: Visual Audit and Direction Lock

#### Deliverables

- [x] Document current UI problems with concrete before-state notes from the live shell audit
- [x] Record target density rules for shell padding, panel padding, row height, and radius
- [x] Define the visual thesis, content plan, and interaction thesis for the app shell
- [x] Establish a small set of reference principles for sidebar, toolbar, widgets, forms, and settings
- [x] Capture implementation guardrails so the overhaul stays Notion-first instead of drifting back toward glossy dashboard chrome

#### Exit Criteria

- [x] The overhaul has a written style direction and measurable density targets
- [x] The implementation path is specific enough that no major visual decisions are deferred

#### Notes

- `visual_overhaul_plan.md` now includes the locked before-state audit, explicit density targets, component-level principles, and implementation guardrails for the redesign track.
- The documented current-state measurements are grounded in the live audit plus the current frontend token and layout code: `268px` sidebar width, `28px` shell and route-hero radii, `24px` card radius, `62px` toolbar controls, and repeated gradient-plus-blur surface styling across the shell.
- Phase 0 sets the target direction as a Notion-first dark workspace with macOS polish used sparingly for typography and motion, and it defines the first-pass target density for sidebar width, card radius, control height, gutters, and padding before visual implementation begins.
- Playwright MCP was used to recheck the live shell during this pass: desktop `/overview`, `/media`, and `/settings` were reviewed, the login screen was revalidated after sign-out, and a `390x844` mobile pass on `/overview` confirmed that the current shell chrome still buries the first widget several screens down.

### Phase 1: Core Visual System Reset

#### Deliverables

- [x] Redefine color tokens around muted neutrals with one restrained accent and reduced ambient gradients
- [x] Reduce shell, panel, card, input, button, and badge radii across the application
- [x] Tighten spacing tokens so outer gutters, section gaps, and component padding are materially smaller
- [x] Rework typography scale and weights for clearer hierarchy with less oversized display treatment
- [x] Simplify shadows, borders, and blur so surfaces read flatter and more document-like
- [x] Standardize motion to a few subtle transitions for reveal, hover, and state change

#### Exit Criteria

- [x] The base token system alone makes the shell feel denser and calmer before route-specific polish
- [x] Light and dark themes no longer depend on glossy gradients or inflated panel styling

#### Notes

- Phase 1 landed as a shared frontend token and density reset across the web shell, widgets, login, notifications, and settings surfaces, without yet changing the higher-level shell composition planned for Phase 2.
- The reset moved the visual language toward quieter Notion-like neutrals, flatter matte panels, smaller radii, tighter paddings, lighter shadows, reduced blur, and calmer motion timings.
- Shared radii now center on `16px` shell panels, `14px` cards, `12px` secondary groupings, and `10px` inputs and action buttons, while page gutters and internal spacing were reduced across the authenticated shell and supporting routes.
- The overview sidebar was reduced from `268px` to `248px`, and typography was tightened across the app so route headers, widget titles, login copy, and settings headings no longer rely on oversized display styling.
- Playwright MCP review on a fresh `next dev -p 3200` session confirmed the denser baseline: desktop `/overview` moved the first widget row from roughly `777px` down to roughly `668px`, and mobile `/overview` moved it from roughly `2258px` down to roughly `1835px` while also reducing the mobile sidebar block and route hero heights.
- `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, and `npm run build --workspace @nexus/web` all passed after the Phase 1 reset. The build still emits the existing Next.js ESLint-plugin warning, but it does not fail the build.
- Browser validation against the long-lived `localhost:3000` dev server hit a pre-existing stale Next module/HMR runtime issue, so the final Playwright review used a fresh server on `3200` instead.
- Follow-up work introduced by this phase includes further compressing the sidebar and route-header stack in Phase 2, continuing to reduce top-of-page meta framing on mobile, and fixing the persistent stale-module local dev-server issue so browser validation can rely on the default port again.

### Phase 2: Shell and Navigation Overhaul

#### Deliverables

- [x] Narrow and densify the sidebar, including nav row height, icon containers, internal padding, and footer actions
- [x] Rework the main route header into a compact workspace toolbar instead of a large hero
- [x] Remove or compress redundant meta tiles near the top of each route
- [x] Make the first viewport show more actual work surface and fewer ornamental wrappers
- [x] Restyle the notification center so it matches the flatter shell language
- [x] Adjust the mobile shell so the sidebar and top framing consume less vertical space before content begins

#### Exit Criteria

- [x] Overview reaches meaningful widget content much sooner on desktop and mobile
- [x] The sidebar feels closer to a source list than a large docked panel

#### Notes

- Phase 2 focused the web-shell composition in `apps/web/src/components/app-shell.tsx` and `apps/web/src/components/notification-center.tsx` rather than broadening product scope: the authenticated shell now opens on a compact toolbar-style route header, a denser left rail, and a flatter notification tray.
- The desktop sidebar now sits at `224px` wide instead of `248px`, nav rows are down to roughly `55px` tall with smaller icon wells, and the previous sidebar session card plus top-of-page four-tile meta block were compressed into lighter inline status treatment.
- The old large route hero was replaced with a smaller workspace toolbar that keeps section identity, unread state, session state, and appearance controls together without burning most of the first viewport on framing chrome.
- Mobile now surfaces the primary workspace first and pushes the full sidebar stack below the main content flow, which materially changes the handheld experience from shell-first to work-first without removing the navigation rail entirely.
- Playwright MCP review on a fresh `next dev -p 3200` session confirmed the density gain: desktop `/overview` now reaches the first widget at roughly `325px` from the top of the viewport instead of `668px`, while the `390x844` mobile pass reaches the first widget at roughly `673px` instead of `1835px` and keeps that first widget visible inside the opening viewport.
- Playwright also revalidated `/media` and `/settings` on the same fresh dev session after the shell changes, and the notification tray now renders at about `340px` wide in the compact shell instead of the previous larger overlay footprint.
- `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, and `npm run build --workspace @nexus/web` all passed after the Phase 2 work. The build still emits the existing Next.js ESLint-plugin warning, but it does not fail the build.
- The current red item remains local Next.js dev-session stability: the long-lived `localhost:3000` flow is still unreliable, and even the direct dev server on `3200` must be restarted if `next build` and `next dev` touch `.next` at the same time. Follow-up work introduced by this phase includes tightening the remaining mobile route-toolbar height during Phase 3 and resolving the local `.next` artifact contention so browser validation can use a stable default dev path again.

## Phase 3.6: UI Overhaul and Interaction Polish

### Objectives

- Recompose the authenticated shell so the first impression feels deliberate, premium, and operational instead of visually inconsistent or over-treated.
- Tighten the page hierarchy around a stronger visual thesis: matte editorial surfaces, calmer navigation, denser dashboard rhythm, and clearer page-level orientation.
- Normalize the UI language across login, dashboard, notification, widget, and settings surfaces so the product reads as one coherent workspace.

### Visual Thesis

- A restrained operator workspace with matte graphite surfaces, warm-metal accents, sharper typography contrast, and a poster-like first viewport instead of stacked utility boxes.

### Content Plan

- Hero/workspace frame: section identity, platform status, and the most important operator controls.
- Support layer: persistent navigation, activity context, and global system posture.
- Detail layer: widgets and settings content presented with clearer scanning rhythm and fewer competing chrome treatments.
- Final CTA layer: sign-in, open settings, and widget navigation remain prominent without dominating the surface.

### Interaction Thesis

- Introduce a stronger page-entry sequence so the shell, hero, and widget field arrive with intentional staging.
- Add restrained hover and focus transitions that sharpen affordance rather than adding decorative motion.
- Improve side-panel and workspace transitions so navigation collapse, notification reveal, and widget controls feel calmer and more native.

### Deliverables

- [x] Redefine the core web design tokens in `apps/web/src/app/globals.css` around cleaner depth, typography, spacing, and accent discipline
- [x] Rebuild the authenticated shell composition in `apps/web/src/components/app-shell.tsx` to improve hierarchy, spacing, and page-level orientation
- [x] Refresh the shared widget presentation in `apps/web/src/components/widget-frame.tsx` so data density feels intentional without relying on generic card styling
- [x] Redesign the login surface in `apps/web/src/components/login-panel.tsx` so it matches the product direction and no longer reads like a placeholder marketing split
- [x] Refine the notification and settings surfaces so overlays and control-heavy views share the same visual system as the main shell
- [x] Update or add frontend unit tests to cover the new UI structure and key interaction affordances touched by the overhaul
- [x] Validate the affected web command path with `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, and `npm run build --workspace @nexus/web`

### Exit Criteria

- [x] The login, shell, widget, notification, and settings surfaces read as one cohesive product UI instead of adjacent styling passes
- [x] The first viewport on primary authenticated routes has a clear visual anchor, concise hierarchy, and reliable mobile/desktop behavior
- [x] Updated unit tests cover the changed structure and critical interactions for the redesigned surfaces
- [x] The relevant web validation commands pass after the overhaul

### Phase 3.6 Notes

- Phase 3.6 rebuilt the shared web surface language around warmer graphite neutrals, restrained gold and aurora accents, cleaner panel depth, calmer borders, and stronger top-of-page hierarchy so the product reads more like a purpose-built operator workspace than a stack of mismatched cards.
- The authenticated shell now uses a more deliberate sidebar, a stronger route hero, tighter workspace controls, and clearer top-level status framing, while the shared widget frame now presents metrics, details, and focus actions with denser but more intentional structure.
- The login experience, notification tray, and settings workspace were redesigned onto the same system so pre-auth, overlay, and configuration-heavy views no longer look like separate styling passes.
- Frontend tests were updated for the revised shell and widget structure, including the redesigned app shell assertions and the widget snapshot footer behavior.
- `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, `npm run typecheck --workspace @nexus/web`, and `npm run build --workspace @nexus/web` all passed after the overhaul work.
- Playwright validation confirmed the redesigned authenticated `/overview` workspace and `/settings` configuration surface render successfully when the API is running on port `4000` and the web app is served through the direct Next.js dev entrypoint.
- The Playwright dev-session console still showed the existing `favicon.ico` 404 in the Next.js development environment.
- `npm run build --workspace @nexus/web` completed successfully but still emitted the existing Next.js warning that the Next ESLint plugin was not detected in the current ESLint configuration.
- Follow-up work introduced by this phase includes adding dedicated end-to-end coverage for the login and dashboard flow, addressing the development-only `favicon.ico` 404, and reconciling the current ESLint setup with Next.js plugin detection expectations.

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

- [x] Complete Phases 0 through 3.5 before enabling any write actions
- [ ] Complete Phase 4 before marketing historical insights as a primary feature
- [ ] Complete Phase 5 before relying on Nexus for operational alerting
- [ ] Complete Phase 6 before positioning Nexus as a true control plane
- [ ] Use Phase 8 to harden the platform before expanding beyond single-admin private use

## Planning Notes

- A dedicated visual overhaul planning artifact now lives in `visual_overhaul_plan.md` and tracks the Notion-first shell redesign, density reset, widget/form restyling, and Playwright validation work for the next major UI pass.
