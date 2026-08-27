'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      router.push('/admin/reports');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f4f7fa', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 18, padding: 32, boxShadow: '0 16px 50px rgba(0,0,0,.10)' }}>
        <div style={{ background: '#063b6d', margin: '-32px -32px 28px', padding: '26px 32px', borderRadius: '18px 18px 0 0', color: '#fff' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#ffd220' }}>VSI IMS</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28 }}>Administration</h1>
          <p style={{ margin: '8px 0 0', opacity: .85 }}>Sign in to review activity reports.</p>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 7 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="username" style={{ width: '100%', boxSizing: 'border-box', padding: 13, border: '1px solid #ccd5df', borderRadius: 9, marginBottom: 18 }} />
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 7 }}>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" style={{ width: '100%', boxSizing: 'border-box', padding: 13, border: '1px solid #ccd5df', borderRadius: 9, marginBottom: 18 }} />
          {error && <div role="alert" style={{ background: '#fff1f1', color: '#9b1c1c', borderRadius: 9, padding: 12, marginBottom: 16 }}>{error}</div>}
          <button disabled={busy} type="submit" style={{ width: '100%', padding: 14, border: 0, borderRadius: 9, background: '#063b6d', color: '#fff', fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
