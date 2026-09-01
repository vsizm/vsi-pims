'use client';

import Link from 'next/link';

const nav = [
  ['Executive Dashboard', '/admin'],
  ['Reports', '/admin/reports'],
  ['Finance', '/admin/finance'],
  ['MEAL', '/admin/meal'],
  ['Activities', '/admin/reports'],
  ['Participants', '/admin/reports/intelligence'],
  ['Donors', '/admin/finance'],
  ['Compliance', '/admin/reports'],
  ['Safeguarding', '/admin/reports/intelligence'],
  ['Learning', '/admin/learning'],
  ['Settings', '/admin'],
];

export default function Phase1Dashboard() {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-wrap">
            <img src="/vsi-logo-white.png" alt="Visionary Students Initiative" />
          </div>
        </div>

        <nav aria-label="Administration">
          {nav.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={label === 'Executive Dashboard' ? 'active' : ''}
            >
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <div className="eyebrow">VSI ADMINISTRATION</div>
            <h1>Executive Dashboard</h1>
            <p>Management Intelligence Centre</p>
          </div>
        </header>

        <section className="canvas" aria-label="Executive Dashboard workspace">
          <div className="canvas-title">Executive Dashboard</div>
          <div className="canvas-note">
            Dashboard workspace cleared. Sections will be added one at a time.
          </div>
        </section>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; }

        .dashboard-shell {
          min-height: 100vh;
          display: flex;
          background: #f5f8fc;
          color: #17212b;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .sidebar {
          position: sticky;
          top: 0;
          width: 224px;
          min-width: 224px;
          height: 100vh;
          padding: 18px 12px 16px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #063b73 0%, #052f5d 100%);
          color: #fff;
          border-right: 1px solid rgba(0, 0, 0, .08);
          box-shadow: 4px 0 18px rgba(6, 59, 115, .08);
        }

        .brand {
          height: 74px;
          padding: 2px 6px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,.13);
          margin-bottom: 16px;
        }

        .logo-wrap {
          width: 100%;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-wrap img {
          width: auto;
          height: 50px;
          max-width: 190px;
          object-fit: contain;
          display: block;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }

        nav a {
          position: relative;
          display: flex;
          align-items: center;
          min-height: 42px;
          padding: 0 14px;
          border-radius: 7px;
          color: rgba(255,255,255,.76);
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .005em;
          transition: background .15s ease, color .15s ease, transform .15s ease;
        }

        nav a span {
          position: relative;
          z-index: 1;
        }

        nav a:hover {
          background: rgba(255,255,255,.075);
          color: #fff;
          transform: translateX(2px);
        }

        nav a.active {
          background: #ffc300;
          color: #063b73;
          font-weight: 900;
          box-shadow: 0 5px 14px rgba(0,0,0,.10);
        }

        nav a.active::before {
          content: "";
          position: absolute;
          left: -12px;
          top: 7px;
          bottom: 7px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: #ffd60a;
        }

        .main {
          flex: 1;
          min-width: 0;
          padding: 34px 40px 60px;
        }

        .header {
          max-width: 1400px;
          margin: 0 auto 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #dce5ed;
        }

        .eyebrow {
          color: #1677c8;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        h1 {
          margin: 8px 0 0;
          color: #063b73;
          font-size: 32px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.035em;
        }

        .header p {
          margin: 7px 0 0;
          color: #718091;
          font-size: 12px;
        }

        .canvas {
          max-width: 1400px;
          min-height: 520px;
          margin: 0 auto;
          padding: 24px;
          background: #fff;
          border: 1px solid #dce5ed;
          border-radius: 10px;
        }

        .canvas-title {
          color: #063b73;
          font-size: 15px;
          font-weight: 900;
        }

        .canvas-note {
          margin-top: 8px;
          color: #8795a2;
          font-size: 10px;
        }

        @media (max-width: 820px) {
          .dashboard-shell { display: block; }
          .sidebar {
            position: relative;
            width: 100%;
            min-width: 0;
            height: auto;
          }
          nav { display: grid; grid-template-columns: repeat(2, 1fr); }
          .main { padding: 22px 18px 40px; }
        }

        @media (max-width: 520px) {
          nav { grid-template-columns: 1fr; }
          .main { padding: 18px 13px 32px; }
          h1 { font-size: 27px; }
          .canvas { min-height: 420px; padding: 18px; }
        }
      `}</style>
    </div>
  );
}
