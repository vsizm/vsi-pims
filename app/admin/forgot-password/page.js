'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="page" style={{ minHeight: '100vh' }}>
      <div className="topbar"><div className="topbar-inner"><div className="brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" className="vsi-logo" /></div><span>ADMINISTRATION</span><nav className="social-links" aria-label="VSI social links"><a href="https://web.facebook.com/vsizambia" target="_blank" rel="noreferrer">f</a><a href="https://www.linkedin.com/in/visionary-students-initiative-vsi-0a447238/" target="_blank" rel="noreferrer">in</a><a href="https://www.instagram.com/vsizambia" target="_blank" rel="noreferrer">◎</a><a href="https://www.youtube.com/@vsizambia" target="_blank" rel="noreferrer">▶</a><a href="https://www.vsizambia.org" target="_blank" rel="noreferrer">↗</a></nav></div></div>
      <div className="shell" style={{ maxWidth: 520, paddingTop: 48 }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderTop: '6px solid var(--school-bus-yellow)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,53,102,.06)' }}>
          <p className="kicker">VSI IMS</p>
          <h1 style={{ margin: '0 0 8px', color: 'var(--regal-navy)', fontSize: 30 }}>Forgot password?</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Password reset instructions for the VSI administrator account are handled through the confirmed VSI administration email.</p>
          <p style={{ background: '#f5f8fb', borderRadius: 8, padding: 14, color: '#34495e', lineHeight: 1.6 }}>Please contact <strong>vsiprojectszm@gmail.com</strong> to request a password reset.</p>
          <Link href="/admin/login" className="submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 22 }}>Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
