import type { AppState, Booking, Equipment } from './types';
import { FEE_RATE, TODAY } from './seed';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const money = (n: number, cents = false) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

export const parse = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, day);
};

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fmtDate = (d: string) => {
  if (!d) return '—';
  const x = parse(d);
  return `${MONTHS[x.getMonth()]} ${x.getDate()}, ${x.getFullYear()}`;
};

export const shortDate = (d: string) => {
  if (!d) return '—';
  const x = parse(d);
  return `${MONTHS[x.getMonth()]} ${x.getDate()}`;
};

export const fmtStamp = (s: string) => {
  const [d, t] = s.split(' ');
  if (!t) return fmtDate(d);
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  const day = d === TODAY ? 'Today' : shortDate(d);
  return `${day}, ${hh}:${String(m).padStart(2, '0')} ${ap}`;
};

export const addDays = (d: string, n: number) => {
  const x = parse(d);
  x.setDate(x.getDate() + n);
  return iso(x);
};

/** Number of rental days, counting both the first and the last day. */
export const rentalDays = (start: string, end: string) =>
  Math.max(1, Math.round((parse(end).getTime() - parse(start).getTime()) / 86400000) + 1);

export const daysUntil = (d: string) => Math.round((parse(d).getTime() - parse(TODAY).getTime()) / 86400000);

export const bookingTotal = (b: Booking) => b.rental + b.deliveryFee + b.tax + (b.extraCharge?.status === 'Approved' ? b.extraCharge.amount : 0) + (b.extension?.status === 'Accepted' ? b.extension.extra : 0);

export const supplierShare = (b: Booking) => {
  const base = b.rental + b.deliveryFee + (b.extraCharge?.status === 'Approved' ? b.extraCharge.amount : 0) + (b.extension?.status === 'Accepted' ? b.extension.extra : 0);
  return Math.round(base * (1 - FEE_RATE));
};

export const platformFee = (b: Booking) => {
  const base = b.rental + b.deliveryFee + (b.extraCharge?.status === 'Approved' ? b.extraCharge.amount : 0) + (b.extension?.status === 'Accepted' ? b.extension.extra : 0);
  return Math.round(base * FEE_RATE);
};

export const overlaps = (a1: string, a2: string, b1: string, b2: string) => a1 <= b2 && b1 <= a2;

export const LIVE_STATUSES = ['Pending payment', 'Confirmed', 'Out for delivery', 'Active', 'Return requested', 'Returned'];

export const eqName = (s: AppState, id: string) => s.equipment.find((e) => e.id === id)?.name ?? 'Equipment';

/** Expired or rejected documents pause new bookings for the equipment they cover (or the whole business). */
export const blockingDocs = (s: AppState, eq?: Equipment) =>
  s.docs.filter((d) => (d.status === 'Expired' || d.status === 'Rejected') && (d.equipmentId === null || (eq && d.equipmentId === eq.id)));

export const isBookable = (s: AppState, eq: Equipment) => eq.status === 'Published' && !!eq.pricing && blockingDocs(s, eq).length === 0;

/** Is a unit free (no live booking and no block) for the whole date range? */
export const unitConflict = (s: AppState, equipmentId: string, unitId: string, from: string, to: string, ignoreBooking?: string) => {
  const b = s.bookings.find(
    (x) => x.id !== ignoreBooking && x.equipmentId === equipmentId && x.unitId === unitId && LIVE_STATUSES.includes(x.status) && overlaps(from, to, x.start, x.end),
  );
  if (b) return `Booked on RigSetGo (${b.id}, ${shortDate(b.start)} – ${shortDate(b.end)})`;
  const bl = s.blocks.find((x) => x.equipmentId === equipmentId && x.unitId === unitId && overlaps(from, to, x.from, x.to));
  if (bl) return `Blocked: ${bl.reason.toLowerCase()} (${shortDate(bl.from)} – ${shortDate(bl.to)})`;
  return '';
};

export const fleetStats = (s: AppState) => {
  const units = s.equipment.filter((e) => e.status !== 'Retired' && e.status !== 'Draft').flatMap((e) => e.units.map((u) => ({ e, u })));
  const onRent = units.filter(({ e, u }) =>
    s.bookings.some((b) => b.equipmentId === e.id && b.unitId === u.id && ['Out for delivery', 'Active', 'Return requested'].includes(b.status)),
  ).length;
  const maintenance = units.filter(
    ({ e, u }) => e.status === 'Maintenance' || s.blocks.some((bl) => bl.equipmentId === e.id && bl.unitId === u.id && bl.reason === 'Maintenance' && overlaps(TODAY, TODAY, bl.from, bl.to)),
  ).length;
  const total = units.length;
  return { total, onRent, maintenance, available: Math.max(0, total - onRent - maintenance), pct: total ? Math.round((onRent / total) * 100) : 0 };
};

export const monthEarnings = (s: AppState, month = TODAY.slice(0, 7)) =>
  s.bookings.filter((b) => b.status !== 'Cancelled' && b.start.slice(0, 7) <= month && b.end.slice(0, 7) >= month && b.payment !== 'Pending').reduce((sum, b) => sum + supplierShare(b), 0);

export const initials = (name: string) =>
  name
    .replace(/[^A-Za-z& ]/g, '')
    .split(' ')
    .filter((w) => w && w !== '&')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const docStatusFor = (expires: string) => {
  if (!expires) return 'Valid' as const;
  const d = daysUntil(expires);
  if (d < 0) return 'Expired' as const;
  if (d <= 30) return 'Expiring soon' as const;
  return 'Valid' as const;
};
