'use client';

export default function MealLayoutCleanup() {
  return <style jsx global>{`
    .phase1-card:has(.phase1-demographics) {
      display: none !important;
    }
  `}</style>;
}
