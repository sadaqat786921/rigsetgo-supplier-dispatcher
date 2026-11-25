import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconRoute, IconClock, IconTruckDelivery, IconUserPlus, IconCalendarEvent, IconMessageCircle, IconBuildingWarehouse, IconArrowRight, IconMapPin, IconPlayerPlay, IconSignature, IconCircleCheck } from '@tabler/icons-react';
import { useStore } from '../store/store';
import { Avatar, Badge, Empty, Pills, Progress } from '../components/ui';
import { RouteMap } from '../components/charts';
import { TODAY } from '../data/seed';
import { addDays, eqName, fmtDate, shortDate } from '../data/utils';
import { DRIVER_ROLES, dispatcherTasks, jobLabel, returnsDue, windowStart } from '../data/dispatch';
import type { DeliveryJob } from '../data/types';

const TASK_ICON = { driver: IconUserPlus, return: IconCalendarEvent, handover: IconBuildingWarehouse, case: IconMessageCircle, late: IconClock };

export default function Dashboard() {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState<'On the way' | 'Next up' | 'Done today'>('On the way');

  const today = state.jobs.filter((j) => j.date === TODAY).sort((a, b) => windowStart(a.window) - windowStart(b.window));
  const live = tab === 'On the way' ? state.jobs.filter((j) => j.status === 'On the way') : tab === 'Next up' ? state.jobs.filter((j) => j.status === 'Scheduled' || j.status === 'Needs driver').sort((a, b) => a.date.localeCompare(b.date)) : today.filter((j) => j.status === 'Done');
  const job = live[0];
  const jobBooking = job && state.bookings.find((b) => b.id === job.bookingId);
  const tasks = dispatcherTasks(state);
  const drivers = state.members.filter((m) => DRIVER_ROLES.includes(m.roleId) && m.status === 'Active');
  const week = state.jobs.filter((j) => j.date > TODAY && j.date <= addDays(TODAY, 7) && j.status !== 'Done').sort((a, b) => a.date.localeCompare(b.date) || windowStart(a.window) - windowStart(b.window));
  const due = returnsDue(state);

  const assign = (j: DeliveryJob, driverId: string) => {
    const d = state.members.find((m) => m.id === driverId);
    update(
      (s) => {
        const x = s.jobs.find((y) => y.id === j.id)!;
        x.driverId = driverId || null;
        if (x.status === 'Needs driver' && driverId) x.status = 'Scheduled';
        if (!driverId && x.status === 'Scheduled') x.status = 'Needs driver';
      },
      { history: `${j.type} for ${j.bookingId} assigned to ${d?.name ?? 'nobody'}`, toast: d ? `${d.name} assigned to ${j.id}` : 'Driver removed' },
    );
  };

  const kpis = [
    { label: 'Deliveries today', value: today.filter((j) => j.type === 'Delivery').length, icon: IconTruckDelivery },
    { label: 'Pickups today', value: today.filter((j) => j.type === 'Pickup').length, icon: IconRoute },
    { label: 'On the road now', value: state.jobs.filter((j) => j.status === 'On the way').length, icon: IconMapPin },
    { label: 'Need a driver', value: state.jobs.filter((j) => j.status === 'Needs driver').length, icon: IconUserPlus, warn: true },
  ];

  return (
    <>
      <div className="grid g4">
        {kpis.map((k) => (
          <button key={k.label} className="kpi" style={{ textAlign: 'left', cursor: 'pointer', border: k.warn && k.value > 0 ? '1.5px solid var(--orange)' : undefined }} onClick={() => nav('/deliveries')}>
            <span className="label row gap-8">
              <k.icon size={18} color={k.warn && k.value > 0 ? 'var(--orange)' : 'var(--navy)'} /> {k.label}
            </span>
            <span className="value">{k.value}</span>
          </button>
        ))}
      </div>

      {/* Live trip + what needs you */}
      <section className="card" style={{ flexDirection: 'row', gap: 24, alignItems: 'stretch' }} aria-label="Live trip">
        <div className="col gap-16" style={{ width: 320, flex: 'none' }}>
          <Pills items={['On the way', 'Next up', 'Done today'] as const} value={tab} onChange={setTab} />
          {job && jobBooking ? (
            <>
              <div>
                <div className="row gap-8">
                  <Badge tone={job.type === 'Delivery' ? 'navy' : 'orange'}>{job.type}</Badge>
                  <Badge>{jobLabel(job)}</Badge>
                </div>
                <div className="strong" style={{ marginTop: 8 }}>
                  {eqName(state, jobBooking.equipmentId)} · #{jobBooking.unitId}
                </div>
                <div className="tiny muted">
                  {job.bookingId} · {jobBooking.contractor} · {state.members.find((m) => m.id === job.driverId)?.name ?? 'No driver yet'}
                </div>
              </div>
              <div className="big-num" style={{ fontSize: 48 }}>
                {job.progress}
                <small>%</small>
              </div>
              <Progress value={job.progress} />
              <div className="grid g2" style={{ gap: 12 }}>
                <div className="stat">
                  <span className="label row gap-4">
                    <IconRoute size={16} color="var(--navy)" /> Distance left
                  </span>
                  <span className="value" style={{ color: 'var(--navy)' }}>
                    {Math.round(job.distance * (1 - job.progress / 100))} mi
                  </span>
                </div>
                <div className="stat">
                  <span className="label row gap-4">
                    <IconClock size={16} color="var(--navy)" /> {job.status === 'On the way' ? 'Arrives in' : job.status === 'Done' ? 'Finished' : 'Time window'}
                  </span>
                  <span className="value" style={{ color: 'var(--navy)', fontSize: job.status === 'On the way' ? 24 : 15 }}>
                    {job.status === 'On the way' ? `${Math.max(1, Math.round(job.distance * (1 - job.progress / 100) * 1.4))} min` : job.status === 'Done' ? 'Today' : `${job.date === TODAY ? 'Today' : shortDate(job.date)}, ${job.window}`}
                  </span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => nav(`/deliveries/${job.id}`)}>
                {job.status === 'On the way' ? 'Open live tracking' : job.status === 'Done' ? 'View ticket' : 'Open job'}
              </button>
            </>
          ) : (
            <Empty title={tab === 'On the way' ? 'No trips on the road' : tab === 'Next up' ? 'Nothing coming up' : 'Nothing finished yet today'} text="Trips show here as soon as a driver starts them." icon={<IconTruckDelivery size={28} />} />
          )}
        </div>
        <div className="grow" style={{ cursor: job ? 'pointer' : 'default' }} onClick={() => job && nav(`/deliveries/${job.id}`)}>
          <RouteMap progress={job?.progress ?? 0} label={jobBooking ? `${job.status === 'Done' ? 'Done' : job.status === 'On the way' ? 'On time' : 'Planned'} · ${(jobBooking.fulfillment === 'pickup' ? 'Your yard' : jobBooking.jobsite).split(',')[0]}` : undefined} height={330} />
        </div>
        <div className="card" style={{ width: 300, flex: 'none', boxShadow: 'var(--shadow)', padding: 20, gap: 14 }}>
          <div className="card-head">
            <h3 style={{ fontSize: 16 }}>Needs your attention</h3>
            <span className="badge b-orange">{tasks.length}</span>
          </div>
          {tasks.length === 0 && (
            <div className="row gap-8 small muted">
              <IconCircleCheck size={18} color="var(--success)" /> All jobs have a driver. Nothing is waiting on you.
            </div>
          )}
          {tasks.slice(0, 4).map((t, i) => {
            const Icon = TASK_ICON[t.kind];
            return (
              <button key={i} className="row top" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => nav(t.to)}>
                <span className={`icon-circle ${t.kind === 'driver' ? 'orange' : ''}`} style={{ width: 36, height: 36 }}>
                  <Icon size={18} />
                </span>
                <span className="grow">
                  <div className="strong small">{t.title}</div>
                  <div className="tiny muted">{t.text}</div>
                </span>
              </button>
            );
          })}
          {tasks.length > 4 && <div className="tiny muted">+ {tasks.length - 4} more</div>}
          {tasks[0] && (
            <button className="btn btn-primary btn-block" style={{ marginTop: 'auto' }} onClick={() => nav(tasks[0].to)}>
              {tasks[0].action} <IconArrowRight size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Today's schedule + drivers */}
      <div className="grid g-main">
        <section className="card">
          <div className="card-head">
            <h2>Today’s schedule</h2>
            <button className="link" onClick={() => nav('/deliveries')}>
              All deliveries
            </button>
          </div>
          {today.length === 0 ? (
            <Empty title="No jobs today" text="Deliveries and pickups for today will show here." icon={<IconTruckDelivery size={28} />} />
          ) : (
            <div className="timeline">
              {today.map((j) => {
                const b = state.bookings.find((x) => x.id === j.bookingId)!;
                return (
                  <div key={j.id} className="t">
                    <i style={j.status === 'Done' ? { background: 'var(--success)' } : j.status === 'Needs driver' ? { background: 'var(--orange)' } : undefined} />
                    <div className="row between top grow" style={{ gap: 16 }}>
                      <div>
                        <div className="row gap-8">
                          <b className="small">{j.window}</b>
                          <Badge tone={j.type === 'Delivery' ? 'navy' : 'orange'}>{j.type}</Badge>
                          <Badge>{jobLabel(j)}</Badge>
                        </div>
                        <div className="strong" style={{ marginTop: 4 }}>
                          {eqName(state, b.equipmentId)} · #{b.unitId}
                        </div>
                        <div className="tiny muted">
                          {j.bookingId} · {b.contractor} · {b.fulfillment === 'pickup' ? 'Your yard' : b.jobsite}
                        </div>
                      </div>
                      <div className="row" style={{ flex: 'none' }}>
                        {j.status !== 'Done' && j.status !== 'On the way' && (
                          <select className="select" style={{ padding: '7px 10px', fontSize: 13.5, width: 160 }} value={j.driverId ?? ''} onChange={(e) => assign(j, e.target.value)} aria-label={`Driver for ${j.id}`}>
                            <option value="">Choose driver</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button className={`btn btn-sm ${j.status === 'Scheduled' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => nav(`/deliveries/${j.id}`)}>
                          {j.status === 'Scheduled' ? (
                            <>
                              <IconPlayerPlay size={15} /> Start
                            </>
                          ) : j.status === 'On the way' ? (
                            'Track'
                          ) : j.status === 'Done' ? (
                            <>
                              <IconSignature size={15} /> Ticket
                            </>
                          ) : (
                            'Open'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Drivers today</h2>
          </div>
          {drivers.map((d) => {
            const mine = today.filter((j) => j.driverId === d.id);
            const onTrip = state.jobs.some((j) => j.driverId === d.id && j.status === 'On the way');
            return (
              <div key={d.id} className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div className="row">
                  <Avatar name={d.name} />
                  <div>
                    <div className="strong small">{d.name}</div>
                    <div className="tiny muted">
                      {mine.length} {mine.length === 1 ? 'job' : 'jobs'} today
                      {mine.find((j) => j.status !== 'Done') ? ` · next ${mine.find((j) => j.status !== 'Done')!.window}` : ''}
                    </div>
                  </div>
                </div>
                <Badge tone={onTrip ? 'navy' : mine.some((j) => j.status === 'Scheduled') ? 'orange' : 'green'}>{onTrip ? 'On a trip' : mine.some((j) => j.status === 'Scheduled') ? 'Has jobs later' : 'Free'}</Badge>
              </div>
            );
          })}
          <div className="tiny muted">Drivers come from your company team. Your Supplier Admin adds or removes team members.</div>
        </section>
      </div>

      {/* Coming up + returns due */}
      <div className="grid g2">
        <section className="card">
          <div className="card-head">
            <h2>Next 7 days</h2>
            <span className="muted small">{week.length} {week.length === 1 ? 'job' : 'jobs'}</span>
          </div>
          {week.length === 0 && <div className="muted small">No deliveries or pickups planned for the next 7 days.</div>}
          {week.map((j) => {
            const b = state.bookings.find((x) => x.id === j.bookingId)!;
            return (
              <button key={j.id} className="row between" style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 14, padding: 12, cursor: 'pointer', textAlign: 'left' }} onClick={() => nav(`/deliveries/${j.id}`)}>
                <div className="row">
                  <div className="col gap-0" style={{ width: 54, textAlign: 'center' }}>
                    <span className="tiny muted">{new Date(j.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <b style={{ fontSize: 20, color: 'var(--navy)' }}>{Number(j.date.slice(8))}</b>
                  </div>
                  <div>
                    <div className="strong small">
                      {j.type} · {eqName(state, b.equipmentId)}
                    </div>
                    <div className="tiny muted">
                      {j.window} · {state.members.find((m) => m.id === j.driverId)?.name ?? 'No driver yet'}
                    </div>
                  </div>
                </div>
                <Badge>{j.status}</Badge>
              </button>
            );
          })}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Returns coming up</h2>
            <span className="muted small">Next 3 days</span>
          </div>
          {due.length === 0 && <div className="muted small">No rentals end in the next 3 days without a pickup planned.</div>}
          {due.map((b) => (
            <button key={b.id} className="row between" style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 14, padding: 12, cursor: 'pointer', textAlign: 'left' }} onClick={() => nav(`/bookings/${b.id}`)}>
              <div>
                <div className="strong small">
                  {b.id} · {eqName(state, b.equipmentId)} · #{b.unitId}
                </div>
                <div className="tiny muted">
                  {b.contractor} · ends {fmtDate(b.end)} · {b.fulfillment === 'delivery' ? 'we pick it up' : 'they bring it back to the yard'}
                </div>
              </div>
              <span className="btn btn-secondary btn-sm">{b.fulfillment === 'delivery' ? 'Schedule pickup' : 'Open'}</span>
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
