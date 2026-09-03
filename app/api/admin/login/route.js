import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'vsi_admin_session';
const MFA_COOKIE = 'vsi_admin_mfa';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MFA_TTL_MS = 5 * 60 * 1000;
const attempts = new Map();

function sign(value) {
  return createHmac('sha256', process.env.VSI_SESSION_SECRET || '').update(value).digest('hex');
}

function sameSecret(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && timingSafeEqual(left, right);
}

function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown').slice(0, 128);
}

function isRateLimited(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 0 });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.startedAt >= WINDOW_MS) attempts.set(key, { startedAt: now, count: 1 });
  else entry.count += 1;
}

function base32Decode(input) {
  const normalized = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of normalized) {
    const value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(char);
    if (value < 0) return null;
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function totp(secret, counter) {
  const key = base32Decode(secret);
  if (!key?.length) return null;
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(binary % 1000000).padStart(6, '0');
}

function verifyTotp(secret, code) {
  if (!/^\d{6}$/.test(code || '')) return false;
  const counter = Math.floor(Date.now() / 30000);
  for (const delta of [-1, 0, 1]) {
    const expected = totp(secret, counter + delta);
    if (expected && sameSecret(code, expected)) return true;
  }
  return false;
}

function createToken(username) {
  const payload = `${username}|${Date.now()}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

function createMfaToken(username) {
  const payload = `${username}|${Date.now()}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(`mfa|${payload}`)}`;
}

function readSignedToken(token, prefix = '') {
  if (!token || !process.env.VSI_SESSION_SECRET) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  try {
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = sign(`${prefix}${prefix ? '|' : ''}${payload}`);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const [username, timestamp] = payload.split('|');
    if (!Number.isFinite(Number(timestamp))) return null;
    return { username, timestamp: Number(timestamp) };
  } catch {
    return null;
  }
}

export async function POST(request) {
  const key = clientKey(request);
  if (isRateLimited(key)) return Response.json({ error: 'Too many sign-in attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': '900' } });
  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : '';
    const expectedUsername = process.env.VSI_AUTH_USERNAME;
    const expectedPassword = process.env.VSI_ADMIN_PASSWORD;
    const secret = process.env.VSI_SESSION_SECRET;
    const totpSecret = process.env.VSI_ADMIN_TOTP_SECRET;
    if (!expectedUsername || !expectedPassword || !secret) return Response.json({ error: 'Admin authentication is not configured.' }, { status: 503 });

    if (body?.mfaToken) {
      const pending = readSignedToken(body.mfaToken, 'mfa');
      if (!pending || Date.now() - pending.timestamp >= MFA_TTL_MS || !sameSecret(pending.username, expectedUsername) || !totpSecret || !verifyTotp(totpSecret, code)) {
        recordFailure(key);
        return Response.json({ error: 'Invalid verification code.' }, { status: 401 });
      }
      attempts.delete(key);
      const store = await cookies();
      store.delete(MFA_COOKIE);
      store.set(COOKIE, createToken(pending.username), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      return Response.json({ ok: true });
    }

    if (!sameSecret(username, expectedUsername) || !sameSecret(password, expectedPassword)) {
      recordFailure(key);
      return Response.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    if (totpSecret) {
      const store = await cookies();
      const mfaToken = createMfaToken(username);
      store.set(MFA_COOKIE, mfaToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 5 });
      return Response.json({ ok: true, requiresMfa: true, mfaToken });
    }

    attempts.delete(key);
    const store = await cookies();
    store.set(COOKIE, createToken(username), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return Response.json({ ok: true });
  } catch {
    recordFailure(key);
    return Response.json({ error: 'Unable to sign in.' }, { status: 400 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete(MFA_COOKIE);
  return Response.json({ ok: true });
}

export function getAdminSessionUsername(token) {
  const data = readSignedToken(token);
  if (!data || Date.now() - data.timestamp >= 8 * 60 * 60 * 1000 || !sameSecret(data.username, process.env.VSI_AUTH_USERNAME)) return null;
  return data.username || null;
}

export function isAdminSession(token) {
  return Boolean(getAdminSessionUsername(token));
}
