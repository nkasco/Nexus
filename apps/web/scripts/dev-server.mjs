import { spawn } from 'node:child_process';
import net from 'node:net';
import { createRequire } from 'node:module';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export function getRequestedPort(env = process.env) {
  const rawPort = env.WEB_PORT?.trim() ?? '';
  const parsedPort = Number.parseInt(rawPort, 10);

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return 3000;
}

export async function canListenOnPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, '0.0.0.0');
  });
}

export async function resolveAvailablePort(startPort, isPortAvailable = canListenOnPort) {
  let port = startPort;

  while (!(await isPortAvailable(port))) {
    port += 1;
  }

  return port;
}

async function startDevServer() {
  const requestedPort = getRequestedPort();
  const selectedPort = await resolveAvailablePort(requestedPort);

  if (selectedPort !== requestedPort) {
    console.log(
      `[nexus:web] Port ${requestedPort} is in use, starting Next.js on ${selectedPort} instead.`,
    );
  }

  const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
  const child = spawn(
    process.execPath,
    [nextBin, 'dev', '--port', String(selectedPort)],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        WEB_PORT: String(selectedPort),
      },
    },
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startDevServer();
}
