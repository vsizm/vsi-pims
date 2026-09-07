-- Authoritative PMIS Programme -> Project -> Activity catalogue.
-- This migration creates the relational catalogue used to drive approved-activity selection.
-- Data seeding is intentionally separate: programme names must come from authoritative VSI source data,
-- never be inferred from activity-code prefixes.

CREATE TABLE IF NOT EXISTS programmes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  directorate TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  programme_code TEXT NOT NULL REFERENCES programmes(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (programme_code, name)
);

CREATE TABLE IF NOT EXISTS activities (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project_code TEXT NOT NULL REFERENCES projects(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  directorate TEXT,
  un_sdgs_alignment TEXT,
  au_agenda_2063_alignment TEXT,
  approval_status TEXT NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_code, name)
);

CREATE INDEX IF NOT EXISTS projects_programme_code_idx ON projects(programme_code);
CREATE INDEX IF NOT EXISTS activities_project_code_idx ON activities(project_code);
CREATE INDEX IF NOT EXISTS activities_approval_status_idx ON activities(approval_status);
