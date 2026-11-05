# Hephaestus — the Vulcan website

Marketing and sales site for **Vulcan**: custom CRM, scheduling, booking, work-ticket and
equipment-tracking systems for small businesses. One-time payment, no subscriptions.

Built with [Astro](https://astro.build) (static), hosted on Netlify. Contact form uses Netlify Forms.

**What's for sale** (all defined in `src/data/packages.ts`):

| Thing | Price | Stripe mode | Where on the site |
| --- | --- | --- | --- |
| Base model (standard version of one package, branded) | $500 one-time | payment | `/packages`, `/pay` |
| Custom build: reserve slot | $50 one-time | payment | `/packages`, `/pay` |
| Custom build: kickoff | $450 one-time | payment | `/pay` |
| Custom build: balance, add-ons, changes | agreed amount | **manual Stripe invoice** | — |
| Vulcan Hosted Small / Shop / Fleet | $49 / $99 / $199 per month | subscription | `/hosting` |
| Care plan (for self-hosted) | $299 per year | subscription | `/hosting` |

Hosting options: **Local** (device + backup file + optional Google Drive, $0/mo), **Own cloud** (customer's
Firebase account, they pay Google), **Vulcan Hosted** (tiers above). No Stripe products need to exist;
Checkout sessions are created with inline `price_data`, one-time or recurring.

## Run it locally

```sh
npm install
npm run dev        # site only, http://localhost:4321
```

To test the Stripe function locally you need the Netlify CLI and a `.env`:

```sh
cp .env.example .env     # then put a Stripe TEST key in it
npx netlify dev          # site + functions, http://localhost:8888
```

Other scripts: `npm run build` (output in `dist/`), `npm run preview`, `npm run check` (type-check).

## Where things live

| What | Where |
| --- | --- |
| Packages, add-ons, site payments, **prices** | `src/data/packages.ts` |
| Phone, email, domain, service area | `src/data/site.ts` |
| Industry list | `src/data/industries.ts` |
| Pages | `src/pages/` (`index`, `packages`, `hosting`, `demos`, `pay`, `contact`, `thanks`, `reserve/success`, `reserve/cancelled`, `404`) |
| Stripe checkout | `netlify/functions/create-checkout.mts` → served at `POST /api/pay` |
| Pay button | `src/components/PayButton.astro` (`payment` = any id in `checkoutItems`) |
| Demo request form | `src/components/DemoRequestForm.astro` (Netlify form named `demo-request`) |
| Brand colours and base styles | `src/styles/global.css` |

Prices only live in `packages.ts`. The site pages and the Stripe function both read from it, so they can't
disagree.

## Before launch — placeholders to replace

Search the repo for `TODO`. The list today:

- [ ] Real phone number and email — `src/data/site.ts`
- [ ] Real domain — `src/data/site.ts` **and** `site` in `astro.config.mjs`
- [ ] Confirm service area wording — `src/data/site.ts`
- [ ] **Confirm prices** — `src/data/packages.ts`: custom starting-at prices, add-ons, hosted tier prices/limits, care plan. (Base $500 and the $50 / $450 custom payments are confirmed.)
- [ ] Confirm the FAQ policies on the home page: build timeline ("three to six weeks") and reservation refund terms
- [ ] `public/robots.txt` currently blocks all crawlers. Flip to `Allow: /` at launch.

## Netlify setup

1. New site from this repo. Build command and publish dir are already in `netlify.toml`.
2. **Environment variables** → add `STRIPE_SECRET_KEY` (live key for production, test key for deploy previews
   if you want).
3. **Forms** → after the first deploy, Netlify will list the `demo-request` form. Add an email notification
   under Forms → Notifications so submissions reach your inbox.
4. **Stripe** → in the Stripe dashboard, make sure the business name and support email are set; they show on
   the checkout page and receipt.

No Stripe webhook is needed: Stripe emails the receipt and the dashboard records each payment with
`payment` (item id), `package`, `hosting` and `business` in its metadata. Subscriptions carry the same
metadata and show under Stripe → Subscriptions; customers cancel from the receipt's link or you cancel
them in the dashboard. Add one later if you want payments
to create records somewhere.

**Invoicing the balance:** Stripe dashboard → Customers → pick the customer Checkout created → Create
invoice. Card and bank-transfer payment both work on invoices.

## Deploying

Pushing to `main` deploys automatically once the Netlify site is connected. Don't connect it until the site
is cleared to go public.
