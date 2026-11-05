// POST /api/pay — creates a Stripe Checkout session for one of the two fixed
// site payments (reserve $50 / kickoff $450) and redirects the customer to
// Stripe. Amounts come from src/data/packages.ts so the site and the checkout
// can never disagree. Anything beyond these two is invoiced from the Stripe
// dashboard, not through the site.

import type { Config } from '@netlify/functions';
import Stripe from 'stripe';
import { formatUsd, getPackage, getPayment } from '../../src/data/packages';

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

  const payment = getPayment(String(form.get('payment') ?? ''));
  if (!payment) {
    return new Response('Unknown payment', { status: 400 });
  }
  // Package is optional context — it just labels the payment in Stripe.
  const pkg = getPackage(String(form.get('package') ?? ''));
  const business = String(form.get('business') ?? '').trim().slice(0, 120);

  const origin = new URL(req.url).origin;
  const stripe = new Stripe(secret);

  const description = [
    payment.description,
    pkg ? `Package: ${pkg.name} (starting at ${formatUsd(pkg.startingAt)}).` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    submit_type: 'pay',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: payment.amount * 100,
          product_data: {
            name: `Vulcan — ${payment.name}`,
            description,
          },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    metadata: {
      payment: payment.id,
      package: pkg?.id ?? '',
      business,
    },
    success_url: `${origin}/reserve/success?paid=${payment.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reserve/cancelled?payment=${payment.id}${pkg ? `&package=${pkg.id}` : ''}`,
  });

  if (!session.url) {
    return new Response('Stripe did not return a checkout URL', { status: 502 });
  }
  return Response.redirect(session.url, 303);
};

export const config: Config = {
  path: '/api/pay',
};
