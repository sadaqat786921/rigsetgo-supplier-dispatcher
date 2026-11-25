import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconPlus, IconSend, IconPaperclip, IconMessageCircle, IconCircleCheck } from '@tabler/icons-react';
import { useStore, nowStamp } from '../store/store';
import { Badge, ConfirmDialog, Empty, Field, Modal, Tabs } from '../components/ui';
import type { SupportCase } from '../data/types';
import { eqName, fmtStamp } from '../data/utils';
import { canSeeCase } from '../data/dispatch';
import { ME } from '../data/seed';

/** Billing questions go to the Supplier Admin, so the Dispatcher does not open or see them. */
const CATS: SupportCase['category'][] = ['Late delivery', 'Breakdown', 'Equipment mismatch', 'Damage'];

export function SupportList() {
  const { state } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'Open' | 'Waiting on you' | 'Resolved' | 'All'>('Open');
  const [newCase, setNewCase] = useState(params.get('new') === '1');
  useEffect(() => {
    if (params.get('new') === '1') setNewCase(true);
  }, [params]);
  const visible = state.cases.filter(canSeeCase);
  const list = visible.filter((c) => (tab === 'All' ? true : tab === 'Open' ? c.status !== 'Resolved' : c.status === tab));
  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ fontSize: 22 }}>Problems on a booking</h2>
          <p>Delivery, breakdown, damage and wrong-machine problems on a booking. The RigSetGo support team helps both sides. Billing questions go to {ME.admin}.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewCase(true)}>
          <IconPlus size={18} /> Open a case
        </button>
      </div>
      <section className="card">
        <Tabs tabs={['Open', 'Waiting on you', 'Resolved', 'All'] as const} value={tab} onChange={setTab} counts={{ Open: visible.filter((c) => c.status !== 'Resolved').length, 'Waiting on you': visible.filter((c) => c.status === 'Waiting on you').length }} />
        {list.length === 0 ? (
          <Empty title="No cases here" text="Good news. Nothing needs your attention." icon={<IconMessageCircle size={28} />} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Subject</th>
                <th>Booking</th>
                <th>Category</th>
                <th>Last message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="click" onClick={() => nav(`/support/${c.id}`)}>
                  <td className="strong">{c.id}</td>
                  <td>{c.subject}</td>
                  <td>{c.bookingId}</td>
                  <td>{c.category}</td>
                  <td className="small muted">{fmtStamp(c.messages[c.messages.length - 1].time)}</td>
                  <td>
                    <Badge>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {newCase && (
        <NewCaseModal
          bookingId={params.get('booking') ?? undefined}
          onClose={() => {
            setNewCase(false);
            setParams({});
          }}
        />
      )}
    </>
  );
}

function NewCaseModal({ bookingId, onClose }: { bookingId?: string; onClose: () => void }) {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [booking, setBooking] = useState(bookingId ?? state.bookings[0].id);
  const [cat, setCat] = useState<SupportCase['category']>('Late delivery');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  return (
    <Modal
      title="Open a support case"
      sub="The RigSetGo support team replies within a few hours."
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (subject.trim().length < 4 || text.trim().length < 10) return setErr('Add a short subject and describe the problem (at least 10 characters).');
              const id = `CASE-${330 + state.cases.length}`;
              update(
                (s) =>
                  s.cases.unshift({
                    id, bookingId: booking, category: cat, subject, status: 'Open', created: nowStamp(),
                    messages: [{ from: 'You', text, time: nowStamp() }, { from: 'RigSetGo Support', text: 'Thanks, we have your case and will reply shortly.', time: nowStamp() }],
                  }),
                { history: `Opened support case ${id} on ${booking}`, toast: `Case ${id} opened` },
              );
              onClose();
              nav(`/support/${id}`);
            }}
          >
            Open case
          </button>
        </>
      }
    >
      <Field label="Booking">
        <select className="select" value={booking} onChange={(e) => setBooking(e.target.value)}>
          {state.bookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.id} · {b.contractor} · {eqName(state, b.equipmentId)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="What is it about?">
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value as SupportCase['category'])}>
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Subject">
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Contractor disputes the fuel charge" />
      </Field>
      <Field label="Describe the problem">
        <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      {err && <div className="banner danger small">{err}</div>}
    </Modal>
  );
}

export function SupportDetail() {
  const { id } = useParams();
  const { state, update } = useStore();
  const nav = useNavigate();
  const c = state.cases.find((x) => x.id === id && canSeeCase(x));
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [resolve, setResolve] = useState(false);
  if (!c) return <Empty title="Case not found" action={<Link className="btn btn-secondary" to="/support">Back to support</Link>} />;
  const b = state.bookings.find((x) => x.id === c.bookingId);
  const send = () => {
    if (!reply.trim() && !files.length) return;
    update(
      (s) => {
        const x = s.cases.find((y) => y.id === c.id)!;
        x.messages.push({ from: 'You', text: reply.trim() + (files.length ? `\n📎 ${files.join(', ')}` : ''), time: nowStamp() });
        if (x.status !== 'Resolved') x.status = 'Open';
      },
      { history: `Replied on ${c.id}`, toast: 'Message sent' },
    );
    setReply('');
    setFiles([]);
  };
  return (
    <>
      <button className="back" onClick={() => nav('/support')}>
        <IconArrowLeft size={16} /> All support cases
      </button>
      <div className="grid g-main">
        <section className="card">
          <div className="row between top">
            <div>
              <div className="row gap-8">
                <Badge>{c.status}</Badge>
                <span className="muted small">
                  {c.id} · {c.category} · opened {fmtStamp(c.created)}
                </span>
              </div>
              <h2 style={{ fontSize: 22, marginTop: 8 }}>{c.subject}</h2>
            </div>
            {c.status !== 'Resolved' ? (
              <button className="btn btn-secondary" onClick={() => setResolve(true)}>
                <IconCircleCheck size={18} /> Mark as resolved
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => update((s) => (s.cases.find((y) => y.id === c.id)!.status = 'Open'), { toast: 'Case reopened', history: `Reopened ${c.id}` })}>
                Reopen case
              </button>
            )}
          </div>
          <div className="thread">
            {c.messages.map((m, i) => (
              <div key={i} className={`msg ${m.from === 'You' ? 'me' : m.from === 'RigSetGo Support' ? 'support' : ''}`}>
                <div className="who">
                  {m.from} · <span className="muted" style={{ fontWeight: 400 }}>{fmtStamp(m.time)}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
          </div>
          {c.status !== 'Resolved' && (
            <div className="col gap-8">
              <textarea className="textarea" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
              {files.length > 0 && (
                <div className="row wrap gap-8">
                  {files.map((f) => (
                    <span key={f} className="chip">
                      📎 {f}
                    </span>
                  ))}
                </div>
              )}
              <div className="row between">
                <button className="btn btn-ghost btn-sm" onClick={() => setFiles([...files, `photo-${files.length + 1}.jpg`])}>
                  <IconPaperclip size={16} /> Add photo or file
                </button>
                <button className="btn btn-primary" onClick={send} disabled={!reply.trim() && !files.length}>
                  <IconSend size={18} /> Send
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="card">
          <h3>Booking</h3>
          {b ? (
            <>
              <div className="strong">{b.id}</div>
              <div className="muted small">
                {b.contractor} · {eqName(state, b.equipmentId)} · #{b.unitId}
              </div>
              <Badge>{b.status}</Badge>
              <button className="btn btn-secondary" onClick={() => nav(`/bookings/${b.id}`)}>
                Open booking
              </button>
            </>
          ) : (
            <div className="muted">Booking not found.</div>
          )}
          <div className="divider" />
          <div className="muted small">Messages you send here are seen by RigSetGo Support. Internal notes of the RigSetGo team are never shown here.</div>
        </section>
      </div>
      {resolve && (
        <ConfirmDialog
          title="Mark this case as resolved?"
          text="RigSetGo Support and the contractor are told. You can reopen it later if needed."
          confirmLabel="Mark as resolved"
          onConfirm={() => update((s) => (s.cases.find((y) => y.id === c.id)!.status = 'Resolved'), { history: `Resolved ${c.id}`, toast: 'Case resolved' })}
          onClose={() => setResolve(false)}
        />
      )}
    </>
  );
}

