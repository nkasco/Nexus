import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { getEnvironmentFileCandidates, loadEnvironment } from './load-env';

describe('loadEnvironment', () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it('prefers an env file in the current working directory', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'nexus-env-local-'));

    try {
      writeFileSync(join(cwd, '.env'), 'DATABASE_URL="file:./local.db"\n');

      const loadedPath = loadEnvironment(cwd);

      expect(loadedPath).toBe(resolve(cwd, '.env'));
      expect(process.env.DATABASE_URL).toBe('file:./local.db');
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('falls back to the repository root env file location', () => {
    const root = mkdtempSync(join(tmpdir(), 'nexus-env-root-'));
    const workspace = join(root, 'apps', 'api');
    mkdirSync(workspace, { recursive: true });

    try {
      writeFileSync(join(root, '.env'), 'DATABASE_URL="file:./root.db"\n');

      const loadedPath = loadEnvironment(workspace);

      expect(loadedPath).toBe(resolve(root, '.env'));
      expect(process.env.DATABASE_URL).toBe('file:./root.db');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns the candidate search paths', () => {
    expect(getEnvironmentFileCandidates('/tmp/example')).toEqual([
      '/tmp/example/.env',
      '/.env',
    ]);
  });
});
