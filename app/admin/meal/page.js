import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import MealLayoutCleanup from './MealLayoutCleanup';
import MealDemographicBar from './MealDemographicBar';
import styles from './meal-overrides.module.css';
import './meal-activity-layout-fixes.module.css';
import './meal-hide-activity.css';
import './meal-donut-fix.module.css';
import './meal-demographic-bar.css';

export default function MealPage() {
  return <div className={styles.scope}><MealLayoutCleanup /><MealKpiEnhancer /><MealDemographicBar /><Phase4Dashboard /></div>;
}
