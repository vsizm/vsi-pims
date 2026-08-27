import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'vsi_admin_session';

function sign(value) {
  return createHmac('sha256', process.env.VSI_SESSION_SECRET || '').update(value).digest('hex');
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const expectedUsername = process.env.VSI_AUTH_USERNAME;
    const expectedPassword = process.env.VSI_ADMIN_PASSWORD;
    const secret = process.env.VSI_SESSION_SECRET;
    if (!expectedUsername || !expectedPassword || !secret) return Response.json({ error: 'Admin authentication is not configured.' }, { status: 503 });
    if (username !== expectedUsername || password !== expectedPassword) return Response.json({ error: 'Invalid username or password.' }, { status: 401 });

    const payload = `${username}|${Date.now()}`;
    const token = `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
    const store = await cookies();
    store.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Unable to sign in.' }, { status: 400 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE);
  return Response.json({ ok: true });
}

export function isAdminSession(token) {
  if (!token || !process.env.VSI_SESSION_SECRET) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  try {
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const [username, timestamp] = payload.split('|');
    if (username !== process.env.VSI_AUTH_USERNAME) return false;
    return Number.isFinite(Number(timestamp)) && Date.now() - Number(timestamp) < 8 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
