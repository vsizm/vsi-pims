import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import MealLayoutCleanup from './MealLayoutCleanup';
import MealDemographicBar from './MealDemographicBar';
import MealProgrammePerformance from './MealProgrammePerformance';
import MealReportingCompliance from './MealReportingCompliance';
import styles from './meal-overrides.module.css';
import './meal-section-header-theme.css';
import './meal-main-header.css';
import './meal-activity-layout-fixes.module.css';
import './meal-hide-activity.css';
import './meal-donut-fix.module.css';
import './meal-demographic-bar.css';
import './meal-programme-performance.css';
import './meal-reporting-compliance.css';
import './meal-followup-actions.css';
import './meal-section-spacing.css';
import './meal-page-spacing.css';
import './meal-dashboard-spacing-fixes.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function MealPage() {
  return <div className={styles.scope}><MealLayoutCleanup /><MealKpiEnhancer /><MealDemographicBar /><MealProgrammePerformance /><MealReportingCompliance /><Phase4Dashboard /></div>;
}
