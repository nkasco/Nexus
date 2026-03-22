# Nexus Visual Overhaul Plan

## Overview

This visual overhaul plan refocuses Nexus around a Notion-first operator workspace: flatter, denser, calmer, and more editorial while preserving the persistent left sidebar and enough macOS polish in typography, motion, and interaction detail.

The current shell is coherent, but the live audit showed an oversized presentation layer across the app. The main issues are excessive outer framing, overly large radii, generous internal padding, and too many stacked summary blocks before the actual work surface. This file should be updated after visual implementation work so completed items, remaining gaps, and new follow-up work stay accurate.

## Phase 0: Visual Audit and Direction Lock

### Objectives

- Convert the current browser audit into explicit design constraints and density targets.
- Lock the new direction before implementation starts so the overhaul stays cohesive.

### Deliverables

- [ ] Document current UI problems with concrete before-state notes from the live shell audit
- [ ] Record target density rules for shell padding, panel padding, row height, and radius
- [ ] Define the visual thesis, content plan, and interaction thesis for the app shell
- [ ] Establish a small set of reference principles for sidebar, toolbar, widgets, forms, and settings
- [ ] Capture implementation guardrails so the overhaul stays Notion-first instead of drifting back toward glossy dashboard chrome

### Exit Criteria

- [ ] The overhaul has a written style direction and measurable density targets
- [ ] The implementation path is specific enough that no major visual decisions are deferred

### Phase 0 Notes

- The live audit covered the login screen plus the authenticated `/overview`, `/media`, and `/settings` surfaces, with an additional mobile viewport pass on `/overview`.
- Current shell measurements from the audit include a `268px` sidebar, `28px` shell and hero radii, `24px` hero padding, `18px` nav row radii, and `16px` widget-card padding, all of which contribute to the oversized feel.
- The current background treatment still uses layered gradients and ambient effects that make the shell feel more ornamental than document-like.

## Phase 1: Core Visual System Reset

### Objectives

- Replace the current dark glossy control-center treatment with a flatter editorial workspace system.
- Tighten the entire spacing and sizing scale across the app.

### Deliverables

- [ ] Redefine color tokens around muted neutrals with one restrained accent and reduced ambient gradients
- [ ] Reduce shell, panel, card, input, button, and badge radii across the application
- [ ] Tighten spacing tokens so outer gutters, section gaps, and component padding are materially smaller
- [ ] Rework typography scale and weights for clearer hierarchy with less oversized display treatment
- [ ] Simplify shadows, borders, and blur so surfaces read flatter and more document-like
- [ ] Standardize motion to a few subtle transitions for reveal, hover, and state change

### Exit Criteria

- [ ] The base token system alone makes the shell feel denser and calmer before route-specific polish
- [ ] Light and dark themes no longer depend on glossy gradients or inflated panel styling

### Phase 1 Notes

- The target direction is Notion-first, with macOS influence reserved for polish rather than primary styling.
- The default density target is noticeably denser, not maximum-density admin-console compactness.

## Phase 2: Shell and Navigation Overhaul

### Objectives

- Make the shell feel like a focused workspace instead of a framed showcase.
- Preserve the left sidebar while making it slimmer, quieter, and more scannable.

### Deliverables

- [ ] Narrow and densify the sidebar, including nav row height, icon containers, internal padding, and footer actions
- [ ] Rework the main route header into a compact workspace toolbar instead of a large hero
- [ ] Remove or compress redundant meta tiles near the top of each route
- [ ] Make the first viewport show more actual work surface and fewer ornamental wrappers
- [ ] Restyle the notification center so it matches the flatter shell language
- [ ] Adjust the mobile shell so the sidebar and top framing consume less vertical space before content begins

### Exit Criteria

- [ ] Overview reaches meaningful widget content much sooner on desktop and mobile
- [ ] The sidebar feels closer to a source list than a large docked panel

### Phase 2 Notes

- The current shell spends too much of the first screen on framing, status, and control blocks before reaching the dashboard field.
- Mobile currently stacks a very tall sidebar block above the main surface, which pushes primary content far down the page.

## Phase 3: Widget, Form, and Settings Refactor

### Objectives

- Apply the new density and styling system to data widgets and form-heavy surfaces.
- Replace repeated oversized card treatment with clearer content grouping and stronger utility-first scanability.

### Deliverables

- [ ] Rebuild widget framing around tighter headers, smaller actions, cleaner metadata, and lower chrome
- [ ] Reduce internal widget padding and compress stat blocks, lists, badges, and snapshot footers
- [ ] Introduce section and list compositions where they scan better than uniform cards
- [ ] Restyle inputs, selects, toggles, and save actions to feel lighter and more document-tool-like
- [ ] Rework settings into denser grouped sections so long forms feel more manageable and less inflated
- [ ] Keep status semantics clear without relying on loud fills or pill-heavy UI

### Exit Criteria

- [ ] Dashboard routes feel information-dense but still readable
- [ ] Settings becomes easier to scan and faster to use without changing its functional coverage

### Phase 3 Notes

- The settings workspace currently demonstrates the same inflation problem as the dashboards: large wrappers, large spacing, and repeated stacked panels before core controls.
- The overhaul should preserve the existing settings coverage and widget behaviors; this phase is visual and structural, not a product-scope change.

## Phase 4: Validation, Regression Coverage, and Follow-Through

### Objectives

- Verify the overhaul across real screens and keep the planning artifacts current as implementation lands.
- Ensure the visual reset does not regress behavior.

### Deliverables

- [ ] Add or update unit tests for shell layout states, widget framing, and settings presentation changes
- [ ] Run `npm run test`, `npm run typecheck`, and `npm run lint`
- [ ] Use Playwright to review login, overview, media, settings, and a mobile viewport after implementation
- [ ] Record any remaining polish or follow-up items back into this file
- [ ] Update `implementation_plan.md` to reflect overhaul progress and any follow-up work introduced by the redesign

### Exit Criteria

- [ ] The revised shell is validated on desktop and mobile with Playwright
- [ ] Verification commands pass, or any remaining failures are documented explicitly

### Phase 4 Notes

- The current live audit surfaced the existing `favicon.ico` 404 in the Next.js dev environment; it is unrelated to the visual overhaul but may continue to appear during browser validation until fixed separately.

## Cross-Phase Testing Strategy

### Automated Testing

- [ ] Frontend component tests for shell density states, sidebar behavior, widget framing, and settings presentation
- [ ] State-management tests for theme, density, layout preset, and notification interactions affected by shell changes
- [ ] End-to-end smoke coverage for login, authenticated restore, and route rendering after the overhaul lands

### Manual Validation

- [ ] Validate the desktop experience on `/overview`, `/media`, and `/settings`
- [ ] Validate the mobile experience to ensure shell chrome no longer buries the primary content
- [ ] Validate theme parity in light and dark modes after the token reset
- [ ] Validate sidebar collapse, notification drawer, theme switch, and layout preset behavior after the visual refactor

## Recommended Delivery Sequence

- [ ] Complete Phase 0 before implementation work starts so density and style goals are locked
- [ ] Complete Phases 1 and 2 before broad widget-specific polish
- [ ] Complete Phase 3 before final regression and Playwright validation in Phase 4
