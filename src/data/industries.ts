// Industries we market to. Regulated fields (medical/dental/vet, financial
// advisors, insurance, law, mortgage) are intentionally left off for now.

export interface IndustryGroup {
  title: string;
  items: string[];
}

export const industries: IndustryGroup[] = [
  {
    title: 'Service & field work',
    items: [
      'HVAC',
      'Electrical',
      'Plumbing',
      'Generators & critical power',
      'Elevators & lifts',
      'Pool service',
      'Pest control',
      'Lawn care',
      'Multi-trade contractors',
      'Facility maintenance',
      'Property management',
      'Telecom & utility field techs',
    ],
  },
  {
    title: 'People businesses',
    items: ['Recruiting & staffing', 'Executive search', 'Real estate teams', 'Consulting firms', 'Marketing agencies', 'Accounting & bookkeeping', 'Architecture & engineering'],
  },
  {
    title: 'Bookings & customers who come back',
    items: ['Boat tours & charters', 'Rentals', 'Gyms & personal trainers', 'Studios & classes', 'Auto service shops', 'Event & wedding planners', 'Tutoring & education', 'Nonprofits'],
  },
  {
    title: 'Sales & product',
    items: ['B2B equipment sales', 'Wholesale & distribution', 'Manufacturers who sell direct', 'Construction contractors', 'Franchise operators'],
  },
];
