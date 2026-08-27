'use client';

import { useEffect } from 'react';

export default function EvidenceUploadBridge() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const marker = '__vsiActivityUploadBridgeInstalled';
    if (window[marker]) return;
    window[marker] = true;

    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      const method = String(init.method || (typeof input !== 'string' ? input?.method : 'GET') || 'GET').toUpperCase();

      if (method !== 'POST' || !url.includes('/api/activity-reports') || url.includes('/api/activity-reports/upload')) {
        return originalFetch(input, init);
      }

      const headers = new Headers(init.headers || (typeof input !== 'string' ? input?.headers : undefined));
      const contentType = headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return originalFetch(input, init);

      let payload;
      try { payload = JSON.parse(String(init.body || '')); } catch { return originalFetch(input, init); }

      const fileInput = document.querySelector('input[type="file"]');
      const selectedFiles = fileInput?.files ? Array.from(fileInput.files) : [];
      if (!selectedFiles.length) return originalFetch(input, init);

      try {
        const uploadReference = `pending-${crypto.randomUUID()}`;
        const uploaded = [];

        for (const file of selectedFiles) {
          const form = new FormData();
          form.append('file', file);
          form.append('reference', uploadReference);

          const response = await originalFetch('/api/activity-reports/upload', { method: 'POST', body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || `Unable to upload ${file.name}.`);
          uploaded.push(result);
        }

        payload.attachments = uploaded;
        payload.evidenceUploaded = 'Yes';
        init = { ...init, body: JSON.stringify(payload) };
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message || 'Evidence upload failed. Please try again.' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return originalFetch(input, init);
    };

    return () => {
      if (window.fetch !== originalFetch) window.fetch = originalFetch;
      delete window[marker];
    };
  }, []);

  return null;
}
