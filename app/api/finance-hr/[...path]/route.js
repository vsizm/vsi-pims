import handler from '../backend.ts';

export const dynamic = 'force-dynamic';

export async function GET(request) { return forward(request); }
export async function POST(request) { return forward(request); }
export async function PUT(request) { return forward(request); }
export async function PATCH(request) { return forward(request); }
export async function DELETE(request) { return forward(request); }

async function forward(request) {
  const url = new URL(request.url);
  const forwardedPath = url.pathname.replace(/^\/api\/finance-hr/, '');
  url.pathname = forwardedPath.startsWith('/api/') ? forwardedPath : '/api' + forwardedPath;
  return handler(new Request(url, request));
}
