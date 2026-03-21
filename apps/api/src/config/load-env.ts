import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

export function getEnvironmentFileCandidates(cwd = process.cwd()) {
  return [resolve(cwd, '.env'), resolve(cwd, '../../.env')];
}

export function loadEnvironment(cwd = process.cwd()) {
  for (const path of getEnvironmentFileCandidates(cwd)) {
    if (existsSync(path)) {
      config({ path });
      return path;
    }
  }

  return undefined;
}
