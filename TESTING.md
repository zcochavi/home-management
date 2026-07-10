# FamilyHub — Manual Test Checklist

Run through this before any significant deploy (major refactor, new feature, Cloud Function changes).

---

## Auth & Join

- [ ] **Sign up** — create a new family with at least one parent and one kid; verify family doc appears in Firestore
- [ ] **Sign in** — sign out and back in with email/password
- [ ] **Join via family code** — on a second device/browser, join with the family code; verify login screen shows all members
- [ ] **Join via kid code** — join with a kid's personal code; verify auto-login as that kid with no member switcher shown
- [ ] **Refresh after join** — refresh the page after joining; verify it loads correctly (no infinite spinner, no blank page)
- [ ] **Sign out** — sign out; verify auth screen appears

---

## Member Navigation & Roles

- [ ] **Kid restriction** — logged in as a kid, verify no "החלף משתמש" option in hamburger menu
- [ ] **Parent restriction** — logged in as a parent, open member switcher; verify other parents are NOT listed, only self + kids
- [ ] **Role badge** — verify correct badge shown in header (🔑 מנהל / ועד / הורה / ילד/ה)
- [ ] **Login screen badges** — verify role badges appear on member cards on login screen

---

## Community & Events

- [ ] **Submit event as regular parent** — verify it goes to pending, not published directly
- [ ] **Pending notification** — committee/admin receives notification (not the submitter)
- [ ] **Approve event** — committee member approves; event appears in community; submitter receives approval notification
- [ ] **Reject event** — committee member rejects; event disappears from pending
- [ ] **Admin panel** — opens from hamburger menu (admin only); shows pending events, applications, schools, log, settings
- [ ] **Publish directly as committee** — committee member publishes event; appears immediately without pending

---

## School & City Approval

- [ ] **New school request** — enter an unknown school name for a kid; verify pending badge appears and admin gets notification
- [ ] **Approve school** — admin approves; kid is registered in class, pending badge removed
- [ ] **Deny school** — admin denies; school data cleared from kid's profile

---

## Committee Applications

- [ ] **Apply for committee** — regular parent applies; admin + class members notified
- [ ] **Vote** — another parent votes; progress bar updates
- [ ] **Admin approve** — admin approves application; applicant role becomes committee, notified
- [ ] **Auto-deny** — (requires waiting or adjusting expiryDays to 0 in settings) expired application gets denied

---

## Kid Codes Migration (one-time)

- [ ] **Migration button** — open admin panel → Maintenance → run "הפק קודים חסרים"; verify all existing kids get codes
- [ ] **Code visible** — open management screen; verify each kid shows their personal code with share button

---

## Notifications (Chrome)

- [ ] **Permission granted** — FCM registers successfully (`[FCM] registered on chrome` in console)
- [ ] **Foreground toast** — trigger a notification while the app is open; verify toast appears
- [ ] **Background notification** — trigger a notification while app is closed/backgrounded; verify system notification appears

---

## General UI

- [ ] **Home screen upcoming events** — next 5 events from calendar + class events shown
- [ ] **Community search** — search box filters classmates correctly
- [ ] **Past announcements hidden** — events with past dates don't appear
- [ ] **Gender filter** — birthday event marked boys-only is not shown to girl members

---

## After a File Split / Refactor

- [ ] **Page loads** — no 404 errors in Network tab for CSS/JS files
- [ ] **No console errors** — browser console is clean on load
- [ ] **All tabs render** — click through every tab; verify no blank/broken sections
