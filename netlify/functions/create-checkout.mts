// POST /api/pay — creates a Stripe Checkout session for one of the items in
// src/data/packages.ts (`checkoutItems`): a one-time site payment (reserve,
// kickoff, base model), a monthly Vulcan Hosted tier, or the yearly care plan.
// Amounts live only in that file so the site and the checkout never disagree.
// Anything else (custom build balances, add-ons) is invoiced from the Stripe
// dashboard, not through the site.

import type { Config } from '@netlify/functions';
import Stripe from 'stripe';
import { formatUsd, getCheckoutItem, getPackage } from '../../src/data/packages';

const HOSTING_LABELS: Record<string, string> = {
  local: 'Local',
  'own-cloud': 'Your own cloud',
  hosted: 'Vulcan Hosted',
};

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return new Response('Online payment is not configured yet. Please email or call us and we will send a Stripe invoice.', {
      status: 503,
    });
  }

  const form = await req.formData();

  // Honeypot — bots fill every field.
  if (form.get('company_site')) {
    return Response.redirect(new URL('/reserve/success', req.url).toString(), 303);
  }

  const item = getCheckoutItem(String(form.get('payment') ?? ''));
  if (!item) {
    return new Response('Unknown payment', { status: 400 });
  }
  // Optional context — labels the payment in Stripe so the follow-up is obvious.
  const pkg = getPackage(String(form.get('package') ?? ''));
  const hosting = String(form.get('hosting') ?? '');
  const business = String(form.get('business') ?? '').trim().slice(0, 120);

  const origin = new URL(req.url).origin;
  const stripe = new Stripe(secret);

  const description = [
    item.description,
    pkg ? `Package: ${pkg.name} (custom builds start at ${formatUsd(pkg.startingAt)}).` : null,
    HOSTING_LABELS[hosting] ? `Hosting: ${HOSTING_LABELS[hosting]}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const recurring = item.interval === 'once' ? undefined : { interval: item.interval };

  const session = await stripe.checkout.sessions.create({
    mode: recurring ? 'subscription' : 'payment',
    ...(recurring ? {} : { submit_type: 'pay' as const }),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: item.amount * 100,
          product_data: {
            name: `Vulcan — ${item.name}`,
            description,
          },
          ...(recurring ? { recurring } : {}),
        },
      },
    ],
    phone_number_collection: { enabled: true },
    metadata: {
      payment: item.id,
      package: pkg?.id ?? '',
      hosting,
      business,
    },
    ...(recurring ? { subscription_data: { metadata: { payment: item.id, package: pkg?.id ?? '', business } } } : {}),
    success_url: `${origin}/reserve/success?paid=${item.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reserve/cancelled?payment=${item.id}${pkg ? `&package=${pkg.id}` : ''}`,
  });

  if (!session.url) {
    return new Response('Stripe did not return a checkout URL', { status: 502 });
  }
  return Response.redirect(session.url, 303);
};

export const config: Config = {
  path: '/api/pay',
};
