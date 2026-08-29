import { neon } from '@neondatabase/serverless';

// TEST MODE: all report fields are optional so the end-to-end workflow can be tested.
const required = [];
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const participantFields = [
  'plannedMaleChildren','plannedMaleYouth','plannedMaleAdult','plannedFemaleChildren','plannedFemaleYouth','plannedFemaleAdult',
  'plannedPwdMaleChildren','plannedPwdMaleYouth','plannedPwdMaleAdult','plannedPwdFemaleChildren','plannedPwdFemaleYouth','plannedPwdFemaleAdult',
  'reachedMaleChildren','reachedMaleYouth','reachedMaleAdult','reachedFemaleChildren','reachedFemaleYouth','reachedFemaleAdult',
  'reachedPwdMaleChildren','reachedPwdMaleYouth','reachedPwdMaleAdult','reachedPwdFemaleChildren','reachedPwdFemaleYouth','reachedPwdFemaleAdult',
];

async function sendReportEmail({ recipient, reference, activityTitle, reporterName }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !recipient) return;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'VSI PIMS <noreply@ims.vsizambia.org>',
      to: [recipient],
      reply_to: 'vsiprojectszm@gmail.com',
      subject: `VSI PIMS Activity Report Received — ${reference}`,
      text: `Dear ${reporterName || 'VSI Officer'},\n\nYour activity report has been successfully submitted to VSI PIMS.\n\nReference: ${reference}\nActivity: ${activityTitle || 'Activity report'}\n\nThe report is now recorded for review.\n\nVSI PIMS\nVisionary Students Initiative`,
      html: `<p>Dear ${reporterName || 'VSI Officer'},</p><p>Your activity report has been successfully submitted to <strong>VSI PIMS</strong>.</p><p><strong>Reference:</strong> ${reference}<br><strong>Activity:</strong> ${activityTitle || 'Activity report'}</p><p>The report is now recorded for review.</p><p>VSI PIMS<br>Visionary Students Initiative</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend email failed (${response.status}): ${await response.text()}`);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid submission.' }, { status: 400 });

    if ((body.reporterEmail && !email.test(body.reporterEmail)) || (body.grantEmail && !email.test(body.grantEmail)) || (body.supervisorEmail && !email.test(body.supervisorEmail))) {
      return Response.json({ error: 'Please provide valid email address(es).' }, { status: 400 });
    }

    const participantData = Object.fromEntries(participantFields.map((key) => [key, Number(body[key]) || 0]));
    if (Object.values(participantData).some((n) => n < 0 || !Number.isFinite(n))) return Response.json({ error: 'Participant numbers must be valid non-negative numbers.' }, { status: 400 });

    const plannedTotal = Number(body.plannedParticipantTotal) || 0;
    const reachedTotal = Number(body.reachedParticipantTotal) || 0;
    const participantPerformance = body.participantPerformance || (plannedTotal === 0 ? '' : reachedTotal < plannedTotal ? 'UNDER-ACHIEVED' : reachedTotal > plannedTotal ? 'OVER-ACHIEVED' : 'ACHIEVED');
    const participantPerformancePercent = plannedTotal > 0 ? Math.round((reachedTotal / plannedTotal) * 100) : 0;
    if (participantPerformance !== 'ACHIEVED' && participantPerformance !== '' && !String(body.participantPerformanceJustification || '').trim()) return Response.json({ error: 'Please provide the justification for the participant performance result.' }, { status: 400 });
    if (plannedTotal < 0 || reachedTotal < 0 || !Number.isFinite(plannedTotal) || !Number.isFinite(reachedTotal)) return Response.json({ error: 'Participant totals must be valid non-negative numbers.' }, { status: 400 });

    const female = participantData.reachedFemaleChildren + participantData.reachedFemaleYouth + participantData.reachedFemaleAdult;
    const male = participantData.reachedMaleChildren + participantData.reachedMaleYouth + participantData.reachedMaleAdult;
    const other = 0;
    const total = reachedTotal;
    if (total !== female + male) return Response.json({ error: 'Reached participant total does not match the male + female breakdown.' }, { status: 400 });

    const budgetItems = Array.isArray(body.budgetItems) ? body.budgetItems : [];
    const followUps = Array.isArray(body.followUpActions) ? body.followUpActions : [];
    const approvedBudget = budgetItems.reduce((s, x) => s + (Number(x.approved) || 0), 0);
    const actualSpent = budgetItems.reduce((s, x) => s + (Number(x.actual) || 0), 0);
    const budgetStatus = actualSpent > approvedBudget ? 'Overspent' : actualSpent < approvedBudget ? 'Underspent' : 'Within approved budget';
    if (budgetItems.some((x) => (Number(x.approved) || 0) < 0 || (Number(x.actual) || 0) < 0)) return Response.json({ error: 'Budget amounts cannot be negative.' }, { status: 400 });
    if (budgetStatus === 'Overspent' && !body.overspendCause) return Response.json({ error: 'Please provide the reason for the overspend.' }, { status: 400 });

    const attachments = Array.isArray(body.attachments) ? [...body.attachments] : [];
    attachments.push({ category: 'participant-breakdown', plannedTotal, reachedTotal, performance: participantPerformance, achievementPercent: participantPerformancePercent, variance: reachedTotal - plannedTotal, justification: body.participantPerformanceJustification || null, breakdown: participantData });

    const reference = `VSI-AR-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO activity_reports (
      reference, activity_title, activity_date, start_time, end_time, activity_type, activity_type_other, directorate, programme, project, activity_code, activity_description, province, district, constituency, ward_community, venue, reporter_full_name, reporter_position, reporter_phone, reporter_email, supervisor_full_name, supervisor_position, supervisor_phone, supervisor_email, donor_name, grant_title, grant_reference, grant_manager, grant_phone, grant_email, funding_source, funding_source_other, lead_facilitator, other_staff_volunteers, partner_organisations, partner_contact, target_group, participant_total, participant_female, participant_male, participant_other, age_groups, participants_with_disabilities, attendance_status, objectives, activity_delivered, implementation_status, implementation_change, knowledge_skills, key_issues, participant_feedback, immediate_outcomes, notable_achievements, results_evidence, budget_items, approved_budget, actual_spent, budget_status, overspend_reason, overspend_cause, prior_approval, overspend_approved_by, overspend_approval_date, financial_documents, challenges, challenges_addressed, lessons_learned, future_improvements, safeguarding_status, follow_up_actions, evidence_available, evidence_uploaded, photo_media_consent, overall_assessment, assessment_explanation, attachments, declaration
    ) VALUES (
      ${reference}, ${body.activityTitle || ''}, ${body.activityDate || null}, ${body.startTime || null}, ${body.endTime || null}, ${body.activityType || ''}, ${body.activityTypeOther || null}, ${body.directorate || ''}, ${body.programme || ''}, ${body.project || ''}, ${body.activityCode || null}, ${body.activityDescription || ''}, ${body.province || ''}, ${body.district || ''}, ${body.constituency || null}, ${body.wardCommunity || null}, ${body.venue || ''}, ${body.reporterFullName || ''}, ${body.reporterPosition || ''}, ${body.reporterPhone || ''}, ${body.reporterEmail || ''}, ${body.supervisorFullName || null}, ${body.supervisorPosition || null}, ${body.supervisorPhone || null}, ${body.supervisorEmail || null}, ${body.donorName || null}, ${body.grantTitle || null}, ${body.grantReference || null}, ${body.grantManager || null}, ${body.grantPhone || null}, ${body.grantEmail || null}, ${body.fundingSource || ''}, ${body.fundingSourceOther || null}, ${body.leadFacilitator || null}, ${body.otherStaffVolunteers || null}, ${body.partnerOrganisations || null}, ${body.partnerContact || null}, ${body.targetGroup || ''}, ${total}, ${female}, ${male}, ${other}, ${body.ageGroups || null}, ${body.participantsWithDisabilities || null}, ${body.attendanceStatus || ''}, ${body.objectives || ''}, ${body.activityDelivered || ''}, ${body.implementationStatus || ''}, ${body.implementationChange || null}, ${body.knowledgeSkills || null}, ${body.keyIssues || null}, ${body.participantFeedback || null}, ${body.immediateOutcomes || null}, ${body.notableAchievements || null}, ${body.resultsEvidence || null}, ${JSON.stringify(budgetItems)}::jsonb, ${approvedBudget}, ${actualSpent}, ${budgetStatus}, ${budgetStatus === 'Overspent' ? Math.abs(approvedBudget - actualSpent).toFixed(2) : null}, ${body.overspendCause || null}, ${body.priorApproval || null}, ${body.overspendApprovedBy || null}, ${body.overspendApprovalDate || null}, ${body.financialDocuments || null}, ${body.challenges || null}, ${body.challengesAddressed || null}, ${body.lessonsLearned || null}, ${body.futureImprovements || null}, ${body.safeguardingStatus || ''}, ${JSON.stringify(followUps)}::jsonb, ${Array.isArray(body.evidenceAvailable) ? body.evidenceAvailable : []}, ${body.evidenceUploaded || ''}, ${body.photoMediaConsent || ''}, ${body.overallAssessment || ''}, ${body.assessmentExplanation || ''}, ${JSON.stringify(attachments)}::jsonb, true
    )`;

    try { await sendReportEmail({ recipient: body.reporterEmail, reference, activityTitle: body.activityTitle, reporterName: body.reporterFullName }); } catch (emailError) { console.error('activity report email notification failed', emailError); }
    return Response.json({ ok: true, reference }, { status: 201 });
  } catch (error) {
    console.error('activity report submission failed', error);
    return Response.json({ error: 'Unable to save the activity report. Please try again.' }, { status: 500 });
  }
}
