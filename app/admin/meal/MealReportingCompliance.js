'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };

function breakdown(report) {
  const item = json(report.attachments, []).find(x => x?.category === 'participant-breakdown');
  const b = item?.breakdown || {};
  const g = (k) => num(b[`reached${k}`]);
  return { children:g('MaleChildren')+g('FemaleChildren'), youth:g('MaleYouth')+g('FemaleYouth'), adults:g('MaleAdult')+g('FemaleAdult'), pwd:g('PwdMaleChildren')+g('PwdFemaleChildren')+g('PwdMaleYouth')+g('PwdFemaleYouth')+g('PwdMaleAdult')+g('PwdFemaleAdult'), hasBreakdown:Boolean(item?.breakdown) };
}

function reportingCompliance(report) {
  const b = breakdown(report);
  const planned = num(first(report,['planned_participant_total','participant_target','target_participants'])) || b.children+b.youth+b.adults;
  const reached = num(first(report,['reached_participant_total','participant_total','participants_reached'])) || b.children+b.youth+b.adults;
  const missing=[];
  if(!first(report,['activity_code','activityCode','code'])) missing.push('Activity code');
  if(!first(report,['activity_title','activity_name','activityName'])) missing.push('Activity name');
  if(!first(report,['directorate','directorate_name','directorateName'])) missing.push('Directorate');
  if(!b.hasBreakdown) missing.push('Participant disaggregation');
  if(!first(report,['province','province_name','provinceName'])) missing.push('Province');
  if(!first(report,['district','district_name','districtName'])) missing.push('District');
  if(!(report.immediate_outcomes||report.notable_achievements)) missing.push('Outcome / results');
  if(!(report.results_evidence||report.evidence_uploaded)) missing.push('Evidence');
  if(missing.length) return {state:'non',label:'NON-COMPLIANT',description:'Required reporting information is missing or incomplete.',missing,planned,reached,variance:reached-planned};
  if(reached!==planned) return {state:'variance',label:'VARIANCE IDENTIFIED',description:'Reporting is complete, but the participant target differs from actual reach.',missing:[],planned,reached,variance:reached-planned};
  return {state:'ok',label:'COMPLIANT',description:'All required reporting information is complete and consistent.',missing:[],planned,reached,variance:0};
}

function budgetCompliance(report) {
  const approved=num(first(report,['approved_budget','approvedBudget','budget_approved','budgetApproved','total_approved_budget']));
  const spent=num(first(report,['actual_spent','actualSpent','actual_expenditure','actualExpenditure','total_actual_spent']));
  const status=String(first(report,['budget_status','budgetStatus'], '')).trim();
  const hasAmounts=first(report,['approved_budget','approvedBudget','budget_approved','budgetApproved','total_approved_budget'])!=='' || first(report,['actual_spent','actualSpent','actual_expenditure','actualExpenditure','total_actual_spent'])!=='';
  if(status.toLowerCase()==='within approved budget') return {state:'ok',label:'COMPLIANT',description:'Expenditure is within the approved activity budget.',approved,spent,variance:approved-spent,hasData:true};
  if(status.toLowerCase()==='underspent') return {state:'variance',label:'VARIANCE IDENTIFIED',description:'Activity is under the approved budget and should be reviewed against plan.',approved,spent,variance:approved-spent,hasData:true};
  if(status.toLowerCase()==='overspent') return {state:'variance',label:'VARIANCE IDENTIFIED',description:'Actual expenditure exceeds the approved activity budget.',approved,spent,variance:approved-spent,hasData:true};
  if(hasAmounts) return {state:spent>approved?'variance':'ok',label:spent>approved?'VARIANCE IDENTIFIED':'COMPLIANT',description:spent>approved?'Actual expenditure exceeds the approved activity budget.':'Expenditure is within the approved activity budget.',approved,spent,variance:approved-spent,hasData:true};
  return {state:'non',label:'NON-COMPLIANT',description:'Budget compliance information is not recorded for this activity.',approved:0,spent:0,variance:0,hasData:false};
}

function safeguardingCompliance(report) {
  const status=String(first(report,['safeguarding_status','safeguardingStatus'],'')).trim().toLowerCase();
  if(status==='no concerns identified') return {state:'ok',label:'COMPLIANT',description:'No safeguarding concerns were identified.'};
  if(status==='concern identified and handled according to vsi procedures') return {state:'ok',label:'COMPLIANT',description:'A safeguarding concern was identified and handled according to VSI procedures.'};
  if(status==='concern requires follow-up') return {state:'variance',label:'ATTENTION REQUIRED',description:'A safeguarding concern requires follow-up.'};
  return {state:'non',label:'NON-COMPLIANT',description:'Safeguarding status is not recorded for this activity.'};
}

function overallState(r,b,s){
  if(r.state==='non'||b.state==='non'||s.state==='non') return 'non';
  if(r.state==='variance'||b.state==='variance'||s.state==='variance') return 'variance';
  return 'ok';
}

function Status({item,compact=false}) { return <div className={`meal-compliance-status ${item.state}${compact?' compact':''}`}><b>{item.state==='ok'?'✓':item.state==='variance'?'!':'×'}</b><div><strong>{item.label}</strong><span>{item.description}</span></div></div>; }

export default function MealReportingCompliance(){
  const [host,setHost]=useState(null); const [activities,setActivities]=useState([]);
  useEffect(()=>{const find=()=>[...document.querySelectorAll('.phase1-card')].find(el=>el.textContent.includes('IMPLEMENTATION AUDIT'));const apply=()=>{const el=find();if(el){el.classList.add('meal-compliance-host');setHost(el)}};apply();const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect()},[]);
  useEffect(()=>{let cancelled=false;(async()=>{try{const res=await fetch('/api/admin/activity-reports',{cache:'no-store'});const data=await res.json();const approved=(data.reports||[]).filter(r=>r.review_status==='APPROVED');const full=await Promise.all(approved.map(async r=>{try{const d=await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`,{cache:'no-store'});const x=await d.json();return x.report||r}catch{return r}}));if(!cancelled)setActivities(full)}catch{if(!cancelled)setActivities([])}})();return()=>{cancelled=true}},[]);
  if(!host)return null;
  return createPortal(<div className="meal-reporting-compliance">
    <div className="meal-compliance-head"><div><span>REPORTING COMPLIANCE</span><h2>Compliance status</h2><p>MEAL reporting, budget and safeguarding compliance across approved activities.</p></div></div>
    <div className="meal-compliance-legend"><div className="ok"><b>✓</b><strong>COMPLIANT</strong><span>All required requirements are complete and consistent.</span></div><div className="variance"><b>!</b><strong>VARIANCE IDENTIFIED</strong><span>A variance or follow-up item is present and should be reviewed.</span></div><div className="non"><b>×</b><strong>NON-COMPLIANT</strong><span>A required compliance element is missing or incomplete.</span></div></div>
    <div className="meal-compliance-list">{activities.map((r,i)=>{const rc=reportingCompliance(r),bc=budgetCompliance(r),sc=safeguardingCompliance(r),overall=overallState(rc,bc,sc);const name=first(r,['activity_title','activity_name','activityName'],'Approved activity'),code=first(r,['activity_code','activityCode','code'],first(r,['reference'],'—')),directorate=first(r,['directorate','directorate_name','directorateName'],first(r,['programme','programme_name','programmeName'],'—')),href=`/admin/reports/${encodeURIComponent(r.reference)}`;return <Link href={href} className={`meal-compliance-row ${overall}`} key={r.reference||i}><div className="meal-compliance-icon">▣</div><div className="meal-compliance-activity"><small>ACTIVITY · {code}</small><strong>{name}</strong><span>{directorate}</span></div><div className="meal-compliance-checks"><div className="meal-compliance-check reporting"><small>MEAL / REPORTING</small><Status item={rc}/><div className="meal-compliance-metric">REACH / TARGET <strong>{rc.reached.toLocaleString()} / {rc.planned.toLocaleString()}</strong><span>Variance: {rc.variance>0?'+':''}{rc.variance.toLocaleString()}</span></div></div><div className="meal-compliance-check finance"><small>💰 BUDGET / FINANCE</small><Status item={bc}/>{bc.hasData&&<div className="meal-compliance-metric">APPROVED / SPENT <strong>{bc.approved.toLocaleString()} / {bc.spent.toLocaleString()}</strong><span>Variance: {bc.variance>0?'+':''}{bc.variance.toLocaleString()}</span></div>}</div><div className="meal-compliance-check safeguarding"><small>🛡 SAFEGUARDING</small><Status item={sc}/></div></div><div className="meal-compliance-link">View approved report →</div></Link>})}{!activities.length&&<div className="phase1-empty">No approved activities available for compliance review.</div>}</div>
  </div>,host);
}
