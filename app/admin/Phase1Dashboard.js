'use client';

import Link from 'next/link';

const nav = [
  ['01', 'Executive Dashboard', '/admin'],
  ['02', 'Reports', '/admin/reports'],
  ['03', 'Finance', '/admin/finance'],
  ['04', 'MEAL', '/admin/meal'],
  ['05', 'Activities', '/admin/reports'],
  ['06', 'Participants', '/admin/reports/intelligence'],
  ['07', 'Donors', '/admin/finance'],
  ['08', 'Compliance', '/admin/reports'],
  ['09', 'Safeguarding', '/admin/reports/intelligence'],
  ['10', 'Learning', '/admin/learning'],
  ['11', 'Settings', '/admin'],
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
          {nav.map(([number, label, href]) => (
            <Link
              key={label}
              href={href}
              className={label === 'Executive Dashboard' ? 'active' : ''}
            >
              <span>{number}</span>
              <strong>{label}</strong>
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
          top: 28px;
          width: 250px;
          min-width: 250px;
          height: calc(100vh - 56px);
          max-height: calc(100vh - 56px);
          margin: 28px 0 28px 24px;
          padding: 0 10px 14px;
          background: linear-gradient(180deg, #003566 0 78px, #094074 78px 100%);
          border: 0;
          border-radius: 16px;
          box-shadow: 0 10px 28px rgba(0, 53, 102, 0.16);
          color: #fff;
          overflow: auto;
        }

        .brand {
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }

        .logo-wrap {
          width: 100%;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-wrap img {
          width: auto;
          height: 52px;
          max-width: 205px;
          object-fit: contain;
          display: block;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 10px;
        }

        nav a {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 49px;
          text-decoration: none;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          padding: 10px;
          border-radius: 10px;
          margin: 3px 0;
          transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
        }

        nav a strong {
          font-size: 12px;
          line-height: 1.2;
          font-weight: 800;
          color: inherit;
        }

        nav a:hover {
          background: rgba(255, 255, 255, 0.11);
          color: #fff;
          transform: translateX(3px);
        }

        nav a:hover strong {
          color: #fff;
        }

        nav a span {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #3c6997;
          color: #ffd60a;
          font-size: 10px;
          line-height: 1;
          font-weight: 900;
          flex: 0 0 29px;
          transition: background 0.18s ease, color 0.18s ease;
        }

        nav a.active {
          background: #ffc300;
          color: #003566;
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.16);
        }

        nav a.active span {
          background: #003566;
          color: #ffd60a;
        }

        .main {
          flex: 1;
          min-width: 0;
          padding: 34px 40px 60px 26px;
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

        @media (max-width: 900px) {
          .dashboard-shell { display: block; }

          .sidebar {
            position: sticky;
            top: 78px;
            z-index: 900;
            width: auto;
            min-width: 0;
            height: auto;
            max-height: none;
            margin: 0 14px;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 10px;
            border-radius: 16px;
            background: #003566;
          }

          .brand { display: none; }

          nav {
            flex-direction: row;
            gap: 6px;
            padding-top: 0;
          }

          nav a {
            min-height: 40px;
            white-space: nowrap;
            margin: 0;
            padding: 7px 8px;
          }

          nav a span {
            width: 26px;
            height: 26px;
            flex-basis: 26px;
          }

          nav a strong { font-size: 12px; }

          .main { padding: 22px 18px 40px; }
        }

        @media (max-width: 520px) {
          .sidebar { margin: 0 10px; }
          .main { padding: 18px 13px 32px; }
          h1 { font-size: 27px; }
          .canvas { min-height: 420px; padding: 18px; }
        }
      `}</style>
    </div>
  );
}
