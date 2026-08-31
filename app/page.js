'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      {/* Top Accent Bar */}
      <div className="topLine" />

      {/* Main Navigation */}
      <nav className="nav">
        <Link href="/" className="brand">
          <div className="logoMark">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="brandText">
            <span className="brandName">placement</span>
            <span className="brandBadge">
              <svg viewBox="0 0 24 24" className="starIcon" fill="currentColor">
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
              </svg>
              PRO
            </span>
          </div>
        </Link>
        <Link href="/login" className="signin">
          SIGN IN <span>↗</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        {/* Left Column: Portrait & Floating Feature Icons */}
        <div className="left">
          <div className="visualContainer">
            {/* Circular Profile Portrait */}
            <div className="portraitCircle">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                alt="VSI IMS Coach" 
              />
            </div>

            {/* Floating Graphic Badge Icons */}
            <div className="floatingIcon iconGreen" title="Programmes">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>

            <div className="floatingIcon iconYellow" title="Evidence">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </div>

            <div className="floatingIcon iconOrange" title="Results">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.1 7.7l-1 4.3c-.1.3-.4.5-.7.5H16v2h1.5c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5H16v1c0 .6-.4 1-1 1s-1-.4-1-1v-1h-2v1c0 .6-.4 1-1 1s-1-.4-1-1v-1H8c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H12v-2H9.6c-.3 0-.6-.2-.7-.5l-1-4.3C7.3 5.9 8.7 4.5 10.5 4.5h3c1.8 0 3.2 1.4 2.6 3.2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Content & Call to Actions */}
        <div className="right">
          <span className="subhead">Get expert assistance with</span>
          <h1>An Insider In<br />Your Corner</h1>
          <p>
            Connect 1:1 with a hiring expert who cares about your success.
            They make job searching simple and—dare we say—kind of fun.
          </p>

          <div className="ctaGroup">
            <Link href="/find-coach" className="ctaButton">
              Find My Career Coach
            </Link>
            <Link href="/about" className="secondaryLink">
              Learn about Placement Pro <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Embedded CSS Styling */}
      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          background-color: #231d4f;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .topLine {
          height: 5px;
          background: #ffcc00;
          width: 100%;
        }

        .nav {
          height: 90px;
          padding: 0 clamp(24px, 6vw, 90px);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          text-decoration: none;
        }

        .logoMark {
          width: 32px;
          height: 32px;
          color: #ffcc00;
        }

        .brandText {
          display: flex;
          align-items: center;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .brandName {
          color: #ffffff;
        }

        .brandBadge {
          display: flex;
          align-items: center;
          color: #ffcc00;
          margin-left: 2px;
        }

        .starIcon {
          width: 18px;
          height: 18px;
          fill: #ffcc00;
        }

        .signin {
          color: #ffffff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .signin span {
          color: #ffcc00;
          margin-left: 4px;
        }

        .hero {
          flex: 1;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 40px clamp(24px, 6vw, 90px);
          box-sizing: border-box;
          gap: 40px;
        }

        .left {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visualContainer {
          position: relative;
          width: 380px;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portraitCircle {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          overflow: hidden;
          background: #392f75;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portraitCircle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .floatingIcon {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }

        .floatingIcon svg {
          width: 24px;
          height: 24px;
          fill: #ffffff;
        }

        .iconGreen {
          background-color: #28a745;
          top: 15%;
          right: 15%;
        }

        .iconYellow {
          background-color: #ffb703;
          top: 45%;
          right: 5%;
        }

        .iconOrange {
          background-color: #f76c35;
          bottom: 12%;
          right: 18%;
        }

        .right {
          max-width: 540px;
        }

        .subhead {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .right h1 {
          font-size: clamp(40px, 4.5vw, 62px);
          line-height: 1.08;
          font-weight: 800;
          margin: 0 0 20px 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .right p {
          font-size: 16px;
          line-height: 1.6;
          color: #d1cfdf;
          margin: 0 0 32px 0;
        }

        .ctaGroup {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
        }

        .ctaButton {
          display: inline-block;
          background: linear-gradient(180deg, #ffcc00 0%, #e6b800 100%);
          color: #1a153b;
          text-decoration: none;
          padding: 16px 36px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ctaButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 204, 0, 0.3);
        }

        .secondaryLink {
          color: #ffcc00;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .secondaryLink span {
          margin-left: 4px;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .right {
            margin: 0 auto;
          }
          .ctaGroup {
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .visualContainer {
            width: 280px;
            height: 280px;
          }
          .portraitCircle {
            width: 240px;
            height: 240px;
          }
          .floatingIcon {
            width: 38px;
            height: 38px;
          }
          .floatingIcon svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </main>
  );
}
