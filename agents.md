# Agent Instructions

Before doing any work in this repository, always read the following files first:

- `spec.md`
- `implementation_plan.md`

These documents define the project goals, architecture, scope, constraints, and phased delivery plan. Treat them as required context before making changes, proposing implementations, or executing tasks.

After completing work, always update `implementation_plan.md` to reflect the current project state, completed deliverables, and any newly introduced follow-up work.

When creating or modifying code, always add or update unit tests to cover the new behavior. Do not consider implementation work complete unless the relevant unit tests are included, except for tasks that are strictly non-code changes such as documentation-only updates.

When browser interaction, rendered UI validation, or end-to-end workflow verification would help, use the Playwright MCP tools instead of relying only on code inspection.

When you need current library or framework documentation, examples, or API details, use the Context7 MCP tools as the default documentation lookup path.

When changing developer tooling, startup scripts, dependency configuration, or anything that can affect local boot or CI behavior, validate the relevant real command path before declaring success. At minimum, rerun the impacted checks such as `npm install`/`npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, and the relevant `npm run dev*` or start command when startup behavior was touched.

Do not describe the repo as solid, clean, or fixed while any verification command is still failing or while a known blocker remains unresolved. State the exact passing checks and call out any remaining red items explicitly.
