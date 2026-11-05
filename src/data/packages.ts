// Packages, add-ons and the deposit. Shared by the site pages AND the Stripe
// checkout function (netlify/functions/create-checkout.mts), so prices only
// live here.
//
// TODO: all dollar amounts below are PLACEHOLDERS pending confirmation.

export type PackageId = 'recruiting' | 'field-service' | 'bookings';

export interface Package {
  id: PackageId;
  name: string;
  /** Who it's for, in one line. */
  audience: string;
  /** The pitch — what this build replaces. */
  summary: string;
  /** "Starting at" price in whole US dollars. */
  startingAt: number;
  includes: string[];
  /** Industries that typically pick this package. */
  goodFor: string[];
}

// ---------------------------------------------------------------------------
// Base model — the ready-made version of any package. Not custom.
// TODO: confirm price.
export const BASE_MODEL_USD = 500;

export const baseModel = {
  name: 'Base model',
  price: BASE_MODEL_USD,
  summary:
    'The standard version of any package, set up with your logo, colours and company details. Ready in days, not weeks. Upgrade to a custom build later and the price comes off.',
  includes: [
    'Every standard feature of the package you pick',
    'Your logo, colours and business details',
    'Set up on the hosting option you choose',
    'A short walkthrough call and written guide',
  ],
  notIncluded: ['Custom workflows or screens', 'Integrations with other software', 'Data migration from old systems'],
};

// ---------------------------------------------------------------------------
// The fixed one-time payments the website itself can take. Everything beyond
// these is invoiced through Stripe for the agreed amount.
export type PaymentId = 'reserve' | 'kickoff' | 'base';

export interface SitePayment {
  id: PaymentId;
  name: string;
  /** Whole US dollars. */
  amount: number;
  /** When in the process this is paid. */
  when: string;
  description: string;
}

export const sitePayments: SitePayment[] = [
  {
    id: 'reserve',
    name: 'Reserve a build slot',
    amount: 50,
    when: 'After your free demo',
    description:
      'Holds your place in the build queue while we write up your scope. Refunded in full if we agree before scoping that it is not a fit.',
  },
  {
    id: 'kickoff',
    name: 'Kickoff payment',
    amount: 450,
    when: 'When you approve the written scope',
    description: 'Starts your custom build. Applied to your final one-time price, like the reservation.',
  },
  {
    id: 'base',
    name: 'Base model',
    amount: BASE_MODEL_USD,
    when: 'Any time',
    description:
      'The full price of a base model: the standard version of one package with your branding. Pick the package and where you want it to live below.',
  },
];

export const RESERVE_USD = sitePayments[0].amount;
export const KICKOFF_USD = sitePayments[1].amount;

export function getPayment(id: string): SitePayment | undefined {
  return sitePayments.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Where the system lives. Three options, from "nothing per month" to "we run
// everything". Hosted tiers are priced mainly by team size and storage.
// TODO: all monthly / yearly amounts are PLACEHOLDERS pending confirmation.
export type HostingId = 'local' | 'own-cloud' | 'hosted';

export interface HostingOption {
  id: HostingId;
  name: string;
  tagline: string;
  monthly: number | null; // null = "varies" (hosted tiers)
  monthlyNote: string;
  bestFor: string;
  includes: string[];
  limits: string[];
}

export const hostingOptions: HostingOption[] = [
  {
    id: 'local',
    name: 'Local',
    tagline: 'Runs on your own computer or tablet. Nothing per month.',
    monthly: 0,
    monthlyNote: 'No monthly cost. Your own domain if you want one.',
    bestFor: 'A solo operator or a single office computer.',
    includes: [
      'Your data stays on your device',
      'Automatic backup file on your computer',
      'Optional backup to your Google Drive',
      'Works offline',
    ],
    limits: ['One device at a time; no live sync between office and field', 'Photos and files limited by device space'],
  },
  {
    id: 'own-cloud',
    name: 'Your own cloud',
    tagline: 'Your Google account, your domain. You pay Google directly.',
    monthly: 0,
    monthlyNote: 'Nothing to Vulcan. Google bills you directly, typically $0 to $25 a month for a small business.',
    bestFor: 'A team that wants the office and the field on one system and wants to own every account.',
    includes: [
      'Database and file storage in your own Firebase account',
      'Your own domain',
      'Techs and office share one live system',
      'We set it up; you hold the keys',
    ],
    limits: ['You manage the Google billing account', 'Updates and support are a separate care plan'],
  },
  {
    id: 'hosted',
    name: 'Vulcan Hosted',
    tagline: 'We run it. Hosting, storage, backups, updates and support, one bill.',
    monthly: null,
    monthlyNote: 'Priced by team size and storage. Cancel any time; your data exports with you.',
    bestFor: 'A business that wants it to just work and never think about servers.',
    includes: [
      'Hosting, database and file storage',
      'Nightly backups',
      'Updates and fixes included',
      'Phone and email support',
      'Annual renewal included',
    ],
    limits: [],
  },
];

export interface HostedTier {
  id: 'hosted-small' | 'hosted-shop' | 'hosted-fleet';
  name: string;
  monthly: number;
  users: number;
  storageGb: number;
  support: string;
}

export const hostedTiers: HostedTier[] = [
  { id: 'hosted-small', name: 'Small', monthly: 49, users: 3, storageGb: 10, support: 'Email support' },
  { id: 'hosted-shop', name: 'Shop', monthly: 99, users: 10, storageGb: 50, support: 'Phone and email support' },
  { id: 'hosted-fleet', name: 'Fleet', monthly: 199, users: 25, storageGb: 250, support: 'Priority phone and email support' },
];

// Optional yearly plan for Local and Own-cloud customers. The software keeps
// working without it; this covers keeping it current.
export const carePlan = {
  id: 'care-plan' as const,
  name: 'Care plan',
  yearly: 299,
  includes: ['Updates and security fixes', 'Bug fixes', 'Phone and email support', 'Small tweaks (an hour a month)'],
};

// ---------------------------------------------------------------------------
// Everything Stripe Checkout can be asked for, one-time or recurring.
export interface CheckoutItem {
  id: string;
  name: string;
  amount: number;
  interval: 'once' | 'month' | 'year';
  description: string;
}

export const checkoutItems: CheckoutItem[] = [
  ...sitePayments.map<CheckoutItem>((p) => ({
    id: p.id,
    name: p.name,
    amount: p.amount,
    interval: 'once',
    description: p.description,
  })),
  ...hostedTiers.map<CheckoutItem>((t) => ({
    id: t.id,
    name: `Vulcan Hosted — ${t.name}`,
    amount: t.monthly,
    interval: 'month',
    description: `Up to ${t.users} users, ${t.storageGb} GB storage, ${t.support.toLowerCase()}. Hosting, backups, updates and renewal included. Cancel any time.`,
  })),
  {
    id: carePlan.id,
    name: carePlan.name,
    amount: carePlan.yearly,
    interval: 'year',
    description: 'Updates, fixes and support for a system you host yourself. Renews yearly; cancel any time.',
  },
];

export function getCheckoutItem(id: string): CheckoutItem | undefined {
  return checkoutItems.find((c) => c.id === id);
}

export function formatMonthly(amount: number): string {
  return `${formatUsd(amount)}/mo`;
}

export const packages: Package[] = [
  {
    id: 'field-service',
    name: 'Field Service',
    audience: 'HVAC, electrical, plumbing, pool, pest, lawn, generators, any trade that sends techs out.',
    summary:
      'Replace the clipboard. Customers, jobs, scheduling and digital work tickets your techs fill out from their phone in a few taps.',
    startingAt: 4500,
    includes: [
      'Customer records with full job history',
      'Drag-and-drop schedule and dispatch board',
      'Digital work tickets with photos, signatures and parts used',
      'Quotes and invoices, paid online by card',
      'Text and email reminders for customers',
      'Crew and subcontractor coordination',
      'Works on any phone, tablet or laptop',
    ],
    goodFor: ['HVAC', 'Electrical', 'Plumbing', 'Pool service', 'Pest control', 'Lawn care', 'Generators', 'Facility maintenance'],
  },
  {
    id: 'recruiting',
    name: 'Recruiting & Staffing',
    audience: 'Staffing agencies, recruiters, executive search, temp placement.',
    summary:
      'Every candidate, client and job order in one place, with a pipeline that tells you who to call next instead of a spreadsheet that tells you nothing.',
    startingAt: 3500,
    includes: [
      'Candidate database with resumes, notes and tags',
      'Client and job-order tracking',
      'Pipeline board: sourced → screened → submitted → placed',
      'Follow-up reminders so nobody goes cold',
      'Email and text from inside the system',
      'Placement and fee reporting',
      'Works on any phone, tablet or laptop',
    ],
    goodFor: ['Staffing agencies', 'Executive search', 'Temp placement', 'Real estate teams', 'Consulting firms', 'Agencies'],
  },
  {
    id: 'bookings',
    name: 'Bookings & Tours',
    audience: 'Boat tours, charters, rentals, classes, studios, anyone who sells time slots.',
    summary:
      'Customers book and pay in advance from their phone, day or night. You stop standing on the dock hoping someone walks up.',
    startingAt: 2500,
    includes: [
      'Online booking calendar with real-time availability',
      'Prepayment or deposits by card at booking',
      'Automatic confirmations and reminders',
      'Customer list with booking history',
      'Waivers and intake forms',
      'Daily manifest and check-in',
      'Works on any phone, tablet or laptop',
    ],
    goodFor: ['Boat tours', 'Charters', 'Rentals', 'Gyms & trainers', 'Studios & classes', 'Event planners', 'Tutoring'],
  },
];

export interface AddOn {
  name: string;
  description: string;
  /** Starting price in whole US dollars, or null when it's quoted per project. */
  startingAt: number | null;
  /** Shown when the add-on needs ongoing online storage in the client's own account. */
  needsStorage?: boolean;
}

export const addOns: AddOn[] = [
  {
    name: 'Customer equipment tracking',
    description:
      'Every unit you service — serials, model, install date, photos, every ticket ever written against it. Techs see the history before they open the panel.',
    startingAt: 1500,
    needsStorage: true,
  },
  {
    name: 'Inventory & parts tracking',
    description: 'Know what is on the truck, in the shop and on order. Parts used on a ticket come off the count automatically.',
    startingAt: 1200,
  },
  {
    name: 'Training & onboarding',
    description: 'We train your office staff and your techs on their own devices, then leave you a short written guide.',
    startingAt: 500,
  },
  {
    name: 'Customer portal',
    description: 'Customers log in to see their history, approve quotes and pay invoices without calling you.',
    startingAt: 900,
  },
  {
    name: 'Reporting dashboard',
    description: 'Revenue, jobs per tech, open invoices, no-show rate. The numbers you actually run the business on.',
    startingAt: 700,
  },
  {
    name: 'Anything else',
    description: 'Every build is custom. If your business has a process nobody else has, we build around it.',
    startingAt: null,
  },
];

export function getPackage(id: string): Package | undefined {
  return packages.find((p) => p.id === id);
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
