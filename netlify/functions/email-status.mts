// GET /api/email-status — read-only diagnostics for the Resend integration.
// Reports whether the API key is visible to functions and Resend's view of
// the sending domain. Never returns the key itself.

import type { Config } from '@netlify/functions';
import { Resend } from 'resend';
import { site } from '../../src/data/site';

export default async (): Promise<Response> => {
  const apiKey = process.env.RESEND_API_KEY;
  const out: Record<string, unknown> = {
    resendKey: apiKey ? 'present' : 'MISSING',
    notifyTo: process.env.NOTIFY_EMAIL ?? site.email,
    from: site.email,
  };

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.domains.list();
      out.domains = error
        ? { error }
        : (data?.data ?? []).map((d) => ({ name: d.name, status: d.status, region: d.region }));
    } catch (e) {
      out.domains = { threw: String(e) };
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};

export const config: Config = {
  path: '/api/email-status',
};
