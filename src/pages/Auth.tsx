import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  IconCheck, IconMail, IconLock, IconEye, IconEyeOff, IconUser, IconPhone, IconBuilding, IconMapPin, IconClock, IconTruck,
  IconBuildingStore, IconArrowRight, IconArrowLeft, IconInfoCircle, IconFile, IconUpload, IconX, IconShieldCheck, IconHelpCircle,
  IconLockExclamation, IconCircleCheck, IconHourglass, IconPlus, IconBuildingBank,
} from '@tabler/icons-react';
import { useStore } from '../store/store';
import { DEMO_CODE, Field, Modal } from '../components/ui';
import { ME } from '../data/seed';
import { img } from '../data/images';

const BRAND = [
  { photo: 'images/dump-truck.jpg', head: 'Plan every delivery and pickup in one place', sub: 'Today’s jobs, drivers, live tracking and signed handover tickets for your company’s rentals.' },
  { photo: 'images/wheel-loaders.jpg', head: 'You have been invited to your company’s team', sub: 'Your Supplier Admin chose your role. You only see the sections you need for your work.' },
  { photo: 'images/road-roller.jpg', head: 'Set up your sign-in', sub: 'Use a strong password. We will also send a security code to your phone each time you sign in.' },
  { photo: 'images/pipelayers.jpg', head: 'Your account, kept safe', sub: 'We ask for a security code at every sign-in, so only your team can open your bookings and deliveries.' },
];

function Shell({ brand, top, children, dots }: { brand: number; top: ReactNode; children: ReactNode; dots?: number }) {
  const b = BRAND[brand];
  return (
    <div className="auth">
      <aside className="auth-brand">
        <img className="logo" src={img('images/logo-white.svg')} alt="RigSetGo" />
        <div className="auth-photo">
          <img src={img(b.photo)} alt="Construction equipment on a job site" />
        </div>
        <div>
          <h2>{b.head}</h2>
          <p>{b.sub}</p>
          {brand === 0 && (
            <div className="auth-points">
              {['Today’s jobs in order, with drivers', 'Live tracking for every trip', 'Signed tickets with photos at every handover'].map((t) => (
                <div key={t}>
                  <IconCheck size={20} stroke={3} /> {t}
                </div>
              ))}
            </div>
          )}
          {dots !== undefined && (
            <div className="dots">
              {[0, 1].map((i) => (
                <i key={i} className={i === dots ? 'on' : ''} />
              ))}
            </div>
          )}
        </div>
      </aside>
      <section className="auth-form">
        <div className="auth-top">{top}</div>
        <div className="auth-content">{children}</div>
        <div className="auth-foot">
          <span>© 2026 RigSetGo</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </section>
    </div>
  );
}

const helpTop = (
  <>
    <span />
    <span className="row gap-8">
      <IconHelpCircle size={18} /> Need help? <a href="mailto:support@rigsetgo.com">Contact support</a>
    </span>
  </>
);

/* ---------------- Sign in ---------------- */
export function Login() {
  const { auth, setAuth, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState(auth.email || ME.email);
  const [pw, setPw] = useState('demo-password');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [forgot, setForgot] = useState(false);
  if (auth.signedIn) return <Navigate to="/" replace />;
  if (auth.locked) return <Navigate to="/login/locked" replace />;
  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (!pw) return setErr('Enter your password.');
    setAuth({ email, codeStep: true });
    nav('/login/code');
  };
  return (
    <Shell
      brand={0}
      top={
        <>
          <span />
          <span>
            Invited by your company? <Link to="/invite" className="strong">Accept your invitation</Link>
          </span>
        </>
      }
    >
      <h1>Sign in</h1>
      <p className="lead">Welcome back. Sign in to plan today’s deliveries and pickups.</p>
      <form
        className="col gap-16"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Email" error={err && err.includes('email') ? err : ''}>
          <div className="input-wrap">
            <IconMail size={18} />
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </Field>
        <Field label="Password" error={err && err.includes('password') ? err : ''}>
          <div className="input-wrap">
            <IconLock size={18} />
            <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
            <button type="button" className="suffix" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </Field>
        <div className="row between">
          <label className="check">
            <input type="checkbox" defaultChecked /> Keep me signed in
          </label>
          <button type="button" className="link" onClick={() => setForgot(true)}>
            Forgot password?
          </button>
        </div>
        <button className="btn btn-primary btn-lg btn-block" type="submit">
          Continue <IconArrowRight size={18} />
        </button>
      </form>
      <div className="banner info small">
        <IconInfoCircle size={18} />
        <div className="grow">Demo: any email and password work. The security code on the next screen is 482193.</div>
      </div>
      {forgot && (
        <Modal
          title="Reset your password"
          sub="We will email you a link to choose a new password."
          onClose={() => setForgot(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setForgot(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setForgot(false);
                  toast(`Reset link sent to ${email}`);
                }}
              >
                Send reset link
              </button>
            </>
          }
        >
          <Field label="Email">
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </Modal>
      )}
    </Shell>
  );
}

export function SecurityCode() {
  const { auth, setAuth, toast } = useStore();
  const nav = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [err, setErr] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  if (auth.signedIn) return <Navigate to="/" replace />;
  if (auth.locked) return <Navigate to="/login/locked" replace />;
  if (!auth.codeStep) return <Navigate to="/login" replace />;
  const verify = (code: string) => {
    if (code === DEMO_CODE) {
      setAuth({ signedIn: true, codeStep: false, wrongCodes: 0, tourOpen: !auth.tourDone });
      nav('/');
      return;
    }
    const n = auth.wrongCodes + 1;
    if (n >= 3) {
      setAuth({ wrongCodes: n, locked: true, codeStep: false });
      nav('/login/locked');
      return;
    }
    setAuth({ wrongCodes: n });
    setErr(`That code is not right. ${3 - n} ${3 - n === 1 ? 'try' : 'tries'} left before the account locks.`);
    setDigits(['', '', '', '', '', '']);
    refs.current[0]?.focus();
  };
  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) {
      const all = clean.slice(0, 6).split('');
      const next = [...digits];
      all.forEach((d, k) => (next[k] = d));
      setDigits(next);
      if (next.every(Boolean)) verify(next.join(''));
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setErr('');
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next.join(''));
  };
  return (
    <Shell
      brand={3}
      top={
        <>
          <Link to="/login" className="back" onClick={() => setAuth({ codeStep: false })}>
            <IconArrowLeft size={16} /> Back to sign in
          </Link>
          <span />
        </>
      }
    >
      <div className="icon-circle" style={{ width: 88, height: 88 }}>
        <IconShieldCheck size={40} />
      </div>
      <h1>Enter your security code</h1>
      <p className="lead">We sent a 6-digit code to the phone ending in 0142. This keeps your company’s bookings safe.</p>
      <div className={`code-inputs ${err ? 'invalid' : ''}`}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={6}
            aria-label={`Digit ${i + 1}`}
            autoFocus={i === 0}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === 'Enter' && digits.every(Boolean)) verify(digits.join(''));
            }}
          />
        ))}
      </div>
      {err && <div className="banner danger small">{err}</div>}
      <button className="btn btn-primary btn-lg btn-block" disabled={!digits.every(Boolean)} onClick={() => verify(digits.join(''))}>
        Verify and sign in
      </button>
      <div className="row between small">
        <span className="muted">Didn’t get it?</span>
        <button className="link" onClick={() => toast('A new code was sent to your phone', 'info')}>
          Send a new code
        </button>
      </div>
      <div className="banner info small">
        <IconInfoCircle size={18} />
        <div className="grow">Demo code: 482193. Three wrong codes lock the account.</div>
      </div>
    </Shell>
  );
}

export function Locked() {
  const { auth, setAuth, toast } = useStore();
  const nav = useNavigate();
  const [sent, setSent] = useState(false);
  if (!auth.locked) return <Navigate to="/login" replace />;
  return (
    <Shell brand={3} top={helpTop}>
      <div className="icon-circle red" style={{ width: 88, height: 88 }}>
        <IconLockExclamation size={40} />
      </div>
      <h1>Your account is locked</h1>
      <p className="lead">The security code was entered wrong 3 times, so we locked the account to keep it safe. Nobody can sign in until it is unlocked.</p>
      <div className="doc-row">
        <div className="strong">How to unlock</div>
        <div className="muted small">We will email an unlock link to {auth.email || 'your email'}. Open it on any device, then sign in again.</div>
      </div>
      {!sent ? (
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={() => {
            setSent(true);
            toast('Unlock link sent to your email', 'info');
          }}
        >
          <IconMail size={18} /> Email me an unlock link
        </button>
      ) : (
        <>
          <div className="banner success small">
            <IconCircleCheck size={18} />
            <div className="grow">Unlock link sent. Check your inbox.</div>
          </div>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={() => {
              setAuth({ locked: false, wrongCodes: 0, codeStep: false });
              toast('Account unlocked. Please sign in again.');
              nav('/login');
            }}
          >
            I opened the unlock link (demo)
          </button>
        </>
      )}
    </Shell>
  );
}

/* ---------------- Accept an invitation ---------------- */
/**
 * Dispatchers do not sign up on their own. The Supplier Admin invites them from Team & Roles
 * with the ready-made Dispatcher role. The email link opens this screen.
 */
export function Invite() {
  const { auth, setAuth, toast } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState<'invite' | 'account' | 'declined'>('invite');
  const [name, setName] = useState(ME.name);
  const [phone, setPhone] = useState(ME.phone);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [decline, setDecline] = useState(false);
  if (auth.signedIn) return <Navigate to="/" replace />;
  const strength = Math.min(4, (pw.length >= 8 ? 1 : 0) + (/[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0));
  const label = ['Too short', 'Weak password', 'Fair password', 'Good password', 'Strong password'][strength];
  const submit = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Enter your full name.';
    if (phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number. Security codes are sent here.';
    if (strength < 3) e.pw = 'Use 8 or more characters with a capital letter and a number.';
    if (pw2 !== pw || !pw2) e.pw2 = 'The two passwords do not match.';
    if (!terms) e.terms = 'Please agree to the terms to continue.';
    setErrs(e);
    if (Object.keys(e).length) return;
    setAuth({ email: ME.email, codeStep: true, tourDone: false });
    toast(`Security code sent to the phone ending in ${phone.replace(/\D/g, '').slice(-4)}`, 'info');
    nav('/login/code');
  };
  const top = (
    <>
      {step === 'account' ? (
        <button className="back" onClick={() => setStep('invite')}>
          <IconArrowLeft size={16} /> Back
        </button>
      ) : (
        <span />
      )}
      <span>
        Already set up? <Link to="/login" className="strong">Sign in</Link>
      </span>
    </>
  );

  if (step === 'declined')
    return (
      <Shell brand={1} top={top}>
        <div className="icon-circle" style={{ width: 88, height: 88 }}>
          <IconCircleCheck size={40} />
        </div>
        <h1>Invitation declined</h1>
        <p className="lead">We let {ME.admin} know. Nothing was set up for you. If this was a mistake, ask {ME.admin} to send a new invitation.</p>
        <button className="btn btn-secondary btn-lg btn-block" onClick={() => setStep('invite')}>
          Show the invitation again (demo)
        </button>
      </Shell>
    );

  if (step === 'account')
    return (
      <Shell brand={2} top={top} dots={1}>
        <h1>Set up your sign-in</h1>
        <p className="lead">You will join Atlanta Heavy Rentals as {ME.role}. This only takes a minute.</p>
        <form
          className="col gap-16"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="Full name" error={errs.name}>
            <div className="input-wrap">
              <IconUser size={18} />
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </Field>
          <Field label="Work email" hint="Your Supplier Admin sent the invitation to this email. It cannot be changed here.">
            <div className="input-wrap">
              <IconMail size={18} />
              <input className="input" value={ME.email} readOnly aria-readonly="true" style={{ background: 'var(--bg)' }} />
            </div>
          </Field>
          <Field label="Mobile phone" hint="We send a security code here each time you sign in." error={errs.phone}>
            <div className="input-wrap">
              <IconPhone size={18} />
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            </div>
          </Field>
          <Field label="Create a password" error={errs.pw}>
            <div className="input-wrap">
              <IconLock size={18} />
              <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
              <button type="button" className="suffix" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
            {pw && (
              <div className="row gap-8" style={{ marginTop: 6 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ width: 48, height: 4, borderRadius: 2, background: i < strength ? (strength >= 3 ? 'var(--success)' : 'var(--orange)') : 'var(--line)' }} />
                ))}
                <span className="tiny strong" style={{ color: strength >= 3 ? 'var(--success)' : 'var(--orange-ink)' }}>
                  {label}
                </span>
              </div>
            )}
          </Field>
          <Field label="Type the password again" error={errs.pw2}>
            <div className="input-wrap">
              <IconLock size={18} />
              <input className="input" type={show ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            </div>
          </Field>
          <label className="check">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> I agree to the RigSetGo terms of use and privacy policy
          </label>
          {errs.terms && <span className="small" style={{ color: 'var(--danger)', fontWeight: 500 }}>{errs.terms}</span>}
          <button className="btn btn-primary btn-lg btn-block" type="submit">
            Create my sign-in <IconArrowRight size={18} />
          </button>
        </form>
        <div className="banner info small">
          <IconInfoCircle size={18} />
          <div className="grow">Demo: the security code on the next screen is 482193.</div>
        </div>
      </Shell>
    );

  return (
    <Shell brand={1} top={top} dots={0}>
      <div className="icon-circle" style={{ width: 88, height: 88 }}>
        <IconMail size={40} />
      </div>
      <h1>You’re invited to join Atlanta Heavy Rentals</h1>
      <p className="lead">
        {ME.admin}, Supplier Admin, invited <b>{ME.email}</b> to RigSetGo as <b>{ME.role}</b>.
      </p>
      <div className="doc-row">
        <div className="strong">What you can do as {ME.role}</div>
        <div className="col gap-4 small" style={{ marginTop: 6 }}>
          {['See today’s deliveries and pickups on the dashboard', 'Assign drivers, start trips and follow them live', 'Record delivery and return tickets with photos and signature', 'See bookings and the calendar for every machine', 'Open and answer support cases about deliveries'].map((t) => (
            <span key={t} className="row gap-8">
              <IconCheck size={16} color="var(--success)" stroke={3} /> {t}
            </span>
          ))}
        </div>
      </div>
      <div className="doc-row">
        <div className="strong">Handled by your Supplier Admin</div>
        <div className="muted small">Prices, payments and payouts, equipment listings, documents, reviews, team and business settings.</div>
      </div>
      <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep('account')}>
        Accept invitation <IconArrowRight size={18} />
      </button>
      <button className="btn btn-ghost btn-block" onClick={() => setDecline(true)}>
        This invitation is not for me
      </button>
      <div className="muted tiny">This invitation expires in 7 days.</div>
      {decline && (
        <Modal
          title="Decline this invitation?"
          sub={`${ME.admin} will be told that you declined. You can be invited again later.`}
          onClose={() => setDecline(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setDecline(false)}>
                Keep invitation
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setDecline(false);
                  setStep('declined');
                }}
              >
                Decline invitation
              </button>
            </>
          }
        >
          <div className="muted small">Nothing is set up until you accept.</div>
        </Modal>
      )}
    </Shell>
  );
}
