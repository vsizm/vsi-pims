-- VSI IMS programme management foundation.
-- Apply through the approved migration workflow; this file does not run automatically.

CREATE TABLE IF NOT EXISTS vsi_programmes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  directorate TEXT NOT NULL DEFAULT '',
  lead_name TEXT NOT NULL DEFAULT '',
  objectives TEXT NOT NULL DEFAULT '',
  target_groups TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS vsi_programmes_status_idx
  ON vsi_programmes (status) WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS vsi_projects (
  id BIGSERIAL PRIMARY KEY,
  programme_id BIGINT NOT NULL REFERENCES vsi_programmes(id),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  project_lead TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Planned', 'Active', 'On Hold', 'Completed', 'Archived')),
  objectives TEXT NOT NULL DEFAULT '',
  indicators TEXT NOT NULL DEFAULT '',
  target_groups TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS vsi_projects_programme_idx
  ON vsi_projects (programme_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS vsi_projects_status_idx
  ON vsi_projects (status) WHERE archived_at IS NULL;
