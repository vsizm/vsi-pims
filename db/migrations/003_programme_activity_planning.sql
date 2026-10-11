-- VSI PIMS programme activity planning foundation.
-- Apply through the approved migration workflow; this file does not run automatically.
CREATE TABLE IF NOT EXISTS vsi_planned_activities (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES vsi_projects(id),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lead_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  target_groups TEXT NOT NULL DEFAULT '',
  expected_outputs TEXT NOT NULL DEFAULT '',
  indicators TEXT NOT NULL DEFAULT '',
  planned_start_date DATE,
  planned_end_date DATE,
  budget_estimate NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (budget_estimate >= 0),
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Planned', 'Active', 'Completed', 'Cancelled', 'Archived')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  CHECK (planned_start_date IS NULL OR planned_end_date IS NULL OR planned_end_date >= planned_start_date)
);
CREATE INDEX IF NOT EXISTS vsi_planned_activities_project_idx
  ON vsi_planned_activities (project_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS vsi_planned_activities_status_idx
  ON vsi_planned_activities (status) WHERE archived_at IS NULL;
