import MealFollowupActions from '../meal/MealFollowupActions';
import '../meal/meal-followup-actions.css';

export default function FollowupActionsPage() {
  return (
    <main className="followup-workspace">
      <header className="followup-header">
        <div className="followup-header-copy">
          <div className="followup-kicker">VSI ADMINISTRATION · MEAL INTELLIGENCE</div>
          <h1>Follow-up Actions</h1>
          <p>Track pending and in-progress actions from approved activity reports.</p>
        </div>
      </header>
      <MealFollowupActions />
    </main>
  );
}
