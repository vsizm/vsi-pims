import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import MealLayoutCleanup from './MealLayoutCleanup';
import MealDemographicBar from './MealDemographicBar';
import MealProgrammePerformance from './MealProgrammePerformance';
import MealReportingCompliance from './MealReportingCompliance';
import MealFollowupActions from './MealFollowupActions';
import styles from './meal-overrides.module.css';
import './meal-section-header-theme.css';
import './meal-activity-layout-fixes.module.css';
import './meal-hide-activity.css';
import './meal-donut-fix.module.css';
import './meal-demographic-bar.css';
import './meal-programme-performance.css';
import './meal-reporting-compliance.css';
import './meal-followup-actions.css';

export default function MealPage() {
  return <div className={styles.scope}><MealLayoutCleanup /><MealKpiEnhancer /><MealDemographicBar /><MealProgrammePerformance /><MealReportingCompliance /><MealFollowupActions /><Phase4Dashboard /></div>;
}
