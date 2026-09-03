/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.resend.com https://*.blob.vercel-storage.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig = {
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/api/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: 'https://ims.vsizambia.org' }, { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' }, { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }] },
    ];
  },
};

module.exports = nextConfig;
