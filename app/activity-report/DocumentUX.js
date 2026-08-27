'use client';
import { useEffect, useState } from 'react';

export default function DocumentUX(){
  const [rows,setRows]=useState([]);

  useEffect(()=>{
    let cancelled=false;
    let attempts=0;
    let input=null;

    const findSection=()=>[...document.querySelectorAll('.section')]
      .find(s=>s.querySelector('h2')?.textContent?.trim()==='Evidence & Attachments');

    const render=()=>{
      const section=findSection();
      const panel=section?.querySelector('[data-vsi-document-panel]');
      if(!panel) return;

      panel.innerHTML='';
      const heading=document.createElement('div');
      heading.className='vsi-document-heading';
      heading.textContent='Supporting Documents';
      panel.appendChild(heading);

      if(!rows.length){
        const empty=document.createElement('div');
        empty.className='vsi-document-empty';
        empty.textContent='No documents added yet. Use + Add Document to add supporting evidence.';
        panel.appendChild(empty);
        return;
      }

      const table=document.createElement('div');
      table.className='vsi-document-table';
      const head=document.createElement('div');
      head.className='vsi-document-row vsi-document-head';
      head.innerHTML='<div>Document Title</div><div>File</div><div>Action</div>';
      table.appendChild(head);

      rows.forEach((row,index)=>{
        const el=document.createElement('div');
        el.className='vsi-document-row';

        const titleWrap=document.createElement('div');
        const titleInput=document.createElement('input');
        titleInput.type='text';
        titleInput.placeholder='Enter document title';
        titleInput.value=row.title;
        titleInput.addEventListener('input',e=>{
          const value=e.target.value;
          setRows(prev=>prev.map((x,i)=>i===index?{...x,title:value}:x));
        });
        titleWrap.appendChild(titleInput);

        const file=document.createElement('div');
        file.className='vsi-document-file';
        file.textContent=`${row.file.name} · ${(row.file.size/1024/1024).toFixed(2)} MB`;

        const action=document.createElement('button');
        action.type='button';
        action.className='small-btn';
        action.textContent='Remove';
        action.addEventListener('click',()=>setRows(prev=>prev.filter((_,i)=>i!==index)));

        el.append(titleWrap,file,action);
        table.appendChild(el);
      });
      panel.appendChild(table);
    };

    const setup=()=>{
      const section=findSection();
      if(!section) return false;

      section.querySelector('.options')?.setAttribute('style','display:none');
      section.querySelector('select[name="evidenceUploaded"]')?.closest('.grid')?.setAttribute('style','display:none');
      section.querySelector('.document-list')?.setAttribute('style','display:none');
      section.querySelector('.hint')?.setAttribute('style','display:none');

      let panel=section.querySelector('[data-vsi-document-panel]');
      if(!panel){
        panel=document.createElement('div');
        panel.dataset.vsiDocumentPanel='true';
        panel.className='vsi-document-panel';
        const button=[...section.querySelectorAll('button')].find(b=>b.textContent.includes('Add Document'));
        (button?.parentElement||section.querySelector('.section-body')||section).appendChild(panel);
      }

      input=section.querySelector('input[type="file"]');
      if(input && !input.dataset.vsiCapture){
        input.dataset.vsiCapture='1';
        input.addEventListener('change',(e)=>{
          const selected=[...e.target.files];
          if(selected.length){
            setRows(prev=>[
              ...prev,
              ...selected.map(file=>({
                key:`${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
                file,
                title:''
              }))
            ]);
            e.target.value='';
          }
        });
      }
      render();
      return true;
    };

    const trySetup=()=>{
      if(cancelled) return;
      if(setup()) return;
      if(++attempts<120) requestAnimationFrame(trySetup);
    };
    trySetup();
    return()=>{cancelled=true;};
  },[rows]);

  useEffect(()=>{
    const applySuccess=()=>{
      const success=document.querySelector('.success');
      if(!success) return false;

      const top=success.closest('.shell')?.previousElementSibling;
      const brand=top?.querySelector('.brand');
      if(brand && !brand.querySelector('[data-vsi-success-logo]')){
        brand.innerHTML='<img src="/vsi-logo-white.png" alt="Visionary Students Initiative" class="vsi-logo" data-vsi-success-logo="true"/><small>VISIONARY STUDENTS INITIATIVE</small>';
        const inner=top.querySelector('.topbar-inner');
        let span=inner?.querySelector(':scope > span');
        if(!span && inner){span=document.createElement('span');inner.appendChild(span);}
        if(span) span.textContent='ACTIVITY REPORT';
      }

      if(!success.querySelector('[data-submit-another]')){
        const p=success.querySelector('p:last-of-type');
        const a=document.createElement('a');
        a.href='/activity-report';
        a.dataset.submitAnother='true';
        a.className='submit another-report';
        a.textContent='Submit another activity report →';
        p?.after(a);
      }
      return true;
    };

    if(applySuccess()) return;
    const observer=new MutationObserver(()=>{if(applySuccess()) observer.disconnect();});
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  return null;
}
