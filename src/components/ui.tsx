import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconStar, IconStarFilled, IconX, IconInbox } from '@tabler/icons-react';
import { initials } from '../data/utils';

export function Modal({
  title,
  sub,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close">
            <IconX size={22} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  text: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Go back
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="muted">{text}</div>
    </Modal>
  );
}

/** A dialog that will not continue until a reason is written. */
export function ReasonDialog({
  title,
  text,
  label = 'Reason',
  placeholder = 'Write a short reason. The other side will see it.',
  confirmLabel = 'Confirm',
  danger,
  options,
  onConfirm,
  onClose,
}: {
  title: string;
  text?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  danger?: boolean;
  options?: string[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState(options?.[0] ?? '');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const full = options ? `${choice}${reason.trim() ? `: ${reason.trim()}` : ''}` : reason.trim();
  const valid = options ? !!choice && reason.trim().length > 0 : reason.trim().length > 2;
  return (
    <Modal
      title={title}
      sub={text}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Go back
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              setTried(true);
              if (!valid) return;
              onConfirm(full);
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {options && (
        <div className="field">
          <label>Choose a reason</label>
          <select className="select" value={choice} onChange={(e) => setChoice(e.target.value)}>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label>{options ? 'More details' : label}</label>
        <textarea
          className={`textarea ${tried && !valid ? 'invalid' : ''}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        {tried && !valid && <span className="error">A reason is required.</span>}
      </div>
    </Modal>
  );
}

const TONES: Record<string, string> = {
  Published: 'green', Available: 'green', Active: 'green', Paid: 'green', Valid: 'green', Accepted: 'green', Completed: 'grey', Approved: 'green', Resolved: 'green', Done: 'green', Connected: 'green', Kept: 'grey', Removed: 'green',
  Draft: 'grey', Retired: 'grey', Expired: 'red', Cancelled: 'grey', Declined: 'red', Failed: 'red', Rejected: 'red', Refunded: 'grey',
  Maintenance: 'orange', Unavailable: 'orange', 'Expiring soon': 'orange', 'Under review': 'orange', 'Pending payment': 'orange', Pending: 'orange', 'Needs driver': 'orange', 'Waiting on you': 'orange', 'Needs review': 'orange', 'Return requested': 'orange', Waiting: 'orange', 'Needs attention': 'orange', Invited: 'orange', Suspended: 'red',
  New: 'solid', Quoted: 'navy', Confirmed: 'navy', 'Out for delivery': 'navy', 'On the way': 'navy', Scheduled: 'navy', Open: 'navy', Returned: 'navy', 'Pay later': 'navy', Locked: 'grey',
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const t = tone ?? (typeof children === 'string' ? TONES[children] : undefined) ?? 'grey';
  return <span className={`badge b-${t}`}>{children}</span>;
}

export function Empty({ title, text, action, icon }: { title: string; text?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="empty">
      <div className="icon-circle">{icon ?? <IconInbox size={28} />}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (i <= Math.round(value) ? <IconStarFilled key={i} size={size} /> : <IconStar key={i} size={size} />))}
    </span>
  );
}

export function Avatar({ name, size, tone }: { name: string; size?: 'sm' | 'lg'; tone?: 'orange' }) {
  return <div className={`avatar ${size ?? ''} ${tone ?? ''}`}>{initials(name)}</div>;
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, counts }: { tabs: T[]; value: T; onChange: (t: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={t === value} className={t === value ? 'active' : ''} onClick={() => onChange(t)}>
          {t}
          {counts && counts[t] !== undefined && <span className="n">{counts[t]}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pills<T extends string>({ items, value, onChange }: { items: T[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="pills">
      {items.map((t) => (
        <button key={t} className={t === value ? 'active' : ''} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <label className="toggle" aria-label={label}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error ? <span className="error">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

/** Closes a dropdown when clicking anywhere outside it. */
export function useOutside<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, close]);
  return ref;
}

export const DEMO_CODE = '482193';

/** Asks for the 6-digit security code before a sensitive change (bank details). */
export function SecurityCodeDialog({ onSuccess, onClose, text }: { onSuccess: () => void; onClose: () => void; text: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const locked = tries >= 3;
  return (
    <Modal
      title="Enter your security code"
      sub={text}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={locked}
            onClick={() => {
              if (code === DEMO_CODE) {
                onSuccess();
                onClose();
              } else {
                const t = tries + 1;
                setTries(t);
                setError(t >= 3 ? 'Too many wrong codes. This change is locked for safety. Try again later.' : `That code is not right. ${3 - t} tries left.`);
              }
            }}
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="banner info small">We sent a 6-digit code to the phone ending in 0142. Demo code: 482193.</div>
      <Field label="Security code" error={error}>
        <input className={`input ${error ? 'invalid' : ''}`} inputMode="numeric" maxLength={6} value={code} disabled={locked} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" autoFocus />
      </Field>
    </Modal>
  );
}
