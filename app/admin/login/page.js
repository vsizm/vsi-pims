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
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page" style={{ minHeight: '100vh' }}>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <img src="/vsi-logo-white.png" alt="Visionary Students Initiative" className="vsi-logo" />
          </div>
          <span>ADMINISTRATION</span>
          <nav className="social-links" aria-label="VSI social links">
            <a href="https://web.facebook.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.linkedin.com/in/visionary-students-initiative-vsi-0a447238/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.instagram.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
            <a href="https://www.youtube.com/@vsizambia" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
            <a href="https://www.vsizambia.org" target="_blank" rel="noreferrer" aria-label="VSI website">↗</a>
          </nav>
        </div>
      </div>

      <div className="shell" style={{ maxWidth: 520, paddingTop: 48 }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderTop: '6px solid var(--school-bus-yellow)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,53,102,.06)' }}>
          <p className="kicker">VSI IMS</p>
          <h1 style={{ margin: '0 0 8px', color: 'var(--regal-navy)', fontSize: 30 }}>Administrator Sign in</h1>
          <p style={{ margin: '0 0 26px', color: 'var(--muted)', lineHeight: 1.6 }}>Sign in to access the VSI Information Management System.</p>

          <form onSubmit={submit}>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="username" /></label>
            <label style={{ marginTop: 18 }}>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" /></label>
            {error && <div role="alert" className="error" style={{ marginTop: 18 }}>{error}</div>}
            <div className="actions" style={{ justifyContent: 'stretch' }}>
              <button disabled={busy} type="submit" className="submit" style={{ width: '100%' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </div>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 12 }}>Authorised VSI personnel only.</p>
      </div>
    </main>
  );
}
