import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]);

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Evidence storage is not configured yet.' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const reference = String(formData.get('reference') || '').trim();

    if (!(file instanceof File)) return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    if (!reference) return NextResponse.json({ error: 'A report reference is required.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Each evidence file must be 10 MB or smaller.' }, { status: 413 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });

    const safeReference = reference.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `activity-reports/${safeReference}/${Date.now()}-${safeName}`;

    const response = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-version': '7',
        'x-content-type': file.type || 'application/octet-stream',
        'x-add-random-suffix': '0',
        access: 'private',
      },
      body: Buffer.from(await file.arrayBuffer()),
    });

    if (!response.ok) {
      console.error('Vercel Blob upload response:', response.status, await response.text());
      return NextResponse.json({ error: 'Evidence upload failed. Please try again.' }, { status: 502 });
    }

    const blob = await response.json();
    return NextResponse.json({ name: file.name, type: file.type, size: file.size, url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error('Activity evidence upload failed:', error);
    return NextResponse.json({ error: 'Evidence upload failed. Please try again.' }, { status: 500 });
  }
}
