// Pure helpers for family push notifications (no Firebase access, so they are easy to test).

// Tomorrow's date (YYYY-MM-DD) in the family's timezone.
function tomorrowIn(timeZone = 'Asia/Jerusalem', now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function eventsDueOn(events, dateStr) {
  return (Array.isArray(events) ? events : []).filter(e => e && e.date === dateStr && e.title);
}

// Who should hear about a calendar event: { all:true } or { names:[...] }
function eventTarget(ev) {
  const ps = Array.isArray(ev.person) ? ev.person : [ev.person || 'All'];
  return ps.includes('All') ? { all: true } : { names: ps };
}

// Who a newly created list is shared with (never the creator). null = nobody else.
function listShareTarget(list) {
  const creator = list.createdBy || null;
  if (!list.sharedWith || list.sharedWith === 'all') return { all: true, exclude: creator };
  const names = [...new Set(list.sharedWith)].filter(n => n && n !== creator);
  return names.length ? { names } : null;
}

// tokenDocs: [{ token, memberName }]
function pickTokens(tokenDocs, target) {
  if (!target) return [];
  let docs = tokenDocs;
  if (target.all) {
    if (target.exclude) docs = docs.filter(d => d.memberName !== target.exclude);
  } else {
    docs = docs.filter(d => target.names.includes(d.memberName));
  }
  return [...new Set(docs.map(d => d.token).filter(Boolean))];
}

function reminderMessage(ev) {
  const when = ev.time ? `בשעה ${ev.time}` : 'כל היום';
  return {
    title: `🔔 מחר: ${ev.title}`,
    body: `${when}${ev.location ? ' · ' + ev.location : ''}`,
  };
}

function listSharedMessage(list) {
  return {
    title: '📋 רשימה חדשה',
    body: `"${list.name}"${list.createdBy ? ' — נוספה על ידי ' + list.createdBy : ''}`,
  };
}

module.exports = { tomorrowIn, eventsDueOn, eventTarget, listShareTarget, pickTokens, reminderMessage, listSharedMessage };
