# Nexus

Centralized control, elegant design.

## Workspace Layout

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend
- `packages/shared`: shared TypeScript contracts
- `spec.md`: product and architecture specification
- `implementation_plan.md`: phased delivery checklist
- `agents.md`: repository working rules for agents

## Prerequisites

- Node.js 24+
- npm 11+
- Docker and Docker Compose for containerized development

## Getting Started

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Start the frontend with `npm run dev:web`.
4. Start the backend with `npm run dev:api`.

## Common Commands

- `npm run lint`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run format`

## Docker Compose

The repository includes a `docker-compose.yml` that boots the frontend and backend together. The API uses SQLite with a persistent named volume for local development.

## Secret Hygiene

- Never commit `.env` files or provider credentials.
- Use `.env.example` as the template for required configuration.
- Keep local SQLite databases, certificates, and editor metadata out of git.

## Phase 0 Status

Phase 0 establishes the monorepo, base configs, local development flow, CI skeleton, Docker setup, shared contracts package, and a minimal frontend/backend scaffold.
