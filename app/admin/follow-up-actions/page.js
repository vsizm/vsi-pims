import MealFollowupActions from '../meal/MealFollowupActions';
import '../meal/meal-followup-actions.css';

export default function FollowupActionsPage() {
  return (
    <main style={{ padding: '28px 28px 56px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.14em', color: '#64748b', marginBottom: '5px' }}>VSI ADMINISTRATION · WORKSPACE</div>
        <h1 style={{ margin: 0, color: '#003566', fontSize: '26px', lineHeight: 1.15 }}>Follow-up Actions</h1>
        <p style={{ margin: '7px 0 0', color: '#718398', fontSize: '12px' }}>Track pending and in-progress actions from approved activity reports.</p>
      </header>
      <MealFollowupActions />
    </main>
  );
}
