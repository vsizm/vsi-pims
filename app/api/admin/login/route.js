import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'vsi_admin_session';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
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

export async function POST(request) {
  const key = clientKey(request);
  if (isRateLimited(key)) return Response.json({ error: 'Too many sign-in attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': '900' } });
  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const expectedUsername = process.env.VSI_AUTH_USERNAME;
    const expectedPassword = process.env.VSI_ADMIN_PASSWORD;
    const secret = process.env.VSI_SESSION_SECRET;
    if (!expectedUsername || !expectedPassword || !secret) return Response.json({ error: 'Admin authentication is not configured.' }, { status: 503 });
    if (!sameSecret(username, expectedUsername) || !sameSecret(password, expectedPassword)) {
      recordFailure(key);
      return Response.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    attempts.delete(key);
    const payload = `${username}|${Date.now()}`;
    const token = `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
    const store = await cookies();
    store.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return Response.json({ ok: true });
  } catch {
    recordFailure(key);
    return Response.json({ error: 'Unable to sign in.' }, { status: 400 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE);
  return Response.json({ ok: true });
}

export function getAdminSessionUsername(token) {
  if (!token || !process.env.VSI_SESSION_SECRET) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  try {
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const [username, timestamp] = payload.split('|');
    if (!sameSecret(username, process.env.VSI_AUTH_USERNAME)) return null;
    if (!Number.isFinite(Number(timestamp)) || Date.now() - Number(timestamp) >= 8 * 60 * 60 * 1000) return null;
    return username || null;
  } catch {
    return null;
  }
}

export function isAdminSession(token) {
  return Boolean(getAdminSessionUsername(token));
}
