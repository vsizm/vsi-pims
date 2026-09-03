-- Activity Reports admin workflow schema.
-- This records the schema required by the admin review/edit/delete APIs.
-- Production currently already contains these objects; this file is the
-- reproducible migration record for new environments.

ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS last_edited_by TEXT;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW';
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_comment TEXT;
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS activity_report_audit (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
