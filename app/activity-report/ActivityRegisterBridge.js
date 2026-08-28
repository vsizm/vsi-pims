'use client';

import { useEffect } from 'react';

function findInput(labelText) {
  const labels = Array.from(document.querySelectorAll('.section label'));
  const label = labels.find((el) => el.textContent.trim().startsWith(labelText));
  return label?.querySelector('input, textarea, select') || null;
}

function setReactValue(input, value) {
  if (!input) return;
  const proto = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export default function ActivityRegisterBridge() {
  useEffect(() => {
    const section = Array.from(document.querySelectorAll('.section')).find((el) => el.querySelector('.section-head h2')?.textContent.trim() === 'Activity Identification');
    if (!section) return;
    const grid = section.querySelector('.grid');
    if (!grid || grid.querySelector('[data-vsi-activity-register]')) return;

    const activity = findInput('Activity Title');
    const directorate = findInput('Directorate');
    const project = findInput('Project');
    const code = findInput('Activity / Project Code');

    [activity, directorate, project, code].forEach((input) => {
      const label = input?.closest('label');
      if (label) label.style.display = 'none';
    });

    const wrapper = document.createElement('div');
    wrapper.dataset.vsiActivityRegister = 'true';
    wrapper.className = 'vsi-activity-register full';
    wrapper.innerHTML = `
      <div class="vsi-register-label">Approved VSI Activity</div>
      <div class="vsi-register-help">Search by activity name or activity code. Select an approved activity to populate the fields automatically.</div>
      <input class="vsi-register-search" type="search" placeholder="Search activity name or activity code..." autocomplete="off" />
      <div class="vsi-register-results" role="listbox"></div>
      <div class="vsi-register-selected" hidden>
        <div class="vsi-register-grid">
          <label>Activity Code<input data-vsi="code" readonly /></label>
          <label>Activity Name<input data-vsi="name" readonly /></label>
          <label>Project<input data-vsi="project" readonly /></label>
          <label>Directorate<input data-vsi="directorate" readonly /></label>
          <label>UN SDGs Alignment<textarea data-vsi="sdgs" readonly></textarea></label>
          <label>AU Agenda 2063 Alignment<textarea data-vsi="au" readonly></textarea></label>
        </div>
      </div>`;
    grid.prepend(wrapper);

    const search = wrapper.querySelector('.vsi-register-search');
    const results = wrapper.querySelector('.vsi-register-results');
    const selected = wrapper.querySelector('.vsi-register-selected');
    let cancelled = false;

    const render = (items) => {
      results.innerHTML = '';
      if (!items.length) {
        results.innerHTML = '<div class="vsi-register-empty">No approved activity found.</div>';
        return;
      }
      items.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'vsi-register-result';
        button.innerHTML = `<strong>${item.activityCode}</strong><span>${item.activityName}</span><small>${item.project} · ${item.directorate}</small>`;
        button.addEventListener('click', () => {
          setReactValue(activity, item.activityName);
          setReactValue(code, item.activityCode);
          setReactValue(project, item.project);
          setReactValue(directorate, item.directorate);
          wrapper.querySelector('[data-vsi="code"]').value = item.activityCode;
          wrapper.querySelector('[data-vsi="name"]').value = item.activityName;
          wrapper.querySelector('[data-vsi="project"]').value = item.project;
          wrapper.querySelector('[data-vsi="directorate"]').value = item.directorate;
          wrapper.querySelector('[data-vsi="sdgs"]').value = item.sdgs;
          wrapper.querySelector('[data-vsi="au"]').value = item.au;
          selected.hidden = false;
          results.innerHTML = '';
          search.value = item.activityName;
        });
        results.appendChild(button);
      });
    };

    const load = async () => {
      const q = search.value.trim();
      const response = await fetch(`/api/approved-activities${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      if (!response.ok || cancelled) return;
      render(await response.json());
    };

    search.addEventListener('input', load);
    load();
    return () => { cancelled = true; search.removeEventListener('input', load); wrapper.remove(); };
  }, []);

  return null;
}
