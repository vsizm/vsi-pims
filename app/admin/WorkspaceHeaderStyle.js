'use client';

import { useEffect } from 'react';

const PAGE_NUMBERS = { '/admin': '01', '/admin/reports': '02' };

export default function WorkspaceHeaderStyle() {
  useEffect(() => {
    if (window.location.pathname === '/admin/finance') return;
    const number = PAGE_NUMBERS[window.location.pathname];
    if (!number) return;

    const styleId = 'vsi-workspace-header-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .vsi-workspace-header{width:100%;display:flex!important;align-items:center!important;gap:16px!important;padding:20px 24px!important;border-radius:16px 16px 0 0!important;background:#002D62!important;box-shadow:0 8px 22px rgba(0,45,98,.12)!important;box-sizing:border-box!important;margin:0 0 18px!important}
        .vsi-workspace-header .vsi-workspace-badge{width:40px;height:40px;min-width:40px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FFC107;color:#002D62;font-size:13px;font-weight:900;line-height:1}
        .vsi-workspace-header .vsi-workspace-copy{min-width:0;display:flex;flex-direction:column;gap:4px;flex:1;align-items:flex-start!important;text-align:left!important}
        .vsi-workspace-header .vsi-workspace-copy>*{width:auto!important;max-width:100%;text-align:left!important}
        .vsi-workspace-header .vsi-workspace-copy .admin-kicker{margin:0!important;color:#CBD5E1!important;font-size:10px!important;font-weight:800!important;letter-spacing:.11em;text-transform:uppercase;line-height:1.2;text-align:left!important}
        .vsi-workspace-header .vsi-workspace-copy h1{margin:0!important;color:#fff!important;font-size:21px!important;font-weight:800!important;letter-spacing:-.02em;line-height:1.2;text-align:left!important}
        .vsi-workspace-header .vsi-workspace-copy p{margin:0!important;color:#CBD5E1!important;font-size:12px!important;font-weight:400;line-height:1.45;text-align:left!important}
        .vsi-workspace-header .vsi-workspace-action{margin-left:auto;flex:0 0 auto}
        .vsi-workspace-header .vsi-workspace-action>*{border-color:rgba(255,255,255,.22)!important;background:rgba(255,255,255,.08)!important;color:#fff!important}
        .register-section .workspace-register-head{display:flex!important;align-items:center!important;gap:16px!important;padding:20px 24px!important;background:#002D62!important;border-bottom:0!important;border-radius:16px 16px 0 0!important;text-align:left!important}
        .register-section .workspace-register-head>div{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:4px!important;text-align:left!important}
        .register-section .workspace-register-head h2{margin:0!important;color:#fff!important;font-size:21px!important;font-weight:800!important;line-height:1.2!important;letter-spacing:-.02em;text-align:left!important}
        .register-section .workspace-register-head p{margin:0!important;color:#CBD5E1!important;font-size:12px!important;font-weight:400!important;line-height:1.45!important;text-align:left!important}
        @media(max-width:720px){.vsi-workspace-header{padding:17px 18px!important;gap:12px!important}.vsi-workspace-header .vsi-workspace-badge{width:36px;height:36px;min-width:36px}.vsi-workspace-header .vsi-workspace-copy h1{font-size:19px!important}.register-section .workspace-register-head{padding:17px 18px!important}}
      `;
      document.head.appendChild(style);
    }

    const apply = () => {
      const header = document.querySelector('.phase1-header, .admin-header');
      if (!header || header.classList.contains('vsi-workspace-header')) return;
      const copy = header.querySelector(':scope > div');
      if (!copy) return;
      const title = copy.querySelector('h1');
      if (!title) return;

      header.classList.add('vsi-workspace-header');
      const originalChildren = [...copy.children];
      const badge = document.createElement('div');
      badge.className = 'vsi-workspace-badge';
      badge.textContent = number;

      const newCopy = document.createElement('div');
      newCopy.className = 'vsi-workspace-copy';
      originalChildren.forEach((child) => newCopy.appendChild(child));
      copy.replaceWith(newCopy);
      header.prepend(badge);

      const action = header.querySelector(':scope > a, :scope > button');
      if (action && !action.parentElement.classList.contains('vsi-workspace-action')) {
        const wrap = document.createElement('div');
        wrap.className = 'vsi-workspace-action';
        action.parentNode.insertBefore(wrap, action);
        wrap.appendChild(action);
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); document.getElementById(styleId)?.remove(); };
  }, []);
  return null;
}
