'use client';

export default function MealLayoutCleanup() {
  return <style jsx global>{`
    /* Surgical layout guard: remove only the redundant demographic card. */
    .phase1-card:has(.phase1-demographics) {
      display: none !important;
    }

    /* Keep the restored MEAL activity layout readable at desktop widths. */
    .phase4-activity-card {
      min-width: 0;
    }
    .phase4-activity-card .activity-title,
    .phase4-activity-card .activity-subtitle {
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
    }

    /* Agreed MEAL architecture: five KPI cards in one desktop ribbon. */
    .phase1-kpis.meal-five-kpis {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
      align-items: stretch;
    }

    /* Activity details + demographic footprint: 65 / 35 split. */
    .phase1-bottom-grid {
      grid-template-columns: minmax(0, 1.9fr) minmax(280px, 1fr) !important;
      align-items: start;
    }
    .activity-panel { grid-column: 1 !important; grid-row: 1 !important; }
    .footprint-panel { grid-column: 2 !important; grid-row: 1 !important; }

    /* Preserve the donut footprint as the sole demographic visualization. */
    .footprint-panel .donut-wrap {
      text-align: center;
    }
    .footprint-panel .donut {
      margin-inline: auto;
    }

    /* Activity rows must have dedicated columns; never overlay badge/text. */
    .meal-activity {
      grid-template-columns: minmax(205px, 1.45fr) auto minmax(78px, .55fr) minmax(78px, .55fr) minmax(78px, .55fr) minmax(145px, .85fr) auto !important;
      column-gap: 10px;
      min-width: 0;
    }
    .meal-activity > * { min-width: 0; }
    .meal-activity .activity-main { min-width: 0; }
    .meal-activity .activity-main > div:last-child { min-width: 0; }
    .meal-activity .status { min-width: max-content; }
    .meal-activity .meal-metrics { min-width: 0; }
    .meal-activity .meal-progress { min-width: 0; }
    .meal-activity .reach-meta { white-space: normal; }

    @media (max-width: 1100px) {
      .phase1-kpis.meal-five-kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      .phase1-bottom-grid {
        grid-template-columns: 1fr !important;
      }
      .activity-panel,
      .footprint-panel {
        grid-column: 1 !important;
        grid-row: auto !important;
      }
      .meal-activity {
        grid-template-columns: minmax(180px, 1fr) repeat(3, minmax(75px, .6fr)) !important;
      }
    }

    @media (max-width: 720px) {
      .phase1-kpis.meal-five-kpis { grid-template-columns: 1fr !important; }
      .meal-activity {
        grid-template-columns: 1fr 1fr !important;
      }
      .meal-activity .activity-main,
      .meal-activity .meal-progress {
        grid-column: 1 / -1 !important;
      }
    }
  `}</style>;
}
