import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS = 20;
const uploadRateLimit = new Map();
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]);

function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown').slice(0, 128);
}

function rateLimited(key) {
  const now = Date.now();
  const entry = uploadRateLimit.get(key);
  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    uploadRateLimit.set(key, { startedAt: now, count: 1 });
    return false;
  }
  if (entry.count >= MAX_UPLOADS) return true;
  entry.count += 1;
  return false;
}

export async function POST(request) {
  const key = clientKey(request);
  if (rateLimited(key)) return NextResponse.json({ error: 'Too many evidence uploads. Please try again later.' }, { status: 429, headers: { 'Retry-After': '3600' } });
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: 'Evidence storage is not configured yet.' }, { status: 503 });

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_FILE_SIZE + 64 * 1024) return NextResponse.json({ error: 'Evidence file is too large.' }, { status: 413 });

    const formData = await request.formData();
    const file = formData.get('file');
    const reference = String(formData.get('reference') || '').trim();

    if (!(file instanceof File)) return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    if (!/^PENDING-[A-Z0-9_-]{8,64}$/.test(reference)) return NextResponse.json({ error: 'Invalid report reference.' }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Each evidence file must be between 1 byte and 10 MB.' }, { status: 413 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });

    const safeReference = reference.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 160);
    const pathname = `activity-reports/${safeReference}/${crypto.randomUUID()}-${safeName}`;
    const blob = await put(pathname, file, { access: 'private', addRandomSuffix: false, token });

    return NextResponse.json({ name: file.name, type: file.type, size: file.size, url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error('Activity evidence upload failed:', error);
    return NextResponse.json({ error: 'Evidence upload failed. Please try again.' }, { status: 500 });
  }
}
