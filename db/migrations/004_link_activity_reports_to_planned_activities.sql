-- Link activity reports to the planned-activity register.
-- Apply only after migrations 002 and 003, on the isolated UAT database first.
ALTER TABLE activity_reports
  ADD COLUMN IF NOT EXISTS planned_activity_id BIGINT
  REFERENCES vsi_planned_activities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS activity_reports_planned_activity_idx
  ON activity_reports (planned_activity_id)
  WHERE planned_activity_id IS NOT NULL;
