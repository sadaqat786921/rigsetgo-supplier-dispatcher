import type { AppState, Application } from './types';

/** The demo "today". Every date in the sample data is relative to this day. */
/** The signed-in person in this demo: Darnell Brooks, Dispatcher (team member M-2). */
export const ME = { id: 'M-2', name: 'Darnell Brooks', first: 'Darnell', initials: 'DB', role: 'Dispatcher', email: 'darnell@atlantaheavyrentals.com', phone: '(404) 555-0142', admin: 'Mark Rivera' };

export const TODAY = '2026-11-20';
/** RigSetGo commission taken from the supplier's rental amount. */
export const FEE_RATE = 0.12;

export const SECTIONS = [
  'Dashboard',
  'Storefront',
  'Equipment',
  'Pricing',
  'Calendar',
  'Quote Requests',
  'Bookings',
  'Deliveries & Tracking',
  'Compliance',
  'Reviews',
  'Support Cases',
  'Earnings & Payouts',
];

export const CATEGORIES = ['Excavators', 'Loaders', 'Compaction', 'Pipelayers', 'Dump trucks', 'Mini excavators'];

/** Documents required for each equipment category (list to be confirmed by Nick). */
export const REQUIRED_DOCS: Record<string, string[]> = {
  Excavators: ['Annual inspection certificate'],
  Loaders: ['Annual inspection certificate'],
  Compaction: ['Annual inspection certificate'],
  Pipelayers: ['Lift inspection certificate', 'Operator certificate'],
  'Dump trucks': ['Annual inspection certificate', 'DOT registration'],
  'Mini excavators': ['Annual inspection certificate'],
};

export const PHOTOS = [
  'images/excavator-sunset.jpg',
  'images/excavator-dusk.jpg',
  'images/excavator-sky.jpg',
  'images/wheel-loaders.jpg',
  'images/road-roller.jpg',
  'images/pipelayers.jpg',
  'images/dump-truck.jpg',
  'images/excavator-banner.jpg',
];

export const emptyApplication = (): Application => ({
  step: 0,
  role: 'supplier',
  name: '',
  email: '',
  phone: '',
  legalName: '',
  contactName: '',
  address: '',
  serviceAreas: ['Atlanta'],
  days: 'Mon – Fri',
  opens: '7:00 AM',
  closes: '6:00 PM',
  delivery: true,
  pickup: true,
  docs: { 'Business license': 'empty', 'Certificate of insurance': 'empty', 'Tax ID (W-9)': 'empty' },
  provider: '',
  status: 'Draft',
});

export const seed = (): AppState => ({
  business: {
    legalName: 'Atlanta Heavy Rentals LLC',
    contactName: 'Mark Rivera',
    phone: '(404) 555-0142',
    email: 'rentals@atlantaheavyrentals.com',
    address: '2150 Marietta Blvd NW, Atlanta, GA 30318',
    about:
      'Family-run equipment rental yard serving metro Atlanta since 2009. Well-kept excavators, loaders, rollers and pipelayers, delivered on time by our own drivers.',
    serviceAreas: ['Atlanta', 'Marietta', 'Decatur', 'Sandy Springs'],
    days: 'Mon – Fri',
    opens: '7:00 AM',
    closes: '6:00 PM',
    delivery: true,
    pickup: true,
    rentalPolicy:
      'Rental days are counted per calendar day. Each day includes 8 engine hours; extra hours are charged as overtime. Equipment must be returned clean and with the same fuel level.',
    cancellationPolicy:
      'Free cancellation up to 48 hours before the start date. Cancellations within 48 hours are charged one rental day.',
    verifiedOn: '2026-09-14',
  },
  payoutAccount: { provider: 'Stripe', bank: 'Truist Bank', last4: '4417', status: 'Connected' },
  equipment: [
    {
      id: 'EQ-101', name: 'CAT 320 Excavator', category: 'Excavators', make: 'Caterpillar', model: '320', year: 2023,
      photo: 'images/excavator-sunset.jpg',
      description: '20-ton hydraulic excavator for trenching, digging and site preparation. Comes with a 42-inch bucket.',
      weight: '22.5 t', capacity: '1.19 m³ bucket', fuel: 'Diesel', transport: 'Lowboy trailer',
      operatorRequired: false, attachments: ['42" bucket', 'Hydraulic thumb'], prohibitedUses: 'Demolition of structures',
      status: 'Published', bookingMode: 'instant',
      pricing: { daily: 650, weekly: 2600, fourWeek: 7800, minDays: 2, hoursPerDay: 8, overtimePerHour: 85, deliveryFee: 250, deposit: 1500, weekendRule: 'Weekends charged' },
      units: [
        { id: 'U-12', serial: 'CAT0320GKL01442', condition: 'Excellent', meterHours: 1240 },
        { id: 'U-13', serial: 'CAT0320GKL01518', condition: 'Good', meterHours: 2310 },
        { id: 'U-14', serial: 'CAT0320GKL01602', condition: 'Excellent', meterHours: 640 },
      ],
    },
    {
      id: 'EQ-102', name: 'Komatsu PC210 Excavator', category: 'Excavators', make: 'Komatsu', model: 'PC210LC', year: 2022,
      photo: 'images/excavator-dusk.jpg',
      description: 'Reliable 21-ton excavator with low fuel use. Ideal for utility and foundation work.',
      weight: '23.0 t', capacity: '1.2 m³ bucket', fuel: 'Diesel', transport: 'Lowboy trailer',
      operatorRequired: false, attachments: ['36" bucket'], prohibitedUses: 'Lifting people',
      status: 'Published', bookingMode: 'quote',
      pricing: { daily: 620, weekly: 2450, fourWeek: 7400, minDays: 3, hoursPerDay: 8, overtimePerHour: 80, deliveryFee: 250, deposit: 1500, weekendRule: 'Weekends charged' },
      units: [
        { id: 'U-21', serial: 'KMTPC210E55821', condition: 'Good', meterHours: 3120 },
        { id: 'U-22', serial: 'KMTPC210E55903', condition: 'Good', meterHours: 2875 },
      ],
    },
    {
      id: 'EQ-103', name: 'Volvo L120H Wheel Loader', category: 'Loaders', make: 'Volvo', model: 'L120H', year: 2021,
      photo: 'images/wheel-loaders.jpg',
      description: 'Powerful wheel loader for moving gravel, soil and aggregates. Smooth ride and great visibility.',
      weight: '20.1 t', capacity: '3.3 m³ bucket', fuel: 'Diesel', transport: 'Lowboy trailer',
      operatorRequired: false, attachments: ['General purpose bucket', 'Pallet forks'], prohibitedUses: 'Lifting people',
      status: 'Published', bookingMode: 'instant',
      pricing: { daily: 540, weekly: 2150, fourWeek: 6450, minDays: 1, hoursPerDay: 8, overtimePerHour: 70, deliveryFee: 220, deposit: 1200, weekendRule: 'Weekends free' },
      units: [
        { id: 'U-31', serial: 'VCEL120HV2041', condition: 'Good', meterHours: 4100 },
        { id: 'U-32', serial: 'VCEL120HV2087', condition: 'Fair', meterHours: 5320 },
        { id: 'U-33', serial: 'VCEL120HV2112', condition: 'Excellent', meterHours: 1890 },
      ],
    },
    {
      id: 'EQ-104', name: 'CAT CS56B Road Roller', category: 'Compaction', make: 'Caterpillar', model: 'CS56B', year: 2022,
      photo: 'images/road-roller.jpg',
      description: '84-inch smooth drum vibratory roller for soil and base compaction on road and site work.',
      weight: '11.6 t', capacity: '84" drum', fuel: 'Diesel', transport: 'Flatbed trailer',
      operatorRequired: false, attachments: [], prohibitedUses: 'Asphalt finishing',
      status: 'Published', bookingMode: 'instant',
      pricing: { daily: 420, weekly: 1680, fourWeek: 5040, minDays: 1, hoursPerDay: 8, overtimePerHour: 55, deliveryFee: 180, deposit: 900, weekendRule: 'Weekends free' },
      units: [
        { id: 'U-41', serial: 'CATCS56BL80211', condition: 'Excellent', meterHours: 980 },
        { id: 'U-42', serial: 'CATCS56BL80298', condition: 'Good', meterHours: 2050 },
      ],
    },
    {
      id: 'EQ-105', name: 'Liebherr RL 66 Pipelayer', category: 'Pipelayers', make: 'Liebherr', model: 'RL 66', year: 2020,
      photo: 'images/pipelayers.jpg',
      description: 'Crawler pipelayer for lifting and laying large-diameter pipe. Operator certificate required.',
      weight: '57.0 t', capacity: '90 t lift', fuel: 'Diesel', transport: 'Heavy haul trailer (permit)',
      operatorRequired: true, attachments: ['Counterweight kit'], prohibitedUses: 'General lifting outside pipe work',
      status: 'Published', bookingMode: 'quote',
      pricing: { daily: 1450, weekly: 5800, fourWeek: 17400, minDays: 5, hoursPerDay: 8, overtimePerHour: 190, deliveryFee: 900, deposit: 5000, weekendRule: 'Weekends charged' },
      units: [
        { id: 'U-51', serial: 'LHRL66P10077', condition: 'Good', meterHours: 6210 },
        { id: 'U-52', serial: 'LHRL66P10091', condition: 'Good', meterHours: 5840 },
      ],
    },
    {
      id: 'EQ-106', name: 'Hitachi EH3500 Dump Truck', category: 'Dump trucks', make: 'Hitachi', model: 'EH3500', year: 2019,
      photo: 'images/dump-truck.jpg',
      description: 'Rigid haul truck for large earthmoving and quarry jobs. Off-road use only.',
      weight: '150 t', capacity: '168 t payload', fuel: 'Diesel', transport: 'Disassembled heavy haul',
      operatorRequired: true, attachments: [], prohibitedUses: 'Public road use',
      status: 'Maintenance', bookingMode: 'quote',
      pricing: { daily: 2900, weekly: 11600, fourWeek: 34800, minDays: 7, hoursPerDay: 10, overtimePerHour: 320, deliveryFee: 4500, deposit: 15000, weekendRule: 'Weekends charged' },
      units: [{ id: 'U-61', serial: 'HTEH3500A0412', condition: 'Fair', meterHours: 11840 }],
    },
    {
      id: 'EQ-107', name: 'CAT 336 Excavator', category: 'Excavators', make: 'Caterpillar', model: '336', year: 2024,
      photo: 'images/excavator-sky.jpg',
      description: '36-ton excavator for heavy digging and mass excavation. Includes grade control screen.',
      weight: '36.6 t', capacity: '1.88 m³ bucket', fuel: 'Diesel', transport: 'Lowboy trailer (permit)',
      operatorRequired: false, attachments: ['60" bucket', 'Ripper tooth'], prohibitedUses: 'Demolition of structures',
      status: 'Published', bookingMode: 'instant',
      pricing: { daily: 980, weekly: 3900, fourWeek: 11700, minDays: 3, hoursPerDay: 8, overtimePerHour: 120, deliveryFee: 450, deposit: 2500, weekendRule: 'Weekends charged' },
      units: [
        { id: 'U-71', serial: 'CAT0336NXB00218', condition: 'Excellent', meterHours: 420 },
        { id: 'U-72', serial: 'CAT0336NXB00244', condition: 'Excellent', meterHours: 760 },
      ],
    },
    {
      id: 'EQ-108', name: 'Komatsu PC88 Mini Excavator', category: 'Mini excavators', make: 'Komatsu', model: 'PC88MR', year: 2024,
      photo: 'images/excavator-banner.jpg',
      description: 'Compact excavator for tight sites, landscaping and utility trenches.',
      weight: '8.9 t', capacity: '0.28 m³ bucket', fuel: 'Diesel', transport: 'Tag trailer',
      operatorRequired: false, attachments: ['24" bucket'], prohibitedUses: '',
      status: 'Draft', bookingMode: 'instant', pricing: null,
      units: [{ id: 'U-81', serial: 'KMTPC88MR30117', condition: 'Excellent', meterHours: 85 }],
    },
  ],
  bookings: [
    {
      id: 'RSG-10482', contractor: 'Turner Construction', contactName: 'Mike Turner', rating: 4.8,
      equipmentId: 'EQ-101', unitId: 'U-12', start: '2026-11-18', end: '2026-12-01',
      jobsite: '1180 Peachtree St NE, Atlanta', siteContact: 'Dave Collins · (404) 555-0188', fulfillment: 'delivery',
      status: 'Active', payment: 'Paid', paymentMethod: 'Card · Stripe', rental: 6200, deliveryFee: 250, tax: 390, deposit: 1500, poNumber: 'TC-88412',
      extension: { newEnd: '2026-12-05', extra: 1950, status: 'Waiting' },
      timeline: [
        { time: '2026-11-12 09:14', text: 'Booked and paid by Mike Turner' },
        { time: '2026-11-18 08:05', text: 'Delivered by Darnell Brooks. Ticket signed by Dave Collins' },
        { time: '2026-11-19 16:40', text: 'Contractor asked to extend to Dec 5' },
      ],
    },
    {
      id: 'RSG-10490', contractor: 'Brasfield & Gorrie', contactName: 'Anna Price', rating: 4.6,
      equipmentId: 'EQ-103', unitId: 'U-31', start: '2026-11-20', end: '2026-11-27',
      jobsite: '400 Northside Dr NW, Atlanta', siteContact: 'Luis Ortega · (404) 555-0123', fulfillment: 'delivery',
      status: 'Out for delivery', payment: 'Paid', paymentMethod: 'Card · PayPal', rental: 2150, deliveryFee: 220, tax: 142, deposit: 1200, poNumber: 'BG-55120',
      timeline: [
        { time: '2026-11-15 11:02', text: 'Booked and paid by Anna Price' },
        { time: '2026-11-20 07:48', text: 'Darnell Brooks started the trip' },
      ],
    },
    {
      id: 'RSG-10491', contractor: 'Hardin Construction', contactName: 'Sam Hardin', rating: 4.9,
      equipmentId: 'EQ-104', unitId: 'U-41', start: '2026-11-20', end: '2026-11-24',
      jobsite: '2500 Cobb Pkwy SE, Smyrna', siteContact: 'Gary Wells · (770) 555-0170', fulfillment: 'delivery',
      status: 'Confirmed', payment: 'Paid', paymentMethod: 'Bank transfer (ACH) · Stripe', rental: 1680, deliveryFee: 180, tax: 112, deposit: 900, poNumber: '',
      timeline: [
        { time: '2026-11-16 14:20', text: 'Quote QR-2030 accepted by Sam Hardin' },
        { time: '2026-11-18 10:02', text: 'Bank transfer confirmed' },
      ],
    },
    {
      id: 'RSG-10493', contractor: 'Skanska USA', contactName: 'Rachel Kim', rating: 4.7,
      equipmentId: 'EQ-107', unitId: 'U-71', start: '2026-11-21', end: '2026-11-28',
      jobsite: '725 Ponce De Leon Ave NE, Atlanta', siteContact: 'Rachel Kim · (404) 555-0199', fulfillment: 'delivery',
      status: 'Confirmed', payment: 'Paid', paymentMethod: 'Card · Square', rental: 3900, deliveryFee: 450, tax: 261, deposit: 2500, poNumber: 'SK-2204',
      timeline: [{ time: '2026-11-17 09:30', text: 'Booked and paid by Rachel Kim' }],
    },
    {
      id: 'RSG-10476', contractor: 'Choate Construction', contactName: 'Ben Choate', rating: 4.5,
      equipmentId: 'EQ-101', unitId: 'U-13', start: '2026-11-10', end: '2026-11-20',
      jobsite: '3330 Cumberland Blvd, Atlanta', siteContact: 'Ben Choate · (770) 555-0144', fulfillment: 'delivery',
      status: 'Return requested', payment: 'Paid', paymentMethod: 'Card · Stripe', rental: 4550, deliveryFee: 250, tax: 288, deposit: 1500, poNumber: 'CC-1902',
      timeline: [
        { time: '2026-11-04 12:00', text: 'Booked and paid by Ben Choate' },
        { time: '2026-11-10 07:55', text: 'Delivered by Darnell Brooks' },
        { time: '2026-11-19 17:10', text: 'Contractor asked for pickup on Nov 20' },
      ],
    },
    {
      id: 'RSG-10470', contractor: 'Batson-Cook', contactName: 'Jill Batson', rating: 4.2,
      equipmentId: 'EQ-103', unitId: 'U-32', start: '2026-11-06', end: '2026-11-19',
      jobsite: '1 Glenlake Pkwy, Sandy Springs', siteContact: 'Jill Batson · (678) 555-0111', fulfillment: 'delivery',
      status: 'Returned', payment: 'Paid', paymentMethod: 'Card · Stripe', rental: 4300, deliveryFee: 220, tax: 271, deposit: 1200, poNumber: 'BC-7781',
      extraCharge: { reason: 'Two bucket teeth broken and fuel tank returned at 1/4 (delivered full)', amount: 640, status: 'Needs review' },
      timeline: [
        { time: '2026-11-01 15:45', text: 'Booked and paid by Jill Batson' },
        { time: '2026-11-06 08:10', text: 'Delivered by Darnell Brooks' },
        { time: '2026-11-19 14:30', text: 'Picked up by Darnell Brooks. Damage recorded with 6 photos' },
      ],
    },
    {
      id: 'RSG-10455', contractor: 'McCarthy Building', contactName: 'Paul Reyes', rating: 4.9,
      equipmentId: 'EQ-102', unitId: 'U-21', start: '2026-10-20', end: '2026-11-03',
      jobsite: '100 Peachtree St NW, Atlanta', siteContact: 'Paul Reyes', fulfillment: 'delivery',
      status: 'Completed', payment: 'Paid', paymentMethod: 'Card · Stripe', rental: 4900, deliveryFee: 250, tax: 309, deposit: 1500, poNumber: 'MB-3381',
      timeline: [{ time: '2026-11-04 10:00', text: 'Rental completed. Deposit returned' }],
    },
    {
      id: 'RSG-10450', contractor: 'Juneau Construction', contactName: 'Ted Juneau', rating: 4.7,
      equipmentId: 'EQ-104', unitId: 'U-42', start: '2026-10-27', end: '2026-11-07',
      jobsite: '55 Trinity Ave SW, Atlanta', siteContact: 'Ted Juneau', fulfillment: 'pickup',
      status: 'Completed', payment: 'Paid', paymentMethod: 'Card · Square', rental: 2940, deliveryFee: 0, tax: 176, deposit: 900, poNumber: '',
      timeline: [{ time: '2026-11-08 09:00', text: 'Rental completed. Deposit returned' }],
    },
    {
      id: 'RSG-10461', contractor: 'Hardin Construction', contactName: 'Sam Hardin', rating: 4.9,
      equipmentId: 'EQ-107', unitId: 'U-72', start: '2026-11-01', end: '2026-11-14',
      jobsite: '2500 Cobb Pkwy SE, Smyrna', siteContact: 'Gary Wells', fulfillment: 'delivery',
      status: 'Completed', payment: 'Paid', paymentMethod: 'Card · Stripe', rental: 7800, deliveryFee: 450, tax: 495, deposit: 2500, poNumber: 'HC-6610',
      timeline: [{ time: '2026-11-15 11:30', text: 'Rental completed. Deposit returned' }],
    },
    {
      id: 'RSG-10495', contractor: 'New South Construction', contactName: 'Carla James', rating: 4.4,
      equipmentId: 'EQ-101', unitId: 'U-14', start: '2026-11-24', end: '2026-12-08',
      jobsite: '880 Memorial Dr SE, Atlanta', siteContact: 'Carla James · (404) 555-0156', fulfillment: 'delivery',
      status: 'Pending payment', payment: 'Pending', paymentMethod: 'Bank transfer (ACH) · Stripe', rental: 5200, deliveryFee: 250, tax: 327, deposit: 1500, poNumber: 'NS-410',
      timeline: [{ time: '2026-11-19 13:05', text: 'Booked by Carla James. Bank transfer started' }],
    },
    {
      id: 'RSG-10497', contractor: 'Turner Construction', contactName: 'Mike Turner', rating: 4.8,
      equipmentId: 'EQ-105', unitId: 'U-51', start: '2026-12-01', end: '2026-12-15',
      jobsite: 'I-285 Pipeline Project, Doraville', siteContact: 'Dave Collins · (404) 555-0188', fulfillment: 'delivery',
      status: 'Confirmed', payment: 'Pay later', paymentMethod: 'Pay Later · Net 30', rental: 11600, deliveryFee: 900, tax: 750, deposit: 5000, poNumber: 'TC-88560',
      timeline: [{ time: '2026-11-14 16:20', text: 'Quote accepted by Mike Turner. Paid with Pay Later (Net 30)' }],
    },
    {
      id: 'RSG-10440', contractor: 'Brasfield & Gorrie', contactName: 'Anna Price', rating: 4.6,
      equipmentId: 'EQ-106', unitId: 'U-61', start: '2026-10-01', end: '2026-10-28',
      jobsite: 'Vulcan Quarry, Lithonia', siteContact: 'Anna Price', fulfillment: 'delivery',
      status: 'Completed', payment: 'Paid', paymentMethod: 'Bank transfer (ACH) · Stripe', rental: 34800, deliveryFee: 4500, tax: 2358, deposit: 15000, poNumber: 'BG-54011',
      timeline: [{ time: '2026-10-29 10:00', text: 'Rental completed. Deposit returned' }],
    },
    {
      id: 'RSG-10468', contractor: 'Holder Construction', contactName: 'Nina Holder', rating: 4.3,
      equipmentId: 'EQ-102', unitId: 'U-22', start: '2026-11-03', end: '2026-11-10',
      jobsite: '1000 Abernathy Rd, Sandy Springs', siteContact: 'Nina Holder', fulfillment: 'delivery',
      status: 'Cancelled', payment: 'Refunded', paymentMethod: 'Card · Stripe', rental: 2450, deliveryFee: 250, tax: 162, deposit: 1500, poNumber: '',
      cancelReason: 'Contractor cancelled: project start moved to January',
      timeline: [{ time: '2026-11-02 09:40', text: 'Cancelled by contractor. Full refund sent' }],
    },
    {
      id: 'RSG-10484', contractor: 'Robins & Morton', contactName: 'Eric Morton', rating: 4.6,
      equipmentId: 'EQ-103', unitId: 'U-33', start: '2026-11-17', end: '2026-11-23',
      jobsite: '1364 Clifton Rd, Atlanta', siteContact: 'Eric Morton · (404) 555-0133', fulfillment: 'pickup',
      status: 'Active', payment: 'Pay later', paymentMethod: 'Pay Later · Net 30', rental: 3700, deliveryFee: 0, tax: 222, deposit: 1200, poNumber: 'RM-2090',
      timeline: [
        { time: '2026-11-13 10:12', text: 'Booked by Eric Morton with Pay Later (Net 30)' },
        { time: '2026-11-17 07:30', text: 'Collected from the yard. Ticket signed by Eric Morton' },
      ],
    },
  ],
  jobs: [
    { id: 'JOB-301', bookingId: 'RSG-10490', type: 'Delivery', date: '2026-11-20', window: '8:00 – 10:00 AM', driverId: 'M-2', status: 'On the way', progress: 72, distance: 18 },
    { id: 'JOB-302', bookingId: 'RSG-10491', type: 'Delivery', date: '2026-11-20', window: '10:00 AM – 12:00 PM', driverId: null, status: 'Needs driver', progress: 0, distance: 14 },
    { id: 'JOB-303', bookingId: 'RSG-10476', type: 'Pickup', date: '2026-11-20', window: '1:00 – 3:00 PM', driverId: 'M-2', status: 'Scheduled', progress: 0, distance: 11 },
    { id: 'JOB-304', bookingId: 'RSG-10493', type: 'Delivery', date: '2026-11-21', window: '7:00 – 9:00 AM', driverId: 'M-5', status: 'Scheduled', progress: 0, distance: 9 },
    { id: 'JOB-305', bookingId: 'RSG-10497', type: 'Delivery', date: '2026-12-01', window: '7:00 – 11:00 AM', driverId: null, status: 'Needs driver', progress: 0, distance: 21 },
    {
      id: 'JOB-296', bookingId: 'RSG-10482', type: 'Delivery', date: '2026-11-18', window: '7:00 – 9:00 AM', driverId: 'M-2', status: 'Done', progress: 100, distance: 12,
      ticket: { photos: 6, condition: 'Excellent', fuel: 100, meter: 1186, idMatches: true, signedBy: 'Dave Collins', time: '2026-11-18 08:05' },
    },
    {
      id: 'JOB-298', bookingId: 'RSG-10470', type: 'Pickup', date: '2026-11-19', window: '1:00 – 3:00 PM', driverId: 'M-2', status: 'Done', progress: 100, distance: 16,
      ticket: { photos: 6, condition: 'Fair', fuel: 25, meter: 5320, idMatches: true, signedBy: 'Jill Batson', time: '2026-11-19 14:30', damageNote: 'Two bucket teeth broken. Fuel at 1/4.' },
    },
    {
      id: 'JOB-293', bookingId: 'RSG-10484', type: 'Delivery', date: '2026-11-17', window: 'Yard pickup · 7:00 AM', driverId: 'M-5', status: 'Done', progress: 100, distance: 0,
      ticket: { photos: 5, condition: 'Excellent', fuel: 100, meter: 1850, idMatches: true, signedBy: 'Eric Morton', time: '2026-11-17 07:30' },
    },
  ],
  blocks: [
    { id: 'BL-1', equipmentId: 'EQ-103', unitId: 'U-32', from: '2026-11-20', to: '2026-11-23', reason: 'Maintenance', note: 'Replace bucket teeth after Batson-Cook rental' },
    { id: 'BL-2', equipmentId: 'EQ-101', unitId: 'U-14', from: '2026-11-20', to: '2026-11-22', reason: 'Rented outside RigSetGo', note: 'Phone booking – Peachtree Paving' },
    { id: 'BL-3', equipmentId: 'EQ-106', unitId: 'U-61', from: '2026-11-15', to: '2026-12-10', reason: 'Maintenance', note: 'Engine overhaul' },
  ],
  quotes: [
    {
      id: 'QR-2041', contractor: 'Turner Construction', contactName: 'Mike Turner', need: '2 wheel loaders for site grading', category: 'Loaders', equipmentId: 'EQ-103',
      start: '2026-11-24', end: '2026-11-28', jobsite: '1180 Peachtree St NE, Atlanta', operator: false, deliveryWindow: 'Morning, before 9 AM',
      budget: '$5,000', notes: 'Need both loaders on site Monday morning. Gate code 4410.', received: '2026-11-20 10:30', respondBy: '2026-11-21', status: 'New',
    },
    {
      id: 'QR-2040', contractor: 'Brasfield & Gorrie', contactName: 'Anna Price', need: 'Pipelayer with certified operator', category: 'Pipelayers', equipmentId: 'EQ-105',
      start: '2026-12-02', end: '2026-12-16', jobsite: 'Atlanta Gas Light corridor, Smyrna', operator: true, deliveryWindow: 'Any time Dec 1',
      budget: '', notes: '24" steel pipe. Ground is soft after rain.', received: '2026-11-20 09:15', respondBy: '2026-11-21', status: 'New',
    },
    {
      id: 'QR-2038', contractor: 'Holder Construction', contactName: 'Nina Holder', need: 'Large excavator for 3 weeks', category: 'Excavators', equipmentId: 'EQ-107',
      start: '2026-12-01', end: '2026-12-22', jobsite: '1000 Abernathy Rd, Sandy Springs', operator: false, deliveryWindow: 'Afternoon',
      budget: '$12,000', notes: 'Mass excavation for a parking deck.', received: '2026-11-19 15:40', respondBy: '2026-11-21', status: 'New',
    },
    {
      id: 'QR-2035', contractor: 'Skanska USA', contactName: 'Rachel Kim', need: 'Haul truck for one month', category: 'Dump trucks', equipmentId: 'EQ-106',
      start: '2026-12-14', end: '2027-01-11', jobsite: 'Vulcan Quarry, Lithonia', operator: true, deliveryWindow: 'Any time',
      budget: '', notes: '', received: '2026-11-17 11:00', respondBy: '2026-11-19', status: 'Quoted',
      quote: { lines: [{ label: '4-week rental', amount: 34800 }, { label: 'Delivery and assembly', amount: 4500 }, { label: 'Certified operator (20 days)', amount: 9600 }], validUntil: '2026-11-25', note: 'Truck is in maintenance until Dec 10 and will be ready by Dec 14.' },
    },
    {
      id: 'QR-2030', contractor: 'Hardin Construction', contactName: 'Sam Hardin', need: 'Road roller, 4 days', category: 'Compaction', equipmentId: 'EQ-104',
      start: '2026-11-20', end: '2026-11-24', jobsite: '2500 Cobb Pkwy SE, Smyrna', operator: false, deliveryWindow: 'Morning',
      budget: '$2,000', notes: '', received: '2026-11-14 08:20', respondBy: '2026-11-15', status: 'Accepted', bookingId: 'RSG-10491',
      quote: { lines: [{ label: '4 rental days', amount: 1680 }, { label: 'Delivery and pickup', amount: 180 }], validUntil: '2026-11-18', note: '' },
    },
    {
      id: 'QR-2028', contractor: 'McCarthy Building', contactName: 'Paul Reyes', need: 'Excavator for one weekend', category: 'Excavators', equipmentId: 'EQ-102',
      start: '2026-11-14', end: '2026-11-16', jobsite: '100 Peachtree St NW, Atlanta', operator: false, deliveryWindow: 'Friday evening',
      budget: '', notes: '', received: '2026-11-11 16:00', respondBy: '2026-11-12', status: 'Declined', declineReason: 'Both units already booked that weekend.',
    },
    {
      id: 'QR-2025', contractor: 'Choate Construction', contactName: 'Ben Choate', need: 'Pipelayer, 2 weeks', category: 'Pipelayers', equipmentId: 'EQ-105',
      start: '2026-11-10', end: '2026-11-24', jobsite: '3330 Cumberland Blvd, Atlanta', operator: true, deliveryWindow: 'Morning',
      budget: '', notes: '', received: '2026-11-03 09:00', respondBy: '2026-11-04', status: 'Expired',
      quote: { lines: [{ label: '2 weeks rental', amount: 11600 }, { label: 'Delivery', amount: 900 }], validUntil: '2026-11-07', note: '' },
    },
  ],
  docs: [
    { id: 'DOC-1', name: 'Business license', covers: 'Business', equipmentId: null, file: 'atlanta-heavy-license.pdf', expires: '2027-08-31', status: 'Valid' },
    { id: 'DOC-2', name: 'Certificate of insurance', covers: 'Business', equipmentId: null, file: 'insurance-2026.pdf', expires: '2026-11-27', status: 'Expiring soon' },
    { id: 'DOC-3', name: 'Tax ID (W-9)', covers: 'Business', equipmentId: null, file: 'w9-atlanta-heavy.pdf', expires: '', status: 'Valid' },
    { id: 'DOC-4', name: 'Annual inspection certificate', covers: 'CAT 320 Excavator', equipmentId: 'EQ-101', file: 'cat320-inspection.pdf', expires: '2027-03-15', status: 'Valid' },
    { id: 'DOC-5', name: 'Annual inspection certificate', covers: 'Komatsu PC210 Excavator', equipmentId: 'EQ-102', file: 'pc210-inspection.pdf', expires: '2027-02-02', status: 'Valid' },
    { id: 'DOC-6', name: 'Annual inspection certificate', covers: 'Volvo L120H Wheel Loader', equipmentId: 'EQ-103', file: 'l120h-inspection.pdf', expires: '2027-01-10', status: 'Valid' },
    { id: 'DOC-7', name: 'Annual inspection certificate', covers: 'CAT CS56B Road Roller', equipmentId: 'EQ-104', file: 'cs56b-inspection.pdf', expires: '2027-05-02', status: 'Valid' },
    { id: 'DOC-8', name: 'Lift inspection certificate', covers: 'Liebherr RL 66 Pipelayer', equipmentId: 'EQ-105', file: 'rl66-lift-2025.pdf', expires: '2026-11-12', status: 'Expired' },
    { id: 'DOC-9', name: 'Operator certificate', covers: 'Liebherr RL 66 Pipelayer', equipmentId: 'EQ-105', file: 'operator-cert-rl66.pdf', expires: '2027-06-30', status: 'Valid' },
    { id: 'DOC-10', name: 'Annual inspection certificate', covers: 'Hitachi EH3500 Dump Truck', equipmentId: 'EQ-106', file: 'eh3500-inspection.pdf', expires: '2027-09-01', status: 'Under review' },
    { id: 'DOC-11', name: 'DOT registration', covers: 'Hitachi EH3500 Dump Truck', equipmentId: 'EQ-106', file: 'eh3500-dot.pdf', expires: '2027-04-30', status: 'Valid' },
    { id: 'DOC-12', name: 'Annual inspection certificate', covers: 'CAT 336 Excavator', equipmentId: 'EQ-107', file: 'cat336-inspection.pdf', expires: '2026-12-05', status: 'Expiring soon' },
  ],
  reviews: [
    { id: 'RV-61', contractor: 'Hardin Construction', bookingId: 'RSG-10461', equipmentId: 'EQ-107', date: '2026-11-16', accuracy: 5, delivery: 4, service: 5, text: 'Machine was exactly as listed and nearly new. Delivery was 20 minutes late but the driver called ahead.' },
    { id: 'RV-58', contractor: 'Juneau Construction', bookingId: 'RSG-10450', equipmentId: 'EQ-104', date: '2026-11-09', accuracy: 4, delivery: 5, service: 4, text: 'Good roller, easy pickup from the yard. Paperwork was quick.' },
    { id: 'RV-55', contractor: 'McCarthy Building', bookingId: 'RSG-10455', equipmentId: 'EQ-102', date: '2026-11-05', accuracy: 5, delivery: 5, service: 5, text: 'Clean excavator, on time, and Mark answered every call. Will book again.' },
    { id: 'RV-49', contractor: 'Brasfield & Gorrie', bookingId: 'RSG-10440', equipmentId: 'EQ-106', date: '2026-10-30', accuracy: 4, delivery: 3, service: 4, text: 'Truck worked well. Assembly took a day longer than planned.' },
    {
      id: 'RV-44', contractor: 'Peach State Grading', bookingId: 'RSG-10399', equipmentId: 'EQ-101', date: '2026-10-12', accuracy: 1, delivery: 1, service: 1,
      text: 'Terrible company, never again!!! Call 404-555-0000 for a better deal.',
      report: { reason: 'Spam or advertising', details: 'This contractor never rented from us and the review advertises a competitor phone number.', status: 'Under review' },
    },
  ],
  cases: [
    {
      id: 'CASE-320', bookingId: 'RSG-10484', category: 'Billing', subject: 'Question about weekend charges', status: 'Open', created: '2026-11-19 11:20',
      messages: [
        { from: 'Eric Morton (Robins & Morton)', text: 'Are we charged for Saturday and Sunday? The loader is parked on weekends.', time: '2026-11-19 11:20' },
        { from: 'RigSetGo Support', text: 'Hi Mark, the contractor is asking about weekend days. Your policy for this loader says weekends are free. Can you confirm?', time: '2026-11-19 12:05' },
      ],
    },
    {
      id: 'CASE-318', bookingId: 'RSG-10470', category: 'Damage', subject: 'Broken bucket teeth on return', status: 'Waiting on you', created: '2026-11-19 15:02',
      messages: [
        { from: 'You', text: 'Two bucket teeth were broken and fuel was low on return. Photos are on the return ticket.', time: '2026-11-19 15:02' },
        { from: 'RigSetGo Support', text: 'Thanks Mark. Please upload a repair estimate so we can review the extra charge with Batson-Cook.', time: '2026-11-20 08:40' },
      ],
    },
    {
      id: 'CASE-311', bookingId: 'RSG-10482', category: 'Late delivery', subject: 'Contractor asked about delivery time', status: 'Resolved', created: '2026-11-18 06:50',
      messages: [
        { from: 'Mike Turner (Turner Construction)', text: 'Is the excavator still arriving before 9?', time: '2026-11-18 06:50' },
        { from: 'You', text: 'Yes, driver is on the way, ETA 8:05.', time: '2026-11-18 07:02' },
        { from: 'RigSetGo Support', text: 'Delivered at 8:05. Closing this case.', time: '2026-11-18 08:30' },
      ],
    },
  ],
  payouts: [
    { id: 'PO-1120', date: '2026-11-25', amount: 12400, status: 'Scheduled', bookings: ['RSG-10455', 'RSG-10450', 'RSG-10461'] },
    { id: 'PO-1113', date: '2026-11-18', amount: 9860, status: 'Paid', bookings: ['RSG-10440'] },
    { id: 'PO-1106', date: '2026-11-11', amount: 10890, status: 'Paid', bookings: ['RSG-10432', 'RSG-10428'], deduction: { amount: 350, reason: 'Refund to Holder Construction after payout (RSG-10468 cancelled)' } },
    { id: 'PO-1099', date: '2026-11-04', amount: 8650, status: 'Paid', bookings: ['RSG-10421', 'RSG-10419'] },
    { id: 'PO-1092', date: '2026-10-28', amount: 3150, status: 'Failed', bookings: ['RSG-10410'] },
  ],
  members: [
    { id: 'M-1', name: 'Mark Rivera', email: 'mark@atlantaheavyrentals.com', roleId: 'admin', status: 'Active', lastActive: 'Now' },
    { id: 'M-2', name: 'Darnell Brooks', email: 'darnell@atlantaheavyrentals.com', roleId: 'dispatcher', status: 'Active', lastActive: 'Today, 7:48 AM' },
    { id: 'M-3', name: 'Lisa Chen', email: 'lisa@atlantaheavyrentals.com', roleId: 'inventory', status: 'Active', lastActive: 'Yesterday' },
    { id: 'M-4', name: 'Priya Patel', email: 'priya@atlantaheavyrentals.com', roleId: 'finance', status: 'Active', lastActive: 'Nov 18' },
    { id: 'M-5', name: 'Tom Alvarez', email: 'tom@atlantaheavyrentals.com', roleId: 'custom-yard', status: 'Active', lastActive: 'Today, 6:30 AM' },
    { id: 'M-6', name: 'Kevin Wright', email: 'kevin@atlantaheavyrentals.com', roleId: 'dispatcher', status: 'Invited', lastActive: '—' },
  ],
  roles: [
    { id: 'admin', name: 'Supplier Admin', locked: true, description: 'Full access to every section, including bank details and the team.', sections: [...SECTIONS] },
    { id: 'dispatcher', name: 'Dispatcher', locked: true, description: 'Plans deliveries and pickups, assigns drivers and fills in tickets.', sections: ['Dashboard', 'Bookings', 'Calendar', 'Deliveries & Tracking', 'Support Cases'] },
    { id: 'inventory', name: 'Inventory Manager', locked: true, description: 'Manages machines, units, calendars and documents. Cannot change prices.', sections: ['Dashboard', 'Equipment', 'Calendar', 'Compliance'] },
    { id: 'finance', name: 'Finance Officer', locked: true, description: 'Sees earnings, payouts and statements. Cannot change bank details.', sections: ['Dashboard', 'Bookings', 'Earnings & Payouts'] },
    { id: 'custom-yard', name: 'Yard Driver', locked: false, description: 'Custom role made by Mark Rivera.', sections: ['Dashboard', 'Deliveries & Tracking'] },
  ],
  notifications: [
    { id: 'N-1', text: 'Delivery JOB-302 today 10:00 AM – 12:00 PM still needs a driver', time: '7:15 AM', read: false, link: '/deliveries/JOB-302' },
    { id: 'N-2', text: 'Support case CASE-318 (broken bucket teeth) is waiting on you', time: 'Yesterday', read: false, link: '/support/CASE-318' },
    { id: 'N-3', text: 'Delivery JOB-305 on Dec 1 needs a driver', time: 'Yesterday', read: false, link: '/deliveries/JOB-305' },
    { id: 'N-4', text: 'Pickup for RSG-10476 is planned for today, 1:00 – 3:00 PM', time: 'Nov 19', read: true, link: '/deliveries/JOB-303' },
    { id: 'N-5', text: 'Return ticket for RSG-10470 saved with damage photos', time: 'Nov 19', read: true, link: '/bookings/RSG-10470' },
  ],
  history: [
    { id: 'H-5', time: '2026-11-19 17:12', who: 'Mark Rivera', text: 'Blocked U-14 (CAT 320) Nov 20–22: rented outside RigSetGo' },
    { id: 'H-4', time: '2026-11-19 14:31', who: 'Darnell Brooks', text: 'Recorded return ticket for RSG-10470 with damage photos' },
    { id: 'H-3', time: '2026-11-18 08:05', who: 'Darnell Brooks', text: 'Recorded delivery ticket for RSG-10482' },
    { id: 'H-2', time: '2026-11-15 10:20', who: 'Mark Rivera', text: 'Changed CAT 336 weekly rate from $3,800 to $3,900' },
    { id: 'H-1', time: '2026-11-12 09:00', who: 'System', text: 'Liebherr RL 66 paused: lift inspection certificate expired' },
  ],
  prefs: {
    email: true,
    sms: true,
    inApp: true,
    quietHours: true,
    topics: {
      'New quote requests': true,
      'New bookings and payments': true,
      'Deliveries and returns': true,
      'Extensions and cancellations': true,
      'Document expiry reminders': true,
      'Support case replies': true,
      'Payouts': true,
    },
  },
  application: { ...emptyApplication(), status: 'Approved', step: 7 },
});
