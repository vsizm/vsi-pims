'use client';

import ActivityReportWorkspace from './ActivityReportWorkspace';

export default function ActivityReportPage(){
  return <>
    <style dangerouslySetInnerHTML={{__html:`
      .workspace{max-width:1440px;margin:0 auto;padding:28px 24px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:26px;align-items:start}
      .report-sidebar{position:sticky;top:92px;background:linear-gradient(180deg,var(--regal-navy) 0 78px,var(--yale-blue) 78px 100%);border:0;border-radius:16px;padding:0 10px 14px;box-shadow:0 10px 28px rgba(0,53,102,.16);max-height:calc(100vh - 112px);overflow:auto}
      .sidebar-title{font-size:12px;font-weight:900;letter-spacing:.12em;color:#fff;padding:18px 10px 3px}
      .sidebar-subtitle{font-size:12px;color:rgba(255,255,255,.72);padding:0 10px 14px}
      .report-sidebar a{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-size:12px;font-weight:800;padding:10px;border-radius:10px;margin:3px 0;transition:transform .18s ease,background .18s ease,box-shadow .18s ease}
      .report-sidebar a:hover{background:rgba(255,255,255,.11);color:var(--gold);transform:translateX(3px)}
      .report-sidebar a span{width:29px;height:29px;display:grid;place-items:center;border-radius:8px;background:var(--baltic-blue);color:var(--gold);font-size:10px;font-weight:900;flex:0 0 29px;transition:background .18s ease,color .18s ease}
      .report-sidebar a.active{background:var(--school-bus-yellow);color:var(--regal-navy);box-shadow:0 5px 14px rgba(0,0,0,.16)}
      .report-sidebar a.active span{background:var(--regal-navy);color:var(--gold)}
      .report-content{min-width:0}.report-content .form-intro{margin-top:0}
      .report-content .section{scroll-margin-top:110px}
      @media(max-width:900px){.workspace{grid-template-columns:1fr;padding:20px 14px 55px}.report-sidebar{position:sticky;top:78px;z-index:900;max-height:none;display:flex;gap:6px;overflow-x:auto;padding:10px;background:var(--regal-navy)}.sidebar-title,.sidebar-subtitle{display:none}.report-sidebar a{white-space:nowrap;margin:0;padding:7px 8px}.report-sidebar a span{width:26px;height:26px;flex-basis:26px}.report-content{width:100%}}
    `}} />
    <ActivityReportWorkspace />
  </>;
}
