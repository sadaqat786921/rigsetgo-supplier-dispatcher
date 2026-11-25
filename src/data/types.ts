export type EquipmentStatus = 'Published' | 'Draft' | 'Unavailable' | 'Maintenance' | 'Retired';
export type BookingMode = 'instant' | 'quote';

export interface Pricing {
  daily: number;
  weekly: number;
  fourWeek: number;
  minDays: number;
  hoursPerDay: number;
  overtimePerHour: number;
  deliveryFee: number;
  deposit: number;
  weekendRule: 'Weekends free' | 'Weekends charged';
}

export interface Unit {
  id: string;
  serial: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  meterHours: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  make: string;
  model: string;
  year: number;
  photo: string;
  /** All photos, main photo first. Older sample data only has `photo`. */
  photos?: string[];
  description: string;
  weight: string;
  capacity: string;
  fuel: string;
  transport: string;
  operatorRequired: boolean;
  attachments: string[];
  prohibitedUses: string;
  status: EquipmentStatus;
  bookingMode: BookingMode;
  pricing: Pricing | null;
  units: Unit[];
}

export type BookingStatus =
  | 'Pending payment'
  | 'Confirmed'
  | 'Out for delivery'
  | 'Active'
  | 'Return requested'
  | 'Returned'
  | 'Completed'
  | 'Cancelled';

export interface TimelineEvent {
  time: string;
  text: string;
}

export interface ExtraCharge {
  reason: string;
  amount: number;
  status: 'Needs review' | 'Approved' | 'Dropped';
}

export interface Booking {
  id: string;
  contractor: string;
  contactName: string;
  rating: number;
  equipmentId: string;
  unitId: string;
  start: string;
  end: string;
  jobsite: string;
  siteContact: string;
  fulfillment: 'delivery' | 'pickup';
  status: BookingStatus;
  payment: 'Paid' | 'Pending' | 'Refunded' | 'Pay later';
  paymentMethod: string;
  rental: number;
  deliveryFee: number;
  tax: number;
  deposit: number;
  poNumber: string;
  extension?: { newEnd: string; extra: number; status: 'Waiting' | 'Accepted' | 'Declined'; reason?: string };
  extraCharge?: ExtraCharge;
  cancelReason?: string;
  timeline: TimelineEvent[];
}

export type JobStatus = 'Needs driver' | 'Scheduled' | 'On the way' | 'Done';

export interface Ticket {
  photos: number;
  condition: string;
  fuel: number;
  meter: number;
  idMatches: boolean;
  signedBy: string;
  time: string;
  damageNote?: string;
}

export interface DeliveryJob {
  id: string;
  bookingId: string;
  type: 'Delivery' | 'Pickup';
  date: string;
  window: string;
  driverId: string | null;
  status: JobStatus;
  progress: number;
  distance: number;
  ticket?: Ticket;
}

export type QuoteStatus = 'New' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired';

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface QuoteRequest {
  id: string;
  contractor: string;
  contactName: string;
  need: string;
  category: string;
  equipmentId: string;
  start: string;
  end: string;
  jobsite: string;
  operator: boolean;
  deliveryWindow: string;
  budget: string;
  notes: string;
  received: string;
  respondBy: string;
  status: QuoteStatus;
  quote?: { lines: QuoteLine[]; validUntil: string; note: string };
  declineReason?: string;
  bookingId?: string;
}

export type DocStatus = 'Valid' | 'Expiring soon' | 'Expired' | 'Under review' | 'Rejected';

export interface ComplianceDoc {
  id: string;
  name: string;
  covers: string;
  equipmentId: string | null;
  file: string;
  expires: string;
  status: DocStatus;
  rejectReason?: string;
}

export interface Review {
  id: string;
  contractor: string;
  bookingId: string;
  equipmentId: string;
  date: string;
  accuracy: number;
  delivery: number;
  service: number;
  text: string;
  report?: { reason: string; details: string; status: 'Under review' | 'Kept' | 'Removed' };
}

export interface CaseMessage {
  from: 'You' | 'RigSetGo Support' | string;
  text: string;
  time: string;
}

export interface SupportCase {
  id: string;
  bookingId: string;
  category: 'Late delivery' | 'Breakdown' | 'Equipment mismatch' | 'Damage' | 'Billing';
  subject: string;
  status: 'Open' | 'Waiting on you' | 'Resolved';
  created: string;
  messages: CaseMessage[];
}

export interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Scheduled' | 'Failed';
  bookings: string[];
  deduction?: { amount: number; reason: string };
}

export interface Member {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
}

export interface Role {
  id: string;
  name: string;
  locked: boolean;
  description: string;
  sections: string[];
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  link: string;
}

export interface HistoryEntry {
  id: string;
  time: string;
  who: string;
  text: string;
}

export interface Business {
  legalName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  about: string;
  serviceAreas: string[];
  days: string;
  opens: string;
  closes: string;
  delivery: boolean;
  pickup: boolean;
  rentalPolicy: string;
  cancellationPolicy: string;
  verifiedOn: string;
  pendingChange?: { field: string; value: string; label: string };
}

export interface PayoutAccount {
  provider: 'Stripe' | 'PayPal' | 'Square';
  bank: string;
  last4: string;
  status: 'Connected' | 'Needs attention';
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  quietHours: boolean;
  topics: Record<string, boolean>;
}

export interface Application {
  step: number;
  role: 'supplier' | 'contractor';
  name: string;
  email: string;
  phone: string;
  legalName: string;
  contactName: string;
  address: string;
  serviceAreas: string[];
  days: string;
  opens: string;
  closes: string;
  delivery: boolean;
  pickup: boolean;
  docs: Record<string, 'empty' | 'uploading' | 'uploaded'>;
  provider: '' | 'Stripe' | 'PayPal' | 'Square';
  status: 'Draft' | 'Pending' | 'Needs information' | 'Approved';
  infoRequest?: string;
}

export interface AppState {
  business: Business;
  payoutAccount: PayoutAccount;
  equipment: Equipment[];
  bookings: Booking[];
  jobs: DeliveryJob[];
  blocks: CalendarBlock[];
  quotes: QuoteRequest[];
  docs: ComplianceDoc[];
  reviews: Review[];
  cases: SupportCase[];
  payouts: Payout[];
  members: Member[];
  roles: Role[];
  notifications: Notification[];
  history: HistoryEntry[];
  prefs: NotificationPrefs;
  application: Application;
}

export interface CalendarBlock {
  id: string;
  equipmentId: string;
  unitId: string;
  from: string;
  to: string;
  reason: 'Maintenance' | 'Rented outside RigSetGo' | 'Other';
  note: string;
}
