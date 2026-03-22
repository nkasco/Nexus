import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SQLITE_BOOTSTRAP_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "UserSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "UserSetting_key_key" ON "UserSetting"("key")`,
  `CREATE TABLE IF NOT EXISTS "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pollingIntervalSeconds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Integration_provider_key" ON "Integration"("provider")`,
  `CREATE TABLE IF NOT EXISTS "IntegrationCredentialRef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationCredentialRef_integrationId_fkey"
      FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationCredentialRef_integrationId_key_key"
    ON "IntegrationCredentialRef"("integrationId", "key")`,
  `CREATE TABLE IF NOT EXISTS "IntegrationSyncState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastStartedAt" DATETIME,
    "lastCompletedAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastError" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "assetCount" INTEGER NOT NULL DEFAULT 0,
    "metricCount" INTEGER NOT NULL DEFAULT 0,
    "summaryJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationSyncState_integrationId_fkey"
      FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationSyncState_integrationId_key"
    ON "IntegrationSyncState"("integrationId")`,
  `CREATE TABLE IF NOT EXISTS "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "summary" TEXT NOT NULL,
    "metadataJson" TEXT,
    "lastSeenAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asset_integrationId_fkey"
      FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Asset_provider_assetType_externalId_key"
    ON "Asset"("provider", "assetType", "externalId")`,
  `CREATE INDEX IF NOT EXISTS "Asset_integrationId_assetType_idx"
    ON "Asset"("integrationId", "assetType")`,
  `CREATE TABLE IF NOT EXISTS "CurrentMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "assetId" TEXT,
    "scopeKey" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "valueText" TEXT NOT NULL,
    "valueNumber" REAL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "metadataJson" TEXT,
    "observedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CurrentMetric_integrationId_fkey"
      FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CurrentMetric_assetId_fkey"
      FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CurrentMetric_scopeKey_key"
    ON "CurrentMetric"("scopeKey")`,
  `CREATE INDEX IF NOT EXISTS "CurrentMetric_integrationId_key_idx"
    ON "CurrentMetric"("integrationId", "key")`,
  `CREATE TABLE IF NOT EXISTS "Dashboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Dashboard_slug_key" ON "Dashboard"("slug")`,
] as const;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.bootstrapSqliteSchema();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async bootstrapSqliteSchema() {
    await this.$transaction(
      SQLITE_BOOTSTRAP_STATEMENTS.map((statement) =>
        this.$executeRawUnsafe(statement),
      ),
    );

    await this.ensureSqliteColumn(
      'Integration',
      'pollingIntervalSeconds',
      'INTEGER',
    );
  }

  private async ensureSqliteColumn(
    table: string,
    column: string,
    definition: string,
  ) {
    const columns = await this.$queryRawUnsafe<Array<{ name?: string }>>(
      `PRAGMA table_info("${table}")`,
    );

    if (columns.some((entry) => entry.name === column)) {
      return;
    }

    await this.$executeRawUnsafe(
      `ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`,
    );
  }
}
