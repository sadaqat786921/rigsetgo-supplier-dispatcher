import { useCallback, useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  IconLayoutGrid, IconCalendar, IconFileText, IconClipboardList, IconTruckDelivery,
  IconMessageCircle, IconSearch, IconBell,
  IconChevronDown, IconLogout, IconRefresh, IconHelpCircle, IconUserCircle, IconChecks, IconRoute,
} from '@tabler/icons-react';
import { useStore } from '../store/store';
import { ConfirmDialog, Modal, useOutside } from './ui';
import { TODAY, ME } from '../data/seed';
import { canSeeCase, dispatcherNeedsAction } from '../data/dispatch';
import { eqName } from '../data/utils';
import { img } from '../data/images';

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconLayoutGrid, end: true },
  { to: '/bookings', label: 'Bookings', icon: IconClipboardList, count: 'bookings' },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar },
  { to: '/deliveries', label: 'Deliveries & Tracking', icon: IconTruckDelivery, count: 'deliveries' },
  { to: '/support', label: 'Support Cases', icon: IconMessageCircle, count: 'support' },
];

const TITLES: Record<string, [string, string]> = {
  calendar: ['Availability for every unit', 'Calendar'],
  bookings: ['Every rental from start to finish', 'Bookings'],
  deliveries: ['Drivers, deliveries and returns', 'Deliveries & Tracking'],
  support: ['Problems on a booking', 'Support Cases'],
  account: ['Your sign-in, phone and alerts', 'My account'],
};

const TOUR = [
  { photo: 'images/excavator-sunset.jpg', title: `Welcome to RigSetGo, ${ME.first}`, text: 'You are the Dispatcher for Atlanta Heavy Rentals. You plan deliveries and pickups, assign drivers and record handover tickets.' },
  { photo: 'images/wheel-loaders.jpg', title: 'Your dashboard', text: 'Each morning it shows today’s jobs in order, which jobs still need a driver, trips on the road right now, and returns coming up.' },
  { photo: 'images/dump-truck.jpg', title: 'Deliveries and live tracking', text: 'Assign a driver, start the trip and follow it on the live map. If you are running late, one click tells the contractor.' },
  { photo: 'images/pipelayers.jpg', title: 'Tickets keep everyone safe', text: 'At every handover, take photos, check the machine number, note fuel and hours, and get a signature. Prices and payments stay with your Supplier Admin.' },
];

export default function Layout() {
  const { state, update, auth, setAuth, resetDemo } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState<'' | 'notif' | 'profile' | 'search'>('');
  const [q, setQ] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [help, setHelp] = useState(false);
  const [slide, setSlide] = useState(0);
  const close = useCallback(() => setMenu(''), []);
  const notifRef = useOutside<HTMLDivElement>(menu === 'notif', close);
  const profRef = useOutside<HTMLDivElement>(menu === 'profile', close);
  const searchRef = useOutside<HTMLDivElement>(menu === 'search', close);

  const counts = {
    bookings: state.bookings.filter((b) => dispatcherNeedsAction(state, b)).length,
    deliveries: state.jobs.filter((j) => j.status === 'Needs driver').length,
    support: state.cases.filter((c) => c.status === 'Waiting on you' && canSeeCase(c)).length,
  } as Record<string, number>;
  const unread = state.notifications.filter((n) => !n.read).length;
  const todayJobs = state.jobs.filter((j) => j.date === TODAY);
  
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const out: { label: string; sub: string; to: string }[] = [];
    state.bookings.forEach((b) => (b.id + b.contractor + b.contactName).toLowerCase().includes(s) && out.push({ label: `${b.id} · ${b.contractor}`, sub: `Booking · ${eqName(state, b.equipmentId)} · ${b.status}`, to: `/bookings/${b.id}` }));
    state.jobs.forEach((j) => {
      const b = state.bookings.find((x) => x.id === j.bookingId);
      if ((j.id + j.bookingId + (b?.jobsite ?? '') + (state.members.find((m) => m.id === j.driverId)?.name ?? '')).toLowerCase().includes(s))
        out.push({ label: `${j.id} · ${j.type}`, sub: `${j.date === TODAY ? 'Today' : j.date} · ${j.window} · ${j.status}`, to: `/deliveries/${j.id}` });
    });
    state.cases.filter(canSeeCase).forEach((c) => (c.id + c.subject + c.bookingId).toLowerCase().includes(s) && out.push({ label: `${c.id} · ${c.subject}`, sub: `Support case · ${c.status}`, to: `/support/${c.id}` }));
    return out.slice(0, 8);
  }, [q, state]);

  if (!auth.signedIn) return <Navigate to="/login" replace />;

  const key = loc.pathname.split('/')[1];
  const [, title] = key ? TITLES[key] ?? ['', 'RigSetGo'] : ['Dashboard', `Good morning, ${ME.first}`];
  const small = key ? 'Friday, November 20, 2026' : 'Dashboard';

  const go = (to: string) => {
    setMenu('');
    setQ('');
    nav(to);
  };

  return (
    <div className="app">
      <aside className="sidebar" aria-label="Main menu">
        <img className="logo" src={img('images/logo.svg')} alt="RigSetGo – Construction Equipment Rentals" />
        <div className="profile">
          <div className="avatar lg">{ME.initials}</div>
          <div>
            <div className="muted small">Hello,</div>
            <div className="strong">{ME.name}</div>
            <div className="tiny strong" style={{ color: 'var(--navy)' }}>
              {state.business.legalName.replace(' LLC', '')}
            </div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <n.icon size={20} stroke={1.8} />
              {n.label}
              {n.count && counts[n.count] > 0 && <span className="count">{counts[n.count]}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="today-card">
          <div className="row between">
            <b style={{ fontSize: 17 }}>Today</b>
            <button className="link" style={{ color: 'var(--on-navy-muted)' }} onClick={() => nav('/deliveries')}>
              View all
            </button>
          </div>
          <div className="item" onClick={() => nav('/deliveries')}>
            <small>Deliveries</small>
            <div>
              <b>{todayJobs.filter((j) => j.type === 'Delivery').length}</b>
              <span>scheduled</span>
            </div>
          </div>
          <div className="item" onClick={() => nav('/deliveries')}>
            <small>Pickups</small>
            <div>
              <b>{todayJobs.filter((j) => j.type === 'Pickup').length}</b>
              <span>scheduled</span>
            </div>
          </div>
          <div className="item" onClick={() => nav('/deliveries')}>
            <small>On the road now</small>
            <div>
              <b>{state.jobs.filter((j) => j.status === 'On the way').length}</b>
              <span>{state.jobs.filter((j) => j.status === 'On the way').length === 1 ? 'trip' : 'trips'}</span>
            </div>
          </div>
          <button className="btn btn-white btn-block" onClick={() => nav('/deliveries')}>
            <IconTruckDelivery size={18} /> Today’s jobs
          </button>
        </div>
        <div className="side-photo">
          <img src={img('images/excavator-sky.jpg')} alt="Excavator on site" />
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div className="title">
            <small>{small}</small>
            <h1>{title}</h1>
          </div>
          <div className="header-actions">
            <div className="dropdown" ref={searchRef}>
              <div className="search" style={{ width: 320 }}>
                <IconSearch size={18} color="var(--muted)" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setMenu('search');
                  }}
                  onFocus={() => setMenu('search')}
                  placeholder="Search bookings, jobs, drivers…"
                  aria-label="Search"
                />
              </div>
              {menu === 'search' && q.trim().length >= 2 && (
                <div className="menu search-results">
                  {results.length === 0 && <div className="muted small" style={{ padding: 12 }}>No results for “{q}”. Try a booking or job number, contractor or driver.</div>}
                  {results.map((r) => (
                    <button key={r.to + r.label} onClick={() => go(r.to)}>
                      <div>
                        <div className="strong">{r.label}</div>
                        <div className="tiny muted">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown" ref={notifRef}>
              <button className="icon-btn" aria-label="Notifications" onClick={() => setMenu(menu === 'notif' ? '' : 'notif')}>
                <IconBell size={20} />
                {unread > 0 && <span className="dot">{unread}</span>}
              </button>
              {menu === 'notif' && (
                <div className="menu notif-menu">
                  <div className="row between" style={{ padding: '14px 16px' }}>
                    <b>Notifications</b>
                    <button className="link" onClick={() => update((s) => s.notifications.forEach((n) => (n.read = true)))}>
                      <IconChecks size={14} /> Mark all as read
                    </button>
                  </div>
                  <div className="divider" />
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {state.notifications.length === 0 && <div className="muted small" style={{ padding: 16 }}>You’re all caught up.</div>}
                    {state.notifications.map((n) => (
                      <button
                        key={n.id}
                        className={`notif-item ${n.read ? '' : 'unread'}`}
                        onClick={() => {
                          update((s) => {
                            const x = s.notifications.find((y) => y.id === n.id);
                            if (x) x.read = true;
                          });
                          go(n.link);
                        }}
                      >
                        <span className="icon-circle" style={{ width: 34, height: 34 }}>
                          <IconBell size={16} />
                        </span>
                        <div className="grow">
                          <div className="small" style={{ fontWeight: n.read ? 400 : 600 }}>
                            {n.text}
                          </div>
                          <div className="tiny muted">{n.time}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="dropdown" ref={profRef}>
              <button className="row" style={{ background: 'none', border: 'none', cursor: 'pointer', gap: 10 }} onClick={() => setMenu(menu === 'profile' ? '' : 'profile')} aria-label="Profile menu">
                <div className="avatar">{ME.initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <div className="strong small">{ME.name}</div>
                  <div className="tiny muted">{ME.role}</div>
                </div>
                <IconChevronDown size={16} color="var(--muted)" />
              </button>
              {menu === 'profile' && (
                <div className="menu">
                  <div style={{ padding: '8px 12px' }}>
                    <div className="strong">{ME.name}</div>
                    <div className="tiny muted">{auth.email || ME.email}</div>
                    <div className="tiny muted">{ME.role} · Atlanta Heavy Rentals</div>
                  </div>
                  <div className="sep" />
                  <button onClick={() => go('/account')}>
                    <IconUserCircle size={18} /> My account
                  </button>
                  <button
                    onClick={() => {
                      setMenu('');
                      setSlide(0);
                      setAuth({ tourOpen: true });
                    }}
                  >
                    <IconRoute size={18} /> Take the welcome tour
                  </button>
                  <button
                    onClick={() => {
                      setMenu('');
                      setConfirmReset(true);
                    }}
                  >
                    <IconRefresh size={18} /> Reset demo data
                  </button>
                  <div className="sep" />
                  <button
                    onClick={() => {
                      setMenu('');
                      setAuth({ signedIn: false, codeStep: false, wrongCodes: 0 });
                      nav('/login');
                    }}
                  >
                    <IconLogout size={18} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <span>© 2026 RigSetGo · Atlanta, GA</span>
          <nav>
            <button onClick={() => setHelp(true)}>
              <IconHelpCircle size={14} style={{ verticalAlign: -2 }} /> Help
            </button>
            <button onClick={() => setHelp(true)}>Privacy</button>
            <button onClick={() => setHelp(true)}>Terms</button>
          </nav>
        </footer>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset demo data?"
          text="All changes you made in this demo will be cleared and the sample data will come back. You will stay signed in."
          confirmLabel="Reset demo data"
          onConfirm={() => {
            resetDemo();
            nav('/');
          }}
          onClose={() => setConfirmReset(false)}
        />
      )}

      {help && (
        <Modal
          title="Help and policies"
          sub="RigSetGo support is here for you, Monday to Saturday, 7 AM to 7 PM."
          onClose={() => setHelp(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setHelp(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setHelp(false);
                  nav('/support?new=1');
                }}
              >
                Open a support case
              </button>
            </>
          }
        >
          <div className="col gap-8">
            <div className="strong">Phone</div>
            <div className="muted">(404) 555-0100</div>
            <div className="strong">Email</div>
            <div className="muted">support@rigsetgo.com</div>
            <div className="strong">Privacy and terms</div>
            <div className="muted small">Contractors only see the delivery details for their own booking: driver name, arrival time and the live map while a trip is running. Prices, payments and business settings are managed by your Supplier Admin.</div>
          </div>
        </Modal>
      )}

      {auth.tourOpen && (
        <div className="backdrop">
          <div className="modal tour" role="dialog" aria-label="Welcome tour">
            <div className="hero-photo">
              <img src={img(TOUR[slide].photo)} alt="" />
            </div>
            <div className="modal-body" style={{ alignItems: 'center' }}>
              <div className="tiny strong" style={{ color: 'var(--navy)' }}>
                Step {slide + 1} of {TOUR.length}
              </div>
              <h2 style={{ fontSize: 24 }}>{TOUR[slide].title}</h2>
              <p className="muted">{TOUR[slide].text}</p>
              <div className="dots" style={{ marginTop: 4 }}>
                {TOUR.map((_, i) => (
                  <i key={i} className={i === slide ? 'on' : ''} style={{ background: i === slide ? undefined : 'var(--line-strong)' }} />
                ))}
              </div>
            </div>
            <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setAuth({ tourOpen: false, tourDone: true })}>
                Skip tour
              </button>
              <div className="row">
                {slide > 0 && (
                  <button className="btn btn-secondary" onClick={() => setSlide(slide - 1)}>
                    Back
                  </button>
                )}
                {slide < TOUR.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setSlide(slide + 1)}>
                    Next
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setAuth({ tourOpen: false, tourDone: true })}>
                    Start using RigSetGo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
