# RigSetGo – Supplier Dispatcher Portal (clickable working design)

A complete, clickable working design of the **Dispatcher** role in the RigSetGo Supplier portal (the Atlanta construction equipment rental marketplace). Front-end only with sample data: no backend, no API keys, no environment variables. It opens directly in Figma Make.

- **User:** Darnell Brooks, **Dispatcher** at Atlanta Heavy Rentals LLC (team member `M-2`). Invited by Mark Rivera, Supplier Admin.
- **Role (locked, ready-made):** plans deliveries and pickups, assigns drivers, follows trips live, fills in delivery and return tickets, and handles delivery problems. Exactly the access the Supplier Admin portal gives the Dispatcher role: **Dashboard, Bookings, Calendar, Deliveries & Tracking, Support Cases**.
- **Not part of this role (handled by the Supplier Admin):** prices, money, payments and payouts, equipment listings, documents, reviews, quote requests, team and business settings. Opening those links shows a "not part of your role" page.
- **Same design system, layout and sample data as** the Supplier Admin portal: https://github.com/sadaqat786921/rigsetgo-supplier-admin
- **Source of truth:** RigSetGo BRD v1.1 (with client comments), the approved Supplier user flows in FigJam, and the approved navy Supplier Admin design.
- **Demo date:** Friday, November 20, 2026 (`TODAY` in `src/data/seed.ts`).

## Demo sign-in

1. Any email and any password on the sign-in screen.
2. Security code **482193**. Three wrong codes lock the account (unlock screen with an "unlock link" demo button).
3. A short 4-step welcome tour opens after the first sign-in (re-open it from the profile menu).
4. New team member? `#/invite` shows the invitation from the Supplier Admin (accept or decline, set up sign-in, then security code).
5. **Reset demo data** is in the profile menu (top right). Demo changes are kept in `sessionStorage`.

## Tech

- React 19 + Vite + TypeScript, `HashRouter`. Entry: `index.html` → `src/main.tsx` → `src/App.tsx`.
- Icons: `@tabler/icons-react`. Font: `@fontsource/inter` (400/500/600/700). One font everywhere.
- Plain CSS design tokens and all component styles in `src/styles/app.css` (no Tailwind).
- Images are built into the code in `src/data/images.ts` (so they load for every viewer in Figma Make). Sample data keeps paths like `images/excavator-sunset.jpg`; every `<img>` uses `img(path)` to get the built-in image. Originals stay in `public/images`.
- `npm install` then `npm run dev`. `npm run build` type-checks and builds.

## Structure

```
src/
  main.tsx, App.tsx          routes (HashRouter) + "not part of your role" page for admin-only sections
  styles/app.css             design tokens + every component style
  data/types.ts              data model
  data/seed.ts               all sample data, TODAY, ME (the signed-in Dispatcher)
  data/dispatch.ts           Dispatcher rules: admin-only sections, drivers, needs-action, returns due, dashboard tasks, time-window sorting
  data/utils.ts              date helpers, availability checks
  data/images.ts             every photo and logo built into the code + img() helper
  store/store.tsx            app state + auth in sessionStorage, update() with history/notification/toast, resetDemo()
  components/Layout.tsx      sidebar (5 sections), header (search, notifications, profile menu), footer, help, welcome tour
  components/ui.tsx          Modal, ConfirmDialog, ReasonDialog, Badge, Tabs, Pills, Toggle, Field, Empty, Avatar, Progress
  components/charts.tsx      RouteMap (live route with moving truck)
  pages/Auth.tsx             sign in, security code, locked, accept invitation
  pages/Dashboard.tsx        dispatcher dashboard
  pages/Bookings.tsx         bookings list + detail (no money; admin decisions shown as information)
  pages/Calendar.tsx         unit calendar, view only
  pages/Deliveries.tsx       deliveries list, live tracking, TicketModal (delivery/return ticket)
  pages/Support.tsx          cases list, new case, case thread (billing cases stay with the Supplier Admin)
  pages/Account.tsx          my account: profile, notifications, password
```

## Design system

- Primary navy `#003778`, white surfaces, page background `#F3F6FA`, lines `#E3E9F1`.
- Orange `#F7941D` (from the logo) is an accent only: badges, alerts, highlights.
- Status colours: green `#12A150` (good / done), orange (waiting / needs action), red `#D92D20` (problem / blocked).
- Inter only (one font for the whole portal). Body 15 px, titles 22–34 px. Calm, plain wording for users aged 60+.
- Cards 22 px radius, buttons 12 px radius. Real equipment photos from the approved Figma file.

## Routes and every flow

| Route | Screen | What works |
|---|---|---|
| `#/login` | Sign in | Email + password, forgot password (sends link), link to accept an invitation |
| `#/login/code` | Security code | 482193 signs in; wrong code counts down; 3 wrong codes lock |
| `#/login/locked` | Account locked | Email unlock link → unlock (demo) → sign in again |
| `#/invite` | Accept invitation | Invitation from Mark Rivera (Supplier Admin) as Dispatcher: what the role can and cannot do → **Accept** → set up sign-in (name, fixed work email, mobile phone, password with strength, confirm, terms; validation) → security code → tour → dashboard. **This invitation is not for me** → confirm → declined screen |
| `#/` | Dashboard | KPIs (deliveries today, pickups today, on the road now, need a driver); live trip card (On the way / Next up / Done today, progress, distance, arrival, map); **Needs your attention** (jobs without a driver, yard handovers due, returns to plan, support cases waiting); **Today's schedule** in time order with driver picker and Start / Track / Ticket; **Drivers today** (jobs and status); **Next 7 days**; **Returns coming up** (next 3 days) |
| `#/bookings` | Bookings | Tabs (All, Needs action, Upcoming, Active, Completed, Cancelled), search; columns: booking, contractor, machine and unit, dates, delivery or yard pickup, next job, status. No prices or payments |
| `#/bookings/:id` | Booking detail | Plan delivery, record yard handover, track delivery, report breakdown (repair, or swap to a free unit; opens a support case), schedule pickup / record return at yard, go to pickup job; jobs and tickets; history; contractor; open a support case. Payment waiting, extension request, extra charge review and rental completion are shown as information because the Supplier Admin decides them |
| `#/calendar` | Calendar | View only: month view per machine and unit with bookings, maintenance and outside rentals; click a booking to open it; view a block. Blocking days stays with the Supplier Admin and Inventory Manager |
| `#/deliveries` | Deliveries & Tracking | KPIs; tabs Today / Upcoming / Needs driver / Completed; assign or change driver |
| `#/deliveries/:id` | Job detail | Assign driver; **Start trip**; live map moves while open; **Running late** (contractor told); **Mark arrived** → delivery or return ticket: at least 4 photos, condition, fuel, hour meter (compared with delivery), machine-number check, damage or extra use with a suggested charge (sent to the Supplier Admin for review), typed signature; validation |
| `#/support`, `#/support/:id` | Support Cases | Open a case on a booking (late delivery, breakdown, wrong machine, damage), reply with files, resolve / reopen. Billing cases are not shown |
| `#/account` | My account | Profile (name, mobile; email and role fixed by the Supplier Admin), notifications (email, SMS with consent, in-app, topics), password change with validation |
| `#/storefront`, `#/equipment`, `#/pricing`, `#/quotes`, `#/compliance`, `#/reviews`, `#/earnings`, `#/team`, `#/settings` | Not part of this role | Friendly message naming the section and Mark Rivera as the person to ask |

Everything connects: assigning a driver, starting a trip and saving a ticket update the dashboard, lists, sidebar badges, booking status and history.

## Decisions still to confirm with the client

- GPS method for live tracking (driver phone vs machine trackers) — simulated in the demo. If driver phones are chosen, a separate Driver role may be added.
- Payout release rule, document list per equipment type and public review replies stay with the Supplier Admin portal.
