import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { IconLock } from '@tabler/icons-react';
import { StoreProvider } from './store/store';
import Layout from './components/Layout';
import { Login, SecurityCode, Locked, Invite } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import { BookingList, BookingDetail } from './pages/Bookings';
import { DeliveryList, DeliveryDetail } from './pages/Deliveries';
import { SupportList, SupportDetail } from './pages/Support';
import Account from './pages/Account';
import { Empty } from './components/ui';
import { ADMIN_ONLY } from './data/dispatch';
import { ME } from './data/seed';

/** Shown when the Dispatcher opens a section that is switched off for this role. */
function NoAccess() {
  const loc = useLocation();
  const section = ADMIN_ONLY[loc.pathname.split('/')[1]] ?? 'This section';
  return (
    <section className="card">
      <Empty
        icon={<IconLock size={28} />}
        title={`${section} is not part of your role`}
        text={`As a ${ME.role}, you can see the Dashboard, Bookings, Calendar, Deliveries & Tracking and Support Cases. If you need access, ask ${ME.admin}, your Supplier Admin.`}
        action={
          <Link className="btn btn-primary" to="/">
            Go to the dashboard
          </Link>
        }
      />
    </section>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/code" element={<SecurityCode />} />
          <Route path="/login/locked" element={<Locked />} />
          <Route path="/invite" element={<Invite />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="deliveries" element={<DeliveryList />} />
            <Route path="deliveries/:id" element={<DeliveryDetail />} />
            <Route path="support" element={<SupportList />} />
            <Route path="support/:id" element={<SupportDetail />} />
            <Route path="account" element={<Account />} />
            {Object.keys(ADMIN_ONLY).map((k) => (
              <Route key={k} path={`${k}/*`} element={<NoAccess />} />
            ))}
            <Route path="*" element={<Empty title="Page not found" text="This page does not exist." action={<Link className="btn btn-primary" to="/">Go to the dashboard</Link>} />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
