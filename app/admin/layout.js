export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        /* Admin shell guardrails: keep the navigation and logo physically bounded.
           This is intentionally isolated to /admin so report review behaviour is untouched. */
        html, body { margin: 0; padding: 0; }
        .admin-app {
          width: 100%; max-width: 100%; min-height: 100vh; overflow-x: hidden !important;
        }
        .admin-sidebar {
          width: 250px !important; min-width: 250px !important; max-width: 250px !important;
          flex: 0 0 250px !important; overflow: hidden !important;
        }
        .side-brand {
          width: 100% !important; max-width: 100% !important; min-width: 0 !important;
          overflow: hidden !important;
        }
        .side-logo-wrap {
          width: 42px !important; height: 34px !important; min-width: 42px !important;
          max-width: 42px !important; min-height: 34px !important; max-height: 34px !important;
          flex: 0 0 42px !important; overflow: hidden !important; position: relative !important;
        }
        .side-logo-wrap img, .side-brand img {
          display: block !important; width: 42px !important; height: 28px !important;
          min-width: 42px !important; min-height: 28px !important; max-width: 42px !important;
          max-height: 28px !important; object-fit: contain !important; object-position: center !important;
          flex: 0 0 42px !important;
        }
        .side-brand > div:last-child {
          min-width: 0 !important; max-width: calc(100% - 52px) !important; overflow: hidden !important;
        }
        .admin-main {
          min-width: 0 !important; max-width: calc(100% - 250px) !important; overflow-x: hidden !important;
        }
        .stat-grid, .dashboard-grid { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }

        /* Dashboard polish: consistent cards, spacing and navigation badges. */
        .stat-card, .dash-panel { transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }
        .stat-card:hover, .dash-panel:hover { box-shadow: 0 10px 28px rgba(0,53,102,.08) !important; }
        .admin-sidebar nav a { position: relative !important; }
        .admin-sidebar nav a[href*="PENDING_REVIEW"]::after {
          content: '2'; margin-left: auto; min-width: 20px; height: 20px; padding: 0 5px;
          display: inline-flex; align-items: center; justify-content: center; border-radius: 999px;
          background: rgba(255,255,255,.13); color: #fff; font-size: 9px; font-weight: 900;
        }
        .admin-sidebar nav a[href*="APPROVED"]::after {
          content: '1'; margin-left: auto; min-width: 20px; height: 20px; padding: 0 5px;
          display: inline-flex; align-items: center; justify-content: center; border-radius: 999px;
          background: rgba(255,255,255,.13); color: #fff; font-size: 9px; font-weight: 900;
        }
        .admin-sidebar nav a.active[href*="PENDING_REVIEW"]::after,
        .admin-sidebar nav a.active[href*="APPROVED"]::after { background: #003566; color: #fff; }
        .admin-header { align-items: center !important; }
        .header-action { box-shadow: 0 4px 14px rgba(0,53,102,.05); }
        .metric-grid > div, .programme-row { border: 1px solid #edf1f4; }
        .programme-row { border-radius: 10px !important; padding: 13px !important; }
        .programme-row + .programme-row { margin-top: 8px; }
        .admin-notice { border-radius: 12px !important; }
        .admin-error { border-radius: 12px !important; }

        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 820px) {
          .admin-sidebar { width: 220px !important; min-width: 220px !important; max-width: 220px !important; flex-basis: 220px !important; }
          .admin-main { max-width: calc(100% - 220px) !important; }
          .dashboard-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .dash-panel.wide { grid-column: auto !important; }
          .admin-header { align-items: flex-start !important; }
        }
        @media (max-width: 640px) {
          .admin-app { display: block !important; }
          .admin-sidebar { position: relative !important; width: 100% !important; min-width: 0 !important; max-width: none !important; height: auto !important; min-height: 0 !important; }
          .admin-main { width: 100% !important; max-width: 100% !important; padding: 20px 14px 40px !important; }
          .admin-header { display: block !important; }
          .header-action { display: inline-block; margin-top: 12px; }
          .stat-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .side-note { max-width: 520px; }
        }
      `}</style>
      {children}
    </>
  );
}
