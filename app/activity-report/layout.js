export default function ActivityReportLayout({ children }) {
  return (
    <>
      <style>{`
        .form-intro {
          margin: 0 0 28px;
          padding: 20px 24px;
          background: #fff;
          border: 1px solid #dfe5ea;
          border-left: 5px solid #ffc300;
          border-radius: 12px;
          box-shadow: 0 4px 18px rgba(0,53,102,.055);
        }
        .form-intro p {
          max-width: none;
          margin: 0;
          color: #3c6997;
          font-size: 15px;
          line-height: 1.7;
        }
        .brand .vsi-logo {
          display: block;
          width: 118px;
          height: 58px;
          object-fit: contain;
          object-position: left center;
          content: url('/VSI%20LOGO%20white.png');
        }
        .social-links {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 0;
        }
        .social-links a {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.34);
          border-radius: 10px;
          background: rgba(255,255,255,.10);
          color: #fff;
          text-decoration: none;
          font-size: 0;
          transition: transform .16s ease, background .16s ease, border-color .16s ease;
        }
        .social-links a:hover {
          transform: translateY(-2px);
          background: rgba(255,195,0,.22);
          border-color: rgba(255,195,0,.7);
        }
        .social-links a::before {
          content: '';
          width: 19px;
          height: 19px;
          display: block;
          background: currentColor;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-size: contain;
          mask-size: contain;
        }
        .social-links a:nth-child(1)::before {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M14 8h3V4h-3c-3.31 0-5 1.99-5 5v3H6v4h3v4h4v-4h3.25l.75-4H13V9c0-.67.33-1 1-1Z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M14 8h3V4h-3c-3.31 0-5 1.99-5 5v3H6v4h3v4h4v-4h3.25l.75-4H13V9c0-.67.33-1 1-1Z'/%3E%3C/svg%3E");
        }
        .social-links a:nth-child(2)::before {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M5 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5ZM2.8 10h4.4v11H2.8V10Zm7 0h4.2v1.5h.06c.58-1.05 2-1.9 4.12-1.9 4.4 0 5.22 2.9 5.22 6.67V21H19v-4.17c0-1.8-.03-4.12-2.51-4.12-2.52 0-2.9 1.97-2.9 3.99V21H9.8V10Z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M5 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5ZM2.8 10h4.4v11H2.8V10Zm7 0h4.2v1.5h.06c.58-1.05 2-1.9 4.12-1.9 4.4 0 5.22 2.9 5.22 6.67V21H19v-4.17c0-1.8-.03-4.12-2.51-4.12-2.52 0-2.9 1.97-2.9 3.99V21H9.8V10Z'/%3E%3C/svg%3E");
        }
        .social-links a:nth-child(3)::before {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z'/%3E%3C/svg%3E");
        }
        .social-links a:nth-child(4)::before {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.4 3.9-6.4 3.9Z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.4 3.9-6.4 3.9Z'/%3E%3C/svg%3E");
        }
        .social-links a:nth-child(5)::before {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z'/%3E%3C/svg%3E");
        }
        @media (max-width: 760px) {
          .topbar-inner { gap: 12px; }
          .brand .vsi-logo { width: 92px; height: 48px; }
          .social-links { gap: 5px; }
          .social-links a { width: 34px; height: 34px; border-radius: 9px; }
          .social-links a::before { width: 17px; height: 17px; }
          .form-intro { padding: 16px 18px; }
          .form-intro p { font-size: 14px; }
        }
      `}</style>
      {children}
    </>
  );
}
