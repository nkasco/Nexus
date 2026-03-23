# Nexus Visual Overhaul Plan

## Overview

This visual overhaul plan refocuses Nexus around a Notion-first operator workspace: flatter, denser, calmer, and more editorial while preserving the persistent left sidebar and enough macOS polish in typography, motion, and interaction detail.

The current shell is coherent, but the live audit showed an oversized presentation layer across the app. The main issues are excessive outer framing, overly large radii, generous internal padding, and too many stacked summary blocks before the actual work surface. This file should be updated after visual implementation work so completed items, remaining gaps, and new follow-up work stay accurate.

## Phase 0: Visual Audit and Direction Lock

### Objectives

- Convert the current browser audit into explicit design constraints and density targets.
- Lock the new direction before implementation starts so the overhaul stays cohesive.

### Deliverables

- [x] Document current UI problems with concrete before-state notes from the live shell audit
- [x] Record target density rules for shell padding, panel padding, row height, and radius
- [x] Define the visual thesis, content plan, and interaction thesis for the app shell
- [x] Establish a small set of reference principles for sidebar, toolbar, widgets, forms, and settings
- [x] Capture implementation guardrails so the overhaul stays Notion-first instead of drifting back toward glossy dashboard chrome

### Exit Criteria

- [x] The overhaul has a written style direction and measurable density targets
- [x] The implementation path is specific enough that no major visual decisions are deferred

### Phase 0 Notes

- The live audit covered the login screen plus the authenticated `/overview`, `/media`, and `/settings` surfaces, with an additional mobile viewport pass on `/overview`.
- Current shell measurements from the audit include a `268px` sidebar, `28px` shell and hero radii, `24px` hero padding, `18px` nav row radii, and `16px` widget-card padding, all of which contribute to the oversized feel.
- The current background treatment still uses layered gradients and ambient effects that make the shell feel more ornamental than document-like.
- A fresh Playwright MCP pass during this planning phase revalidated the before-state on desktop and mobile: desktop `/overview` still places the first widget row at roughly `777px` from the top of the viewport, while mobile `/overview` pushes the first widget to roughly `2258px` because the sidebar stack and route hero consume nearly the entire first screens worth of space.

### Before-State Audit

- The shell spends too much of the first viewport on framing before content: the outer workspace frame, large sidebar shell, rounded route hero, toolbar chips, and summary tiles stack before the widget field starts doing useful work.
- Playwright on desktop confirmed that the first widget row does not begin until about `777px` from the top of the viewport, leaving the first screen dominated by shell chrome instead of live operational content.
- The radius scale is consistently too large for an operator workspace: `28px` on shell panels and route heroes, `24px` on cards, `22px` on stat blocks, `20px` on tiles and menus, `18px` on nav rows and list rows, and `16px` on inputs make nearly every element feel inflated.
- The sidebar reads as a featured panel instead of a source list. At `268px` wide with `18px` active-row radii, `40px` icon containers, `11px` plus tracked eyebrow labels, and generous vertical padding, it carries too much visual weight relative to the page content.
- Toolbar controls are too tall and self-important. The current `min-h-[62px]`, `min-w-[148px]` control blocks present preference toggles more like dashboard cards than compact workspace tools.
- In the live desktop render, those toolbar controls are landing at roughly `74px` tall once typography and spacing are applied, which further exaggerates the top-of-page control stack.
- Widget framing repeats the same large-card treatment too often. Widgets, stat blocks, list rows, notification items, and settings groups all rely on similar rounded bordered containers, which reduces hierarchy and makes dense information feel equally heavy everywhere.
- The login route still behaves like a showcase splash: large ambient orbs, a two-panel shell, oversized display typography, a three-card stat strip, and repeated badges consume attention before the sign-in task itself.
- The canvas treatment remains more decorative than editorial. Global radial glows, grid overlays, soft blur, and gradient stacking on the shell, hero, auth panel, and cards create a polished look, but not the flatter document-tool feeling this overhaul is targeting.
- Mobile inherits the same inflation problem. The sidebar block, route hero, and stacked summary blocks consume too much vertical space before core content appears, especially on `/overview`.
- Playwright on a `390x844` viewport showed the mobile sidebar block alone at about `899px` tall, the route hero starting around `940px`, and the first widget not appearing until around `2258px`, which means meaningful dashboard content begins several screens down.

### Target Density Rules

- Outer page gutter: reduce from `12px` to a target `8px` on mobile and from `20px` to a target `16px` on desktop.
- Shell panel radius: reduce from `28px` to a target `16px`.
- Route hero radius: reduce from `28px` to a target `16px`, with hero usage itself becoming optional and usually replaced by a compact toolbar.
- Standard card radius: reduce from `24px` to a target `14px`.
- Secondary tile and grouped-row radius: reduce from `22px` to `18px` down to a target `10px` to `12px` depending on component role.
- Input, select, button, and badge radius: reduce from `16px` to `18px` down to a target `8px` to `10px`, reserving pill shapes only for true pills.
- Sidebar width: reduce from `268px` to a target `232px` expanded width and approximately `84px` collapsed width.
- Sidebar row height: tighten to a target `40px` to `44px`, including smaller icon containers and less internal row padding.
- Toolbar control height: reduce from `62px` minimum height to a target `40px` to `44px`, with controls reading as tools rather than cards.
- Primary card padding: reduce from the current `20px` to `24px` range to a target `14px` to `16px`.
- Secondary row and list padding: reduce from the current `16px` horizontal rhythm to a target `10px` to `12px`.
- Section gaps: compress top-of-page and inter-panel spacing so the first viewport shows live widgets or forms sooner, with a target `12px` grid rhythm instead of repeated `20px` plus blocks.

### Visual Thesis

- Nexus should read as a dark document workspace first and an operations dashboard second.
- Notion is the primary reference for density, restraint, and editorial hierarchy; macOS should influence polish, motion, and typography quality rather than adding extra gloss or chrome.
- Surfaces should feel matte, quiet, and intentionally layered, with structure coming from spacing, typography, and grouping before borders, fills, or effects.

### Content Plan

- The first screen on each route should prioritize usable content over ornamental framing.
- The sidebar should behave like a navigation source list, the header should behave like a compact toolbar, and the main canvas should behave like a working document containing widgets, lists, and forms.
- Summary context should be compressed into one concise route header band or absorbed into the first content section instead of being repeated through multiple stacked hero and stat modules.

### Interaction Thesis

- Controls should feel direct and low-drama: small movement, subtle hover response, quiet focus treatment, and minimal reveal choreography.
- Motion should reinforce state changes and panel entrances, not advertise the chrome.
- Semantics should stay clear through typography, placement, and restrained tone shifts rather than large fills, oversized badges, or glossy highlight treatments.

### Reference Principles

- Sidebar: treat it as a dense source list with compact rows, smaller icon wells, subdued separators, and a single clear active state instead of nested glossy framing.
- Toolbar: use one horizontal workspace toolbar with compact controls, concise labels, and optional secondary metadata rather than card-like control blocks.
- Widgets: default to flatter grouped sections with tighter headers and lighter metadata; use nested cards only where content types genuinely differ.
- Forms: favor document-tool controls with smaller radii, lighter borders, denser spacing, and clearer grouped headings so settings feel editable rather than ceremonially framed.
- Settings: organize long sections into denser thematic groups with less repeated chrome and more consistent label, helper-text, and action placement.

### Implementation Guardrails

- Do not reintroduce large ambient orbs, glossy gradients, or broad blur as primary identity elements.
- Do not solve hierarchy problems by adding more wrapper cards; remove containers before inventing new ones.
- Do not use large hero banners by default. A route should earn a large header only when it communicates route-specific meaning that cannot fit in a compact toolbar.
- Do not let badges, toggles, or filter controls grow into the dominant visual element of a surface.
- Do not push the design into ultra-compact admin-console density; the target is calmer and tighter, not cramped.
- Keep one restrained accent and let neutral layering carry most of the interface.
- Prefer mixed compositions of lists, grouped rows, and small supporting panels over uniform grids of equal-weight cards.
- Preserve current product scope and interactions during the overhaul. This track is about visual structure, density, and hierarchy rather than adding new settings or widget capabilities.

## Phase 1: Core Visual System Reset

### Objectives

- Replace the current dark glossy control-center treatment with a flatter editorial workspace system.
- Tighten the entire spacing and sizing scale across the app.

### Deliverables

- [x] Redefine color tokens around muted neutrals with one restrained accent and reduced ambient gradients
- [x] Reduce shell, panel, card, input, button, and badge radii across the application
- [x] Tighten spacing tokens so outer gutters, section gaps, and component padding are materially smaller
- [x] Rework typography scale and weights for clearer hierarchy with less oversized display treatment
- [x] Simplify shadows, borders, and blur so surfaces read flatter and more document-like
- [x] Standardize motion to a few subtle transitions for reveal, hover, and state change

### Exit Criteria

- [x] The base token system alone makes the shell feel denser and calmer before route-specific polish
- [x] Light and dark themes no longer depend on glossy gradients or inflated panel styling

### Phase 1 Notes

- The target direction is Notion-first, with macOS influence reserved for polish rather than primary styling.
- The default density target is noticeably denser, not maximum-density admin-console compactness.
- Phase 1 shipped as a shared visual-system reset across `apps/web/src/app/globals.css`, `app-shell`, `widget-frame`, `login-panel`, `notification-center`, and `settings-workspace`, without changing product scope or route composition yet.
- The core palette now uses quieter graphite and stone neutrals in both themes, keeps a single restrained accent at a time, and removes the stronger blue-gray ambient treatment that previously made the shell feel more glossy than editorial.
- Shell, panel, and card radii now land at `16px`, `14px`, and `12px`, with inputs and action buttons tightened to `10px`, which materially reduces the inflated rounded language before the larger shell/header compression work in Phase 2.
- Shared padding and scale were tightened across the app: page gutters dropped to `10px` mobile and `16px` desktop, the overview sidebar was reduced to `248px`, widget frames dropped to `16px` to `20px` internal padding, and headings across login, shell, settings, and widgets now use smaller display ramps.
- Shadows, border contrast, and blur were flattened at the token layer so surfaces read more like stacked document sections and less like polished glass panels, while motion was normalized onto shorter `150ms` to `220ms` rise and slide transitions.
- Playwright review on a fresh `next dev -p 3200` session confirmed the token reset improved the before-state even before Phase 2: desktop `/overview` now places the first widget row at roughly `668px` instead of `777px`, and mobile `/overview` now places the first widget at roughly `1835px` instead of `2258px`.
- The same mobile pass showed the sidebar block reduced from roughly `899px` tall to `794px`, while the route hero dropped from roughly `1144px` tall to `853px`; the shell is still too tall on handheld, but the reset moved it materially in the right direction without structural rewrites.
- `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, and `npm run build --workspace @nexus/web` all passed after the reset.
- Initial Playwright validation against the long-lived `localhost:3000` dev server hit a pre-existing stale-module/HMR runtime problem, so the final review for this phase used a fresh dev server on `3200`; Phase 4 should still revisit the persistent dev-server issue separately from the visual overhaul itself.
- Follow-up work introduced by this phase includes shrinking the sidebar and route header stack further in Phase 2, deciding whether the remaining login/status badge strip should compress further, and resolving the stale Next dev chunk issue so browser validation can reliably use the default local server again.

## Phase 2: Shell and Navigation Overhaul

### Objectives

- Make the shell feel like a focused workspace instead of a framed showcase.
- Preserve the left sidebar while making it slimmer, quieter, and more scannable.

### Deliverables

- [x] Narrow and densify the sidebar, including nav row height, icon containers, internal padding, and footer actions
- [x] Rework the main route header into a compact workspace toolbar instead of a large hero
- [x] Remove or compress redundant meta tiles near the top of each route
- [x] Make the first viewport show more actual work surface and fewer ornamental wrappers
- [x] Restyle the notification center so it matches the flatter shell language
- [x] Adjust the mobile shell so the sidebar and top framing consume less vertical space before content begins

### Exit Criteria

- [x] Overview reaches meaningful widget content much sooner on desktop and mobile
- [x] The sidebar feels closer to a source list than a large docked panel

### Phase 2 Notes

- Phase 2 landed in `apps/web/src/components/app-shell.tsx` and `apps/web/src/components/notification-center.tsx`, with the key structural move being a compact workspace toolbar, a denser `224px` desktop sidebar, and a lower-chrome notification tray that no longer reads like a separate glossy overlay.
- The route hero is now a toolbar-style block that keeps section identity, session state, unread count, and appearance controls together without the previous four-tile summary stack or a separate top-of-page dashboard wrapper.
- Sidebar rows were tightened to roughly `55px` active-link height with smaller icon wells and tighter footer actions, which makes the left rail read more like a source list than a docked feature panel.
- Mobile now prioritizes the primary workspace before the full sidebar stack, which puts meaningful content back into the first viewport while still preserving the full navigation rail further down the page.
- Playwright review on a fresh `next dev -p 3200` session measured the desktop `/overview` first widget row at roughly `325px` from the top of the viewport instead of `668px`, with the route toolbar at roughly `288px` tall, a `224px` sidebar, a `340px` notification tray, and about a `55px` nav-row height.
- The same `390x844` mobile Playwright pass now reaches the first widget at roughly `673px` and keeps it visible in the first viewport, down from roughly `1835px` in Phase 1. The mobile toolbar still remains the tallest top-of-page element and should compress a little further during Phase 3 if widget-level edits create room to do so cleanly.
- `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, `npm run test --workspace @nexus/web`, and `npm run build --workspace @nexus/web` all passed after the Phase 2 shell work. The build still emits the existing Next.js ESLint-plugin warning, but it does not fail.
- Validation again used a fresh direct dev server on `3200`; the long-lived local dev session remains prone to stale Next.js artifact issues, and running `next build` at the same time as `next dev` can also corrupt `.next` output for the live server until it is restarted.

## Phase 3: Widget, Form, and Settings Refactor

### Objectives

- Apply the new density and styling system to data widgets and form-heavy surfaces.
- Replace repeated oversized card treatment with clearer content grouping and stronger utility-first scanability.

### Deliverables

- [x] Rebuild widget framing around tighter headers, smaller actions, cleaner metadata, and lower chrome
- [x] Reduce internal widget padding and compress stat blocks, lists, badges, and snapshot footers
- [x] Introduce section and list compositions where they scan better than uniform cards
- [x] Restyle inputs, selects, toggles, and save actions to feel lighter and more document-tool-like
- [x] Rework settings into denser grouped sections so long forms feel more manageable and less inflated
- [x] Keep status semantics clear without relying on loud fills or pill-heavy UI

### Exit Criteria

- [x] Dashboard routes feel information-dense but still readable
- [x] Settings becomes easier to scan and faster to use without changing its functional coverage

### Phase 3 Notes

- Phase 3 landed primarily in `apps/web/src/app/globals.css`, `apps/web/src/components/widget-frame.tsx`, and `apps/web/src/components/settings-workspace.tsx`, where the shared radius, padding, shadow, badge, input, and action-button system was tightened again to move the UI farther away from glossy card chrome and closer to a dense document workspace.
- Dashboard widgets now use smaller headers, tighter footer treatment, lighter action controls, and explicit `Snapshot` plus `Recent detail` or `Attention queue` sections so stats and operational lists scan like grouped content instead of one repeated card pattern.
- The settings workspace was recomposed into denser sections with lighter top framing, smaller control cards, tighter field rhythm, and more direct helper copy, while preserving the full Phase 3.5 configuration coverage and save flows.
- Environment-only credential and notification-secret rows now sit inside quieter grouped blocks, which keeps the security boundary clear without relying on oversized pills or repeated heavy wrappers.
- Unit tests were updated for the shared widget frame and shell rendering assumptions so the tighter responsive heading and section structure remain covered after the refactor.

## Phase 4: Validation, Regression Coverage, and Follow-Through

### Objectives

- Verify the overhaul across real screens and keep the planning artifacts current as implementation lands.
- Ensure the visual reset does not regress behavior.

### Deliverables

- [x] Add or update unit tests for shell layout states, widget framing, and settings presentation changes
- [x] Run `npm run test`, `npm run typecheck`, and `npm run lint`
- [x] Use Playwright to review login, overview, media, settings, and a mobile viewport after implementation
- [x] Record any remaining polish or follow-up items back into this file
- [x] Update `implementation_plan.md` to reflect overhaul progress and any follow-up work introduced by the redesign

### Exit Criteria

- [x] The revised shell is validated on desktop and mobile with Playwright
- [x] Verification commands pass, or any remaining failures are documented explicitly

### Phase 4 Notes

- The current live audit surfaced the existing `favicon.ico` 404 in the Next.js dev environment; it is unrelated to the visual overhaul but may continue to appear during browser validation until fixed separately.
- Phase 4 added another shell regression assertion in `apps/web/src/components/app-shell.test.tsx` so the collapsed-sidebar plus compact-layout state remains covered alongside the earlier widget and settings tests, and it added login-form regression coverage in `apps/web/src/components/login-panel.test.tsx` for native credential semantics plus submit or error states.
- The login form now exposes explicit username or password autocomplete semantics and required fields in `apps/web/src/components/login-panel.tsx`, which keeps the rendered route aligned with native browser expectations and strengthens browser-driven validation.
- Final validation passed `npm run test --workspace @nexus/web`, `npm run typecheck --workspace @nexus/web`, `npm run lint --workspace @nexus/web`, and `npm run build --workspace @nexus/web` after the Phase 4 follow-through work. The build still emits the existing Next.js ESLint-plugin warning, but it does not fail.
- Playwright review against the built API on `4000` and the built web app on `3000` now covers the login route, `/overview`, `/media`, `/settings`, and a `390x844` mobile overview viewport. The sweep also exercised visible-form login with `admin` / `nexus-admin`, layout preset changes, theme switching in both directions, the collapsed sidebar state, and notification-center rendering in the overhauled shell.
- The mobile overview pass still keeps the first widget inside the opening viewport, with the `Compute Status` heading landing at roughly `698px` from the top of a `390x844` viewport during the final check.
- The remaining follow-up from this phase is narrower now: the development-time `favicon.ico` 404 still appears during some browser loads, `npm run build --workspace @nexus/web` still emits the existing non-failing Next.js ESLint-plugin warning, and broader end-to-end smoke coverage is still needed for authenticated restore and route rendering.

## Cross-Phase Testing Strategy

### Automated Testing

- [x] Frontend component tests for shell density states, sidebar behavior, widget framing, and settings presentation
- [ ] State-management tests for theme, density, layout preset, and notification interactions affected by shell changes
- [ ] End-to-end smoke coverage for login, authenticated restore, and route rendering after the overhaul lands

### Manual Validation

- [x] Validate the desktop experience on `/overview`, `/media`, and `/settings`
- [x] Validate the mobile experience to ensure shell chrome no longer buries the primary content
- [x] Validate theme parity in light and dark modes after the token reset
- [x] Validate sidebar collapse, notification drawer, theme switch, and layout preset behavior after the visual refactor

## Recommended Delivery Sequence

- [ ] Complete Phase 0 before implementation work starts so density and style goals are locked
- [ ] Complete Phases 1 and 2 before broad widget-specific polish
- [x] Complete Phase 3 before final regression and Playwright validation in Phase 4
