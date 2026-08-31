'use client';

export default function HomePage() {
  return (
    <main className="page">
      {/* Top Yellow Accent Bar */}
      <div className="topLine" />

      {/* Hero Section Container */}
      <section className="hero">
        <div className="content">
          {/* Main Title */}
          <h1 className="title">
            <span className="accent">VSI Information</span>
            <span className="mainText">Management System</span>
          </h1>

          {/* Subtitle */}
          <p className="subtitle">
            Data, evidence and insight behind our work
          </p>

          {/* Action Buttons */}
          <div className="ctaGroup">
            <a 
              href="https://ims.vsizambia.org/activity-report" 
              className="btn btnWhite"
            >
              Submit an activity report
            </a>
            <a 
              href="https://www.vsizambia.org/activities/submit" 
              className="btn btnYellow"
            >
              Volunteer Activity Logbook
            </a>
          </div>

          {/* VSI Logo & Footer Branding */}
          <div className="footerLogo">
            <div className="logoShield">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm-1 6h2v3h3v2h-3v3h-2v-3H8v-2h3V8z"/>
              </svg>
            </div>
            <div className="logoText">
              <span>VISIONARY</span>
              <span>STUDENTS</span>
              <span>INITIATIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded CSS Styling with Global Override */}
      <style jsx>{`
        /* Global Reset to Force Navy Background Across Browser Window */
        :global(html),
        :global(body) {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          background-color: #003566 !important;
        }

        .page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background-color: #003566;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .topLine {
          height: 12px;
          background-color: #ffc300;
          width: 100%;
          flex-shrink: 0;
        }

        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }

        .content {
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          margin: 0 0 16px 0;
          line-height: 1.15;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .accent {
          color: #ffc300;
          font-size: clamp(32px, 5.5vw, 64px);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .mainText {
          color: #ffffff;
          font-size: clamp(38px, 6.5vw, 76px);
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: #ffffff;
          font-size: clamp(18px, 2.5vw, 26px);
          font-weight: 400;
          margin: 0 0 40px 0;
          opacity: 0.95;
        }

        .ctaGroup {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 60px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 28px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btnWhite {
          background-color: #ffffff;
          color: #003566;
        }

        .btnYellow {
          background-color: #ffc300;
          color: #003566;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .footerLogo {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.9;
        }

        .logoShield {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          box-sizing: border-box;
        }

        .logoShield svg {
          width: 100%;
          height: 100%;
          fill: #ffffff;
        }

        .logoText {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          line-height: 1.25;
          color: #ffffff;
        }

        @media (max-width: 600px) {
          .ctaGroup {
            flex-direction: column;
            width: 100%;
          }

          .btn {
            width: 100%;
            max-width: 300px;
            box-sizing: border-box;
          }
        }
      `}</style>
    </main>
  );
}
