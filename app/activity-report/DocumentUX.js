'use client';
import { useEffect, useRef, useState } from 'react';

export default function DocumentUX(){
  const [rows,setRows]=useState([]);
  const mounted=useRef(false);
  useEffect(()=>{
    let observer;
    const setup=()=>{
      const sections=[...document.querySelectorAll('.section')];
      const section=sections.find(s=>s.querySelector('h2')?.textContent?.trim()==='Evidence & Attachments');
      if(!section) return false;
      section.querySelector('.options')?.setAttribute('style','display:none');
      section.querySelector('select[name="evidenceUploaded"]')?.closest('.grid')?.setAttribute('style','display:none');
      const input=section.querySelector('input[type="file"]');
      const oldList=section.querySelector('.document-list'); if(oldList) oldList.style.display='none';
      const oldHint=section.querySelector('.hint'); if(oldHint) oldHint.style.display='none';
      let panel=section.querySelector('[data-vsi-document-panel]');
      if(!panel){
        panel=document.createElement('div'); panel.dataset.vsiDocumentPanel='true'; panel.className='vsi-document-panel';
        const button=[...section.querySelectorAll('button')].find(b=>b.textContent.includes('Add Document'));
        (button?.parentElement||section.querySelector('.section-body')||section).appendChild(panel);
      }
      if(input && !input.dataset.vsiCapture){
        input.dataset.vsiCapture='1';
        input.addEventListener('change',(e)=>{
          const selected=[...e.target.files];
          if(selected.length) setRows(prev=>[...prev,...selected.map(file=>({key:`${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,file,title:''}))]);
        },true);
      }
      return true;
    };
    const render=()=>{
      const panel=document.querySelector('[data-vsi-document-panel]'); if(!panel) return;
      panel.innerHTML='';
      const title=document.createElement('div'); title.className='vsi-document-heading'; title.textContent='Supporting Documents'; panel.appendChild(title);
      if(!rows.length){ const empty=document.createElement('div'); empty.className='vsi-document-empty'; empty.textContent='No documents added yet. Use + Add Document to add supporting evidence.'; panel.appendChild(empty); return; }
      const table=document.createElement('div'); table.className='vsi-document-table';
      const head=document.createElement('div'); head.className='vsi-document-row vsi-document-head'; head.innerHTML='<div>Document Title</div><div>File</div><div>Action</div>'; table.appendChild(head);
      rows.forEach((row,index)=>{
        const el=document.createElement('div'); el.className='vsi-document-row';
        const titleWrap=document.createElement('div'); const titleInput=document.createElement('input'); titleInput.type='text'; titleInput.placeholder='Enter document title'; titleInput.value=row.title; titleInput.addEventListener('input',e=>setRows(prev=>prev.map((x,i)=>i===index?{...x,title:e.target.value}:x))); titleWrap.appendChild(titleInput);
        const file=document.createElement('div'); file.className='vsi-document-file'; file.textContent=`${row.file.name} · ${(row.file.size/1024/1024).toFixed(2)} MB`;
        const action=document.createElement('button'); action.type='button'; action.className='small-btn'; action.textContent='Remove'; action.addEventListener('click',()=>{
          const lists=[...document.querySelectorAll('.document-item')]; const match=lists.find(x=>x.querySelector('strong')?.textContent===row.file.name && x.querySelector('button'));
          match?.querySelector('button')?.click(); setRows(prev=>prev.filter((_,i)=>i!==index));
        });
        el.append(titleWrap,file,action); table.appendChild(el);
      }); panel.appendChild(table);
    };
    const onSubmitCapture=(e)=>{
      if(!(e.target instanceof HTMLFormElement)) return;
      const original=window.fetch; window.fetch=async(...args)=>{
        try{ const [url,opts]=args; if(String(url).includes('/api/activity-reports') && opts?.body && typeof opts.body==='string'){
          const payload=JSON.parse(opts.body); payload.documentTitles=rows.map(r=>({title:r.title||r.file.name,name:r.file.name,size:r.file.size,type:r.file.type})); args[1]={...opts,body:JSON.stringify(payload)};
        }}catch{}
        const result=await original(...args); window.fetch=original; return result;
      };
    };
    document.addEventListener('submit',onSubmitCapture,true);
    observer=new MutationObserver(()=>setup()); observer.observe(document.body,{childList:true,subtree:true});
    setup(); mounted.current=true;
    return()=>{document.removeEventListener('submit',onSubmitCapture,true); observer?.disconnect();};
  },[rows]);

  useEffect(()=>{
    const applySuccess=()=>{
      const success=document.querySelector('.success'); if(!success) return;
      const top=success.closest('.shell')?.previousElementSibling;
      const brand=top?.querySelector('.brand');
      if(brand){ brand.innerHTML='<img src="/vsi-logo-white.png" alt="Visionary Students Initiative" class="vsi-logo"/><small>VISIONARY STUDENTS INITIATIVE</small>'; const span=top.querySelector('.topbar-inner>span')||document.createElement('span'); span.textContent='ACTIVITY REPORT'; if(!span.parentElement) top.querySelector('.topbar-inner')?.appendChild(span); }
      if(!success.querySelector('[data-submit-another]')){ const p=success.querySelector('p:last-of-type'); const a=document.createElement('a'); a.href='/activity-report'; a.dataset.submitAnother='true'; a.className='submit another-report'; a.textContent='Submit another activity report →'; p?.after(a); }
    };
    const o=new MutationObserver(applySuccess); o.observe(document.body,{childList:true,subtree:true}); applySuccess(); return()=>o.disconnect();
  },[]);
  return null;
}
