import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight, IconPlus, IconBan, IconEye } from '@tabler/icons-react';
import { useStore, uid } from '../store/store';
import { Badge, ConfirmDialog, Field, Modal } from '../components/ui';
import type { CalendarBlock } from '../data/types';
import { TODAY, ME } from '../data/seed';
import { fmtDate, iso, overlaps, shortDate, LIVE_STATUSES } from '../data/utils';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const eqs = state.equipment.filter((e) => e.status !== 'Retired' && e.units.length);
  const [eqId, setEqId] = useState(params.get('eq') ?? eqs[0]?.id);
  const eq = state.equipment.find((e) => e.id === eqId) ?? eqs[0];
  const [unitId, setUnitId] = useState<string>(params.get('unit') ?? eq?.units[0]?.id ?? '');
  const unit = eq?.units.find((u) => u.id === unitId) ?? eq?.units[0];
  const [ym, setYm] = useState<[number, number]>([2026, 10]);
  const [view, setView] = useState<CalendarBlock | null>(null);

  if (!eq || !unit) return null;
  const first = new Date(ym[0], ym[1], 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return iso(d);
  });
  const bookings = state.bookings.filter((b) => b.equipmentId === eq.id && b.unitId === unit.id && b.status !== 'Cancelled');
  const blocks = state.blocks.filter((b) => b.equipmentId === eq.id && b.unitId === unit.id);
  const upcoming = [...bookings.filter((b) => b.end >= TODAY).map((b) => ({ k: b.id, from: b.start, to: b.end, label: `${b.id} · ${b.contractor}`, tone: 'navy', to_: `/bookings/${b.id}` })), ...blocks.filter((b) => b.to >= TODAY).map((b) => ({ k: b.id, from: b.from, to: b.to, label: `${b.reason}${b.note ? ` · ${b.note}` : ''}`, tone: b.reason === 'Maintenance' ? 'orange' : 'grey', to_: '' }))].sort((a, b) => a.from.localeCompare(b.from));

  const move = (n: number) => {
    let [y, m] = ym;
    m += n;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYm([y, m]);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ fontSize: 22 }}>Availability for each unit</h2>
          <p>See when each machine is booked, in repair or rented outside RigSetGo, so you can plan deliveries and pickups.</p>
        </div>
        <span className="badge b-grey" style={{ padding: '8px 12px' }}>
          <IconEye size={15} /> View only
        </span>
      </div>
      <section className="card">
        <div className="row between wrap">
          <div className="row">
            <select
              className="select"
              style={{ width: 280 }}
              value={eq.id}
              aria-label="Equipment"
              onChange={(e) => {
                setEqId(e.target.value);
                setUnitId(state.equipment.find((x) => x.id === e.target.value)?.units[0]?.id ?? '');
              }}
            >
              {eqs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select className="select" style={{ width: 160 }} value={unit.id} onChange={(e) => setUnitId(e.target.value)} aria-label="Unit">
              {eq.units.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit #{u.id}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous month">
              <IconChevronLeft size={18} />
            </button>
            <b style={{ minWidth: 150, textAlign: 'center', fontSize: 17 }}>
              {MONTHS[ym[1]]} {ym[0]}
            </b>
            <button className="icon-btn" onClick={() => move(1)} aria-label="Next month">
              <IconChevronRight size={18} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setYm([2026, 10])}>
              Today
            </button>
          </div>
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--navy)' }} /> Booked on RigSetGo</span>
          <span><i style={{ background: 'var(--orange-bg)', border: '1px solid var(--orange)' }} /> Maintenance</span>
          <span><i style={{ background: '#eef1f5', border: '1px solid var(--line-strong)' }} /> Rented outside RigSetGo</span>
          <span>Click a booking to open it. To block days, ask {ME.admin} or your Inventory Manager.</span>
        </div>
        <div className="cal">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="dow">{d}</div>
          ))}
          {days.map((d) => {
            const bs = bookings.filter((b) => overlaps(d, d, b.start, b.end));
            const bl = blocks.filter((b) => overlaps(d, d, b.from, b.to));
            const out = Number(d.slice(5, 7)) - 1 !== ym[1];
            return (
              <button
                key={d}
                className={`day ${out ? 'out' : ''} ${d === TODAY ? 'today' : ''}`}
                onClick={() => {
                  if (bs[0]) nav(`/bookings/${bs[0].id}`);
                  else if (bl[0]) setView(bl[0]);
                }}
              >
                <span className="num">{Number(d.slice(8))}</span>
                {bs.map((b) => (
                  <span key={b.id} className="tag tag-booked" title={`${b.id} · ${b.contractor}`}>
                    {b.contractor.split(' ')[0]}
                  </span>
                ))}
                {bl.map((b) => (
                  <span key={b.id} className={`tag ${b.reason === 'Maintenance' ? 'tag-maint' : 'tag-outside'}`} title={b.note}>
                    {b.reason === 'Maintenance' ? 'Maintenance' : 'Outside'}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </section>
      <section className="card">
        <div className="card-head">
          <h3>
            Coming up for {eq.name} · #{unit.id}
          </h3>
        </div>
        {upcoming.length === 0 && <div className="muted">No bookings or blocks coming up. This unit is free.</div>}
        {upcoming.map((u) => (
          <div key={u.k} className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
            <div className="row">
              <Badge tone={u.tone}>
                {shortDate(u.from)} – {shortDate(u.to)}
              </Badge>
              <span>{u.label}</span>
            </div>
            {u.to_ ? (
              <button className="link" onClick={() => nav(u.to_)}>
                Open booking
              </button>
            ) : (
              <button className="link" onClick={() => setView(blocks.find((b) => b.id === u.k)!)}>
                View block
              </button>
            )}
          </div>
        ))}
      </section>
      {view && (
        <Modal
          title={view.reason}
          sub={`${eq.name} · Unit #${view.unitId}`}
          onClose={() => setView(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setView(null)}>
                Close
              </button>
            </>
          }
        >
          <div className="row between">
            <span className="muted">Dates</span>
            <b>
              {fmtDate(view.from)} – {fmtDate(view.to)}
            </b>
          </div>
          <div className="row between">
            <span className="muted">Note</span>
            <b>{view.note || '—'}</b>
          </div>
        </Modal>
      )}
    </>
  );
}
