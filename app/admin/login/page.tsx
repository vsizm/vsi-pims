'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
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
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fff', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 18px', borderRadius: 12, background: '#063b6d', display: 'grid', placeItems: 'center', color: '#ffd220', fontWeight: 900, fontSize: 18 }}>VSI</div>
          <h1 style={{ margin: 0, color: '#063b6d', fontSize: 27, fontWeight: 800 }}>VSI IMS</h1>
          <p style={{ margin: '7px 0 0', color: '#687789' }}>Administration</p>
        </div>
        <div style={{ border: '1px solid #e0e6ed', borderRadius: 12, padding: 28, boxShadow: '0 8px 28px rgba(20,45,70,.06)' }}>
          <h2 style={{ margin: '0 0 22px', fontSize: 20, color: '#243447' }}>Sign in</h2>
          <form onSubmit={submit}>
            <label style={{ display: 'block', fontWeight: 700, color: '#34495e', marginBottom: 7 }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="username" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 13px', border: '1px solid #ccd5df', borderRadius: 7, marginBottom: 17, fontSize: 15 }} />
            <label style={{ display: 'block', fontWeight: 700, color: '#34495e', marginBottom: 7 }}>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 13px', border: '1px solid #ccd5df', borderRadius: 7, marginBottom: 17, fontSize: 15 }} />
            {error && <div role="alert" style={{ background: '#fff1f1', color: '#9b1c1c', borderRadius: 7, padding: 11, marginBottom: 15, fontSize: 14 }}>{error}</div>}
            <button disabled={busy} type="submit" style={{ width: '100%', padding: 13, border: 0, borderRadius: 7, background: '#063b6d', color: '#fff', fontWeight: 800, fontSize: 15, cursor: busy ? 'wait' : 'pointer' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 18, color: '#8a97a6', fontSize: 12 }}>Authorised VSI personnel only.</p>
      </section>
    </main>
  );
}
