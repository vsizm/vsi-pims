'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminNavLearningLink() {
  const pathname = usePathname();

  useEffect(() => {
    const navs = document.querySelectorAll('.admin-sidebar nav');
    if (!navs.length) return;

    const intelligenceNav = navs[navs.length - 1];
    if (!intelligenceNav || intelligenceNav.querySelector('a[href="/admin/learning"]')) return;

    const link = document.createElement('a');
    link.href = '/admin/learning';
    link.className = pathname === '/admin/learning' ? 'active' : '';
    link.innerHTML = '<span class="nav-dot intel-dot"></span>Learning & Follow-up';
    intelligenceNav.appendChild(link);
  }, [pathname]);

  return null;
}
