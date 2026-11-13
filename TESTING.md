# FamilyHub — Manual Test Checklist

Run through this before any significant deploy (major refactor, new feature, Cloud Function changes).

---

## Auth & Join

- [ ] **Sign up** — create a new family with at least one parent and one kid; verify family doc appears in Firestore
- [ ] **Sign in** — sign out and back in with email/password
- [ ] **Google sign-in (existing family)** — "המשך עם Google" with the owner's Google account; verify it lands in the family
- [ ] **Google sign-in (new account)** — verify it goes to family setup with email locked and no password field; after creating, verify family doc exists and refresh works. Backing out returns to sign-in and signs out
- [ ] **Join via family code** — on a second device/browser, join with the family code; verify login screen shows all members
- [ ] **Join via kid code** — join with a kid's personal code; verify auto-login as that kid with no member switcher shown
- [ ] **Join with Google (spouse)** — generate a personal code for a parent in the management screen; on a second browser enter it in "הצטרף" and tap "הצטרף עם חשבון Google"; verify auto-login as that parent. Sign out, then "המשך עם Google" on the sign-in tab (no code) lands in the same family as the same member
- [ ] **Join with Google (account that owns a family)** — with a Google account that already owns a family, verify a danger prompt names that family and its member count. Cancel → nothing deleted, back on the join tab signed out. Confirm → the old family doc, its subcollections and join codes are gone, and the account lands in the joined family
- [ ] **Join with email/password (new account)** — on the join tab enter a code, open "הצטרף עם אימייל וסיסמה", use a new email; verify it lands in the family, and that after sign-out a normal email sign-in returns there. A wrong code creates no account
- [ ] **Join with email/password (account that owns a family)** — same, with an existing owner's email and password; verify the same deletion prompt, and that cancel deletes nothing
- [ ] **Invite link while signed in** — signed in as an email or Google owner, open a `?join=CODE` link of another family; verify the join prompt, then the deletion prompt; declining either stays in the current family and the `join` param is removed from the URL
- [ ] **Sign-in on a fresh device as a joined account** — clear site data, sign in with a joined email or Google account; verify it lands in the joined family (not signed out)
- [ ] **Connect Google later** — join with a personal parent code only (no Google); open the hamburger menu → "חבר חשבון Google"; verify the page reloads into the same family as the same member, and that after sign-out "המשך עם Google" returns there. The menu item is hidden for the owner, for kids, and once connected
- [ ] **Admin delete family** — (shares code with the above) delete a test family from the admin panel; verify doc, lists, join codes and owner Auth account are removed
- [ ] **Membership can't be forged** — automated: `cd rules-tests && npm install && npm test` (needs Java). By hand: signed in with an unrelated account, `firebase.firestore().collection('uidToFamily').doc(firebase.auth().currentUser.uid).set({familyUid:'<another family uid>'})` in the console is denied, and so is listing `joinCodes`
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

## Claude Connector (MCP)

Automated: `cd functions && npm test` (sign-in flow, tokens, both tools). Manual, after a deploy:

- [ ] **Discovery** — `https://familyhub-7fdd5.firebaseapp.com/.well-known/oauth-authorization-server` returns JSON; a plain GET of `/mcp` returns 401
- [ ] **Connected apps screen** — hamburger menu → "אפליקציות מחוברות" shows Google Calendar (connect / reconnect / disconnect work, and match the bar on the calendar tab) and, for parents, Claude with the connector address and a working copy button; a kid sees only Google Calendar
- [ ] **Connect** — in Claude: Settings → Connectors → add custom connector with `https://familyhub-7fdd5.firebaseapp.com/mcp`; the browser opens FamilyHub on the Connected apps screen with the request card (no separate sign-in when already signed in); approve; Claude shows the connector as connected with 3 tools, recorded under the member who approved
- [ ] **Connect while signed out** — the normal sign-in appears first, then the request card after picking a member
- [ ] **Decline / expiry** — declining returns to Claude without connecting; a request older than 15 minutes shows "פג תוקף"
- [ ] **Refused accounts** — logged in as a kid, the request is not offered for approval; a kid's personal code cannot approve
- [ ] **Disconnect** — "נתק" on the Claude card ends the connection; Claude's next tool call asks to reconnect
- [ ] **Create recipe** — ask Claude to save a recipe; it appears in Lists → recipes with ingredients, amounts, steps and a "למתכון המקורי" link when a source link was given
- [ ] **Create event as regular parent** — goes to pending; committee is notified
- [ ] **Create event as committee** — published immediately; class parents are notified
- [ ] **Locked collections** — from the browser console of a signed-in app session, reading `mcpTokens`, `mcpAuthCodes` or `mcpClients` is denied

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
