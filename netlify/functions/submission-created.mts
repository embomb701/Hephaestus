// Netlify runs a function named `submission-created` after every verified
// Netlify Forms submission. We use it to send two emails through Resend:
//   1. a notification to the business inbox with the demo request, and
//   2. an auto-reply to the prospect so they know it landed.
// Netlify Forms still stores the submission, so nothing is lost if Resend is
// down or RESEND_API_KEY is missing — the function just logs and exits.

import { Resend } from 'resend';
import { site } from '../../src/data/site';
import { getPackage } from '../../src/data/packages';

// Netlify may hand us a modern Request or a legacy event with a string body.
type SubmissionEvent = Request | { body: string };

async function readPayload(event: SubmissionEvent): Promise<{ form_name: string; data: DemoRequest }> {
  const json = typeof (event as Request).json === 'function' ? await (event as Request).json() : JSON.parse((event as { body: string }).body);
  return json.payload;
}

interface DemoRequest {
  name?: string;
  business?: string;
  phone?: string;
  email?: string;
  package?: string;
  message?: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export default async (event: SubmissionEvent) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('submission-created: RESEND_API_KEY not set; skipping emails');
    return new Response('skipped', { status: 200 });
  }

  const payload = await readPayload(event);
  if (payload.form_name !== 'demo-request') {
    return new Response('ignored', { status: 200 });
  }

  const d = payload.data;
  const pkg = d.package ? getPackage(d.package)?.name ?? d.package : 'not chosen';
  const from = `${site.name} <${site.email}>`;
  const resend = new Resend(apiKey);

  // 1. Notify the business.
  const notify = resend.emails.send({
    from,
    to: process.env.NOTIFY_EMAIL ?? site.email,
    replyTo: d.email,
    subject: `Demo request — ${d.business ?? d.name ?? 'new lead'}`,
    text: [
      `New free-demo request from ${site.url}`,
      '',
      `Name:      ${d.name ?? ''}`,
      `Business:  ${d.business ?? ''}`,
      `Phone:     ${d.phone ?? ''}`,
      `Email:     ${d.email ?? ''}`,
      `Package:   ${pkg}`,
      '',
      'What is slowing them down:',
      d.message?.trim() || '(nothing written)',
    ].join('\n'),
  });

  // 2. Auto-reply to the prospect, if they gave a usable address.
  const reply = d.email
    ? resend.emails.send({
        from,
        to: d.email,
        subject: `Got it — your free ${site.name} demo`,
        text: [
          `Hi ${d.name?.split(' ')[0] ?? 'there'},`,
          '',
          `Thanks for reaching out. Your demo request is in and we'll reply within one business day to set a time.`,
          '',
          `If it's quicker, call ${site.phone}.`,
          '',
          `In the meantime, the sample builds are at ${site.url}/demos.`,
          '',
          `— ${site.name}`,
          site.url,
        ].join('\n'),
        html: `<p>Hi ${esc(d.name?.split(' ')[0] ?? 'there')},</p>
<p>Thanks for reaching out. Your demo request is in and we'll reply within one business day to set a time.</p>
<p>If it's quicker, call <a href="${site.phoneHref}">${site.phone}</a>.</p>
<p>In the meantime, the sample builds are at <a href="${site.url}/demos">${site.url}/demos</a>.</p>
<p>— ${site.name}<br><a href="${site.url}">${site.url}</a></p>`,
      })
    : Promise.resolve(null);

  const results = await Promise.allSettled([notify, reply]);
  for (const r of results) {
    if (r.status === 'rejected') console.error('submission-created: email failed', r.reason);
    else if (r.value && 'error' in r.value && r.value.error) console.error('submission-created: resend error', r.value.error);
  }
  return new Response('ok', { status: 200 });
};
