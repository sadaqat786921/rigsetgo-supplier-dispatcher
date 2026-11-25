import { useState } from 'react';
import { IconLock, IconAlertTriangle } from '@tabler/icons-react';
import { useStore } from '../store/store';
import { Avatar, Field, Tabs, Toggle } from '../components/ui';
import { ME } from '../data/seed';

type ATab = 'Profile' | 'Notifications' | 'Password';

const TOPICS = [
  { k: 'assign', label: 'A delivery or pickup needs a driver' },
  { k: 'trips', label: 'Trip updates: started, running late, arrived' },
  { k: 'returns', label: 'Rentals ending soon that need a pickup' },
  { k: 'support', label: 'Replies on support cases' },
];

/** The Dispatcher's own sign-in details. Business settings stay with the Supplier Admin. */
export default function Account() {
  const { toast } = useStore();
  const [tab, setTab] = useState<ATab>('Profile');
  const [name, setName] = useState(ME.name);
  const [phone, setPhone] = useState(ME.phone);
  const [pErr, setPErr] = useState<Record<string, string>>({});
  const [ch, setCh] = useState({ email: true, sms: true, inapp: true });
  const [smsConsent, setSmsConsent] = useState(true);
  const [topics, setTopics] = useState<Record<string, boolean>>({ assign: true, trips: true, returns: true, support: true });
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [wErr, setWErr] = useState<Record<string, string>>({});
  const strength = Math.min(4, (pw.length >= 8 ? 1 : 0) + (/[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0));

  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ fontSize: 22 }}>My account</h2>
          <p>Your own name, phone, alerts and password. Business settings are managed by {ME.admin}, your Supplier Admin.</p>
        </div>
      </div>
      <section className="card" style={{ maxWidth: 820 }}>
        <Tabs tabs={['Profile', 'Notifications', 'Password'] as ATab[]} value={tab} onChange={setTab} />

        {tab === 'Profile' && (
          <>
            <div className="row gap-16">
              <Avatar name={name || ME.name} size="lg" />
              <div>
                <div className="strong" style={{ fontSize: 18 }}>{name || ME.name}</div>
                <div className="muted small">
                  {ME.role} · Atlanta Heavy Rentals
                </div>
              </div>
            </div>
            <div className="grid g2" style={{ gap: 16 }}>
              <Field label="Full name" error={pErr.name}>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Mobile phone" hint="Security codes and trip alerts are sent here." error={pErr.phone}>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
              </Field>
              <Field label="Work email" hint="Only your Supplier Admin can change this.">
                <input className="input" value={ME.email} readOnly style={{ background: 'var(--bg)' }} />
              </Field>
              <Field label="Role" hint="Ready-made role, set by your Supplier Admin.">
                <div className="input row gap-8" style={{ background: 'var(--bg)' }}>
                  <IconLock size={16} color="var(--muted)" /> {ME.role}
                </div>
              </Field>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const e: Record<string, string> = {};
                  if (name.trim().length < 2) e.name = 'Enter your full name.';
                  if (phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number.';
                  setPErr(e);
                  if (!Object.keys(e).length) toast('Your profile was saved');
                }}
              >
                Save profile
              </button>
            </div>
          </>
        )}

        {tab === 'Notifications' && (
          <>
            <div className="col gap-12">
              {[
                ['email', 'Email', ME.email],
                ['sms', 'Text message (SMS)', phone],
                ['inapp', 'In the app', 'The bell at the top of the page'],
              ].map(([k, l, sub]) => (
                <div key={k} className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                  <div>
                    <div className="strong small">{l}</div>
                    <div className="tiny muted">{sub}</div>
                  </div>
                  <Toggle label={l} checked={ch[k as keyof typeof ch]} onChange={(v) => setCh({ ...ch, [k]: v })} />
                </div>
              ))}
            </div>
            {ch.sms && (
              <label className="check small">
                <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} /> I agree to receive text messages from RigSetGo about my jobs. Message and data rates may apply. Reply STOP to stop.
              </label>
            )}
            <h3>Tell me when</h3>
            <div className="col gap-8">
              {TOPICS.map((t) => (
                <label key={t.k} className="check">
                  <input type="checkbox" checked={topics[t.k]} onChange={(e) => setTopics({ ...topics, [t.k]: e.target.checked })} /> {t.label}
                </label>
              ))}
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (ch.sms && !smsConsent) return toast('Tick the text message agreement, or switch text messages off', 'warning');
                  toast('Notification settings saved');
                }}
              >
                Save notifications
              </button>
            </div>
          </>
        )}

        {tab === 'Password' && (
          <>
            <div className="grid g2" style={{ gap: 16 }}>
              <Field label="Current password" error={wErr.cur}>
                <input className="input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
              </Field>
              <span />
              <Field label="New password" error={wErr.pw} hint="8 or more characters with a capital letter and a number.">
                <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
              </Field>
              <Field label="Type the new password again" error={wErr.pw2}>
                <input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
              </Field>
            </div>
            {pw && (
              <div className="row gap-8">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ width: 48, height: 4, borderRadius: 2, background: i < strength ? (strength >= 3 ? 'var(--success)' : 'var(--orange)') : 'var(--line)' }} />
                ))}
              </div>
            )}
            <div className="banner info small">
              <IconAlertTriangle size={18} />
              <div className="grow">Changing your password signs you out on your other devices.</div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const e: Record<string, string> = {};
                  if (!cur) e.cur = 'Enter your current password.';
                  if (strength < 3) e.pw = 'Use 8 or more characters with a capital letter and a number.';
                  if (pw2 !== pw || !pw2) e.pw2 = 'The two passwords do not match.';
                  setWErr(e);
                  if (Object.keys(e).length) return;
                  setCur('');
                  setPw('');
                  setPw2('');
                  toast('Password changed. Other devices were signed out');
                }}
              >
                Change password
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
