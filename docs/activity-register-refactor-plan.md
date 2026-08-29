# Activity Register Refactor Plan

Reference implementation: `vsizambia/vsiwebsite` Activity Register/Admin flow.

Target branch: `refactor/activity-register-clean`

## Principles
- One authoritative approved-activity source.
- Activity Report uses a React-native selector; no DOM bridge.
- No compressed/base64 activity catalogue in the report path.
- Preserve the PIMS `activity_reports` model and Admin review workflow.
- Approved activity metadata is selected, not manually edited in the report.
- Do not modify `main` until the branch builds and the live workflow is verified.

## Required selected fields
- Activity Code
- Activity Name
- Project
- Directorate
- UN SDGs Alignment
- AU Agenda 2063 Alignment

## Verification gates
1. Build passes.
2. Activity search works by code and name.
3. Selecting an approved activity populates all six fields.
4. Required-field validation visibly marks missing fields.
5. Multiple uploaded documents remain visible.
6. Save Draft persists data.
7. Submit creates a report reference.
8. Admin can review the submitted report.
