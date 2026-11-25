import type { AppState, Booking, DeliveryJob, SupportCase } from './types';
import { TODAY } from './seed';
import { addDays } from './utils';

/**
 * What the Dispatcher role can and cannot do.
 * The Dispatcher is a locked, ready-made role set by the Supplier Admin:
 * Dashboard, Bookings, Calendar (view only), Deliveries & Tracking and Support Cases.
 * No prices, money, payouts, documents, team or business settings.
 */
export const ADMIN_ONLY: Record<string, string> = {
  storefront: 'Storefront',
  equipment: 'Equipment',
  pricing: 'Pricing',
  quotes: 'Quote Requests',
  compliance: 'Compliance',
  reviews: 'Reviews',
  earnings: 'Earnings & Payouts',
  team: 'Team & Roles',
  settings: 'Business Settings',
};

/** Team members who can drive a delivery or pickup. */
export const DRIVER_ROLES = ['admin', 'dispatcher', 'custom-yard'];

/** Billing questions belong to the Supplier Admin and Finance, not the Dispatcher. */
export const canSeeCase = (c: SupportCase) => c.category !== 'Billing';

export const jobsOf = (s: AppState, bookingId: string) => s.jobs.filter((j) => j.bookingId === bookingId);

export const endOf = (b: Booking) => (b.extension?.status === 'Accepted' ? b.extension.newEnd : b.end);

/** Rentals ending in the next 3 days that still need a pickup or a yard return planned. */
export function returnsDue(s: AppState) {
  const limit = addDays(TODAY, 3);
  return s.bookings
    .filter((b) => b.status === 'Active' && endOf(b) <= limit && !s.jobs.some((j) => j.bookingId === b.id && j.type === 'Pickup'))
    .sort((a, b) => endOf(a).localeCompare(endOf(b)));
}

/** Yard handovers due today or earlier (customer collects the machine from the yard). */
export function handoversDue(s: AppState) {
  return s.bookings.filter((b) => b.status === 'Confirmed' && b.fulfillment === 'pickup' && b.start <= TODAY);
}

/** Something on this booking is waiting for the Dispatcher. */
export function dispatcherNeedsAction(s: AppState, b: Booking) {
  if (jobsOf(s, b.id).some((j) => j.status === 'Needs driver')) return true;
  if (returnsDue(s).some((x) => x.id === b.id)) return true;
  if (handoversDue(s).some((x) => x.id === b.id)) return true;
  return false;
}

/** Tasks shown on the dashboard, most urgent first. */
export function dispatcherTasks(s: AppState) {
  const out: { kind: 'driver' | 'return' | 'handover' | 'case' | 'late'; title: string; text: string; to: string; action: string; date: string }[] = [];
  s.jobs
    .filter((j) => j.status === 'Needs driver')
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((j) =>
      out.push({ kind: 'driver', title: `${j.type} needs a driver`, text: `${j.bookingId} · ${j.date === TODAY ? 'Today' : shortish(j.date)}, ${j.window}`, to: `/deliveries/${j.id}`, action: 'Assign a driver', date: j.date }),
    );
  handoversDue(s).forEach((b) => out.push({ kind: 'handover', title: 'Yard handover today', text: `${b.id} · ${b.contractor} collects the machine`, to: `/bookings/${b.id}`, action: 'Record handover', date: b.start }));
  returnsDue(s).forEach((b) =>
    out.push({
      kind: 'return',
      title: b.fulfillment === 'delivery' ? 'Pickup to schedule' : 'Return at the yard due',
      text: `${b.id} · rental ends ${endOf(b) === TODAY ? 'today' : shortish(endOf(b))}`,
      to: `/bookings/${b.id}`,
      action: b.fulfillment === 'delivery' ? 'Schedule pickup' : 'Open booking',
      date: endOf(b),
    }),
  );
  s.cases
    .filter((c) => c.status === 'Waiting on you' && canSeeCase(c))
    .forEach((c) => out.push({ kind: 'case', title: 'Support case waiting on you', text: `${c.id} · ${c.subject}`, to: `/support/${c.id}`, action: 'Reply', date: c.created.slice(0, 10) }));
  return out;
}

export function jobLabel(j: DeliveryJob) {
  return j.status === 'Done' ? (j.type === 'Delivery' ? 'Delivered' : 'Picked up') : j.status;
}

function shortish(d: string) {
  return new Date(d + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Minutes after midnight for the start of a time window like "1:00 – 3:00 PM", for sorting. */
export function windowStart(w: string) {
  const m = w.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 24 * 60;
  const first = w.split('–')[0];
  const ampm = (first.match(/AM|PM/) ?? w.match(/AM|PM/))?.[0] ?? 'AM';
  const h = (Number(m[1]) % 12) + (ampm === 'PM' ? 12 : 0);
  return h * 60 + Number(m[2]);
}
