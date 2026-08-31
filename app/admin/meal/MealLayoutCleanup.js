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
  `}</style>;
}
