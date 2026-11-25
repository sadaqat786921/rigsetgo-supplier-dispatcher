import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppState } from '../data/types';
import { seed, TODAY, ME } from '../data/seed';

const STATE_KEY = 'rsg-dispatcher-state-v1';
const AUTH_KEY = 'rsg-dispatcher-auth-v1';

export interface Auth {
  signedIn: boolean;
  email: string;
  codeStep: boolean;
  wrongCodes: number;
  locked: boolean;
  tourDone: boolean;
  tourOpen: boolean;
}

const defaultAuth: Auth = { signedIn: false, email: '', codeStep: false, wrongCodes: 0, locked: false, tourDone: false, tourOpen: false };

function load<T>(key: string, fallback: () => T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback();
}

function save(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export type Tone = 'success' | 'info' | 'warning' | 'danger';
interface ToastItem {
  id: number;
  text: string;
  tone: Tone;
}

/** Demo clock: the date is fixed to TODAY, the time is the real time of day. */
export function nowStamp() {
  const d = new Date();
  return `${TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

let counter = 1000;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString().slice(-5)}${counter++}`;

interface UpdateOptions {
  history?: string;
  notify?: { text: string; link: string };
  toast?: string;
  tone?: Tone;
}

interface StoreValue {
  state: AppState;
  update: (mutate: (draft: AppState) => void, opts?: UpdateOptions) => void;
  auth: Auth;
  setAuth: (patch: Partial<Auth>) => void;
  toast: (text: string, tone?: Tone) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load(STATE_KEY, seed));
  const [auth, setAuthState] = useState<Auth>(() => load(AUTH_KEY, () => defaultAuth));
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(1);

  useEffect(() => save(STATE_KEY, state), [state]);
  useEffect(() => save(AUTH_KEY, auth), [auth]);

  const toast = useCallback((text: string, tone: Tone = 'success') => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const update = useCallback(
    (mutate: (draft: AppState) => void, opts: UpdateOptions = {}) => {
      setState((prev) => {
        const draft = structuredClone(prev);
        mutate(draft);
        if (opts.history) {
          draft.history.unshift({ id: uid('H'), time: nowStamp(), who: ME.name, text: opts.history });
        }
        if (opts.notify) {
          draft.notifications.unshift({ id: uid('N'), text: opts.notify.text, link: opts.notify.link, time: nowTime(), read: false });
        }
        return draft;
      });
      if (opts.toast) toast(opts.toast, opts.tone);
    },
    [toast],
  );

  const setAuth = useCallback((patch: Partial<Auth>) => setAuthState((a) => ({ ...a, ...patch })), []);

  const resetDemo = useCallback(() => {
    setState(seed());
    setAuthState((a) => ({ ...a, wrongCodes: 0, locked: false }));
    toast('Demo data has been reset', 'info');
  }, [toast]);

  const value = useMemo(() => ({ state, update, auth, setAuth, toast, resetDemo }), [state, update, auth, setAuth, toast, resetDemo]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
