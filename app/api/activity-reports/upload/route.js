import { put } from '@vercel/blob';
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
    const formData = await request.formData();
    const file = formData.get('file');
    const reference = String(formData.get('reference') || '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }
    if (!reference) {
      return NextResponse.json({ error: 'A report reference is required.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Each evidence file must be 10 MB or smaller.' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `activity-reports/${reference}/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, { access: 'private', addRandomSuffix: false });

    return NextResponse.json({
      name: file.name,
      type: file.type,
      size: file.size,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Activity evidence upload failed:', error);
    return NextResponse.json({ error: 'Evidence upload failed. Please try again.' }, { status: 500 });
  }
}
