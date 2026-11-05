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

// The two fixed payments the website itself can take. Everything beyond these
// is invoiced through Stripe for the agreed amount.
export type PaymentId = 'reserve' | 'kickoff';

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
    description: 'Starts the build. Applied to your final one-time price, like the reservation.',
  },
];

export const RESERVE_USD = sitePayments[0].amount;
export const KICKOFF_USD = sitePayments[1].amount;

export function getPayment(id: string): SitePayment | undefined {
  return sitePayments.find((p) => p.id === id);
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
