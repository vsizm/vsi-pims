export async function GET() {
  const response = await fetch('https://raw.githubusercontent.com/vsizm/vsi-pims/main/VSI%20LOGO%20white.png', { cache: 'force-cache' });
  if (!response.ok) return new Response('Not found', { status: 404 });
  return new Response(response.body, {
    headers: {
      'Content-Type': response.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
