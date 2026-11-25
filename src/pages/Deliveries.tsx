import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconCamera, IconCircleCheck, IconAlertTriangle, IconPlayerPlay, IconMapPin, IconClock, IconTruckDelivery, IconSignature, IconPhone } from '@tabler/icons-react';
import { useStore, nowStamp } from '../store/store';
import { Badge, Empty, Field, Modal, Progress, Tabs } from '../components/ui';
import { RouteMap } from '../components/charts';
import type { DeliveryJob } from '../data/types';
import { TODAY } from '../data/seed';
import { eqName, fmtDate, fmtStamp, money, shortDate } from '../data/utils';
import { DRIVER_ROLES, windowStart } from '../data/dispatch';
import { ME } from '../data/seed';

type DTab = 'Today' | 'Upcoming' | 'Needs driver' | 'Completed';

export function DeliveryList() {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState<DTab>('Today');
  const drivers = state.members.filter((m) => DRIVER_ROLES.includes(m.roleId) && m.status === 'Active');
  const f = (j: DeliveryJob, t: DTab) => (t === 'Today' ? j.date === TODAY : t === 'Upcoming' ? j.date > TODAY && j.status !== 'Done' : t === 'Needs driver' ? j.status === 'Needs driver' : j.status === 'Done');
  const list = state.jobs.filter((j) => f(j, tab)).sort((a, b) => a.date.localeCompare(b.date) || windowStart(a.window) - windowStart(b.window));
  const assign = (j: DeliveryJob, driverId: string) => {
    const d = state.members.find((m) => m.id === driverId);
    update(
      (s) => {
        const x = s.jobs.find((y) => y.id === j.id)!;
        x.driverId = driverId || null;
        if (x.status === 'Needs driver' && driverId) x.status = 'Scheduled';
        if (!driverId && x.status === 'Scheduled') x.status = 'Needs driver';
      },
      { history: `${j.type} for ${j.bookingId} assigned to ${d?.name ?? 'nobody'}`, toast: d ? `${d.name} assigned` : 'Driver removed' },
    );
  };
  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ fontSize: 22 }}>Deliveries and returns</h2>
          <p>Assign drivers, follow trips live and record handover tickets.</p>
        </div>
      </div>
      <div className="grid g4">
        {[
          ['Deliveries today', state.jobs.filter((j) => j.date === TODAY && j.type === 'Delivery').length],
          ['Pickups today', state.jobs.filter((j) => j.date === TODAY && j.type === 'Pickup').length],
          ['On the way now', state.jobs.filter((j) => j.status === 'On the way').length],
          ['Need a driver', state.jobs.filter((j) => j.status === 'Needs driver').length],
        ].map(([l, v]) => (
          <div key={String(l)} className="kpi">
            <span className="label">{l}</span>
            <span className="value">{v}</span>
          </div>
        ))}
      </div>
      <section className="card">
        <Tabs tabs={['Today', 'Upcoming', 'Needs driver', 'Completed'] as DTab[]} value={tab} onChange={setTab} counts={{ 'Needs driver': state.jobs.filter((j) => j.status === 'Needs driver').length }} />
        {list.length === 0 ? (
          <Empty title="No jobs here" text="Deliveries and pickups appear here once bookings are confirmed." icon={<IconTruckDelivery size={28} />} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Booking</th>
                  <th>When</th>
                  <th>Where</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((j) => {
                  const b = state.bookings.find((x) => x.id === j.bookingId)!;
                  return (
                    <tr key={j.id}>
                      <td>
                        <Badge tone={j.type === 'Delivery' ? 'navy' : 'orange'}>{j.type}</Badge>
                      </td>
                      <td>
                        <button className="link" onClick={() => nav(`/bookings/${b.id}`)}>
                          {b.id}
                        </button>
                        <div className="tiny muted">
                          {eqName(state, b.equipmentId)} · #{b.unitId}
                        </div>
                      </td>
                      <td>
                        <div className="strong small">{j.date === TODAY ? 'Today' : shortDate(j.date)}</div>
                        <div className="tiny muted">{j.window}</div>
                      </td>
                      <td className="small">{b.fulfillment === 'pickup' ? 'Your yard' : b.jobsite}</td>
                      <td>
                        {j.status === 'Done' ? (
                          state.members.find((m) => m.id === j.driverId)?.name ?? '—'
                        ) : (
                          <select className="select" style={{ padding: '7px 10px', fontSize: 13.5, width: 170 }} value={j.driverId ?? ''} onChange={(e) => assign(j, e.target.value)} aria-label="Driver">
                            <option value="">Choose driver</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <Badge>{j.status}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => nav(`/deliveries/${j.id}`)}>
                          {j.status === 'On the way' ? 'Track live' : j.status === 'Done' ? 'View ticket' : 'Open'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export function DeliveryDetail() {
  const { id } = useParams();
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const j = state.jobs.find((x) => x.id === id);
  const [ticket, setTicket] = useState(false);
  const [late, setLate] = useState(false);
  const [lateMin, setLateMin] = useState('30');

  // Simulated GPS: the truck moves along the route while this page is open.
  useEffect(() => {
    if (!j || j.status !== 'On the way' || j.progress >= 100) return;
    const t = setTimeout(() => update((s) => { const x = s.jobs.find((y) => y.id === j.id); if (x) x.progress = Math.min(100, x.progress + 4); }), 1500);
    return () => clearTimeout(t);
  }, [j, update]);

  if (!j) return <Empty title="Job not found" action={<Link className="btn btn-secondary" to="/deliveries">Back to deliveries</Link>} />;
  const b = state.bookings.find((x) => x.id === j.bookingId)!;
  const drivers = state.members.filter((m) => DRIVER_ROLES.includes(m.roleId) && m.status === 'Active');
  const driver = state.members.find((m) => m.id === j.driverId);
  const left = Math.round(j.distance * (1 - j.progress / 100));
  const steps = ['Needs driver', 'Scheduled', 'On the way', 'Done'];
  const cur = steps.indexOf(j.status);

  const start = () =>
    update(
      (s) => {
        const x = s.jobs.find((y) => y.id === j.id)!;
        x.status = 'On the way';
        x.progress = 4;
        const bk = s.bookings.find((y) => y.id === j.bookingId)!;
        if (j.type === 'Delivery') bk.status = 'Out for delivery';
        bk.timeline.push({ time: nowStamp(), text: `${driver?.name ?? 'Driver'} started the ${j.type.toLowerCase()} trip` });
      },
      { history: `${j.type} trip started for ${j.bookingId}`, toast: 'Trip started. The contractor can now follow it live' },
    );

  return (
    <>
      <button className="back" onClick={() => nav('/deliveries')}>
        <IconArrowLeft size={16} /> All deliveries
      </button>
      <div className="grid g-main">
        <section className="card">
          <div className="row between top">
            <div>
              <div className="row gap-8">
                <Badge tone={j.type === 'Delivery' ? 'navy' : 'orange'}>{j.type}</Badge>
                <Badge>{j.status}</Badge>
              </div>
              <h2 style={{ fontSize: 22, marginTop: 8 }}>
                {eqName(state, b.equipmentId)} · #{b.unitId}
              </h2>
              <div className="muted small">
                {j.date === TODAY ? 'Today' : fmtDate(j.date)} · {j.window} · <button className="link" onClick={() => nav(`/bookings/${b.id}`)}>{b.id}</button> · {b.contractor}
              </div>
            </div>
            <div className="row">
              {j.status === 'Scheduled' && (
                <button className="btn btn-primary" onClick={start}>
                  <IconPlayerPlay size={18} /> Start trip
                </button>
              )}
              {j.status === 'On the way' && (
                <>
                  <button className="btn btn-secondary" onClick={() => setLate(true)}>
                    Running late
                  </button>
                  <button className="btn btn-primary" onClick={() => setTicket(true)}>
                    {j.progress >= 100 ? 'Arrived · fill in ticket' : 'Mark arrived'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="stepper">
            {steps.map((s, i) => (
              <div key={s} className={`s ${i < cur ? 'done' : i === cur ? 'now' : ''}`}>
                <div className="line">
                  <i className={i === 0 ? 'hide' : i <= cur ? 'on' : ''} />
                  <span className="c">{i < cur ? '✓' : i + 1}</span>
                  <i className={i === 3 ? 'hide' : i < cur ? 'on' : ''} />
                </div>
                {s === 'Done' ? (j.type === 'Delivery' ? 'Delivered' : 'Picked up') : s}
              </div>
            ))}
          </div>
          <RouteMap progress={j.progress} label={j.status === 'On the way' ? `${j.progress >= 100 ? 'Arrived' : 'On time'} · ${b.jobsite.split(',')[0]}` : undefined} height={300} />
          {j.status === 'On the way' && (
            <div className="grid g3" style={{ gap: 12 }}>
              <div className="stat">
                <span className="label">Progress</span>
                <span className="value">{j.progress}%</span>
                <Progress value={j.progress} />
              </div>
              <div className="stat">
                <span className="label">Distance left</span>
                <span className="value">{left} mi</span>
              </div>
              <div className="stat">
                <span className="label">Arrives in</span>
                <span className="value">{j.progress >= 100 ? 'Arrived' : `${Math.max(1, Math.round(left * 1.4))} min`}</span>
              </div>
            </div>
          )}
          {j.status === 'On the way' && (
            <div className="banner info small">
              <IconMapPin size={18} />
              <div className="grow">The contractor sees the same live map and arrival time. Location is shared only while the trip is running.</div>
            </div>
          )}
          {j.ticket && (
            <div className="card" style={{ background: 'var(--navy-50)', borderColor: 'var(--tint-2)' }}>
              <div className="card-head">
                <h3>{j.type} ticket</h3>
                <span className="muted small">{fmtStamp(j.ticket.time)}</span>
              </div>
              <div className="grid g3" style={{ gap: 12 }}>
                {[
                  ['Photos', `${j.ticket.photos} photos`],
                  ['Condition', j.ticket.condition],
                  ['Fuel level', `${j.ticket.fuel}%`],
                  ['Meter reading', `${j.ticket.meter.toLocaleString()} h`],
                  ['Machine ID', j.ticket.idMatches ? 'Matches booking' : 'Mismatch'],
                  ['Signed by', j.ticket.signedBy],
                ].map(([l, v]) => (
                  <div key={l} className="stat">
                    <span className="label">{l}</span>
                    <span className="strong">{v}</span>
                  </div>
                ))}
              </div>
              {j.ticket.damageNote && (
                <div className="banner warning small">
                  <IconAlertTriangle size={18} />
                  <div className="grow">
                    <b>Damage or usage recorded</b>
                    {j.ticket.damageNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        <div className="col gap-24">
          <section className="card">
            <h3>Driver</h3>
            {j.status === 'Done' ? (
              <div className="strong">{driver?.name ?? '—'}</div>
            ) : (
              <Field label="Assigned driver" hint="Choose who drives this trip. You can change it until the trip starts.">
                <select
                  className="select"
                  value={j.driverId ?? ''}
                  onChange={(e) =>
                    update(
                      (s) => {
                        const x = s.jobs.find((y) => y.id === j.id)!;
                        x.driverId = e.target.value || null;
                        if (x.status === 'Needs driver' && e.target.value) x.status = 'Scheduled';
                        if (!e.target.value && x.status === 'Scheduled') x.status = 'Needs driver';
                      },
                      { history: `Driver changed on ${j.id}`, toast: 'Driver updated' },
                    )
                  }
                >
                  <option value="">Choose a driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </section>
          <section className="card">
            <h3>{b.fulfillment === 'pickup' ? 'Handover at your yard' : 'Jobsite'}</h3>
            <div className="row gap-8 small">
              <IconMapPin size={18} color="var(--navy)" /> {b.fulfillment === 'pickup' ? state.business.address : b.jobsite}
            </div>
            <div className="row gap-8 small">
              <IconPhone size={18} color="var(--navy)" /> {b.siteContact}
            </div>
            <div className="row gap-8 small">
              <IconClock size={18} color="var(--navy)" /> {j.window}
            </div>
          </section>
        </div>
      </div>
      {ticket && <TicketModal bookingId={b.id} kind={j.type} jobId={j.id} onClose={() => setTicket(false)} />}
      {late && (
        <Modal
          title="Running late"
          sub={`${b.contactName} will get a message with the new arrival time.`}
          onClose={() => setLate(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setLate(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  update((s) => s.bookings.find((y) => y.id === b.id)!.timeline.push({ time: nowStamp(), text: `Driver running about ${lateMin} minutes late. Contractor told` }), { history: `${j.id}: running late ${lateMin} min` });
                  toast(`${b.contactName} was told you are ${lateMin} minutes late`, 'info');
                  setLate(false);
                }}
              >
                Send update
              </button>
            </>
          }
        >
          <Field label="How late?">
            <select className="select" value={lateMin} onChange={(e) => setLateMin(e.target.value)}>
              {['15', '30', '45', '60'].map((m) => (
                <option key={m} value={m}>
                  About {m} minutes
                </option>
              ))}
            </select>
          </Field>
        </Modal>
      )}
    </>
  );
}

/** Delivery or return ticket: photos, condition, fuel, meter, ID check and signature. */
export function TicketModal({ bookingId, kind, jobId, onClose }: { bookingId: string; kind: 'Delivery' | 'Pickup'; jobId?: string; onClose: () => void }) {
  const { state, update } = useStore();
  const b = state.bookings.find((x) => x.id === bookingId)!;
  const eq = state.equipment.find((e) => e.id === b.equipmentId)!;
  const unit = eq.units.find((u) => u.id === b.unitId);
  const before = state.jobs.find((j) => j.bookingId === bookingId && j.type === 'Delivery' && j.ticket)?.ticket;
  const [photos, setPhotos] = useState(0);
  const [condition, setCondition] = useState(kind === 'Delivery' ? 'Excellent' : 'Good');
  const [fuel, setFuel] = useState(100);
  const [meter, setMeter] = useState((unit?.meterHours ?? 0) + (kind === 'Pickup' ? 64 : 0));
  const [idOk, setIdOk] = useState(false);
  const [signer, setSigner] = useState('');
  const [same, setSame] = useState(true);
  const [damage, setDamage] = useState('');
  const [charge, setCharge] = useState(0);
  const [err, setErr] = useState('');
  const save = () => {
    if (photos < 4) return setErr('Take at least 4 photos: front, back, both sides.');
    if (!idOk) return setErr(`Check the machine number matches the booking. If it does not, stop and call ${ME.admin}.`);
    if (signer.trim().length < 3) return setErr('The site contact must sign by typing their full name.');
    if (kind === 'Pickup' && !same && (damage.trim().length < 5 || charge <= 0)) return setErr('Describe the damage or extra usage and the amount to charge.');
    const t = { photos, condition, fuel, meter, idMatches: idOk, signedBy: signer, time: nowStamp(), damageNote: kind === 'Pickup' && !same ? damage : undefined };
    update(
      (s) => {
        const bk = s.bookings.find((y) => y.id === bookingId)!;
        let job = jobId ? s.jobs.find((y) => y.id === jobId) : undefined;
        if (!job) {
          job = { id: `JOB-${400 + s.jobs.length}`, bookingId, type: kind, date: TODAY, window: 'Yard handover', driverId: ME.id, status: 'Done', progress: 100, distance: 0 };
          s.jobs.push(job);
        }
        job.status = 'Done';
        job.progress = 100;
        job.ticket = t;
        const eqx = s.equipment.find((e) => e.id === bk.equipmentId)!.units.find((u) => u.id === bk.unitId);
        if (eqx) eqx.meterHours = meter;
        if (kind === 'Delivery') {
          bk.status = 'Active';
          bk.timeline.push({ time: nowStamp(), text: `${bk.fulfillment === 'pickup' ? 'Collected at the yard' : 'Delivered'}. Ticket signed by ${signer}` });
        } else {
          bk.status = 'Returned';
          if (!same) bk.extraCharge = { reason: damage, amount: charge, status: 'Needs review' };
          bk.timeline.push({ time: nowStamp(), text: `Returned. Ticket signed by ${signer}${!same ? `. Damage recorded with ${photos} photos` : ''}` });
        }
      },
      {
        history: `${kind} ticket recorded for ${bookingId}`,
        toast: kind === 'Delivery' ? 'Handover recorded. The rental is now active' : !same ? `Return recorded. The ${money(charge)} extra charge was sent to ${ME.admin} for review` : 'Return recorded',
      },
    );
    onClose();
  };
  return (
    <Modal
      title={`${kind === 'Delivery' ? 'Delivery' : 'Return'} ticket`}
      sub={`${bookingId} · ${eq.name} · Unit #${b.unitId}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            <IconSignature size={18} /> Save signed ticket
          </button>
        </>
      }
    >
      <div className="row between" style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
        <div className="row">
          <span className="icon-circle">
            <IconCamera size={20} />
          </span>
          <div>
            <div className="strong">{photos} photos taken</div>
            <div className="tiny muted">Front, back, both sides, and any marks</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setPhotos(photos + 1)}>
          <IconCamera size={18} /> Take photo
        </button>
      </div>
      <div className="grid g3" style={{ gap: 16 }}>
        <Field label="Condition">
          <select className="select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Damaged</option>
          </select>
        </Field>
        <Field label={`Fuel level: ${fuel}%`} hint={before ? `At delivery: ${before.fuel}%` : undefined}>
          <input type="range" min={0} max={100} step={5} value={fuel} onChange={(e) => setFuel(Number(e.target.value))} style={{ accentColor: 'var(--navy)' }} />
        </Field>
        <Field label="Meter reading (hours)" hint={before ? `At delivery: ${before.meter.toLocaleString()} h` : undefined}>
          <input className="input" type="number" value={meter} onChange={(e) => setMeter(Number(e.target.value))} />
        </Field>
      </div>
      <label className="check" style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
        <input type="checkbox" checked={idOk} onChange={(e) => setIdOk(e.target.checked)} />
        <span>
          Machine number on the plate matches <b>Unit #{b.unitId}</b> on this booking
        </span>
      </label>
      {kind === 'Pickup' && (
        <>
          <Field label="Same condition as at delivery?">
            <div className="row">
              <label className={`option ${same ? 'selected' : ''}`} style={{ flex: 1 }}>
                <input type="radio" checked={same} onChange={() => setSame(true)} /> Yes, no problems
              </label>
              <label className={`option ${!same ? 'selected' : ''}`} style={{ flex: 1 }}>
                <input type="radio" checked={!same} onChange={() => setSame(false)} /> No, record damage or extra use
              </label>
            </div>
          </Field>
          {!same && (
            <div className="grid g2" style={{ gap: 16 }}>
              <Field label="What is wrong?">
                <textarea className="textarea" value={damage} onChange={(e) => setDamage(e.target.value)} placeholder="e.g. Cracked mirror, fuel at 1/4" />
              </Field>
              <Field label="Suggested extra charge ($)" hint={`${ME.admin} (Supplier Admin) reviews it before the contractor is charged.`}>
                <input className="input" type="number" value={charge || ''} onChange={(e) => setCharge(Number(e.target.value))} />
              </Field>
            </div>
          )}
        </>
      )}
      <Field label="Site contact signs here" hint="Type the full name. This counts as the signature.">
        <input className="input" style={{ fontFamily: 'cursive', fontSize: 20 }} value={signer} onChange={(e) => setSigner(e.target.value)} placeholder={b.siteContact.split('·')[0].trim()} />
      </Field>
      {err && (
        <div className="banner danger small">
          <IconAlertTriangle size={18} />
          <div className="grow">{err}</div>
        </div>
      )}
      {!err && photos >= 4 && idOk && signer.trim().length >= 3 && (
        <div className="banner success small">
          <IconCircleCheck size={18} />
          <div className="grow">Everything needed is filled in.</div>
        </div>
      )}
    </Modal>
  );
}
