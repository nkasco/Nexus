import { createHmac, timingSafeEqual } from 'node:crypto';

interface JwtPayload {
  sub: string;
  name: string;
  role: 'admin';
  exp: number;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + '='.repeat(4 - padding);

  return Buffer.from(padded, 'base64').toString('utf8');
}

function signSegment(value: string, secret: string) {
  return createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(
  payload: Omit<JwtPayload, 'exp'>,
  secret: string,
  ttlSeconds: number,
) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    } satisfies JwtPayload),
  );
  const signature = signSegment(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const [header, body, signature] = token.split('.');

  if (!header || !body || !signature) {
    throw new Error('Malformed token');
  }

  const expectedSignature = signSegment(`${header}.${body}`, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('Expired token');
  }

  return payload;
}
