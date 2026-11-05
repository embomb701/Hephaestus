// POST /api/reserve  — creates a Stripe Checkout session for a build-slot deposit
// and redirects the customer to Stripe. Prices come from src/data/packages.ts
// so the site and the checkout can never disagree.

import type { Config } from '@netlify/functions';
import Stripe from 'stripe';
import { formatUsd, getPackage } from '../../src/data/packages';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return new Response('Checkout is not configured yet. Please email or call us to reserve a slot.', {
      status: 503,
    });
  }

  const form = await req.formData();
  const pkg = getPackage(String(form.get('package') ?? ''));
  if (!pkg) {
    return new Response('Unknown package', { status: 400 });
  }

  // Honeypot — bots fill every field.
  if (form.get('company_site')) {
    return Response.redirect(new URL('/reserve/success', req.url).toString(), 303);
  }

  const origin = new URL(req.url).origin;
  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    submit_type: 'book',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pkg.deposit * 100,
          product_data: {
            name: `Vulcan build-slot deposit — ${pkg.name}`,
            description: `Reserves your build slot for the ${pkg.name} package (starting at ${formatUsd(
              pkg.startingAt,
            )}). The deposit is applied to your final one-time price.`,
          },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    metadata: { package: pkg.id },
    success_url: `${origin}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reserve/cancelled?package=${pkg.id}`,
  });

  if (!session.url) {
    return new Response('Stripe did not return a checkout URL', { status: 502 });
  }
  return Response.redirect(session.url, 303);
};

export const config: Config = {
  path: '/api/reserve',
};
