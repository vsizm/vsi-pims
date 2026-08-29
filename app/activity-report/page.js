'use client';

import ActivityReportWorkspace from './ActivityReportWorkspace';

export default function ActivityReportPage(){
  return <>
    <style dangerouslySetInnerHTML={{__html:`
      .workspace{max-width:1440px;margin:0 auto;padding:28px 24px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:26px;align-items:start}
      .report-sidebar{position:sticky;top:92px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 12px;box-shadow:0 5px 20px rgba(0,53,102,.05);max-height:calc(100vh - 112px);overflow:auto}
      .sidebar-title{font-size:12px;font-weight:900;letter-spacing:.12em;color:var(--regal-navy);padding:4px 10px 3px}
      .sidebar-subtitle{font-size:12px;color:var(--muted);padding:0 10px 14px}
      .report-sidebar a{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--regal-navy);font-size:12px;font-weight:800;padding:10px;border-radius:9px;margin:2px 0}
      .report-sidebar a:hover{background:#eef4f8;color:var(--yale-blue)}
      .report-sidebar a span{width:29px;height:29px;display:grid;place-items:center;border-radius:7px;background:#eef4f8;color:var(--baltic-blue);font-size:10px;font-weight:900;flex:0 0 29px}
      .report-content{min-width:0}.report-content .form-intro{margin-top:0}
      .report-content .section{scroll-margin-top:110px}
      @media(max-width:900px){.workspace{grid-template-columns:1fr;padding:20px 14px 55px}.report-sidebar{position:sticky;top:78px;z-index:900;max-height:none;display:flex;gap:6px;overflow-x:auto;padding:10px}.sidebar-title,.sidebar-subtitle{display:none}.report-sidebar a{white-space:nowrap;margin:0;padding:7px 8px}.report-sidebar a span{width:26px;height:26px;flex-basis:26px}.report-content{width:100%}}
    `}} />
    <ActivityReportWorkspace />
  </>;
}
