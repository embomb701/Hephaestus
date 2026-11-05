// Business identity and contact details. Everything marked TODO is a placeholder
// until the real values exist — the site reads from here, so change it once.

export const site = {
  name: 'Vulcan',
  tagline: 'Business software, forged once. Yours forever.',
  description:
    'Vulcan builds custom CRM, scheduling, online booking, work-ticket and equipment-tracking systems for small businesses. One-time payment. No subscriptions. You own it.',

  // TODO: real contact details
  phone: '(000) 000-0000',
  phoneHref: 'tel:+10000000000',
  email: 'hello@vulcan.example',

  // TODO: real domain (also update `site` in astro.config.mjs)
  url: 'https://vulcan.example',

  // Where you're based / who you serve. Used in the footer and SEO copy.
  // TODO: confirm service area
  serviceArea: 'Serving small businesses across the United States',
} as const;
