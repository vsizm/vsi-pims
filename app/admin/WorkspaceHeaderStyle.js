'use client';

import { useEffect } from 'react';

const PAGE_META = {
  '/admin': { number: '01', kicker: 'VSI ADMINISTRATION · MANAGEMENT INTELLIGENCE' },
  '/admin/reports': { number: '02', kicker: 'VSI ADMINISTRATION · ACTIVITY REPORTS' },
};

export default function WorkspaceHeaderStyle() {
  useEffect(() => {
    if (window.location.pathname === '/admin/finance') return;

    const meta = PAGE_META[window.location.pathname];
    if (!meta) return;

    const styleId = 'vsi-workspace-header-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .vsi-workspace-banner{width:100%;display:flex;align-items:center;gap:16px;padding:20px 24px;border-radius:16px 16px 0 0;background:#002D62;box-shadow:0 8px 22px rgba(0,45,98,.12);box-sizing:border-box}
        .vsi-workspace-badge{width:40px;height:40px;min-width:40px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FFC107;color:#002D62;font-size:13px;font-weight:900;line-height:1}
        .vsi-workspace-copy{display:flex;flex-direction:column;gap:4px;min-width:0}
        .vsi-workspace-copy .kicker{margin:0;color:#CBD5E1;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;line-height:1.2}
        .vsi-workspace-copy .title{margin:0;color:#fff;font-size:21px;font-weight:800;letter-spacing:-.02em;line-height:1.2}
        .vsi-workspace-copy .description{margin:0;color:#CBD5E1;font-size:12px;font-weight:400;line-height:1.45}
        .vsi-workspace-banner .vsi-workspace-action{margin-left:auto;flex:0 0 auto}
        .vsi-workspace-banner .vsi-workspace-action a,.vsi-workspace-banner .vsi-workspace-action button{border-color:rgba(255,255,255,.22)!important;background:rgba(255,255,255,.08)!important;color:#fff!important}
        @media(max-width:720px){.vsi-workspace-banner{padding:17px 18px;gap:12px}.vsi-workspace-badge{width:36px;height:36px;min-width:36px}.vsi-workspace-copy .title{font-size:19px}}
      `;
      document.head.appendChild(style);
    }

    const apply = () => {
      const header = document.querySelector('.phase1-header, .admin-header');
      if (!header || header.dataset.workspaceStyled === 'true') return;

      const copy = header.querySelector(':scope > div');
      if (!copy) return;

      const kicker = copy.querySelector('.phase1-kicker, .admin-kicker');
      const title = copy.querySelector('h1');
      const description = copy.querySelector('p');
      if (!title) return;

      const banner = document.createElement('div');
      banner.className = 'vsi-workspace-banner';

      const badge = document.createElement('div');
      badge.className = 'vsi-workspace-badge';
      badge.textContent = meta.number;

      const text = document.createElement('div');
      text.className = 'vsi-workspace-copy';

      const kickerEl = document.createElement('div');
      kickerEl.className = 'kicker';
      kickerEl.textContent = kicker?.textContent || meta.kicker;
      const titleEl = document.createElement('h1');
      titleEl.className = 'title';
      titleEl.textContent = title.textContent;
      const descEl = document.createElement('p');
      descEl.className = 'description';
      descEl.textContent = description?.textContent || '';

      text.append(kickerEl, titleEl, descEl);
      banner.append(badge, text);

      const action = header.querySelector(':scope > a, :scope > button');
      if (action) {
        const actionWrap = document.createElement('div');
        actionWrap.className = 'vsi-workspace-action';
        actionWrap.append(action.cloneNode(true));
        banner.append(actionWrap);
      }

      header.replaceWith(banner);
      header.dataset.workspaceStyled = 'true';
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); document.getElementById(styleId)?.remove(); };
  }, []);

  return null;
}
