// Business identity and contact details. Everything marked TODO is a placeholder
// until the real values exist — the site reads from here, so change it once.

export const site = {
  name: 'Vulcan',
  tagline: 'Business software, forged once. Yours forever.',
  description:
    'Vulcan builds CRM, scheduling, online booking, work-ticket and equipment-tracking systems for small businesses. Buy it once and own it. Run it on your own computer for nothing a month, or let us host it. No required subscription.',

  phone: '(802) 416-0914',
  phoneHref: 'tel:+18024160914',
  email: 'hello@vf-customs.com',

  url: 'https://vf-customs.com',

  // Where you're based / who you serve. Used in the footer and SEO copy.
  // TODO: confirm service area
  serviceArea: 'Serving small businesses across the United States',
} as const;
