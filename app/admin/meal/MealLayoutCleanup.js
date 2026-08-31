'use client';

export default function MealLayoutCleanup() {
  return <style jsx global>{`
    .phase1-card:has(.phase1-demographics) {
      display: none !important;
    }

    .phase4-activity-card {
      min-width: 0;
    }
    .phase4-activity-card .activity-title,
    .phase4-activity-card .activity-subtitle {
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
    }

    .phase1-kpis.meal-five-kpis {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
      align-items: stretch;
    }

    /* The activity panel is intentionally hidden; footprint becomes the full-width demographic intelligence panel. */
    .phase1-bottom-grid {
      grid-template-columns: 1fr !important;
      align-items: start;
    }
    .activity-panel {
      display: none !important;
    }
    .footprint-panel {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
    }

    /* Combined demographic panel: live six-metric breakdown on the left, existing donut on the right. */
    .demographic-intelligence {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, .85fr);
      gap: 28px;
      align-items: center;
      margin-top: 18px;
    }
    .demographic-metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      min-width: 0;
    }
    .demographic-metric {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      padding: 12px 14px;
      border: 1px solid rgba(60,105,151,.12);
      border-radius: 12px;
      background: rgba(248,250,252,.78);
    }
    .demographic-metric .demo-icon {
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: #eef4f8;
      font-size: 18px;
    }
    .demographic-metric > div:last-child {
      min-width: 0;
      display: grid;
      grid-template-columns: 1fr auto;
      column-gap: 10px;
      align-items: baseline;
    }
    .demographic-metric small {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #64748b;
    }
    .demographic-metric strong {
      font-size: 20px;
      line-height: 1;
      font-weight: 800;
      color: #123b5d;
    }
    .demographic-metric em {
      grid-column: 1 / -1;
      font-size: 10px;
      font-style: normal;
      color: #94a3b8;
    }
    .demographic-donut {
      min-width: 0;
      display: grid;
      justify-items: center;
      align-content: center;
    }
    .demographic-donut .donut-wrap {
      text-align: center;
    }
    .demographic-donut .donut {
      margin-inline: auto;
    }

    @media (max-width: 1100px) {
      .phase1-kpis.meal-five-kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      .demographic-intelligence {
        grid-template-columns: 1fr;
      }
      .demographic-donut {
        padding-top: 8px;
      }
    }

    @media (max-width: 720px) {
      .phase1-kpis.meal-five-kpis {
        grid-template-columns: 1fr !important;
      }
      .demographic-metrics {
        grid-template-columns: 1fr;
      }
    }
  `}</style>;
}
