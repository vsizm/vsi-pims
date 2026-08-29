export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        /* Admin shell guardrails: keep the navigation and logo physically bounded.
           This is intentionally isolated to /admin so report review behaviour is untouched. */
        html, body { margin: 0; padding: 0; }
        .admin-app {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          overflow-x: hidden !important;
        }
        .admin-sidebar {
          width: 250px !important;
          min-width: 250px !important;
          max-width: 250px !important;
          flex: 0 0 250px !important;
          overflow: hidden !important;
        }
        .side-brand {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        .side-logo-wrap {
          width: 42px !important;
          height: 34px !important;
          min-width: 42px !important;
          max-width: 42px !important;
          min-height: 34px !important;
          max-height: 34px !important;
          flex: 0 0 42px !important;
          overflow: hidden !important;
          position: relative !important;
        }
        .side-logo-wrap img,
        .side-brand img {
          display: block !important;
          width: 42px !important;
          height: 28px !important;
          min-width: 42px !important;
          min-height: 28px !important;
          max-width: 42px !important;
          max-height: 28px !important;
          object-fit: contain !important;
          object-position: center !important;
          flex: 0 0 42px !important;
        }
        .side-brand > div:last-child {
          min-width: 0 !important;
          max-width: calc(100% - 52px) !important;
          overflow: hidden !important;
        }
        .admin-main {
          min-width: 0 !important;
          max-width: calc(100% - 250px) !important;
          overflow-x: hidden !important;
        }
        .stat-grid, .dashboard-grid {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }
        @media (max-width: 820px) {
          .admin-sidebar {
            width: 220px !important;
            min-width: 220px !important;
            max-width: 220px !important;
            flex-basis: 220px !important;
          }
          .admin-main { max-width: calc(100% - 220px) !important; }
        }
        @media (max-width: 640px) {
          .admin-app { display: block !important; }
          .admin-sidebar {
            position: relative !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .admin-main {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
