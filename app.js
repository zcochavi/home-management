// ════════════════════════════════════════
//  FIREBASE CONFIG
//  → Replace placeholder values with your Firebase project config
//  → Get from: Firebase Console → Project Settings → Your apps → Web app
// ════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAlaDotuWTCk3GDqpgY-tEaNkpDrbOKM6M",
  authDomain:        "familyhub-7fdd5.firebaseapp.com",
  projectId:         "familyhub-7fdd5",
  storageBucket:     "familyhub-7fdd5.firebasestorage.app",
  messagingSenderId: "655474126170",
  appId:             "1:655474126170:web:65ffc8203c863bd47b9763",
};

const FB_CONFIGURED = !FIREBASE_CONFIG.apiKey.startsWith('YOUR_');
const VAPID_KEY  = 'BD6LTj6Mp9N1QdCD59_QrRWic6s7uBQV-qJFkUaH8oRCXhTuPrHhIy4WEi158caziOmGm9D1WQq4bhJVidRFPVI';
// Paste your Firebase UID here — this account gets admin privileges (see Settings → avatar for your UID)
const ADMIN_UID  = 'TirsqoPeWHfpB3kIULJh4UM3e2r1';
let fbAuth, fbDb, fbMessaging = null, fbFunctions = null;
if (FB_CONFIGURED) {
  firebase.initializeApp(FIREBASE_CONFIG);
  fbAuth = firebase.auth();
  fbDb   = firebase.firestore();
  fbFunctions = firebase.functions();
}

// ════════════════════════════════════════
//  GOOGLE CALENDAR CONFIG
// ════════════════════════════════════════
const GOOGLE_CLIENT_ID = '34982320669-4sg8h4qmppd7v9jdtflqmoqretjsnffa.apps.googleusercontent.com';
const GCAL_SCOPE       = 'https://www.googleapis.com/auth/calendar.events';
const GCAL_DISCOVERY   = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// ════════════════════════════════════════
//  STRINGS (i18n)
// ════════════════════════════════════════
const STRINGS = {
  he: {
    dir:'rtl', locale:'he-IL',
    loginSub:'מי אתה?',
    parentRole:'הורה', kidRole:'ילד/ה', roleAdmin:'🔑 מנהל', roleParent:'הורה', roleKid:'ילד/ה',
    greetMorning:'בוקר טוב', greetAfternoon:'צהריים טובים', greetEvening:'ערב טוב',
    switchUser:'החלף משתמש', langToggle:'EN',
    tabs:['בית','משימות','סופרמרקט','שיעורים','לוח שנה','קהילה','דשבורד'],
    all:'כולם',
    todayChores:'⚡ משימות היום',
    personChores: n => `⚡ משימות של ${n}`,
    starChart:'⭐ לוח כוכבים',
    hwDueSoon:'📋 שיעורים להגשה',
    allDone:'🎉 הכל גמור! כל הכבוד!',
    noPendingHw:'📭 אין שיעורים ממתינים!',
    hwHistory:'📋 היסטוריה', hwHistoryEmpty:'אין שיעורים שהושלמו עדיין', hwHistorySearch:'חיפוש בהיסטוריה...',
    wbHi: n => `שלום ${n}!`,
    wbStars: n => `יש לך ${n} ⭐ כוכבים השבוע`,
    addChoreTitle:'➕ הוסף משימה', chorePlaceholder:'מה צריך לעשות...',
    noChores:'זה זמן טוב להוסיף משהו קטן 🙂',
    choreHistory:'📋 היסטוריה', choreHistoryEmpty:'אין משימות שהושלמו עדיין', choreHistorySearch:'חיפוש בהיסטוריה...',
    high:'גבוהה', medium:'בינונית', low:'נמוכה',
    youLabel:'(את/ה)', add:'הוסף',
    superPoolTitle:'🏪 מאגר', superListTitle:'🛒 רשימת קניות', superCartTitle:'🧺 בעגלה',
    poolAddPlaceholder:'שם הפריט...',
    poolEmpty:'אין פריטים במאגר — הוסף את הפריטים שאתם קונים בדרך כלל',
    shoppingListEmpty:'הרשימה ריקה — הוסף פריטים מהמאגר',
    cartEmpty:'הסל ריק',
    startShopping:'🛒 התחל קנייה',
    doneShopping:'✓ סיימתי לקנות',
    shoppingHistoryTitle:'📋 היסטוריה', shoppingHistoryEmpty:'אין היסטוריית קניות עדיין',
    historyBought:'קנה', historyMissed:'לא הביא',
    addToList:'+ רשימה', inList:'✓ ברשימה',
    toCart:'לעגלה ←', returnToList:'↩ חזור',
    stillNeed:'עוד לקחת', inCartLabel:'בעגלה',
    doneShoppingConfirm: (bought, missed) => missed ? `קנית ${bought} פריטים.\nלא הבאת ${missed} פריטים — המשך?` : `קנית ${bought} פריטים. להסיים?`,
    doneShoppingMsg: (name, bought, missedNames) => missedNames.length ? `${name} סיים לקנות — לא הביא: ${missedNames.join(', ')}` : `${name} סיים לקנות (${bought} פריטים)`,
    shoppingList:'🛒 רשימת קניות', addItemPlaceholder:'הוסף פריט...',
    clearChecked:'🗑 נקה מסומנים', groceryEmpty:'🛒 הרשימה ריקה!',
    cats:{ 'Fruit & Veg':'פירות וירקות','Dairy & Eggs':'חלב וביצים','Pantry':'מזווה','Meat & Fish':'בשר ודגים','פירות וירקות':'פירות וירקות','חלב וביצים':'חלב וביצים','מזווה':'מזווה','בשר ודגים':'בשר ודגים','כללי':'כללי' },
    hwTitle: n => `📖 שיעורים של ${n}`,
    hwPlaceholder:'תיאור המשימה...', noHw:'🎉 אין שיעורים!',
    hwDueLabel: d => `📅 להגשה: ${d}`,
    subjects:{ Maths:'מתמטיקה', English:'אנגלית', Science:'מדעים', History:'היסטוריה', Art:'אמנות' },
    addEventTitle:'➕ הוסף אירוע', eventPlaceholder:'כותרת האירוע...',
    everyone:'כולם', allDay:'כל היום', noEvents:'אין אירועים', todayLabel:'היום',
    gcalSync:'סנכרון עם Google Calendar',
    gcalConnected:'✓ Google Calendar מחובר',
    gcalLoading:'...טוען',
    gcalSyncing:'🔄 מסנכרן...',
    gcalConnect:'התחבר', gcalDisconnect:'התנתק', gcalRefresh:'↻', gcalReconnect:'התחבר מחדש',
    gcalWasConnected:'📅 Google Calendar — לחץ להתחבר מחדש',
    gcalSetup:'⚠ הדבק Client ID בקוד כדי לאפשר סנכרון',
    dows:['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'],
    months:['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'],
    gcalSource:'· Google Calendar',
    gcalSyncOption:'📅 גם ב-Google Calendar',
    noKids:'אין ילדים במשפחה',
    commNoSchool:'יש לשייך ילדים לבית ספר',
    commNoSchoolHint:'הגדרות ← ניהול משפחה',
    commClassEvents:'אירועי כיתה',
    commNoEvents:'אין אירועים קרובים',
    commPast:'עברו',
    commClassmates:'חברי כיתה ב-FamilyHub',
    commAddEvent:'➕ הוסף אירוע לכיתה',
    commNewEvent:'אירוע חדש',
    commPost:'פרסם',
    commEventTitle:'כותרת האירוע...',
    commEventNote:'הערה (אופציונלי)',
    commEventPaybox:'קישור Paybox (אופציונלי)',
    commPayNow:'💳 שלם עכשיו',
    commScopeClass:'כיתה', commScopeGrade:'שכבה', commScopeSchool:'בית ספר',
    commScopeLabel:'רמת האירוע',
    commTomorrow:'מחר',
    commInDays: n => `בעוד ${n} ימים`,
    commDaysAgo: n => `לפני ${n} ימים`,
    evBirthday:'יום הולדת', evTrip:'טיול', evParty:'מסיבה', evAnnouncement:'הודעה', evOther:'אחר',
    pendingSection:'⏳ ממתינים לאישור',
    pendingApprove:'✓ אשר',
    pendingReject:'✕ דחה',
    pendingSubmitted:'הבקשה נשלחה לוועד ההורים לאישור',
    roleCommittee:'ועד',
    grantCommittee:'הוסף לועד',
    revokeCommittee:'הסר מהועד',
    commApplyCommittee:'הגש מועמדות לוועד ההורים',
    commApplicationsTitle:'מועמדויות לוועד',
    commApplicationVote:'👍 אני תומך',
    commApplicationVoted:'✓ הצבעת',
    commApplicationApprove:'✓ אשר',
    commApplicationDeny:'✕ דחה',
    commMyApplication:'המועמדות שלך',
    commApplicationExpires: d => `פג תוקף: ${d}`,
    commCancelApplication:'בטל מועמדות',
    commLeaveCommittee:'עזוב ועד',
  },
  en: {
    dir:'ltr', locale:'en-US',
    loginSub:"Who's there?",
    parentRole:'Parent', kidRole:'Kid', roleAdmin:'🔑 Admin', roleParent:'Parent', roleKid:'Kid',
    greetMorning:'Good morning', greetAfternoon:'Good afternoon', greetEvening:'Good evening',
    switchUser:'Switch user', langToggle:'עב',
    tabs:['Home','Chores','Supermarket','Homework','Calendar','Community','Dashboard'],
    all:'All',
    todayChores:"⚡ Today's Chores",
    personChores: n => `⚡ ${n}'s Chores`,
    starChart:'⭐ Star Chart',
    hwDueSoon:'📋 Homework Due Soon',
    allDone:'🎉 All done! Great job!',
    noPendingHw:'📭 No pending homework!',
    hwHistory:'📋 History', hwHistoryEmpty:'No completed homework yet', hwHistorySearch:'Search history…',
    wbHi: n => `Hi ${n}!`,
    wbStars: n => `You have ${n} ⭐ star${n!==1?'s':''} this week`,
    addChoreTitle:'➕ Add Chore', chorePlaceholder:'What needs doing…',
    noChores:'A good time to add something small 🙂',
    choreHistory:'📋 History', choreHistoryEmpty:'No completed chores yet', choreHistorySearch:'Search history…',
    high:'high', medium:'medium', low:'low',
    youLabel:'(you)', add:'Add',
    superPoolTitle:'🏪 Pool', superListTitle:'🛒 Shopping List', superCartTitle:'🧺 In Cart',
    poolAddPlaceholder:'Item name...',
    poolEmpty:"No items in pool — add items your family usually buys",
    shoppingListEmpty:'List is empty — add items from the pool',
    cartEmpty:'Cart is empty',
    startShopping:'🛒 Start Shopping',
    doneShopping:'✓ Done Shopping',
    shoppingHistoryTitle:'📋 History', shoppingHistoryEmpty:'No shopping history yet',
    historyBought:'Bought', historyMissed:'Missed',
    addToList:'+ List', inList:'✓ In List',
    toCart:'→ Cart', returnToList:'↩ Return',
    stillNeed:'Still need', inCartLabel:'In cart',
    doneShoppingConfirm: (bought, missed) => missed ? `Bought ${bought} items.\nMissed ${missed} items — finish?` : `Bought ${bought} items. Finish?`,
    doneShoppingMsg: (name, bought, missedNames) => missedNames.length ? `${name} is done shopping — missed: ${missedNames.join(', ')}` : `${name} is done shopping (${bought} items)`,
    shoppingList:'🛒 Shopping List', addItemPlaceholder:'Add item…',
    clearChecked:'🗑 Clear checked', groceryEmpty:'🛒 List is empty!',
    cats:{ 'Fruit & Veg':'Fruit & Veg','Dairy & Eggs':'Dairy & Eggs','Pantry':'Pantry','Meat & Fish':'Meat & Fish' },
    hwTitle: n => `📖 ${n}'s Homework`,
    hwPlaceholder:'Assignment description…', noHw:'🎉 No homework!',
    hwDueLabel: d => `📅 Due: ${d}`,
    subjects:{ Maths:'Maths', English:'English', Science:'Science', History:'History', Art:'Art' },
    addEventTitle:'➕ Add Event', eventPlaceholder:'Event title…',
    everyone:'Everyone', allDay:'All day', noEvents:'No events', todayLabel:'Today',
    gcalSync:'Sync with Google Calendar',
    gcalConnected:'✓ Google Calendar connected',
    gcalLoading:'Loading Google APIs…',
    gcalSyncing:'🔄 Syncing…',
    gcalConnect:'Connect', gcalDisconnect:'Disconnect', gcalRefresh:'↻', gcalReconnect:'Reconnect',
    gcalWasConnected:'📅 Google Calendar — tap to reconnect',
    gcalSetup:'⚠ Paste your Client ID in the script to enable sync',
    dows:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    gcalSource:'· Google Calendar',
    gcalSyncOption:'📅 Also add to Google Calendar',
    noKids:'No kids in this family',
    commNoSchool:'Associate kids with a school',
    commNoSchoolHint:'Settings → Family management',
    commClassEvents:'Class Events',
    commNoEvents:'No upcoming events',
    commPast:'Past',
    commClassmates:'Classmates on FamilyHub',
    commAddEvent:'➕ Add class event',
    commNewEvent:'New Event',
    commPost:'Post',
    commEventTitle:'Event title...',
    commEventNote:'Note (optional)',
    commEventPaybox:'Paybox link (optional)',
    commPayNow:'💳 Pay now',
    commScopeClass:'Class', commScopeGrade:'Grade', commScopeSchool:'School',
    commScopeLabel:'Audience',
    commTomorrow:'Tomorrow',
    commInDays: n => `In ${n} days`,
    commDaysAgo: n => `${n} days ago`,
    evBirthday:'Birthday', evTrip:'Trip', evParty:'Party', evAnnouncement:'Announcement', evOther:'Other',
    pendingSection:'⏳ Pending Approval',
    pendingApprove:'✓ Approve',
    pendingReject:'✕ Reject',
    pendingSubmitted:'Your request was sent to the committee for approval',
    roleCommittee:'Committee',
    grantCommittee:'Make Committee',
    revokeCommittee:'Remove from Committee',
    commApplyCommittee:'Apply for Parents Committee',
    commApplicationsTitle:'Committee Applications',
    commApplicationVote:'👍 Support',
    commApplicationVoted:'✓ Voted',
    commApplicationApprove:'✓ Approve',
    commApplicationDeny:'✕ Deny',
    commMyApplication:'Your Application',
    commApplicationExpires: d => `Expires: ${d}`,
    commCancelApplication:'Cancel Application',
    commLeaveCommittee:'Leave Committee',
  },
};

// ════════════════════════════════════════
//  i18n HELPERS
// ════════════════════════════════════════
function getLang() {
  if (!S || !S.uid || !S.user) return 'he';
  return localStorage.getItem('familyhub_lang_' + S.uid + '_' + S.user) || 'he';
}
function setLang(l) {
  if (!S.uid || !S.user) return;
  localStorage.setItem('familyhub_lang_' + S.uid + '_' + S.user, l);
  applyDir(); renderAll();
}
function toggleLang() { setLang(getLang() === 'he' ? 'en' : 'he'); }
function applyDir() {
  const l = getLang();
  document.documentElement.lang = l;
  document.documentElement.dir  = STRINGS[l].dir;
}
function t(key, ...args) {
  const s = STRINGS[getLang()] || STRINGS.he;
  const v = s[key] !== undefined ? s[key] : (STRINGS.he[key] || key);
  return typeof v === 'function' ? v(...args) : v;
}

// ════════════════════════════════════════
//  DYNAMIC MEMBER HELPERS
// ════════════════════════════════════════
let familyData = null;

function getMembers()        { return familyData?.members || []; }
function getKids()           { return getMembers().filter(m => m.role === 'kid').map(m => m.name); }
function getParents()        { return getMembers().filter(m => m.role === 'parent').map(m => m.name); }
function getAllMemberNames()  { return getMembers().map(m => m.name); }
function getEmoji(name)      { return getMembers().find(m => m.name === name)?.emoji || '👤'; }
// Phosphor-style person SVG per role (matches tab icon style)
function _memberPersonSVG(role, gender) {
  if (role === 'kid') {
    if (gender === 'girl') {
      // girl: face + two pigtails
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">
        <circle cx="12" cy="13" r="8"/>
        <path d="M7 5.5C7 3.5 8.5 2 10.5 2S12 3 12 3s-.5-1 1.5-1S17 3.5 17 5.5" stroke-width="1.8"/>
        <path d="M7 5.5C5 6 4 7.5 4 9" stroke-width="1.8"/>
        <path d="M17 5.5C19 6 20 7.5 20 9" stroke-width="1.8"/>
        <circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none"/>
        <path d="M9.5 16.5c.6.8 1.4 1.2 2.5 1.2s1.9-.4 2.5-1.2"/>
      </svg>`;
    }
    // boy: smiley face in circle
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none"/>
      <path d="M9.5 15.5c.6.8 1.4 1.2 2.5 1.2s1.9-.4 2.5-1.2"/>
    </svg>`;
  }
  if (gender === 'female') {
    // female adult: bust + shoulder curves suggesting hair
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">
      <circle cx="12" cy="7" r="4"/>
      <path d="M3 21c0-4.4 4-8 9-8s9 3.6 9 8"/>
      <path d="M8 4C8 2.5 10 1.5 12 1.5S16 2.5 16 4" stroke-width="1.6"/>
    </svg>`;
  }
  // male / default adult
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">
    <circle cx="12" cy="7" r="4"/>
    <path d="M3 21c0-4.4 4-8 9-8s9 3.6 9 8"/>
  </svg>`;
}
// Returns <img> if member has a photo, else an SVG person icon.
// sizePx = explicit px for standalone use; omit to fill container (width/height 100%).
function getAvatar(name, sizePx) {
  const member = getMembers().find(m => m.name === name);
  if (member?.photo) {
    const s = sizePx != null ? `width:${sizePx}px;height:${sizePx}px` : 'width:100%;height:100%';
    return `<img src="${esc(member.photo)}" style="${s};object-fit:cover;border-radius:50%;display:block">`;
  }
  const color = getPersonColor(name);
  const role = member?.role || 'parent';
  const dim = sizePx != null ? `${sizePx}px` : '100%';
  const bg = sizePx != null ? `background:${color}1a;` : '';
  const gender = member?.gender || null;
  return `<span style="display:flex;align-items:center;justify-content:center;width:${dim};height:${dim};border-radius:50%;${bg}color:${color};"><span style="width:62%;height:62%;display:flex;">${_memberPersonSVG(role, gender)}</span></span>`;
}

const COLOR_PALETTE  = ['#c471ed','#4facfe','#fa709a','#43e97b','#f9d423','#f5576c','#667eea','#48bb78'];
const KID_GRADIENTS  = ['#f093fb,#f5576c','#43e97b,#38f9d7','#fda085,#f6d365','#a18cd1,#fbc2eb','#667eea,#764ba2'];

function getPersonColor(name) {
  if (name === 'All') return '#a0aec0';
  const idx = getAllMemberNames().indexOf(name);
  return COLOR_PALETTE[Math.max(0, idx) % COLOR_PALETTE.length];
}
function getKidGradient(name) {
  const idx = getKids().indexOf(name);
  return KID_GRADIENTS[Math.max(0, idx) % KID_GRADIENTS.length];
}

// ════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════
const DEFAULT_GROCERY_CATS = [
  { name:'כללי', emoji:'🛒' },
  { name:'פירות וירקות', emoji:'🥦' },
  { name:'חלב וביצים', emoji:'🥛' },
  { name:'מזווה', emoji:'🥫' },
  { name:'בשר ודגים', emoji:'🥩' },
];
const DEFAULT_SUBJECTS = [
  { name:'Maths',   nameHe:'מתמטיקה', bg:'#f0f4ff', color:'#4a65cc' },
  { name:'English', nameHe:'אנגלית',  bg:'#fdf2f8', color:'#9d174d' },
  { name:'Science', nameHe:'מדעים',   bg:'#ecfdf5', color:'#065f46' },
  { name:'History', nameHe:'היסטוריה',bg:'#fff7ed', color:'#9a3412' },
  { name:'Art',     nameHe:'אמנות',   bg:'#fef9c3', color:'#854d0e' },
];
const SUBJECT_COLOR_POOL = [
  { bg:'#f0f4ff', color:'#4a65cc' },
  { bg:'#fdf2f8', color:'#9d174d' },
  { bg:'#ecfdf5', color:'#065f46' },
  { bg:'#fff7ed', color:'#9a3412' },
  { bg:'#fef9c3', color:'#854d0e' },
  { bg:'#f0fdfa', color:'#0f766e' },
  { bg:'#faf5ff', color:'#7e22ce' },
  { bg:'#fff1f2', color:'#9f1239' },
];

// Keyword → emoji suggestions for grocery category names
const CAT_EMOJI_HINTS = [
  { emoji:'🥦', keys:['fruit','veg','produce','salad','leaf','green','herb','mushroom','ירק','פרי','ירקות','פירות','סלט','פטריה','עשב'] },
  { emoji:'🥛', keys:['dairy','milk','cream','butter','cheese','yogurt','egg','חלב','ביצ','גבינ','יוגורט','חמאה','שמנת','קוטג','מחלבה'] },
  { emoji:'🍗', keys:['chicken','poultry','turkey','duck','wing','עוף','פרגית','הודו','ברווז','כנף'] },
  { emoji:'🥩', keys:['meat','beef','lamb','steak','pork','veal','butcher','בשר','סטייק','טלה','כבש','עגל','נקניק','קצב'] },
  { emoji:'🐟', keys:['fish','seafood','tuna','salmon','shrimp','prawn','דג','טונה','סלמון','שרימפס','פירות ים','קרפיון'] },
  { emoji:'🥖', keys:['bread','bak','pastry','roll','bun','pita','toast','bagel','challah','לחם','אפייה','מאפה','פיתה','טוסט','בגל','חלה'] },
  { emoji:'☕', keys:['coffee','tea','espresso','cappuccino','latte','קפה','תה','אספרסו','קפוצ'] },
  { emoji:'🍷', keys:['wine','beer','alcohol','spirits','whisky','vodka','יין','בירה','אלכוהול','וויסקי','וודקה','ליקר'] },
  { emoji:'🥤', keys:['drink','juice','soda','water','beverage','lemonade','משקה','מיץ','מים','סודה','לימונדה','קולה'] },
  { emoji:'🍫', keys:['snack','chocolate','candy','sweet','chip','crisp','cookie','wafer','חטיף','שוקולד','ממתק','עוגיה','צ\'יפס','ופל'] },
  { emoji:'🧊', keys:['frozen','freeze','ice','קפוא','גלידה','קרח','מוקפא'] },
  { emoji:'🥫', keys:['pantry','canned','can','tin','preserve','מזווה','קופסא','שימור'] },
  { emoji:'🍝', keys:['pasta','noodle','spaghetti','rice','grain','פסטה','אטריה','ספגטי','אורז'] },
  { emoji:'🧂', keys:['spice','seasoning','salt','pepper','condiment','תבלין','מלח','פלפל','חומץ','חרדל'] },
  { emoji:'🫙', keys:['jam','spread','honey','tahini','peanut','jelly','hummus','ריבה','דבש','טחינה','חמאת','ממרח','חומוס'] },
  { emoji:'🌾', keys:['flour','cereal','oat','grain','muesli','granola','קמח','שיבולת','גרנולה','דגני','קורנפלקס'] },
  { emoji:'🥣', keys:['breakfast','בוקר'] },
  { emoji:'🫒', keys:['oil','olive','שמן','זית'] },
  { emoji:'🍳', keys:['kitchen','cook','cookware','מטבח','בישול','כלי'] },
  { emoji:'🧹', keys:['clean','detergent','laundry','bleach','mop','scrub','wash','ניקוי','ניקיון','כביסה','אקונומיקה','שטיפה','מגב','נקי'] },
  { emoji:'🧻', keys:['paper','tissue','toilet','napkin','disposable','towel','נייר','טישו','מגבת','חד פעמי','מפית','נייר אסלה'] },
  { emoji:'🧴', keys:['personal','hygiene','shampoo','lotion','deodorant','cosmetic','beauty','shower','soap','סבון','שמפו','קרם','דאודורנט','קוסמטיקה','טיפוח','רחצה'] },
  { emoji:'💊', keys:['health','pharmacy','vitamin','medicine','supplement','pill','pharma','בריאות','ויטמין','תרופה','תוסף','כדור','פארמ','רפואה'] },
  { emoji:'👶', keys:['baby','infant','diaper','formula','nappy','תינוק','חיתול','פורמולה'] },
  { emoji:'🐾', keys:['pet','dog','cat','animal','kibble','חיות','כלב','חתול','מחמד','פט'] },
  { emoji:'🌸', keys:['flower','plant','garden','floral','פרח','צמח','גינה','פרחים'] },
  { emoji:'📦', keys:['misc','other','general','misc','שונות','כללי','אחר'] },
];
function suggestCatEmoji(name) {
  if (!name) return '';
  const lower = name.toLowerCase();
  for (const hint of CAT_EMOJI_HINTS) {
    if (hint.keys.some(k => lower.includes(k.toLowerCase()))) return hint.emoji;
  }
  return '';
}
function autoSuggestCatEmoji(val, emojiInputId) {
  const emojiEl = el(emojiInputId || 'mgmtNewCatEmoji');
  if (!emojiEl || emojiEl.dataset.manual) return;
  const suggested = suggestCatEmoji(val);
  emojiEl.value = suggested;
  emojiEl.placeholder = suggested || '🛒';
}

function getGroceryCats() {
  return (familyData?.groceryCategories?.length) ? familyData.groceryCategories : DEFAULT_GROCERY_CATS;
}
function getCatEmoji(name) {
  return getGroceryCats().find(c => c.name === name)?.emoji || '🛒';
}
function getSubjects() {
  return (familyData?.subjects?.length) ? familyData.subjects : DEFAULT_SUBJECTS;
}
function subjectBadgeStyle(name) {
  const s = getSubjects().find(s => s.name === name);
  if (s) return `background:${s.bg};color:${s.color}`;
  return 'background:#f3f4f6;color:#6b7280';
}
function subjectLabel(name) {
  const s = getSubjects().find(s => s.name === name);
  if (getLang() === 'he') return s?.nameHe || s?.name || name;
  return s?.name || name;
}

const _now       = new Date();
const today      = _now.toISOString().slice(0,10);
const tomorrow   = new Date(_now.getTime()+864e5).toISOString().slice(0,10);
const yesterday  = new Date(_now.getTime()-864e5).toISOString().slice(0,10);

function _choreWhen(id) {
  const d = new Date(id).toISOString().slice(0,10);
  if (d === today)     return 'היום';
  if (d === yesterday) return 'אתמול';
  return fmtDate(d);
}
function _choreDueLabel(due) {
  if (!due) return null;
  const isHe = getLang() === 'he';
  if (due < today)      return isHe ? `עבר: ${fmtDate(due)}`  : `overdue: ${fmtDate(due)}`;
  if (due === today)    return isHe ? 'היום'  : 'Today';
  if (due === tomorrow) return isHe ? 'מחר'   : 'Tomorrow';
  return fmtDate(due);
}

// Chore sort score: combines priority + due-date urgency.
// Priority penalty (days): high=0, medium=5, low=12.
// Due-date days: negative if overdue (urgent bonus), 0=today, N=N days out, no-due=30.
// Lower score → appears first.
const _CHORE_PRI_PENALTY = { high: 0, medium: 5, low: 12 };
function _choreSortScore(c) {
  const pri = _CHORE_PRI_PENALTY[c.priority] ?? 5;
  let dueDays;
  if (c.due) {
    const msPerDay = 864e5;
    dueDays = Math.round((new Date(c.due + 'T00:00:00') - new Date(today + 'T00:00:00')) / msPerDay);
  } else {
    dueDays = 30; // no due date: treated as ~a month out
  }
  return pri + dueDays;
}

// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
let S = {
  user:null, uid:null, tab:'home', filter:'All', child:null,
  chores:[], grocery:[], homework:[], stars:{}, events:[],
  groceryPool:[], shoppingList:[], inCart:[], shoppingHistory:[],
  calYear:_now.getFullYear(), calMonth:_now.getMonth(), calSelected:today,
  lockedMember: null,
};
let gcal = { gapiReady:false, gisReady:false, tokenClient:null, accessToken:null, events:[], syncing:false };
let fbUnsubscribe       = null;
let _presenceInterval   = null;
let _notifUnsubscribe   = null;
let _webtopUnsub        = null;
let _webtopHomework     = []; // [{subject, text, day, date, classKey}]

const isParent    = () => getParents().includes(S.user);
const isKid       = () => getKids().includes(S.user);
const isAdmin     = () => !!ADMIN_UID && S.uid === ADMIN_UID && _isOwner();

// Committee helpers — per-member (not per-family)
const _myMember = () => getMembers().find(m => m.name === S.user);
const _memberCommitteeClasses = (m) => {
  // Per-member data takes precedence
  if (m?.committeeClasses !== undefined) return m.committeeClasses;
  // Fall back to family-level ONLY if no member has per-member data yet (legacy migration)
  // Once any member has explicit committeeClasses, unlisted members get none
  const anyPerMember = getMembers().some(x => x.committeeClasses !== undefined);
  if (anyPerMember) return [];
  // Family-level committeeClasses only apply to the account owner, not joined members
  if (!_isOwner()) return [];
  return familyData?.committeeClasses || [];
};
const _isOwner       = () => fbAuth.currentUser?.uid === S.uid;
const isCommittee    = () => isAdmin() || _memberCommitteeClasses(_myMember()).length > 0 || (_isOwner() && familyData?.role === 'committee');
const isCommitteeFor = (cid) => {
  if (isAdmin() || (_isOwner() && familyData?.role === 'committee')) return true;
  const cls = _memberCommitteeClasses(_myMember());
  return cls.includes(cid) || cls.includes('*');
};

// Returns 'all' | 'some' | 'none' — how many of the family's kid-classes this member is committee for.
function parentCommitteeStatus() {
  if (_isOwner() && familyData?.role === 'committee') return 'all';
  const commClasses = _memberCommitteeClasses(_myMember());
  if (commClasses.includes('*')) return 'all';
  if (!commClasses.length) return 'none';

  const kidClassIds = getKids()
    .map(name => getMembers().find(m => m.name === name))
    .filter(m => m?.school?.city && m?.school?.grade)
    .map(m => classIdFor(m.school))
    .filter(Boolean);

  if (!kidClassIds.length) return commClasses.length > 0 ? 'all' : 'none';
  const matching = kidClassIds.filter(cid => commClasses.includes(cid));
  if (matching.length === 0)            return 'none';
  if (matching.length === kidClassIds.length) return 'all';
  return 'some';
}

function _committeeBadge(status) {
  if (status === 'all')  return `<span class="role-badge role-badge-committee">${t('roleCommittee')}</span>`;
  if (status === 'some') return `<span class="role-badge role-badge-committee" style="opacity:0.75">${t('roleCommittee')} / ${t('roleParent')}</span>`;
  return null;
}

function roleBadgeHtml(memberRole, familyUidForAdmin) {
  // memberRole: 'parent' | 'kid'
  // familyUidForAdmin: optional, to check if this member's family is admin
  const isThisAdmin = familyUidForAdmin && ADMIN_UID && familyUidForAdmin === ADMIN_UID;
  if (memberRole === 'kid')
    return `<span class="role-badge role-badge-kid">${t('roleKid')}</span>`;
  if (isThisAdmin)
    return `<span class="role-badge role-badge-admin">${t('roleAdmin')}</span>`;
  const commBadge = _committeeBadge(parentCommitteeStatus());
  if (commBadge) return commBadge;
  return `<span class="role-badge role-badge-parent">${t('roleParent')}</span>`;
}

function currentUserRoleBadge() {
  if (isKid())   return `<span class="role-badge role-badge-kid">${t('roleKid')}</span>`;
  if (isAdmin()) return `<span class="role-badge role-badge-admin">${t('roleAdmin')}</span>`;
  const commBadge = _committeeBadge(parentCommitteeStatus());
  if (commBadge) return commBadge;
  return `<span class="role-badge role-badge-parent">${t('roleParent')}</span>`;
}
// Returns "firstName familyName" from a person-reference object {firstName?, familyName}
function personFullName(obj) {
  if (!obj) return '';
  const first = obj.firstName || '';
  const last  = obj.familyName || '';
  return (first && last) ? first + ' ' + last : last || first;
}
// My own full display name (current logged-in member)
const myFullName = () => (S.user && familyData?.familyName) ? S.user + ' ' + familyData.familyName : S.user || familyData?.familyName || '';

// Committee members and admin publish immediately; regular parents need approval
const canPublishDirectly = (cid) => isParent() && isCommitteeFor(cid);
const gcalReady   = () => gcal.gapiReady && gcal.gisReady && !GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID');
const gcalConnected = () => !!gcal.accessToken;

// ════════════════════════════════════════
//  AUTH SCREEN
// ════════════════════════════════════════
const JOIN_DOMAIN = 'fh.familyhub';
let _registering = false;
let _joining = false;

const EMOJI_OPTIONS = ['👩','👨','👧','👦','🧒','👶','🧑','👵','👴','🧔','🧑‍🍼','👱'];
const GRADE_OPTIONS = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','י"א','י"ב'];
let _draftMembers   = [];
let _draftSelfAdded = false;
let _mbRole   = 'parent';
let _mbEmoji  = EMOJI_OPTIONS[0];
let _mbGender = null;
let _mbDob    = '';

function _enterSu2SelfMode() {
  el('su2Title').textContent         = 'קודם כל, הפרטים שלך';
  el('su2Subtitle').style.display    = '';
  el('su2RoleRow').style.display     = 'none';
  el('mbName').placeholder           = 'השם שלך';
  el('su2AddBtn').className          = 'auth-btn-main su2-self-btn';
  el('su2AddBtn').textContent        = 'הוסף את עצמי ←';
  el('su2MoreDivider').style.display = 'none';
  el('su2CreateRow').style.display   = 'none';
  el('su2BackLink').style.display    = '';
  if (el('mbKidExtras')) el('mbKidExtras').style.display = 'none';
}

function _enterSu2MoreMode() {
  el('su2Title').textContent         = 'הוסף בני משפחה נוספים';
  el('su2Subtitle').style.display    = 'none';
  el('su2RoleRow').style.display     = '';
  el('mbName').placeholder           = 'שם';
  el('su2AddBtn').className          = 'auth-btn-add';
  el('su2AddBtn').textContent        = '+ הוסף';
  el('su2MoreDivider').style.display = '';
  el('su2CreateRow').style.display   = '';
  el('su2BackLink').style.display    = 'none';
}

function generateFamilyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createMemberCode(ownerUid, memberName) {
  const code = generateFamilyCode();
  const inviteEmail = code + '@' + JOIN_DOMAIN;
  const app2 = firebase.initializeApp(FIREBASE_CONFIG, 'inv_' + Date.now());
  try {
    const uc = await app2.auth().createUserWithEmailAndPassword(inviteEmail, code);
    // Store ownerUid|memberName in displayName so doJoin() can read it without Firestore rules
    await uc.user.updateProfile({ displayName: ownerUid + '|' + (memberName || '') });
  } finally {
    await app2.delete();
  }
  // Also write to Firestore as a fallback / audit trail
  await fbDb.collection('joinCodes').doc(code).set({ ownerUid, memberName: memberName || null });
  return code;
}
// Keep old name as alias for existing callers
const createKidCode = (ownerUid, kidName) => createMemberCode(ownerUid, kidName);

function initEmojiRow() {
  el('emojiRow').innerHTML = EMOJI_OPTIONS.map(e =>
    `<span class="emoji-opt ${e===_mbEmoji?'selected':''}" onclick="selectMbEmoji('${e}',this)">${e}</span>`
  ).join('');
}
function selectMbEmoji(emoji, target) {
  _mbEmoji = emoji;
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  target.classList.add('selected');
}
function setMbRole(role) {
  _mbRole = role;
  el('mbRoleParent').classList.toggle('active', role==='parent');
  el('mbRoleKid').classList.toggle('active',    role==='kid');
  const extras = el('mbKidExtras');
  if (extras) extras.style.display = role === 'kid' ? '' : 'none';
  if (role !== 'kid') { _mbGender = null; _mbDob = ''; }
}
function setMbGender(g) {
  _mbGender = g;
  el('mbGenderBoy') .classList.toggle('active', g === 'boy');
  el('mbGenderGirl').classList.toggle('active', g === 'girl');
}
function addDraftMember() {
  const name = el('mbName').value.trim();
  if (!name) { el('mbName').focus(); return; }
  // Phase 1 (self): always parent — role toggle is hidden
  const role  = _draftSelfAdded ? _mbRole : 'parent';
  const entry = { name, emoji: _mbEmoji, role };
  if (role === 'kid') {
    if (_mbGender) entry.gender = _mbGender;
    const dob = el('mbDob')?.value;
    if (dob) entry.dob = dob;
  }
  _draftMembers.push(entry);
  el('mbName').value = '';
  if (el('mbDob')) el('mbDob').value = '';
  _mbGender = null;
  _mbRole = 'parent';
  el('mbGenderBoy') ?.classList.remove('active');
  el('mbGenderGirl')?.classList.remove('active');
  el('mbRoleParent')?.classList.add('active');
  el('mbRoleKid')   ?.classList.remove('active');
  if (el('mbKidExtras')) el('mbKidExtras').style.display = 'none';
  renderMemberPreview();
  if (!_draftSelfAdded) {
    _draftSelfAdded = true;
    _enterSu2MoreMode();
    initEmojiRow();
    setTimeout(() => el('mbName')?.focus(), 50);
  }
}
function removeDraftMember(i) {
  _draftMembers.splice(i, 1);
  renderMemberPreview();
}
function renderMemberPreview() {
  el('memberPreview').innerHTML = _draftMembers.map((m, i) => {
    const genderLabel = m.gender === 'boy' ? ' · 👦' : m.gender === 'girl' ? ' · 👧' : '';
    const dobLabel    = m.dob ? ' · ' + m.dob.split('-').reverse().join('/') : '';
    const isSelf      = i === 0 && _draftSelfAdded;
    return `<div class="member-chip${isSelf ? ' member-chip-first' : ''}">
      <span class="member-chip-emoji">${m.emoji}</span>
      <span class="member-chip-name">${esc(m.name)}${genderLabel}${dobLabel}</span>
      ${isSelf ? '<span class="member-chip-self">אני</span>' : ''}
      <span class="member-chip-role">${m.role==='parent'?'הורה':'ילד/ה'}</span>
      ${isSelf ? '' : `<button class="member-chip-del" onclick="removeDraftMember(${i})">×</button>`}
    </div>`;
  }).join('');
}

function setAuthMode(mode) {
  el('signinPanel').style.display   = mode==='signin' ? '' : 'none';
  el('signupPanel1').style.display  = mode==='signup' ? '' : 'none';
  el('signupPanel2').style.display  = 'none';
  el('joinPanel').style.display     = mode==='join'   ? '' : 'none';
  el('authTabSignin').classList.toggle('active', mode==='signin' || mode==='signup');
  el('authTabJoin').classList.toggle('active',   mode==='join');
  // Only clear errors for panels being hidden — never wipe the active panel's error
  if (mode !== 'join') { const e=el('joinError'); if(e) e.textContent=''; }
  if (mode !== 'signin' && mode !== 'signup') {
    ['siError','su1Error','su2Error'].forEach(id => { const e=el(id); if(e) e.textContent=''; });
  }
}

function signupNext() {
  const familyName = el('suFamily').value.trim();
  const email      = el('suEmail').value.trim();
  const pwd        = el('suPwd').value;
  el('su1Error').textContent = '';
  if (!familyName) { el('su1Error').textContent = 'נדרש שם משפחה'; return; }
  if (!email)      { el('su1Error').textContent = 'נדרש אימייל';   return; }
  if (pwd.length < 6) { el('su1Error').textContent = 'הסיסמה חייבת להיות לפחות 6 תווים'; return; }
  el('signupPanel1').style.display = 'none';
  el('signupPanel2').style.display = '';
  _draftMembers   = [];
  _draftSelfAdded = false;
  _mbRole   = 'parent';
  _mbGender = null;
  renderMemberPreview();
  initEmojiRow();
  _enterSu2SelfMode();
  setTimeout(() => el('mbName')?.focus(), 50);
}
function signupBack() {
  el('signupPanel2').style.display = 'none';
  el('signupPanel1').style.display = '';
  _draftSelfAdded = false;
  _draftMembers   = [];
}

async function doSignIn() {
  if (!FB_CONFIGURED) return;
  const email = el('siEmail').value.trim();
  const pwd   = el('siPwd').value;
  el('siError').textContent = '';
  if (!email || !pwd) { el('siError').textContent = 'נדרשים אימייל וסיסמה'; return; }
  setAuthLoading(true);
  try {
    await fbAuth.signInWithEmailAndPassword(email, pwd);
  } catch(e) {
    setAuthLoading(false);
    el('siError').textContent = getAuthError(e.code);
    const isPwdErr = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-login-credentials';
    const isEmailErr = e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email';
    const pwdEl   = el('siPwd');
    const emailEl = el('siEmail');
    if (isPwdErr) {
      pwdEl.classList.add('input-error');
      pwdEl.select();
      pwdEl.addEventListener('input', () => pwdEl.classList.remove('input-error'), { once: true });
    } else if (isEmailErr) {
      emailEl.classList.add('input-error');
      emailEl.select();
      emailEl.addEventListener('input', () => emailEl.classList.remove('input-error'), { once: true });
    }
  }
}

async function doSignUp() {
  if (!FB_CONFIGURED) return;
  el('su2Error').textContent = '';
  const validMembers = _draftMembers.filter(m => m.name.trim());
  if (validMembers.length === 0) { el('su2Error').textContent = 'יש להוסיף לפחות איש משפחה אחד'; return; }
  const members = validMembers.map(m => {
    const entry = { name: m.name.trim(), emoji: m.emoji, role: m.role };
    if (m.role === 'kid') {
      if (m.gender) entry.gender = m.gender;
      if (m.dob)    entry.dob    = m.dob;
    }
    return entry;
  });
  const familyName = el('suFamily').value.trim();
  const email      = el('suEmail').value.trim();
  const pwd        = el('suPwd').value;
  setAuthLoading(true);
  _registering = true;
  try {
    // 1. Create owner account (Firebase auto-signs in as owner)
    const ownerCred = await fbAuth.createUserWithEmailAndPassword(email, pwd);
    const ownerUid  = ownerCred.user.uid;
    // 2. Generate family code + create invite account via secondary app instance
    const code = generateFamilyCode();
    const inviteEmail = code + '@' + JOIN_DOMAIN;
    const secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, 'inv_' + Date.now());
    try {
      await secondaryApp.auth().createUserWithEmailAndPassword(inviteEmail, code);
    } finally {
      await secondaryApp.delete();
    }
    // 3. Write family doc + join code lookup
    await fbDb.collection('families').doc(ownerUid).set({
      familyName, email, members, familyCode: code,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      chores: [], grocery: [], homework: [], events: [], stars: {},
      groceryPool: [], shoppingList: [], inCart: [], shoppingHistory: [],
    });
    await fbDb.collection('joinCodes').doc(code).set({ ownerUid });
    // Generate personal codes for each kid
    const updatedMembers = [...members];
    for (let i = 0; i < updatedMembers.length; i++) {
      if (updatedMembers[i].role === 'kid') {
        updatedMembers[i] = { ...updatedMembers[i], joinCode: await createKidCode(ownerUid, updatedMembers[i].name) };
      }
    }
    if (updatedMembers.some(m => m.joinCode)) {
      await fbDb.collection('families').doc(ownerUid).update({ members: updatedMembers });
    }
    _registering = false;
    // 4. Manually kick off subscription (onAuthStateChanged was suppressed)
    S.uid = ownerUid;
    el('authScreen').classList.add('hidden');
    subscribeToFamily(ownerUid);
  } catch(e) {
    _registering = false;
    setAuthLoading(false);
    el('su2Error').textContent = getAuthError(e.code);
  }
}

async function doJoin() {
  if (!FB_CONFIGURED) return;
  const code = el('joinCode').value.trim().toUpperCase();
  el('joinError').textContent = '';
  if (code.length < 4) { el('joinError').textContent = 'הזן קוד הצטרפות תקין'; return; }
  setAuthLoading(true);
  _joining = true;

  // Sign out the invite account (if any) while keeping _joining=true so onAuthStateChanged
  // is suppressed throughout — prevents the race where Firebase re-emits auth state and
  // triggers subscribeToFamily with the invite UID before we've stored the ownerUid mapping.
  const _failJoin = async (msg) => {
    _joining = true;
    await fbAuth.signOut().catch(() => {});
    // Keep _joining=true while we paint the error, so any deferred onAuthStateChanged(null)
    // callback (which calls setAuthMode → clears joinError) is suppressed.
    setAuthLoading(false);
    el('authScreen').classList.remove('hidden');
    setAuthMode('join');
    el('joinCode').value = code;
    el('joinError').textContent = msg;
    // Release the flag after one macrotask — all deferred Firebase callbacks will have fired
    setTimeout(() => { _joining = false; }, 300);
  };

  try {
    // Clear any stale Firebase Auth session before signing in with the invite code
    if (fbAuth.currentUser) { _joining = true; await fbAuth.signOut().catch(() => {}); }
    _joining = true;
    el('joinError').textContent = '⏳ מתחבר...';
    const inviteEmail = code + '@' + JOIN_DOMAIN;
    const signInPromise = fbAuth.signInWithEmailAndPassword(inviteEmail, code);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'auth/timeout' })), 15000)
    );
    const cred = await Promise.race([signInPromise, timeoutPromise]);

    el('joinError').textContent = '⏳ בודק קוד...';
    let ownerUid = null, memberName = null;

    // Primary: read ownerUid|memberName from Firebase Auth displayName (no Firestore rules needed)
    const profile = cred.user.displayName || '';
    if (profile.includes('|')) {
      const pipeIdx = profile.indexOf('|');
      ownerUid   = profile.slice(0, pipeIdx) || null;
      memberName = profile.slice(pipeIdx + 1) || null;
    }
    // Fallback: Firestore joinCodes (for codes created before the displayName fix)
    if (!ownerUid) {
      try {
        const snap = await fbDb.collection('joinCodes').doc(code).get();
        if (snap.exists) {
          ownerUid   = snap.data().ownerUid || null;
          memberName = snap.data().memberName || null;
        }
      } catch (_) {}
    }

    if (!ownerUid) {
      await _failJoin('קוד לא נמצא או פג תוקפו. בקש קוד חדש ממי שהזמין אותך.');
      return;
    }

    localStorage.setItem('familyhub_family_uid_' + cred.user.uid, ownerUid);
    if (memberName) localStorage.setItem('familyhub_locked_member_' + cred.user.uid, memberName);
    S.uid = ownerUid;
    S.lockedMember = memberName || null;
    _joining = false;
    setAuthLoading(false);
    el('joinError').textContent = '';
    el('authScreen').classList.add('hidden');
    el('loadingScreen').classList.remove('hidden');
    el('loadingScreen').querySelector('.loading-txt').textContent = '⏳ טוען נתוני משפחה...';
    const loadTimeout = setTimeout(() => {
      el('loadingScreen').classList.add('hidden');
      el('authScreen').classList.remove('hidden');
      el('joinError').textContent = 'הגישה לנתוני המשפחה נכשלה. ייתכן בעיית הרשאות ב-Firestore.';
    }, 15000);
    subscribeToFamily(ownerUid);
    fbDb.collection('families').doc(ownerUid).get()
      .then(() => clearTimeout(loadTimeout))
      .catch(() => clearTimeout(loadTimeout));
  } catch(e) {
    const msgs = {
      'auth/user-not-found':     'קוד לא קיים — בקש קוד חדש.',
      'auth/wrong-password':     'קוד שגוי — בדוק שהעתקת נכון.',
      'auth/invalid-credential': 'קוד לא קיים — בקש קוד חדש.',
      'auth/too-many-requests':  'יותר מדי ניסיונות — נסה שוב עוד כמה דקות.',
      'auth/network-request-failed': 'בעיית רשת — בדוק חיבור לאינטרנט.',
      'auth/timeout':            'פסק זמן — בדוק חיבור לאינטרנט ונסה שוב.',
    };
    await _failJoin(msgs[e.code] || 'שגיאה [' + (e.code || e.message) + ']');
  }
}

function setAuthLoading(on) {
  el('authLoadingOverlay').style.display = on ? '' : 'none';
  ['signinPanel','signupPanel1','signupPanel2','joinPanel'].forEach(id => {
    const e = el(id); if (e) e.style.pointerEvents = on ? 'none' : '';
  });
  // Hide secondary action links while a request is in flight
  document.querySelectorAll('#signinPanel .auth-link-btn').forEach(b => b.style.visibility = on ? 'hidden' : '');
}

function getAuthError(code) {
  const m = {
    'auth/user-not-found':             'לא נמצא חשבון עם כתובת אימייל זו — בדוק שהכתבת נכון',
    'auth/wrong-password':             'סיסמה שגויה — בדוק אותיות גדולות/קטנות ונסה שוב',
    'auth/invalid-credential':         'אימייל או סיסמה שגויים — בדוק ונסה שוב',
    'auth/invalid-login-credentials':  'אימייל או סיסמה שגויים — בדוק ונסה שוב',
    'auth/email-already-in-use':   'כתובת האימייל כבר רשומה במערכת',
    'auth/invalid-email':          'כתובת אימייל לא תקינה',
    'auth/weak-password':          'הסיסמה קצרה מדי — נדרשים לפחות 6 תווים',
    'auth/network-request-failed': 'בעיית חיבור לרשת — בדוק את האינטרנט ונסה שוב',
    'auth/too-many-requests':      'יותר מדי ניסיונות כושלים — נסה שוב עוד כמה דקות',
    'permission-denied':           'אין הרשאה לכתוב למסד הנתונים — יש לעדכן את חוקי האבטחה ב-Firebase Console',
  };
  return m[code] || 'שגיאה: ' + code;
}

let _sessionRef      = null;
let _sessionStartMs  = null;

function _applyAdminUI() {
  const btn = el('pendingReqBtn');
  if (btn) btn.style.display = 'none'; // moved to community tab badge + in-tab banner
  if (isCommittee() && !isKid()) _fetchPendingBadge();
}

// ── Toast (temporary on-screen info, no bell) ────────────────
function showToast(msg, type = 'info', duration = 4000) {
  let wrap = el('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.style.cssText = 'position:fixed;bottom:calc(var(--tab-bar-h,68px) + env(safe-area-inset-bottom,0px) + 12px);right:50%;transform:translateX(50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:90%;max-width:360px';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  const bg = type === 'error' ? '#c53030' : type === 'success' ? '#4CAF84' : '#4a65cc';
  t.style.cssText = `background:${bg};color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,.18);opacity:0;transition:opacity .25s;text-align:center;pointer-events:none`;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 280);
  }, duration);
}

// ── Notification system (banners + message center) ───────────
let _allNotifs    = []; // cached for message center
let _pendingCount = 0; // pending requests count for committee tab badge

function initNotifBanners() {
  if (_notifUnsubscribe) { _notifUnsubscribe(); _notifUnsubscribe = null; }
  if (!S.uid || !fbDb) return;
  _notifUnsubscribe = fbDb
    .collection('families').doc(S.uid)
    .collection('notifications')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      _allNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Request-type notifs only show if explicitly addressed to this user (recipientUid match)
      const _visibleNotif = n => !n.dismissed
        && (n.type !== 'admin_message' || isAdmin())
        && (n.type !== 'admin_reply'   || n.recipientUid === S.uid)
        && (!['school_pending','event_pending','application_pending'].includes(n.type) ||
            (n.recipientUid === S.uid && n.requestedByUid !== S.uid))
        && (n.type !== 'shopping_done' || !isKid());
      renderNotifBanners(_allNotifs.filter(_visibleNotif).reverse());
      if (isAdmin()) _patchMissingReqIds(_allNotifs);
      _updateBellBadge();
      if (!el('messageCenterPanel')?.classList.contains('hidden')) renderMessageCenter();
      if (isCommittee()) _fetchPendingBadge();
      if (!el('messageCenterPanel')?.classList.contains('hidden')) renderMessageCenter();
    }, err => console.error('[notif] onSnapshot error:', err.code, err.message));
}

async function _patchMissingReqIds(notifs) {
  const needsPatch = notifs.filter(n => n.type === 'school_pending' && !n.reqId && !n.dismissed);
  if (!needsPatch.length) return;
  try {
    const snap = await fbDb.collection('pendingSchools').where('status', '==', 'pending').get();
    for (const n of needsPatch) {
      const match = snap.docs.find(d => {
        const req = d.data();
        const label = req.type === 'city'
          ? `עיר חדשה: ${req.city}`
          : `בית ספר חדש: ${req.schoolName} (${req.city})`;
        return n.message.startsWith(label);
      });
      if (match) {
        fbDb.collection('families').doc(S.uid)
          .collection('notifications').doc(n.id)
          .update({ reqId: match.id }).catch(() => {});
      }
    }
  } catch(e) { console.warn('_patchMissingReqIds:', e); }
}

function stopNotifBanners() {
  if (_notifUnsubscribe) { _notifUnsubscribe(); _notifUnsubscribe = null; }
  _allNotifs = [];
  const c = el('notifBanners'); if (c) c.innerHTML = '';
  _updateBellBadge();
}

function _updateBellBadge() {
  const badge = el('notifBellBadge');
  if (!badge) return;
  const count = _allNotifs.filter(n => !n.dismissed &&
    !['school_pending','event_pending','application_pending'].includes(n.type) &&
    (n.type !== 'shopping_done' || !isKid())
  ).length;
  badge.textContent = count > 9 ? '9+' : count;
  badge.classList.toggle('hidden', count === 0);
}

function renderNotifBanners(undismissed) {
  const container = el('notifBanners');
  if (!container) return;
  // Only add banners that aren't already in the DOM (avoid re-animating existing ones)
  const existing = new Set([...container.querySelectorAll('.notif-banner')].map(el => el.id));
  // Remove banners for dismissed notifs
  container.querySelectorAll('.notif-banner').forEach(el => {
    const id = el.id.replace('notifBanner_','');
    if (!undismissed.find(n => n.id === id)) {
      el.classList.replace('notif-banner-in','notif-banner-out');
      setTimeout(() => el.remove(), 300);
    }
  });
  // Add new ones
  undismissed.forEach(n => {
    if (existing.has('notifBanner_' + n.id)) return;
    const REQUEST_TYPES = ['school_pending','event_pending','application_pending'];
    const isRequest  = REQUEST_TYPES.includes(n.type);
    const isAdminMsg   = n.type === 'admin_message';
    const isAdminReply = n.type === 'admin_reply';
    const isInfo     = n.type === 'shopping_done';
    const isGood     = n.type?.includes('approved') || n.type === 'member_joined' || n.type === 'class_member_joined';
    const isDenied   = n.type?.includes('denied') || n.type?.includes('rejected');
    const bg     = isDenied ? '#fff5f5' : isAdminMsg ? '#faf5ff' : isAdminReply ? '#f0fff4' : '#ebf8ff';
    const border = isDenied ? '#feb2b2' : isAdminMsg ? '#d6bcfa' : isAdminReply ? '#9ae6b4' : '#90cdf4';
    const color  = isDenied ? '#c53030' : isAdminMsg ? '#6b21a8' : isAdminReply ? '#276749' : '#2b6cb0';
    const icon   = isInfo ? '🛒' : isGood ? '✅' : isDenied ? '❌' : isRequest ? '📋' : (isAdminMsg || isAdminReply) ? '💬' : '🔔';
    const div = document.createElement('div');
    div.className = 'notif-banner notif-banner-in';
    div.id = 'notifBanner_' + n.id;
    div.style.cssText = `background:${bg};border-color:${border};color:${color}`;
    let requestActions = '';
    if (isRequest && isAdmin()) {
      if (!n.reqId) {
        requestActions = `<div class="notif-banner-actions"><button class="notif-banner-act approve" onclick="closeMenu();openPendingPanel()" title="פתח בקשות">📋</button></div>`;
      } else {
        let evExpired = false;
        if (n.type === 'event_pending') {
          const [cid, pendingId] = n.reqId.split('|');
          const cachedEv = _commCache[cid]?.pendingEvents?.find(e => e.id === pendingId);
          evExpired = !!(cachedEv && !isEventUpcoming(cachedEv.date));
        }
        requestActions = evExpired
          ? `<div class="notif-banner-actions"><span style="font-size:11px;color:var(--gray-400);font-weight:600">פג תוקף</span></div>`
          : `<div class="notif-banner-actions">
               <button class="notif-banner-act approve" onclick="quickApproveReq('${n.id}','${n.type}','${n.reqId}',this)" title="אישור">✓</button>
               <button class="notif-banner-act deny"    onclick="quickDenyReq('${n.id}','${n.type}','${n.reqId}',this)"    title="דחייה">✗</button>
             </div>`;
      }
    }
    const adminMsgAction = isAdminMsg
      ? `<div class="notif-banner-actions"><button class="notif-banner-act approve" onclick="_openAdminMsgFromNotif('${n.id}',this)" title="פתח">פתח</button></div>`
      : '';
    div.innerHTML = `<span class="notif-banner-icon">${icon}</span>
      <span class="notif-banner-text">${esc(n.message)}</span>
      ${requestActions}${adminMsgAction}
      ${isRequest ? '' : `<button class="notif-banner-dismiss" onclick="dismissNotifBanner('${n.id}',this)" title="סגור">×</button>`}`;
    container.appendChild(div);
  });
}

async function dismissNotifBanner(id, btn) {
  btn?.closest('.notif-banner')?.classList.replace('notif-banner-in', 'notif-banner-out');
  try {
    await fbDb.collection('families').doc(S.uid)
      .collection('notifications').doc(id)
      .update({ dismissed: true, dismissedAt: firebase.firestore.FieldValue.serverTimestamp() });
  } catch(e) { console.warn('dismissNotifBanner:', e); }
}

async function _dismissNotifById(id) {
  await fbDb.collection('families').doc(S.uid)
    .collection('notifications').doc(id)
    .update({ dismissed: true, dismissedAt: firebase.firestore.FieldValue.serverTimestamp() })
    .catch(() => {});
}

async function quickApproveReq(notifId, type, reqId, btn) {
  btn.closest('.notif-banner-actions').querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    if (type === 'school_pending') {
      const docSnap = await fbDb.collection('pendingSchools').doc(reqId).get();
      if (!docSnap.exists) return;
      const req = docSnap.data();
      if (req.type === 'city') {
        const cityStatus = req.cityStatus || 'pending';
        if (cityStatus === 'pending') {
          btn.closest('.notif-banner-actions').querySelectorAll('button').forEach(b => b.disabled = false);
          showToast('יש לאשר את העיר תחילה — פתח את לוח הבקשות', 'error');
          return;
        }
        // City already approved — approve the school part
        await fbFunctions.httpsCallable('resolveSchoolPart')({ id: reqId, part: 'school', action: 'approved', adminName: myFullName() });
      } else {
        await updateSchoolIndex(req.city, req.schoolName);
        await fbFunctions.httpsCallable('approveSchoolRequest')({ id: reqId, adminName: myFullName() });
      }
    } else if (type === 'event_pending') {
      const parts = reqId.split('|');
      await fbFunctions.httpsCallable('approveEvent')({ cid: parts[0], pendingId: parts[1] });
    } else if (type === 'application_pending') {
      const parts = reqId.split('|');
      await fbFunctions.httpsCallable('adminApproveApplication')({ applicationId: parts[0], classId: parts[1] });
    }
    await _dismissNotifById(notifId);
  } catch(e) { console.error('quickApproveReq:', e); showToast('שגיאה: ' + e.message, 'error'); }
}

async function quickDenyReq(notifId, type, reqId, btn) {
  if (type === 'event_pending') {
    const [cid, pendingId] = reqId.split('|');
    const cachedEv = _commCache[cid]?.pendingEvents?.find(e => e.id === pendingId);
    if (cachedEv && !isEventUpcoming(cachedEv.date)) return; // expired — silently ignore
  }
  if (!await _confirm('לדחות את הבקשה?', { danger: true, okLabel: 'דחה' })) return;
  btn.closest('.notif-banner-actions').querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    if (type === 'school_pending') {
      await fbFunctions.httpsCallable('denySchoolRequest')({ id: reqId, adminName: myFullName() });
    } else if (type === 'event_pending') {
      const parts = reqId.split('|');
      await fbFunctions.httpsCallable('rejectEvent')({ cid: parts[0], pendingId: parts[1] });
    } else if (type === 'application_pending') {
      const parts = reqId.split('|');
      await fbFunctions.httpsCallable('adminDenyApplication')({ applicationId: parts[0], classId: parts[1] });
    }
    await _dismissNotifById(notifId);
  } catch(e) { console.error('quickDenyReq:', e); showToast('שגיאה: ' + e.message, 'error'); }
}

function _openAdminMsgFromNotif(id, btn) {
  dismissNotifBanner(id, btn?.closest('.notif-banner'));
  openMessageCenter('feedback');
}

// ── Message center ────────────────────────────────────────────
let _mcTab = 'notifs';

function openMessageCenter(tab) {
  const panel = el('messageCenterPanel');
  panel.classList.remove('hidden');
  panel.classList.add('mc-open');
  // Show tab bar only for admin (not kids in admin family)
  const isRealAdmin = isAdmin() && !isKid();
  const tabBar = el('mcTabBar');
  if (tabBar) tabBar.style.display = isRealAdmin ? '' : 'none';
  // Dot on פניות tab if there are unread admin_message notifications
  const dot = el('mcFeedbackUnreadDot');
  if (dot) dot.style.display = isRealAdmin && _allNotifs.some(n => n.type === 'admin_message' && !n.dismissed) ? '' : 'none';
  switchMcTab(tab || _mcTab);
}
function closeMessageCenter() {
  const panel = el('messageCenterPanel');
  panel.classList.add('mc-closing');
  setTimeout(() => { panel.classList.add('hidden'); panel.classList.remove('mc-open','mc-closing'); }, 280);
}
function switchMcTab(tab) {
  _mcTab = tab;
  el('mcTabNotifs')  ?.classList.toggle('mc-tab-active', tab === 'notifs');
  el('mcTabFeedback')?.classList.toggle('mc-tab-active', tab === 'feedback');
  const isNotifs = tab === 'notifs';
  el('messageCenterList').style.display = isNotifs ? '' : 'none';
  el('mcFeedbackList').style.display    = isNotifs ? 'none' : '';
  el('mcSelectAllRow').style.display    = isNotifs ? '' : 'none';
  // Header controls: count + delete-all only shown for notifs tab
  el('mcDeleteAllBtn').style.display    = 'none';
  el('mcCount').textContent             = '';
  if (isNotifs) renderMessageCenter();
  else          renderMcFeedbacks();
}

// ── Pending Requests Panel (admin only) ──────────────────────
function openPendingPanel() {
  const panel = el('pendingPanel');
  panel.classList.remove('hidden');
  panel.classList.add('mc-open');
  renderPendingPanel();
}
function closePendingPanel() {
  const panel = el('pendingPanel');
  panel.classList.add('mc-closing');
  setTimeout(() => { panel.classList.add('hidden'); panel.classList.remove('mc-open','mc-closing'); }, 280);
}
async function renderPendingPanel() {
  const admin = isAdmin();
  // Show/hide admin-only sections
  const adminSec = el('ppAdminSections');
  if (adminSec) adminSec.style.display = admin ? '' : 'none';

  const loading = '<div style="color:#a0aec0;font-size:13px;padding:8px 0">טוען...</div>';
  el('ppEventsList').innerHTML = loading;
  if (admin) {
    el('ppAppsList').innerHTML    = loading;
    el('ppSchoolsList').innerHTML = loading;
  }
  try {
    const fetches = [fbDb.collectionGroup('pendingEvents').get()];
    if (admin) {
      fetches.push(
        fbDb.collection('committeeApplications').where('status','==','pending').get(),
        fbDb.collection('pendingSchools').where('status','==','pending').get(),
      );
    }
    const [pendingSnap, appsSnap, schoolsSnap] = await Promise.all(fetches);

    // Events — admin sees all, committee parent sees only their classes
    const committeeClasses = familyData?.committeeClasses || [];
    const allPending = pendingSnap.docs.map(d => ({ id: d.id, classId: d.ref.parent.parent.id, ...d.data() }));
    const pending = admin ? allPending : allPending.filter(ev => isCommitteeFor(ev.classId));
    const activePending  = pending.filter(ev => !ev.date || isEventUpcoming(ev.date));
    const expiredPending = pending.filter(ev => ev.date && !isEventUpcoming(ev.date));

    const pendingRowHtml = ev => `<div class="pending-event-row">
      <div class="pending-event-info">
        <span class="pending-event-title">${esc(ev.title)}</span>
        <span class="pending-event-meta">${esc(personFullName(ev.postedBy))}${ev.date ? ' · ' + fmtEventDate(ev.date) : ''} · ${esc(classLabelFromId(ev.classId))}</span>
      </div>
      <div class="pending-event-actions">
        <button class="pending-approve-btn" onclick="approveEvent('${ev.classId}','${ev.id}')">${t('pendingApprove')}</button>
        <button class="pending-reject-btn"  onclick="rejectEvent('${ev.classId}','${ev.id}')">${t('pendingReject')}</button>
      </div>
    </div>`;

    el('ppEventsList').innerHTML = activePending.length
      ? activePending.map(pendingRowHtml).join('')
      : '<div style="font-size:13px;color:#a0aec0;padding:6px 0">אין בקשות ממתינות</div>';

    // Committee applications
    const appsList = appsSnap.docs.map(d=>({id:d.id,...d.data()}));
    el('ppAppsList').innerHTML = appsList.length
      ? appsList.map(app => {
          const pct = Math.min(100,Math.round((app.voteCount||0)/15*100));
          return `<div class="application-row">
            <div class="application-info">
              <div class="application-name">👤 ${esc(app.applicantName||'')}</div>
              <div class="application-meta">${app.voteCount||0}/15 תמיכות · ${esc(classLabelFromId(app.classId||''))}</div>
              <div class="application-progress"><div class="application-progress-fill" style="width:${pct}%"></div></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
              <button class="pending-approve-btn" onclick="adminApproveApplication('${app.id}','${app.classId||''}')">${t('commApplicationApprove')}</button>
              <button class="pending-reject-btn"  onclick="adminDenyApplication('${app.id}','${app.classId||''}')">${t('commApplicationDeny')}</button>
            </div>
          </div>`;
        }).join('')
      : '<div style="font-size:13px;color:#a0aec0;padding:6px 0">אין מועמדויות ממתינות</div>';

    // Schools
    const schoolsList = schoolsSnap.docs.map(d=>({id:d.id,...d.data()}));
    el('ppSchoolsList').innerHTML = schoolsList.length
      ? schoolsList.map(req => {
          const reqBy = personFullName(req.requestedBy);
          const count = (req.pendingFamilies||[]).length;
          const meta  = `${reqBy ? 'הוגש על ידי: ' + esc(reqBy) + ' · ' : ''}${count} משפחה/ות ממתינות`;
          if (req.type === 'city') {
            const cityStatus   = req.cityStatus   || 'pending';
            const schoolStatus = req.schoolStatus || 'pending';
            const statusBadge = s => s === 'approved'
              ? '<span style="color:#276749;font-size:11px;font-weight:700">✅ אושר</span>'
              : s === 'denied'
              ? '<span style="color:#c53030;font-size:11px;font-weight:700">❌ נדחה</span>'
              : '';
            return `<div class="pending-event-row" style="flex-direction:column;align-items:stretch;gap:8px">
              <div style="font-size:12px;color:#718096;font-weight:700">${meta}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="pending-event-title" style="flex:1">🏙️ עיר: ${esc(req.city)}</span>
                ${statusBadge(cityStatus)}
                ${cityStatus==='pending' ? `<button class="pending-approve-btn" onclick="approveSchoolPart('${req.id}','city')">אשר עיר</button>
                <button class="pending-reject-btn" onclick="denySchoolPart('${req.id}','city')">דחה עיר</button>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="pending-event-title" style="flex:1">🏫 בית ספר: ${esc(req.schoolName)}</span>
                ${statusBadge(schoolStatus)}
                ${schoolStatus==='pending' && cityStatus==='approved' ? `<button class="pending-approve-btn" onclick="approveSchoolPart('${req.id}','school')">אשר ב"ס</button>
                <button class="pending-reject-btn" onclick="denySchoolPart('${req.id}','school')">דחה ב"ס</button>` : ''}
                ${schoolStatus==='pending' && cityStatus==='pending' ? `<button class="pending-approve-btn" disabled title="יש לאשר את העיר תחילה" style="opacity:0.4;cursor:not-allowed">אשר ב"ס</button>` : ''}
                ${schoolStatus==='pending' && cityStatus==='denied'  ? `<button class="pending-reject-btn" onclick="denySchoolPart('${req.id}','school')">דחה ב"ס</button>` : ''}
              </div>
            </div>`;
          }
          return `<div class="pending-event-row">
            <div class="pending-event-info">
              <span class="pending-event-title">🏫 ${esc(req.schoolName)} (${esc(req.city)})</span>
              <span class="pending-event-meta">${meta}</span>
            </div>
            <div class="pending-event-actions">
              <button class="pending-approve-btn" onclick="approveSchool('${req.id}')">${t('pendingApprove')}</button>
              <button class="pending-reject-btn"  onclick="denySchool('${req.id}')">${t('pendingReject')}</button>
            </div>
          </div>`;
        }).join('')
      : '<div style="font-size:13px;color:#a0aec0;padding:6px 0">אין בקשות ממתינות</div>';

    // Update badge
    const adminCount = admin ? ((appsSnap?.docs.length || 0) + (schoolsSnap?.docs.length || 0)) : 0;
    const total = activePending.length + adminCount;
    const badge = el('pendingReqBadge');
    if (badge) { badge.textContent = total || ''; badge.classList.toggle('hidden', !total); }
  } catch(e) { console.error('renderPendingPanel:', e); }
}
async function _fetchPendingBadge() {
  if (!isCommittee() || !fbDb) return;
  try {
    const admin = isAdmin();
    const fetches = [fbDb.collectionGroup('pendingEvents').get()];
    if (admin) {
      fetches.push(
        fbDb.collection('committeeApplications').where('status','==','pending').get(),
        fbDb.collection('pendingSchools').where('status','==','pending').get(),
      );
    }
    const [evSnap, appsSnap, schoolsSnap] = await Promise.all(fetches);
    const activeDocs = evSnap.docs.filter(d => {
      const data = d.data();
      return !data.date || isEventUpcoming(data.date);
    });
    const evCount = admin
      ? activeDocs.length
      : activeDocs.filter(d => isCommitteeFor(d.ref.parent.parent.id)).length;
    const total = evCount + (appsSnap?.size || 0) + (schoolsSnap?.size || 0);
    _pendingCount = total;
    const badge = el('pendingReqBadge');
    if (badge) { badge.textContent = total || ''; badge.classList.toggle('hidden', !total); }
    _updateCommTabBadge();
    // Update community banner if tab is open
    const banner = el('commPendingBanner');
    if (banner) _renderCommPendingBanner(banner);
  } catch(e) {}
}

function _updateCommTabBadge() {
  const btn = document.querySelector('.tab[data-tab="community"]');
  if (!btn) return;
  let dot = btn.querySelector('.tab-comm-badge');
  if (_pendingCount > 0 && isCommittee() && !isKid()) {
    if (!dot) { dot = document.createElement('span'); dot.className = 'tab-comm-badge'; btn.appendChild(dot); }
    dot.textContent = _pendingCount;
  } else if (dot) {
    dot.remove();
  }
}

function _renderCommPendingBanner(el) {
  if (!isCommittee() || isKid()) { el.innerHTML = ''; return; }
  if (_pendingCount > 0) {
    el.innerHTML = `<div class="comm-pending-banner" onclick="openPendingPanel()">
      <span class="comm-pending-icon">📋</span>
      <span class="comm-pending-text">יש <strong>${_pendingCount}</strong> בקשות ממתינות לאישור</span>
      <span class="comm-pending-arrow">←</span>
    </div>`;
  } else {
    el.innerHTML = `<div style="text-align:end;margin-bottom:4px"><button class="comm-history-link" onclick="openAdminPanel(true,true)">📋 היסטוריית בקשות</button></div>`;
  }
}

function renderMessageCenter() {
  const list = el('messageCenterList');
  if (!list) return;
  const notifs = _allNotifs.filter(n =>
    !['school_pending','event_pending','application_pending','admin_message'].includes(n.type) &&
    (n.type !== 'shopping_done' || !isKid()) &&
    (n.type !== 'admin_reply'   || n.recipientUid === S.uid)
  );
  el('mcCount').textContent = notifs.length ? `${notifs.length} הודעות` : '';
  el('mcDeleteAllBtn').style.display = notifs.length ? '' : 'none';
  const toolbar = el('mcSelectAllRow');
  if (toolbar) toolbar.style.display = notifs.length ? '' : 'none';
  if (!notifs.length) {
    list.innerHTML = '<div style="text-align:center;color:#a0aec0;font-size:13px;font-weight:700;padding:40px 0">אין הודעות</div>';
    return;
  }
  list.innerHTML = notifs.map(n => {
    const isGood = n.type?.includes('approved') || n.type === 'member_joined';
    const isDenied = n.type?.includes('denied') || n.type?.includes('rejected');
    const icon   = n.type === 'shopping_done' ? '🛒' : n.type === 'member_joined' ? '👋' : n.type === 'admin_reply' ? '↩️' : isGood ? '✅' : isDenied ? '❌' : '🔔';
    const dt     = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString('he-IL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';
    const dimmed = n.dismissed ? 'opacity:0.55;' : '';
    return `<div class="mc-item" id="mcItem_${n.id}" style="${dimmed}">
      <input type="checkbox" class="mc-checkbox" id="mcChk_${n.id}" onchange="mcOnCheck()">
      <span class="mc-item-icon">${icon}</span>
      <div class="mc-item-body">
        <div class="mc-item-msg">${esc(n.message)}</div>
        <div class="mc-item-date">${dt}</div>
      </div>
    </div>`;
  }).join('');
}

async function renderMcFeedbacks() {
  const wrap = el('mcFeedbackList');
  if (!wrap) return;
  wrap.innerHTML = '<div style="text-align:center;padding:32px 0"><div class="fh-spinner" style="margin:0 auto"></div></div>';
  try {
    const result = await fbFunctions.httpsCallable('getAdminMessages')();
    const msgs = result.data || [];
    // Update unread dot
    const unreadCount = msgs.filter(m => m.read === false).length;
    const dot = el('mcFeedbackUnreadDot');
    if (dot) dot.style.display = unreadCount ? '' : 'none';
    if (!msgs.length) {
      wrap.innerHTML = '<div style="text-align:center;color:var(--gray-400);font-size:13px;font-weight:700;padding:40px 0">אין פניות עדיין</div>';
      return;
    }
    wrap.innerHTML = msgs.map((m, i) => {
      const ts = m.createdAt ? new Date(m.createdAt) : null;
      const dateStr = ts ? ts.toLocaleDateString('he-IL') + ' ' + ts.toLocaleTimeString('he-IL', { hour:'2-digit', minute:'2-digit' }) : '';
      const unread = m.read === false;
      return `<div id="adminMsg_${m.id}" style="padding:14px 0${i < msgs.length-1 ? ';border-bottom:1px solid var(--gray-100)' : ''}${unread ? ';background:var(--primary-50,#eff6ff);margin:0 -16px;padding-inline:16px' : ''}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          ${unread ? `<span class="adminmsg-dot" style="width:8px;height:8px;border-radius:50%;background:var(--primary-500);flex-shrink:0;display:inline-block"></span>` : ''}
          <span style="font-size:13px;font-weight:900;color:var(--gray-900);flex:1">${esc(m.topicLabel || m.topic || '—')}</span>
          <span style="font-size:11px;color:var(--gray-400)">${dateStr}</span>
          ${unread ? `<button onclick="markAdminMsgRead('${m.id}',this)" style="font-size:11px;border:none;background:none;color:var(--primary-500);cursor:pointer;font-family:inherit;font-weight:700;padding:0;min-width:70px;text-align:end">סמן כנקרא</button>` : ''}
        </div>
        <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">${esc(m.senderName || '')}${m.familyName ? ' · ' + esc(m.familyName) : ''}</div>
        <div style="font-size:13px;color:var(--gray-700);white-space:pre-wrap;margin-bottom:8px">${esc(m.text || '')}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <button onclick="createChoreFromFeedback(${JSON.stringify(m.text||'').replace(/"/g,'&quot;')})" style="font-size:11px;border:none;background:var(--gray-100);color:var(--gray-600);cursor:pointer;font-family:inherit;font-weight:700;padding:4px 10px;border-radius:var(--r-pill)">🧹 צור משימה</button>
          ${m.replied
            ? `<span style="font-size:11px;color:#276749;font-weight:700">✅ נענה · ${esc(m.replyText||'')}</span>`
            : `<button id="adminReplyBtn_${m.id}" onclick="openReplyToFeedback('${m.id}')" style="font-size:11px;border:none;background:var(--primary-50,#eff6ff);color:var(--primary-600);cursor:pointer;font-family:inherit;font-weight:700;padding:4px 10px;border-radius:var(--r-pill)">💬 השב</button>`
          }
        </div>
        <div id="adminReplyForm_${m.id}" style="display:none;margin-top:8px">
          <textarea id="adminReplyText_${m.id}" rows="2" placeholder="כתוב תגובה לפונה..." style="width:100%;box-sizing:border-box;font-family:inherit;font-size:13px;border:1px solid var(--gray-200);border-radius:8px;padding:8px;resize:vertical"></textarea>
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-top:4px">
            <div id="adminReplyErr_${m.id}" style="display:none;font-size:12px;color:var(--error);flex:1"></div>
            <button onclick="sendReplyToFeedback('${m.id}',this)" style="font-size:12px;border:none;background:var(--primary-500);color:white;cursor:pointer;font-family:inherit;font-weight:700;padding:5px 14px;border-radius:var(--r-pill)">שלח</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    wrap.innerHTML = `<div style="font-size:12px;color:var(--error);padding:8px 0">שגיאה: ${esc(e.message)}</div>`;
  }
}

function mcOnCheck() {
  const any = !!el('messageCenterList')?.querySelector('.mc-checkbox:checked');
  el('mcDeleteSelectedBtn').style.display = any ? '' : 'none';
  const all = [...(el('messageCenterList')?.querySelectorAll('.mc-checkbox') || [])];
  el('mcSelectAll').checked = all.length > 0 && all.every(c => c.checked);
}
function mcToggleSelectAll(cb) {
  el('messageCenterList')?.querySelectorAll('.mc-checkbox').forEach(c => c.checked = cb.checked);
  el('mcDeleteSelectedBtn').style.display = cb.checked ? '' : 'none';
}
async function deleteSelectedNotifs() {
  const checked = [...(el('messageCenterList')?.querySelectorAll('.mc-checkbox:checked') || [])];
  const ids = checked.map(c => c.id.replace('mcChk_',''));
  await Promise.all(ids.map(id =>
    fbDb.collection('families').doc(S.uid).collection('notifications').doc(id).delete().catch(()=>{})
  ));
  el('mcSelectAll').checked = false;
  el('mcDeleteSelectedBtn').style.display = 'none';
}
async function deleteAllNotifs() {
  const REQUEST_TYPES = ['school_pending','event_pending','application_pending'];
  await Promise.all(_allNotifs
    .filter(n => !REQUEST_TYPES.includes(n.type))
    .map(n => fbDb.collection('families').doc(S.uid).collection('notifications').doc(n.id).delete().catch(()=>{}))
  );
}

async function stopPresence() {
  if (_presenceInterval) { clearInterval(_presenceInterval); _presenceInterval = null; }
  // Close open session
  if (_sessionRef && _sessionStartMs && fbDb) {
    const durationMs = Date.now() - _sessionStartMs;
    _sessionRef.update({
      endTime:    firebase.firestore.FieldValue.serverTimestamp(),
      durationMs,
    }).catch(() => {});
    _sessionRef = null; _sessionStartMs = null;
  }
  if (S.uid && S.user && fbFunctions) {
    return fbFunctions.httpsCallable('updatePresence')({
      familyUid: S.uid, memberName: S.user,
      familyName: familyData?.familyName || '',
      role: isParent() ? 'parent' : 'kid',
      online: false,
    }).catch(e => {
      // Suppress known Firebase Messaging SW registration error (harmless — FCM still works via explicit registration)
      if (e.code?.startsWith('messaging/') || e.message?.includes('service-worker')) return;
      console.warn('[presence] stopPresence failed:', e.message);
    });
  }
  return Promise.resolve();
}

async function initPresence() {
  await stopPresence();
  if (!S.uid || !S.user || !fbDb) return;
  const write = () => {
    if (!fbFunctions) return;
    try {
      fbFunctions.httpsCallable('updatePresence')({
        familyUid:  S.uid,
        memberName: S.user,
        familyName: familyData?.familyName || '',
        role:       isParent() ? 'parent' : 'kid',
        online:     true,
      }).catch(e => console.warn('[presence] write FAILED:', e.message, e.code));
    } catch(e) { console.error('[presence] sync error:', e.message); }
  };
  write();
  _presenceInterval = setInterval(write, 2 * 60 * 1000);
  // Force heartbeat when tab becomes visible again (handles browser throttling)
  const onVisible = () => { if (document.visibilityState === 'visible') write(); };
  document.removeEventListener('visibilitychange', onVisible);
  document.addEventListener('visibilitychange', onVisible);
  // Start session
  _sessionStartMs = Date.now();
  _sessionRef = fbDb.collection('sessions').doc();
  _sessionRef.set({
    familyUid:  S.uid,
    memberName: S.user,
    familyName: familyData?.familyName || '',
    role:       isParent() ? 'parent' : 'kid',
    startTime:  firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(e => { console.warn('[session] write failed:', e.code, e.message); _sessionRef = null; _sessionStartMs = null; });
}

async function authSignOut() {
  stopNotifBanners();
  await stopPresence();
  unsubscribeAllComm(); _commCache = {};
  if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
  if (_webtopUnsub) { _webtopUnsub(); _webtopUnsub = null; }
  _webtopHomework = [];
  const firebaseUid = fbAuth?.currentUser?.uid;
  if (firebaseUid) localStorage.removeItem('familyhub_family_uid_' + firebaseUid);
  if (firebaseUid) localStorage.removeItem('familyhub_locked_member_' + firebaseUid);
  S.user = null; S.uid = null; familyData = null;
  if (fbAuth) fbAuth.signOut();
  el('loginScreen').classList.add('hidden');
  el('app').classList.remove('visible');
  el('authScreen').classList.remove('hidden');
  setAuthMode('signin');
  setAuthLoading(false);
}

function shareInvite() {
  const code = familyData?.familyCode;
  if (!code) return;
  const url  = location.origin + location.pathname + '?join=' + code;
  const text = `הצטרפ/י למשפחת ${familyData?.familyName || ''} ב-FamilyHub!\nקוד הצטרפות: ${code}\n${url}`;
  if (navigator.share) {
    navigator.share({ title: 'FamilyHub', text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = el('shareBtn');
      if (btn) { btn.textContent = '✓ הועתק!'; setTimeout(() => { if(el('shareBtn')) el('shareBtn').textContent = 'שתף'; }, 2200); }
    }).catch(() => prompt('העתק את הקוד:', text));
  }
}

function shareKidCode(name, code) {
  const url  = location.origin + location.pathname + '?join=' + code;
  const text = `הצטרפ/י כ-${name} למשפחת ${familyData?.familyName || ''} ב-FamilyHub!\nקוד אישי: ${code}\n${url}`;
  if (navigator.share) {
    navigator.share({ title: 'FamilyHub', text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      _alert('✓ הועתק!');
    }).catch(() => prompt('העתק את הקוד:', text));
  }
}

async function generateSpouseCode(memberName) {
  const btn = document.querySelector(`[data-spouse-gen="${CSS.escape(memberName)}"]`);
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  try {
    const code = await createMemberCode(S.uid, memberName);
    const members = getMembers().map(m => m.name === memberName ? { ...m, joinCode: code } : m);
    if (familyData) familyData.members = members;
    await fbDb.collection('families').doc(S.uid).update({ members });
    renderMgmtMembers();
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'צור קוד'; }
    _alert('שגיאה ביצירת קוד: ' + e.message);
  }
}

async function regenSpouseCode(memberName) {
  const btn = document.querySelector(`[data-spouse-regen="${CSS.escape(memberName)}"]`);
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  try {
    const code = await createMemberCode(S.uid, memberName);
    const members = getMembers().map(m => m.name === memberName ? { ...m, joinCode: code } : m);
    if (familyData) familyData.members = members;
    await fbDb.collection('families').doc(S.uid).update({ members });
    renderMgmtMembers();
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = '🔄'; }
    _alert('שגיאה: ' + e.message);
  }
}

function shareSpouseCode(name, code) {
  const url  = location.origin + location.pathname + '?join=' + code;
  const text = `הצטרפ/י כ-${name} למשפחת ${familyData?.familyName || ''} ב-FamilyHub!\nקוד כניסה אישי: ${code}\n${url}`;
  if (navigator.share) {
    navigator.share({ title: 'FamilyHub', text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      _alert('✓ הועתק!');
    }).catch(() => prompt('העתק את הקוד:', text));
  }
}

// ════════════════════════════════════════
//  FIRESTORE PERSISTENCE
// ════════════════════════════════════════
async function save() {
  if (!S.uid || !fbDb) return;
  try {
    await fbDb.collection('families').doc(S.uid).update({
      chores: S.chores, grocery: S.grocery, homework: S.homework,
      events: S.events, stars: S.stars,
      groceryPool: S.groceryPool, shoppingList: S.shoppingList, inCart: S.inCart,
    });
  } catch(e) { console.error('Save error:', e); }
}

// ════════════════════════════════════════
//  PUSH NOTIFICATIONS (FCM)
// ════════════════════════════════════════
function vapidKeyToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function initFCM() {
  if (!FB_CONFIGURED || !fbDb || !S.uid) { console.log('[FCM] skipped: not configured'); return; }
  if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return;
  if (typeof firebase.messaging.isSupported === 'function' && !firebase.messaging.isSupported()) {
    console.log('[FCM] not supported in this browser'); return;
  }
  const ua       = navigator.userAgent;
  const platform = ua.includes('Firefox') ? 'firefox' : ua.includes('Edg') ? 'edge' : 'chrome';
  try {
    const swReg = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    // Wait for SW to be fully active — required in Firefox and prevents Firebase
    // from trying to register a default SW at the root (which would 404 in subdirectory deploys)
    await navigator.serviceWorker.ready;

    // Firefox: explicitly manage the push subscription to avoid stale-subscription errors
    if (platform === 'firefox') {
      try {
        const existing = await swReg.pushManager.getSubscription();
        if (existing) {
          // Verify the existing subscription's applicationServerKey matches our VAPID key
          const existingKey = existing.options?.applicationServerKey;
          const newKey = vapidKeyToUint8Array(VAPID_KEY);
          const keyMatches = existingKey && new Uint8Array(existingKey).join() === newKey.join();
          if (!keyMatches) {
            console.log('[FCM] Firefox: stale subscription detected, unsubscribing');
            await existing.unsubscribe();
          }
        }
        // Pre-create the subscription explicitly so Firebase can use it
        const sub = await swReg.pushManager.getSubscription() ||
          await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKeyToUint8Array(VAPID_KEY) });
        console.log('[FCM] Firefox push subscription ready:', sub.endpoint.slice(0, 40) + '…');
      } catch(e) {
        console.info('[FCM] Firefox push unavailable (network may be blocking Mozilla push service):', e.message);
        return;
      }
    }

    fbMessaging = firebase.messaging();
    // Prevent Firebase from trying to register a default SW at the root domain
    // (which 404s when app is deployed in a subdirectory). Use our explicit registration.
    if (typeof fbMessaging.useServiceWorker === 'function') fbMessaging.useServiceWorker(swReg);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { console.log('[FCM] permission not granted'); return; }
    const token = await fbMessaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    if (token) {
      const tokenKey = token.slice(0, 20);
      const prevFamily = localStorage.getItem('familyhub_fcm_family_' + tokenKey);
      if (prevFamily && prevFamily !== S.uid) {
        // Token was registered under a different family — remove the stale entry so
        // pushes to that family don't land on this device anymore.
        fbDb.collection('families').doc(prevFamily)
          .collection('fcmTokens').doc(tokenKey)
          .delete().catch(() => {});
      }
      localStorage.setItem('familyhub_fcm_family_' + tokenKey, S.uid);
      await fbDb.collection('families').doc(S.uid)
        .collection('fcmTokens').doc(tokenKey)
        .set({ token, platform, memberName: S.user || '', isOwner: fbAuth.currentUser?.uid === S.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      console.log('[FCM] registered on', platform);
    }
    fbMessaging.onMessage(payload => {
      showNotifToast(
        payload.notification?.title || 'FamilyHub',
        payload.notification?.body  || ''
      );
    });
  } catch(e) { console.warn('FCM:', e.message); }
}

function showNotifToast(title, body) {
  const t = document.createElement('div');
  t.className = 'notif-toast';
  t.innerHTML = `<div class="notif-toast-title">${esc(title)}</div><div class="notif-toast-body">${esc(body)}</div>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 4500);
}

function subscribeToFamily(uid) {
  if (!_evtCfgLoaded) { _evtCfgLoaded = true; loadEventTypesCfg(); }
  if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
  _subscribeWebtop(uid);
  fbUnsubscribe = fbDb.collection('families').doc(uid).onSnapshot(snap => {
    if (!snap.exists) {
      // Family doc missing — mapping is stale, sign out and return to auth
      console.warn('subscribeToFamily: doc not found for', uid);
      el('loadingScreen').classList.add('hidden');
      authSignOut();
      return;
    }
    const d = snap.data();
    familyData = d;
    S.chores   = d.chores   || [];
    S.grocery      = d.grocery      || [];
    S.homework     = d.homework     || [];
    S.events       = d.events       || [];
    S.stars        = d.stars        || {};
    S.groceryPool      = d.groceryPool      || [];
    S.shoppingList     = d.shoppingList     || [];
    S.inCart           = d.inCart           || [];
    S.shoppingHistory  = d.shoppingHistory  || [];
    pruneShoppingHistory();
    migrateGroceryIfNeeded();
    afterLoad();
  }, err => {
    console.error('Firestore error:', err);
    el('loadingScreen').classList.add('hidden');
    el('authScreen').classList.remove('hidden');
  });
}

function _subscribeWebtop(familyId) {
  if (_webtopUnsub) { _webtopUnsub(); _webtopUnsub = null; }
  _webtopUnsub = fbDb.collection('webtopClasses')
    .where('familyIds', 'array-contains', familyId)
    .onSnapshot(snap => {
      console.log('[webtop] snapshot docs:', snap.size, 'familyId:', familyId);
      _webtopHomework = [];
      snap.forEach(doc => {
        const hw = doc.data().homework || [];
        console.log('[webtop] doc', doc.id, 'homework items:', hw.length);
        hw.forEach(item => _webtopHomework.push({ ...item, classKey: doc.id }));
      });
      if (S.tab === 'homework') renderHomework();
      renderMgmtWebtop();
    }, err => {
      console.error('[webtop] Firestore listener error:', err.code, err.message);
      const el2 = el('mgmtWebtopStatus');
      if (el2) { el2.textContent = `שגיאה: ${err.code}`; el2.style.color = '#ef4444'; }
    });
}

function renderMgmtWebtop() {
  const el2 = el('mgmtWebtopStatus');
  if (!el2) return;
  const keys = [...new Set(_webtopHomework.map(h => h.classKey))];
  if (keys.length > 0) {
    el2.textContent = `✅ מחובר — ${keys.length} כיתה${keys.length > 1 ? 'ות' : ''}, ${_webtopHomework.length} שיעורי בית סונכרנו`;
    el2.style.color = '#16a34a';
  } else {
    el2.textContent = 'לא מחובר עדיין';
    el2.style.color = '#9ca3af';
  }
}

let _firstJoinNotified = false;

async function _notifyFirstJoin(memberName) {
  try {
    // Mark member as joined so this never fires again
    const members = getMembers().map(m =>
      m.name === memberName ? { ...m, joinedAt: Date.now() } : m
    );
    if (familyData) familyData.members = members;
    await fbDb.collection('families').doc(S.uid).update({ members });
    // Write green notification to the family (visible to parents only via filter)
    const member = getMembers().find(m => m.name === memberName);
    const emoji  = member?.emoji || '👤';
    await fbDb.collection('families').doc(S.uid).collection('notifications').add({
      type: 'member_joined',
      message: `${emoji} ${memberName} הצטרף/ה למשפחה!`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      dismissed: false,
    });
  } catch(e) {
    console.warn('[firstJoin]', e);
  }
}

function _migrateSubjectColors() {
  const subs = familyData?.subjects;
  if (!subs?.length) return;
  const grey = '#f3f4f6';
  const needsPatch = subs.some(s => s.bg === grey);
  if (!needsPatch) return;
  const patched = subs.map((s, i) => {
    if (s.bg !== grey) return s;
    const pool = SUBJECT_COLOR_POOL[i % SUBJECT_COLOR_POOL.length];
    return { ...s, bg: pool.bg, color: pool.color };
  });
  familyData.subjects = patched;
  fbDb.collection('families').doc(S.uid).update({ subjects: patched }).catch(() => {});
}

function afterLoad() {
  const kids = getKids();
  if (!S.child || !kids.includes(S.child)) S.child = kids[0] || null;
  _migrateSubjectColors();
  el('loadingScreen').classList.add('hidden');
  if (S.lockedMember && getAllMemberNames().includes(S.lockedMember)) {
    // First-join detection: if member has no joinedAt, this is their first time
    if (!_firstJoinNotified) {
      const m = getMembers().find(x => x.name === S.lockedMember);
      if (m && !m.joinedAt) {
        _firstJoinNotified = true;
        _notifyFirstJoin(S.lockedMember);
      }
    }
    // Locked device: auto-login as locked member, no choice
    login(S.lockedMember);
  } else if (S.user && getAllMemberNames().includes(S.user)) {
    renderAll(); tryAutoConnectGCal(); initPresence(); initNotifBanners(); _applyAdminUI(); _initHeaderCollapse(); loadWeather();
  } else {
    const saved = localStorage.getItem('familyhub_member_' + S.uid);
    if (saved && getAllMemberNames().includes(saved)) {
      login(saved);
    } else {
      renderLoginScreen();
      el('loginScreen').classList.remove('hidden');
    }
  }
}

// ════════════════════════════════════════
//  GOOGLE CALENDAR
// ════════════════════════════════════════
function gapiLoaded() {
  gapi.load('client', async () => {
    await gapi.client.init({discoveryDocs:[GCAL_DISCOVERY]});
    gcal.gapiReady=true; renderGCalBar(); tryAutoConnectGCal();
  });
}
function gisLoaded() {
  if (!GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID')) {
    gcal.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:GOOGLE_CLIENT_ID, scope:GCAL_SCOPE, callback:onGCalToken,
    });
  }
  gcal.gisReady=true; renderGCalBar(); tryAutoConnectGCal();
}
function gcalWasConnected() {
  return !!(S.uid && S.user && localStorage.getItem('familyhub_gcal_' + S.uid + '_' + S.user) === '1');
}
let _gcalGestureListener = null;
function tryAutoConnectGCal() {
  if (gcalReady()) renderGCalBar();
  // Schedule a silent reconnect on the next user gesture (click/tap).
  // requestAccessToken() requires a user-gesture context to avoid popup blockers;
  // piggybacking on the very next tap achieves this invisibly.
  if (!gcalConnected() && gcalWasConnected() && gcalReady() && gcal.tokenClient && !_gcalGestureListener) {
    _gcalGestureListener = () => {
      document.removeEventListener('click',      _gcalGestureListener);
      document.removeEventListener('touchstart', _gcalGestureListener);
      _gcalGestureListener = null;
      if (!gcalConnected() && gcalWasConnected() && gcalReady() && gcal.tokenClient)
        gcal.tokenClient.requestAccessToken({prompt:''});
    };
    document.addEventListener('click',      _gcalGestureListener);
    document.addEventListener('touchstart', _gcalGestureListener);
  }
}
async function onGCalToken(resp) {
  if (resp.error) { renderGCalBar(); return; }
  gcal.accessToken=resp.access_token;
  if (S.uid && S.user) localStorage.setItem('familyhub_gcal_' + S.uid + '_' + S.user, '1');
  await fetchGCalEvents(); renderGCalBar();
}
async function fetchGCalEvents() {
  if (!gcalConnected()) return;
  gcal.syncing=true; renderGCalBar();
  try {
    const res = await gapi.client.calendar.events.list({
      calendarId:'primary',
      timeMin:new Date(_now.getTime()-30*864e5).toISOString(),
      timeMax:new Date(_now.getTime()+90*864e5).toISOString(),
      maxResults:250,singleEvents:true,orderBy:'startTime',
    });
    gcal.events=(res.result.items||[]).map(ev=>({
      id:'gcal_'+ev.id, gcalId:ev.id,
      title:ev.summary||'(No title)',
      date:(ev.start.dateTime||ev.start.date).slice(0,10),
      time:ev.start.dateTime?ev.start.dateTime.slice(11,16):'',
      person:'All', gcal:true,
    }));
  } catch(e){console.error(e);}
  gcal.syncing=false; renderGCalBar(); renderCalendar();
}
function connectGCal()    { if (gcalReady()&&gcal.tokenClient) gcal.tokenClient.requestAccessToken({prompt:''}); }
function disconnectGCal() {
  if (gcal.accessToken) google.accounts.oauth2.revoke(gcal.accessToken,()=>{});
  gcal.accessToken=null; gcal.events=[];
  if (S.uid && S.user) localStorage.removeItem('familyhub_gcal_' + S.uid + '_' + S.user);
  if (_gcalGestureListener) {
    document.removeEventListener('click',      _gcalGestureListener);
    document.removeEventListener('touchstart', _gcalGestureListener);
    _gcalGestureListener = null;
  }
  renderGCalBar(); renderCalendar();
}
function renderGCalBar() {
  const st=el('gcalStatus'); const bt=el('gcalBtns');
  if (!st) return;
  if (GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID')) {
    st.innerHTML=`<span class="needs-setup">${t('gcalSetup')}</span>`; bt.innerHTML=''; return;
  }
  if (!gcalReady())   { st.textContent=t('gcalLoading'); bt.innerHTML=''; return; }
  if (gcal.syncing)   { st.textContent=t('gcalSyncing'); bt.innerHTML=''; return; }
  if (gcalConnected()) {
    st.innerHTML=`<span class="connected">${t('gcalConnected')}</span>`;
    bt.innerHTML=`<button class="gcal-btn gcal-btn-refresh" onclick="fetchGCalEvents()">${t('gcalRefresh')}</button>
                  <button class="gcal-btn gcal-btn-disconnect" onclick="disconnectGCal()">${t('gcalDisconnect')}</button>`;
  } else if (gcalWasConnected()) {
    st.innerHTML=`<span style="color:#4285f4;font-weight:800">${t('gcalWasConnected')}</span>`;
    bt.innerHTML=`<button class="gcal-btn gcal-btn-connect" onclick="connectGCal()">${t('gcalReconnect')}</button>`;
  } else {
    st.textContent=t('gcalSync');
    bt.innerHTML=`<button class="gcal-btn gcal-btn-connect" onclick="connectGCal()">${t('gcalConnect')}</button>`;
  }
  // Show GCal sync toggle in add-event form only when connected and user is a parent
  const syncRow=el('gcalSyncRow');
  if(syncRow){
    const show=gcalConnected()&&isParent();
    syncRow.style.display=show?'flex':'none';
    const lbl=el('gcalSyncLabel');if(lbl)lbl.textContent=t('gcalSyncOption');
  }
}
async function gcalCreateEvent(ev) {
  if (!gcalConnected()||!isParent()) return null;
  const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const res=await gapi.client.calendar.events.insert({calendarId:'primary',resource:{
      summary:ev.title,
      start:ev.time?{dateTime:`${ev.date}T${ev.time}:00`,timeZone:tz}:{date:ev.date},
      end:ev.time?{dateTime:`${ev.date}T${String(parseInt(ev.time)+1).padStart(2,'0')}:${ev.time.slice(3)}:00`,timeZone:tz}:{date:ev.date},
    }});
    return res.result.id;
  } catch(e){console.error(e);return null;}
}
async function gcalDeleteEvent(gcalId) {
  if (!gcalConnected()||!gcalId) return;
  try { await gapi.client.calendar.events.delete({calendarId:'primary',eventId:gcalId}); } catch(e){}
}

// ════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════
function fmtDate(str) {
  if (!str) return '';
  return new Date(str+'T00:00:00').toLocaleDateString(t('locale'),{weekday:'short',month:'short',day:'numeric'});
}
function fmtDateLong(str) {
  if (!str) return '';
  return new Date(str+'T00:00:00').toLocaleDateString(t('locale'),{weekday:'long',month:'long',day:'numeric'});
}
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function el(id){ return document.getElementById(id); }
function fhSpinnerHTML(){ return `<span class="fh-spinner">${'<span></span>'.repeat(8)}</span>`; }

// ── Action icon SVGs ──────────────────────────
const _ico = {
  x:    `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;display:block"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>`,
  undo: `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:block"><path d="M4 8L2 5l2-3"/><path d="M2 5h6a4 4 0 0 1 0 8H6"/></svg>`,
  edit: `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:block"><path d="M9.5 2a1.5 1.5 0 0 1 2 2L4 11H2V9L9.5 2z"/></svg>`,
  trash:`<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:block"><line x1="2" y1="4" x2="12" y2="4"/><path d="M5 4V2.5h4V4"/><path d="M4 4l.7 7.5h4.6L10 4"/></svg>`,
  plus: `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;display:block"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>`,
  list: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" style="width:15px;height:15px;display:block"><circle cx="3.5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none"/><line x1="6.5" y1="5" x2="13" y2="5"/><line x1="6.5" y1="8.5" x2="13" y2="8.5"/><line x1="6.5" y1="12" x2="11" y2="12"/></svg>`,
  cart: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;display:block"><path d="M1 1.5h2l1.8 7.5h7l1.7-5.5H4.5"/><circle cx="6.5" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="13" r="1" fill="currentColor" stroke="none"/></svg>`,
  clock:`<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-bottom:1px"><circle cx="7" cy="7" r="5.5"/><polyline points="7,4 7,7 9,8.5"/></svg>`,
  pin:  `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-bottom:1px"><path d="M7 1a3.5 3.5 0 0 1 3.5 3.5C10.5 7.5 7 13 7 13S3.5 7.5 3.5 4.5A3.5 3.5 0 0 1 7 1z"/><circle cx="7" cy="4.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  pencil:`<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;display:block"><path d="M9.5 2a1.5 1.5 0 0 1 2 2L4 11H2V9L9.5 2z"/></svg>`,
  fam:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;display:inline-block;vertical-align:middle;color:#a0aec0"><circle cx="13" cy="7" r="2.5"/><path d="M18 17c0-2.8-2.7-5-6-5"/><circle cx="7" cy="7" r="2.5"/><path d="M1 17c0-2.8 2.7-5 6-5s6 2.2 6 5"/></svg>`,
};

// ════════════════════════════════════════
//  LOGIN / MEMBER PICKER
// ════════════════════════════════════════
// Returns the member name of the currently authenticated user, derived from Firebase Auth.
// Owner: uid === S.uid → use ownerMemberName. Joined member: uid encoded in displayName.
function _authMemberName() {
  const uid = fbAuth.currentUser?.uid;
  if (!uid) return null;
  if (uid === S.uid) return familyData?.ownerMemberName || null;
  const dp = fbAuth.currentUser?.displayName || '';
  const parts = dp.split('|');
  return (parts.length === 2 && parts[0] === S.uid) ? (parts[1] || null) : null;
}

function renderLoginScreen() {
  el('loginFamilyName').textContent = familyData?.familyName || '';
  el('loginSub').textContent = STRINGS.he.loginSub;
  const members = getMembers();
  // Restrict visible members based on current context
  let visibleMembers = members;
  if (S.lockedMember) {
    // Locked device: only show the locked member
    visibleMembers = members.filter(m => m.name === S.lockedMember);
  } else {
    // Identify who the current auth user is — owner via ownerMemberName, joined via displayName
    const authName = _authMemberName() || S.user;
    if (authName && getParents().includes(authName)) {
      // This is a parent — show only themselves + kids, not the other parent
      visibleMembers = members.filter(m => m.name === authName || m.role === 'kid');
    }
  }
  el('loginGrid').innerHTML = visibleMembers.map((m, i) => `
    <div class="login-card${i===visibleMembers.length-1&&visibleMembers.length%2!==0?' login-card-solo':''}" onclick="login('${esc(m.name)}')">
      <div class="login-card-emoji">${getAvatar(m.name)}</div>
      <div class="login-card-name">${esc(m.name)}</div>
      <div class="login-card-role">${roleBadgeHtml(m.role, m.role==='parent' && !!ADMIN_UID && S.uid===ADMIN_UID && m.name===(familyData?.ownerMemberName||null) ? S.uid : null)}</div>
    </div>`).join('');
}

function login(name) {
  S.user = name; S.filter = name;
  if (getKids().includes(name)) S.child = name;
  if (!S.child && getKids().length > 0) S.child = getKids()[0];
  localStorage.setItem('familyhub_member_' + S.uid, name);
  // First time the admin owner picks their member — save it so the picker can
  // show the admin badge on the right person only (not on all parents)
  if (fbAuth.currentUser?.uid === S.uid && ADMIN_UID && S.uid === ADMIN_UID && !familyData?.ownerMemberName) {
    fbDb.collection('families').doc(S.uid).update({ ownerMemberName: name }).catch(() => {});
    if (familyData) familyData.ownerMemberName = name;
  }
  el('loginScreen').classList.add('hidden');
  el('app').classList.add('visible');
  loadSyncedClassEvents();
  applyDir(); renderAll(); tryAutoConnectGCal();
  loadWeather(); setInterval(loadWeather, 30*60*1000);
  initFCM();
  refreshHomeUpcoming();
  initPresence();
  initNotifBanners();
  _applyAdminUI();
  _initHeaderCollapse();
}

async function switchUser() {
  if (S.lockedMember) return; // locked devices can't switch members
  const btn = el('pendingReqBtn'); if (btn) btn.style.display = 'none';
  stopNotifBanners();
  await stopPresence();
  unsubscribeAllComm(); _commCache = {};
  S.user = null; S.filter = 'All';
  localStorage.removeItem('familyhub_member_' + S.uid);
  el('app').classList.remove('visible');
  renderLoginScreen();
  el('loginScreen').classList.remove('hidden');
  document.documentElement.lang = 'he';
  document.documentElement.dir  = 'rtl';
  switchTab('home');
}

// ════════════════════════════════════════
//  EVENT PERSON PICKER
// ════════════════════════════════════════
let _eventPersons = ['All'];

// Normalise legacy string person → array
function eventPersons(ev) {
  if (Array.isArray(ev.person)) return ev.person;
  return [ev.person || 'All'];
}

function renderEventPersonPicker() {
  const picker = el('newEventPersonPicker');
  if (!picker) return;
  const others = getAllMemberNames().filter(n => n !== S.user);
  const chips = [
    { key:'All', label:t('everyone') },
    ...others.map(n => ({ key:n, label:n })),
  ];
  picker.innerHTML = chips.map(c => {
    const sel = _eventPersons.includes(c.key);
    const avatarHTML = c.key === 'All' ? _allGroupAvatar() : getAvatar(c.key);
    return `<div class="ep-chip ${sel?'selected':''}" onclick="toggleEventPerson('${esc(c.key)}')">
      <span class="ep-chip-avatar">${avatarHTML}</span>
      <span>${esc(c.label)}</span>
    </div>`;
  }).join('');
}

function toggleEventPerson(key) {
  if (key === 'All') {
    _eventPersons = ['All'];
  } else {
    _eventPersons = _eventPersons.filter(k => k !== 'All');
    if (_eventPersons.includes(key)) {
      _eventPersons = _eventPersons.filter(k => k !== key);
      if (_eventPersons.length === 0) _eventPersons = ['All'];
    } else {
      _eventPersons.push(key);
    }
  }
  renderEventPersonPicker();
}

// ════════════════════════════════════════
//  RENDER ALL + STATIC LABELS
// ════════════════════════════════════════
function renderAll() {
  const sy = window.scrollY;
  renderTabBar(); renderStatic(); renderHeader(); renderHome();
  renderChores(); renderSupermarket(); renderHomework();
  renderCalendar(); renderGCalBar(); applyRoleUI();
  if (S.tab === 'community') renderCommunity();
  // Restore scroll position — Firestore onSnapshot re-renders reset it on mobile
  if (sy > 0) window.scrollTo(0, sy);
}

// ════════════════════════════════════════
//  MANAGEMENT SCREEN
// ════════════════════════════════════════
let _mgmtNewRole   = 'parent';
let _mgmtNewEmoji  = EMOJI_OPTIONS[0];
let _mgmtNewGender = '';
let _mgmtEditEmoji = {}; // keyed by memberIndex

function openMgmt() { renderMgmt(); el('mgmtScreen').classList.remove('hidden'); loadCities(); }
function closeMgmt() { el('mgmtScreen').classList.add('hidden'); }

function renderMgmt() {
  renderMgmtMembers();
  renderMgmtCats();
  renderMgmtSubjects();
  renderMgmtCommunity();
  // Webtop card — parents only
  const webtopCard = el('mgmtWebtopCard');
  if (webtopCard) {
    webtopCard.style.display = isParent() ? '' : 'none';
    const codeEl = el('mgmtWebtopCode');
    if (codeEl) codeEl.textContent = S.uid || '';
    renderMgmtWebtop();
  }
}

function copyWebtopCode() {
  const code = S.uid || '';
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('#mgmtWebtopCard .mgmt-add-btn');
    if (btn) { btn.textContent = '✓'; setTimeout(() => { btn.textContent = '⎘'; }, 1500); }
  }).catch(() => {});
}

// ── Members ──────────────────────────────
function renderMgmtMembers() {
  const members = getMembers();
  const isHe = getLang() === 'he';
  _mgmtEditEmoji = {};
  members.forEach((m, i) => { _mgmtEditEmoji[i] = m.emoji; });

  el('mgmtMemberList').innerHTML = members.map((m, i) => {
    const canDel = members.length > 1 && m.name !== S.user &&
                   !(m.role==='parent' && getParents().length===1);
    return `
    <div class="mgmt-member-row">
      <div class="mgmt-avatar-wrap" onclick="pickPhoto('${esc(m.name)}')" title="${isHe ? 'החלף תמונה' : 'Change photo'}">
        <div class="mgmt-avatar">${getAvatar(m.name)}</div>
        <div class="mgmt-avatar-edit">${_ico.pencil}</div>
      </div>
      <div class="mgmt-member-info">
        <div class="mgmt-member-name">${esc(m.name)}</div>
        <div class="mgmt-member-role">${m.role==='parent'?'הורה':'ילד/ה'}</div>
        ${m.role==='kid'&&m.school?.city ? `<div class="mgmt-school-info">🏫 ${esc(m.school.city)}${m.school.name?', '+esc(m.school.name):''}${m.school.grade?', כיתה '+esc(m.school.grade)+(m.school.classNum?'\''+esc(m.school.classNum):''):''} ${m.schoolPending?'<span style="background:var(--gray-100);color:var(--gray-500);font-size:10px;padding:1px 6px;border-radius:8px;font-weight:700">⏳ ממתין</span>':''}</div>` : ''}
        ${m.role === 'kid' && m.joinCode ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:11px;color:#6a11cb;font-weight:700;background:#f0e6ff;padding:2px 8px;border-radius:8px;letter-spacing:1px">${esc(m.joinCode)}</span>
            <button style="background:none;border:none;cursor:pointer;padding:2px 4px;color:#718096;display:flex;align-items:center" onclick="shareKidCode('${esc(m.name)}','${esc(m.joinCode)}')" title="שתף קוד"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
          </div>` : ''}
        ${m.role === 'parent' && m.name !== S.user ? (m.joinCode ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:10px;color:#718096;margin-left:2px">🔑</span>
            <span style="font-size:11px;color:var(--primary-600);font-weight:700;background:var(--primary-50);padding:2px 8px;border-radius:8px;letter-spacing:1px">${esc(m.joinCode)}</span>
            <button style="background:none;border:none;cursor:pointer;padding:2px 4px;color:#718096;display:flex;align-items:center" onclick="shareSpouseCode('${esc(m.name)}','${esc(m.joinCode)}')" title="שתף קוד"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
            <button data-spouse-regen="${esc(m.name)}" style="font-size:11px;background:#fff5f5;color:#c53030;border:1px solid #fed7d7;border-radius:8px;padding:2px 8px;cursor:pointer;font-family:inherit" onclick="regenSpouseCode('${esc(m.name)}')" title="צור קוד חדש">🔄</button>
          </div>` : `
          <div style="margin-top:4px">
            <button data-spouse-gen="${esc(m.name)}" style="font-size:11px;background:#ebf8ff;color:#2b6cb0;border:1px solid #bee3f8;border-radius:8px;padding:2px 10px;cursor:pointer;font-family:inherit" onclick="generateSpouseCode('${esc(m.name)}')">🔑 צור קוד כניסה</button>
          </div>`) : ''}
      </div>
      <button class="mgmt-icon-btn purple" onclick="toggleMgmtEdit(${i})" title="ערוך">✏️</button>
      ${canDel ? `<button class="mgmt-icon-btn red" onclick="mgmtRemoveMember('${esc(m.name)}')" title="הסר">🗑</button>` : '<span style="width:26px"></span>'}
    </div>
    <div class="mgmt-edit-panel" id="mgmtEditPanel_${i}" data-role="${m.role}" data-emoji="${m.emoji}" data-gender="${m.gender||''}">
      <span class="mgmt-edit-label">אימוג'י</span>
      <div class="emoji-row" id="mgmtEditEmojiRow_${i}"></div>
      <span class="mgmt-edit-label">שם</span>
      <input class="auth-input" id="mgmtEditName_${i}" value="${esc(m.name)}" style="margin-bottom:10px">
      <div class="mb-role-toggle" style="margin-bottom:12px;width:fit-content">
        <button class="mb-role-btn ${m.role==='parent'?'active':''}" id="mgmtEditRoleParent_${i}" onclick="setMgmtEditRole(${i},'parent')">הורה</button>
        <button class="mb-role-btn ${m.role==='kid'?'active':''}"    id="mgmtEditRoleKid_${i}"    onclick="setMgmtEditRole(${i},'kid')">ילד</button>
      </div>
      <div id="mgmtKidSection_${i}" style="display:${m.role==='kid'?'block':'none'}">
        <span class="mgmt-edit-label">מין</span>
        <div class="mb-role-toggle" style="margin-bottom:12px">
          <button class="mb-role-btn ${m.gender==='boy'?'active':''}"  id="mgmtGenderBoy_${i}"  onclick="setMgmtGender(${i},'boy')">👦 בן</button>
          <button class="mb-role-btn ${m.gender==='girl'?'active':''}" id="mgmtGenderGirl_${i}" onclick="setMgmtGender(${i},'girl')">👧 בת</button>
        </div>
        <span class="mgmt-edit-label">תאריך לידה</span>
        <input class="auth-input" id="mgmtEditDob_${i}" type="date" value="${m.dob||''}" style="margin-bottom:12px">
      </div>
      <div id="mgmtSchoolSection_${i}" style="display:${m.role==='kid'?'block':'none'}">
        <span class="mgmt-edit-label" style="display:block;margin-bottom:6px">🏫 בית ספר</span>
        <input class="auth-input" id="mgmtEditCity_${i}" placeholder="עיר" value="${esc(m.school?.city||'')}" style="margin-bottom:6px"
  oninput="onCityAc(this,${i})" onfocus="onCityAc(this,${i})" onblur="scheduleHideAc()">
        <input class="auth-input" id="mgmtEditSchoolName_${i}" placeholder="שם בית הספר" value="${esc(m.school?.name||'')}" style="margin-bottom:6px"
  oninput="onSchoolAc(this,${i})" onfocus="onSchoolAc(this,${i})" onblur="scheduleHideAc()"
  ${!m.school?.city ? 'disabled' : ''}>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <select class="auth-input" id="mgmtEditGrade_${i}" style="flex:1" ${!m.school?.name ? 'disabled' : ''}>
            ${GRADE_OPTIONS.map(g=>`<option value="${g}" ${(m.school?.grade||'')==g?'selected':''}>${g?'כיתה '+g:'כיתה...'}</option>`).join('')}
          </select>
          <input class="auth-input" id="mgmtEditClassNum_${i}" placeholder="כיתה (מספר/שם)" value="${esc(m.school?.classNum||'')}" style="flex:1" maxlength="20" ${!m.school?.name ? 'disabled' : ''}>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="auth-btn-main" style="padding:8px 16px;width:auto" onclick="saveMgmtEdit(${i},'${esc(m.name)}')">✓ שמור</button>
        <button class="auth-btn-back" onclick="toggleMgmtEdit(${i})">ביטול</button>
      </div>
    </div>`;
  }).join('');

  // Populate emoji rows for each edit panel
  members.forEach((m, i) => {
    const row = el(`mgmtEditEmojiRow_${i}`);
    if (!row) return;
    row.innerHTML = EMOJI_OPTIONS.map(e =>
      `<span class="emoji-opt ${e===_mgmtEditEmoji[i]?'selected':''}" onclick="selectMgmtEditEmoji(${i},'${e}',this)">${e}</span>`
    ).join('');
  });

  // Init add-member emoji row
  const newRow = el('mgmtNewEmojiRow');
  if (newRow) {
    newRow.innerHTML = EMOJI_OPTIONS.map(e =>
      `<span class="emoji-opt ${e===_mgmtNewEmoji?'selected':''}" onclick="selectMgmtNewEmoji('${e}',this)">${e}</span>`
    ).join('');
  }
}

function toggleMgmtEdit(i) {
  const panel = el(`mgmtEditPanel_${i}`);
  const open = panel.classList.toggle('open');
  if (open) {
    el(`mgmtAddMemberForm`).classList.remove('open'); // close add form if open
  }
}
function toggleMgmtAddMember() {
  const form = el('mgmtAddMemberForm');
  const open = form.classList.toggle('open');
  if (open) {
    // close all edit panels
    getMembers().forEach((_,i) => el(`mgmtEditPanel_${i}`)?.classList.remove('open'));
    el('mgmtNewMemberName').focus();
  }
}

function selectMgmtNewEmoji(emoji, target) {
  _mgmtNewEmoji = emoji;
  el('mgmtNewEmojiRow').querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  target.classList.add('selected');
}
function selectMgmtEditEmoji(i, emoji, target) {
  _mgmtEditEmoji[i] = emoji;
  el(`mgmtEditEmojiRow_${i}`).querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  target.classList.add('selected');
  el(`mgmtEditPanel_${i}`).dataset.emoji = emoji;
}
function setMgmtNewRole(role) {
  _mgmtNewRole = role;
  el('mgmtNewRoleParent').classList.toggle('active', role==='parent');
  el('mgmtNewRoleKid').classList.toggle('active',    role==='kid');
  const section = el('mgmtNewKidSection');
  if (section) {
    section.style.display = role === 'kid' ? 'block' : 'none';
    const gradeEl = el('mgmtEditGrade_new');
    if (gradeEl && !gradeEl.options.length)
      gradeEl.innerHTML = GRADE_OPTIONS.map(g => `<option value="${g}">${g ? 'כיתה ' + g : 'כיתה...'}</option>`).join('');
  }
}
function setMgmtNewGender(g) {
  _mgmtNewGender = g;
  el('mgmtNewGenderBoy') .classList.toggle('active', g === 'boy');
  el('mgmtNewGenderGirl').classList.toggle('active', g === 'girl');
  el('mgmtNewGenderRow').classList.remove('input-error');
}
function setMgmtEditRole(i, role) {
  el(`mgmtEditPanel_${i}`).dataset.role = role;
  el(`mgmtEditRoleParent_${i}`).classList.toggle('active', role==='parent');
  el(`mgmtEditRoleKid_${i}`).classList.toggle('active',    role==='kid');
  const show = role === 'kid' ? 'block' : 'none';
  const sec = el(`mgmtSchoolSection_${i}`); if (sec) sec.style.display = show;
  const kid = el(`mgmtKidSection_${i}`);   if (kid) kid.style.display  = show;
}
function setMgmtGender(i, g) {
  el(`mgmtEditPanel_${i}`).dataset.gender = g;
  el(`mgmtGenderBoy_${i}`) .classList.toggle('active', g === 'boy');
  el(`mgmtGenderGirl_${i}`).classList.toggle('active', g === 'girl');
}

function _markError(id) {
  const inp = el(id);
  if (!inp) return;
  inp.classList.remove('input-error');
  void inp.offsetWidth; // force reflow to restart animation
  inp.classList.add('input-error');
  inp.addEventListener('input', () => inp.classList.remove('input-error'), { once: true });
  inp.addEventListener('change', () => inp.classList.remove('input-error'), { once: true });
}

async function mgmtAddMember() {
  const name = el('mgmtNewMemberName').value.trim();
  if (!name) { _markError('mgmtNewMemberName'); return; }
  if (getMembers().find(m => m.name === name)) { el('mgmtNewMemberName').select(); return; }
  const newMember = { name, emoji: _mgmtNewEmoji, role: _mgmtNewRole };
  if (_mgmtNewRole === 'kid') {
    const city     = el('mgmtEditCity_new')?.value.trim()       || '';
    const school   = el('mgmtEditSchoolName_new')?.value.trim() || '';
    const grade    = el('mgmtEditGrade_new')?.value             || '';
    const classNum = el('mgmtEditClassNum_new')?.value.trim()   || '';
    const dob      = el('mgmtEditDob_new')?.value               || '';
    const missing = [
      !city          && 'mgmtEditCity_new',
      !school        && 'mgmtEditSchoolName_new',
      !grade         && 'mgmtEditGrade_new',
      !classNum      && 'mgmtEditClassNum_new',
      !dob           && 'mgmtEditDob_new',
    ].filter(Boolean);
    if (missing.length || !_mgmtNewGender) {
      missing.forEach(_markError);
      if (!_mgmtNewGender) _markError('mgmtNewGenderRow');
      el('mgmtAddError').textContent = 'יש למלא את כל שדות החובה';
      return;
    }
    el('mgmtAddError').textContent = '';
    newMember.school  = { city, name: school, grade, classNum };
    newMember.gender  = _mgmtNewGender;
    newMember.dob     = dob;
  }
  const members = [...getMembers(), newMember];
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({ members });
  // Generate kid code if needed
  const addedMember = members[members.length - 1];
  if (addedMember.role === 'kid' && !addedMember.joinCode) {
    const code = await createKidCode(S.uid, addedMember.name);
    const updatedMembers = members.map(m => m.name === addedMember.name ? { ...m, joinCode: code } : m);
    if (familyData) familyData.members = updatedMembers;
    await fbDb.collection('families').doc(S.uid).update({ members: updatedMembers });
  }
  // Register in school class if school was set
  if (newMember.school?.city) syncKidClass(name, newMember.school, undefined, 'kid').then(() => renderMgmtCommunity());
  // Reset form
  el('mgmtNewMemberName').value = '';
  if (el('mgmtEditCity_new'))       el('mgmtEditCity_new').value = '';
  if (el('mgmtEditSchoolName_new')) el('mgmtEditSchoolName_new').value = '';
  if (el('mgmtEditGrade_new'))      el('mgmtEditGrade_new').value = '';
  if (el('mgmtEditClassNum_new'))   el('mgmtEditClassNum_new').value = '';
  _mgmtNewEmoji = EMOJI_OPTIONS[0]; _mgmtNewRole = 'parent'; _mgmtNewGender = '';
  if (el('mgmtNewGenderBoy'))  el('mgmtNewGenderBoy').classList.remove('active');
  if (el('mgmtNewGenderGirl')) el('mgmtNewGenderGirl').classList.remove('active');
  if (el('mgmtEditDob_new'))   el('mgmtEditDob_new').value = '';
  el('mgmtAddMemberForm').classList.remove('open');
  renderMgmtMembers();
}

async function saveMgmtEdit(i, originalName) {
  const panel = el(`mgmtEditPanel_${i}`);
  const newName  = el(`mgmtEditName_${i}`).value.trim();
  const newRole  = panel.dataset.role;
  const newEmoji = panel.dataset.emoji;
  if (!newName) return;
  const oldMember = getMembers().find(m => m.name === originalName);
  const oldSchool = oldMember?.school;
  const school = newRole === 'kid' ? {
    city:     (el(`mgmtEditCity_${i}`)?.value.trim()       || ''),
    name:     (el(`mgmtEditSchoolName_${i}`)?.value.trim() || ''),
    grade:    (el(`mgmtEditGrade_${i}`)?.value             || ''),
    classNum: (el(`mgmtEditClassNum_${i}`)?.value.trim()   || ''),
  } : undefined;
  const newGender = newRole === 'kid' ? (panel.dataset.gender || null) : undefined;
  const newDob    = newRole === 'kid' ? (el(`mgmtEditDob_${i}`)?.value || '') : undefined;
  let members = getMembers().map(m => {
    if (m.name !== originalName) return m;
    const updated = { ...m, name: newName, emoji: newEmoji, role: newRole };
    if (school   !== undefined) updated.school = school;   else delete updated.school;
    if (newGender !== undefined) { if (newGender) updated.gender = newGender; else delete updated.gender; }
    if (newDob    !== undefined) { if (newDob)    updated.dob    = newDob;    else delete updated.dob; }
    return updated;
  });
  // Rename in existing data if member name changed
  if (newName !== originalName) {
    S.chores   = S.chores.map(c   => c.assignee===originalName ? {...c,assignee:newName} : c);
    S.homework = S.homework.map(h => {
      if(h.scope==='class'){
        const doneBy={...(h.doneBy||{})},doneAtBy={...(h.doneAtBy||{})};
        if(originalName in doneBy){doneBy[newName]=doneBy[originalName];delete doneBy[originalName];}
        if(originalName in doneAtBy){doneAtBy[newName]=doneAtBy[originalName];delete doneAtBy[originalName];}
        return {...h,doneBy,doneAtBy};
      }
      return h.child===originalName?{...h,child:newName}:h;
    });
    S.stars    = Object.fromEntries(Object.entries(S.stars).map(([k,v]) => [k===originalName?newName:k, v]));
    if (S.user   === originalName) S.user   = newName;
    if (S.filter === originalName) S.filter = newName;
    if (S.child  === originalName) S.child  = newName;
    localStorage.setItem('familyhub_member_' + S.uid, S.user);
  }
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({
    members, chores:S.chores, homework:S.homework, stars:S.stars,
  });
  panel.classList.remove('open');
  // Generate kid code if role changed to kid and no code yet
  const savedMember = members.find(m => m.name === newName);
  if (newRole === 'kid' && !savedMember?.joinCode) {
    const code = await createKidCode(S.uid, newName);
    const membersWithCode = members.map(m => m.name === newName ? { ...m, joinCode: code } : m);
    if (familyData) familyData.members = membersWithCode;
    await fbDb.collection('families').doc(S.uid).update({ members: membersWithCode });
  }
  // Sync school class index (fire-and-forget, don't block the UI)
  syncKidClass(newName, school, oldSchool, newRole).then(() => renderMgmtCommunity());
  renderMgmtMembers();
  renderAll();
}

async function mgmtRemoveMember(name) {
  if (!await _confirm(`הסר את ${name}?`, { danger: true, okLabel: 'הסר' })) return;
  const removedMember = getMembers().find(m => m.name === name);
  if (removedMember?.role === 'kid' && removedMember?.school)
    unregisterFromClass(name, removedMember.school); // fire-and-forget
  const members = getMembers().filter(m => m.name !== name);
  S.chores   = S.chores.filter(c   => c.assignee !== name);
  S.homework = S.homework
    .filter(h => h.scope==='class' || h.child !== name)
    .map(h => {
      if(h.scope!=='class')return h;
      const doneBy={...(h.doneBy||{})},doneAtBy={...(h.doneAtBy||{})};
      delete doneBy[name];delete doneAtBy[name];
      return {...h,doneBy,doneAtBy};
    });
  const stars = { ...S.stars }; delete stars[name];
  S.stars = stars;
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({ members, chores:S.chores, homework:S.homework, stars:S.stars });
  renderMgmtMembers();
  renderAll();
}

// ── School Index (autocomplete) ───────────
let _cachedCities  = null;
let _cachedSchools = {}; // { [normCityId]: string[] }

function normCityId(city) {
  return (city||'').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^\w\u0590-\u05FF]/g,'');
}
async function loadCities() {
  try {
    const snap = await fbDb.collection('schoolIndex').doc('cities_list').get();
    _cachedCities = snap.exists ? (snap.data().cities||[]) : [];
  } catch(e) { _cachedCities = []; }
}
async function loadSchoolsFor(city) {
  if (!city?.trim()) return;
  const key = normCityId(city);
  if (_cachedSchools[key]) return;
  try {
    const snap = await fbDb.collection('schoolIndex').doc('schools__'+key).get();
    _cachedSchools[key] = snap.exists ? (snap.data().schools||[]) : [];
  } catch(e) { _cachedSchools[key] = []; }
}
function isNewCity(city) {
  if (!city?.trim() || !_cachedCities) return false;
  const norm = city.trim().toLowerCase();
  return !_cachedCities.some(c => c.trim().toLowerCase() === norm);
}
function isNewSchool(city, schoolName) {
  if (!city?.trim() || !schoolName?.trim()) return false;
  const key = normCityId(city);
  const list = _cachedSchools[key];
  if (!list) return true; // not loaded yet = treat as new
  const norm = schoolName.trim().toLowerCase();
  return !list.some(s => s.trim().toLowerCase() === norm);
}

async function requestNewSchool(kidName, school, requestType) {
  // requestType: 'city' | 'school'
  // Check if a pending request already exists for this city+school combo
  const q = await fbDb.collection('pendingSchools')
    .where('city', '==', school.city.trim())
    .where('schoolName', '==', (school.name||'').trim())
    .where('status', '==', 'pending')
    .get();

  const newFamily = { familyUid: S.uid, kidName, school };
  let pendingId;

  if (!q.empty) {
    // Add this family to existing pending request
    pendingId = q.docs[0].id;
    await fbDb.collection('pendingSchools').doc(pendingId).update({
      pendingFamilies: firebase.firestore.FieldValue.arrayUnion(newFamily),
    });
  } else {
    // Create new pending request
    const newReq = {
      type: requestType,
      city: school.city.trim(),
      schoolName: (school.name || '').trim(),
      requestedBy: { familyUid: S.uid, firstName: S.user, familyName: familyData?.familyName || '' },
      pendingFamilies: [newFamily],
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (requestType === 'city') {
      newReq.cityStatus   = 'pending';
      newReq.schoolStatus = 'pending';
    }
    const ref = await fbDb.collection('pendingSchools').add(newReq);
    pendingId = ref.id;
  }

  // Mark schoolPending on the member in the family doc
  const members = getMembers().map(m => {
    if (m.name !== kidName) return m;
    return { ...m, schoolPending: pendingId };
  });
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({ members });

  // Show inline toast to the parent (not a bell notification)
  const toastMsg = requestType === 'city'
    ? `הבקשה לאישור עיר ובית ספר חדשים נשלחה — נודיע לך בהקדם 👍`
    : `הבקשה לאישור בית ספר חדש נשלחה — נודיע לך בהקדם 👍`;
  showToast(toastMsg, 'info');

  return pendingId;
}

async function updateSchoolIndex(city, schoolName) {
  if (!city?.trim()) return;
  try {
    await fbDb.collection('schoolIndex').doc('cities_list').set(
      { cities: firebase.firestore.FieldValue.arrayUnion(city.trim()) }, { merge:true }
    );
    if (schoolName?.trim()) {
      await fbDb.collection('schoolIndex').doc('schools__'+normCityId(city)).set(
        { schools: firebase.firestore.FieldValue.arrayUnion(schoolName.trim()) }, { merge:true }
      );
    }
    _cachedCities = null;
    _cachedSchools = {};
  } catch(e) { console.error('updateSchoolIndex:', e); }
}

// ── Custom autocomplete ───────────────────
let _acInput   = null;
let _acOptions = [];
let _acHideTimer = null;

function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({length: a.length + 1}, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

function showAc(inputEl, options) {
  _acInput = inputEl;
  const q = (inputEl.value || '').trim();
  const ql = q.toLowerCase();

  // Exact substring matches
  const exact = q
    ? options.filter(o => o.toLowerCase().includes(ql))
    : options;

  // Fuzzy fallback — only when substring finds nothing and query ≥ 3 chars
  let fuzzy = [];
  if (q.length >= 3 && exact.length === 0) {
    const threshold = Math.max(1, Math.floor(q.length / 5));
    fuzzy = options
      .map(o => ({ o, d: levenshtein(ql, o.toLowerCase()) }))
      .filter(x => x.d <= threshold)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map(x => x.o);
  }

  const dd = el('acDropdown');
  if (!exact.length && !fuzzy.length) { hideAc(); return; }

  const exactSlice = exact.slice(0, 8);
  _acOptions = [...exactSlice, ...fuzzy];

  const r = inputEl.getBoundingClientRect();
  Object.assign(dd.style, {
    display:'block', position:'fixed', zIndex:'1100',
    top: (r.bottom + 3) + 'px',
    left: r.left + 'px',
    width: r.width + 'px',
  });

  const isHe = getLang() === 'he';
  const didYouMean = isHe ? 'האם התכוונת ל...' : 'Did you mean…';
  dd.innerHTML = [
    ...exactSlice.map((o, i) =>
      `<div class="ac-item" onmousedown="acPick(${i})">${esc(o)}</div>`),
    ...(fuzzy.length ? [
      `<div style="font-size:11px;color:#a0aec0;padding:5px 14px 2px;font-weight:700;border-top:1px solid #f0f4ff">${didYouMean}</div>`,
      ...fuzzy.map((o, i) =>
        `<div class="ac-item" style="color:#6a11cb" onmousedown="acPick(${exactSlice.length + i})">🔍 ${esc(o)}</div>`)
    ] : []),
  ].join('');
}
function hideAc() {
  el('acDropdown').style.display = 'none';
  _acInput = null;
}
function scheduleHideAc() {
  _acHideTimer = setTimeout(hideAc, 150);
}
function acPick(i) {
  if (_acHideTimer) { clearTimeout(_acHideTimer); _acHideTimer = null; }
  const val = _acOptions[i];
  if (_acInput && val !== undefined) {
    _acInput.value = val;
    _acInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  hideAc();
}
async function onDeleteCityAc(inp) {
  if (!_cachedCities) await loadCities();
  showAc(inp, _cachedCities || []);
}
async function onDeleteSchoolCityAc(inp) {
  if (!_cachedCities) await loadCities();
  showAc(inp, _cachedCities || []);
  const schoolInp = el('deleteSchoolNameInput');
  if (schoolInp) {
    schoolInp.disabled = !inp.value.trim();
    if (!inp.value.trim()) schoolInp.value = '';
  }
  if (inp.value.trim()) loadSchoolsFor(inp.value);
}
async function onDeleteSchoolNameAc(inp) {
  const city = el('deleteSchoolCityInput')?.value.trim();
  if (city) await loadSchoolsFor(city);
  showAc(inp, city ? (_cachedSchools[normCityId(city)] || []) : []);
}
async function onCityAc(inp, idx) {
  if (!_cachedCities) await loadCities();
  showAc(inp, _cachedCities || []);
  const hasCity = !!inp.value.trim();
  const schoolInp = el('mgmtEditSchoolName_' + idx);
  if (schoolInp) {
    schoolInp.disabled = !hasCity;
    if (!hasCity) { schoolInp.value = ''; setClassFieldsEnabled(idx, false); }
  }
  if (hasCity) loadSchoolsFor(inp.value);
}
async function onSchoolAc(inp, idx) {
  const city = el('mgmtEditCity_' + idx)?.value.trim();
  if (city) await loadSchoolsFor(city);
  showAc(inp, city ? (_cachedSchools[normCityId(city)] || []) : []);
  setClassFieldsEnabled(idx, !!inp.value.trim());
}
function setClassFieldsEnabled(idx, enabled) {
  const grade    = el('mgmtEditGrade_'    + idx);
  const classNum = el('mgmtEditClassNum_' + idx);
  if (grade)    grade.disabled    = !enabled;
  if (classNum) classNum.disabled = !enabled;
  // Do NOT clear values when disabling — if the parent changes school name,
  // the previously chosen grade/classNum should be preserved.
}

// ── School Community ─────────────────────
function classIdFor(school) {
  if (!school?.city?.trim() || !school?.grade) return null;
  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  return [n(school.city), n(school.name||''), school.grade, n(school.classNum||'')].join('~~');
}
function gradeIdFor(school) {
  if (!school?.city?.trim() || !school?.grade) return null;
  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  return [n(school.city), n(school.name||''), school.grade].join('~~');
}
function schoolIdFor(school) {
  if (!school?.city?.trim() || !school?.name?.trim()) return null;
  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  return [n(school.city), n(school.name)].join('~~');
}
function classMemberId(familyUid, kidName) {
  return familyUid + '__' + kidName.replace(/[^a-z0-9א-תA-Z\u0590-\u05FF]/gi,'_');
}

async function registerInClass(kidName, school) {
  const classId = classIdFor(school);
  if (!classId || !S.uid) return;
  await fbDb.collection('schoolClasses').doc(classId).set(
    { city:school.city, schoolName:school.name||'', grade:school.grade, classNum:school.classNum||'' },
    { merge: true }
  );
  const kidMember = getMembers().find(m => m.name === kidName);
  const memberDoc = {
    kidName, familyUid: S.uid,
    familyName: familyData?.familyName || '',
    addedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (kidMember?.gender) memberDoc.gender = kidMember.gender;
  if (kidMember?.dob)    memberDoc.dob    = kidMember.dob;
  await fbDb.collection('schoolClasses').doc(classId)
    .collection('members').doc(classMemberId(S.uid, kidName)).set(memberDoc);
  updateSchoolIndex(school.city, school.name); // fire-and-forget
}

async function unregisterFromClass(kidName, school) {
  const classId = classIdFor(school);
  if (!classId || !S.uid) return;
  await fbDb.collection('schoolClasses').doc(classId)
    .collection('members').doc(classMemberId(S.uid, kidName)).delete();
}

async function syncKidClass(kidName, newSchool, oldSchool, newRole) {
  // Check for new city/school FIRST — before classIdFor, which requires grade.
  // A parent can change school name without grade being re-entered.
  if (newRole === 'kid' && newSchool?.city) {
    if (!_cachedCities) await loadCities();
    await loadSchoolsFor(newSchool.city);

    const cityNew   = isNewCity(newSchool.city);
    const schoolNew = newSchool.name && !cityNew && isNewSchool(newSchool.city, newSchool.name);

    if (cityNew || schoolNew) {
      const oldId = classIdFor(oldSchool);
      const newId = classIdFor(newSchool);
      if (oldId && oldId !== newId) await unregisterFromClass(kidName, oldSchool);
      await requestNewSchool(kidName, newSchool, cityNew ? 'city' : 'school');
      return;
    }
  }

  const oldId = classIdFor(oldSchool);
  const newId = classIdFor(newSchool);
  if (oldId && oldId !== newId) await unregisterFromClass(kidName, oldSchool);
  if (newRole === 'kid' && newId) {
    await registerInClass(kidName, newSchool);
  }
}

async function fetchClassmates(school) {
  const classId = classIdFor(school);
  if (!classId) return [];
  try {
    const snap = await fbDb.collection('schoolClasses').doc(classId).collection('members').get();
    return snap.docs.map(d => d.data()).filter(m => m.familyUid !== S.uid);
  } catch(e) { console.error('fetchClassmates:', e); return []; }
}

async function renderMgmtCommunity() {
  const container = el('mgmtCommunityList');
  if (!container) return;
  const kidsWithSchool = getKids()
    .map(name => getMembers().find(m => m.name === name))
    .filter(m => m?.school?.city && m?.school?.grade);
  if (!kidsWithSchool.length) {
    container.innerHTML = `<div class="empty">יש לשייך ילדים לבית ספר כדי לראות קהילה</div>`;
    return;
  }
  container.innerHTML = `<div class="empty" style="padding:8px">טוען...</div>`;
  const results = await Promise.all(kidsWithSchool.map(async kid => ({
    kid, classmates: await fetchClassmates(kid.school)
  })));
  container.innerHTML = results.map(({ kid, classmates }) => {
    const s = kid.school;
    const classLabel = [s.city, s.name, s.grade ? 'כיתה '+s.grade+(s.classNum?'\''+s.classNum:'') : ''].filter(Boolean).join(', ');
    return `<div class="comm-kid-block">
      <div class="comm-kid-header">
        <div style="width:34px;height:34px;border-radius:50%;overflow:hidden;background:#f0f4ff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${getAvatar(kid.name)}</div>
        <div class="comm-kid-info">
          <div class="comm-kid-name">${esc(kid.name)}</div>
          <div class="comm-class-label">🏫 ${esc(classLabel)}</div>
        </div>
        <span class="comm-count">${classmates.length} ${classmates.length===1?'משפחה':'משפחות'}</span>
      </div>
      ${classmates.length ? classmates.map(c=>`
        <div class="comm-mate">
          ${_ico.fam}
          <span class="comm-mate-family">${esc(c.familyName||'משפחה')}</span>
          <span class="comm-mate-kid">${esc(c.kidName)}</span>
        </div>`).join('')
      : `<div style="font-size:12px;color:#a0aec0;padding:4px 0">אין עדיין ילדים מהכיתה ב-FamilyHub</div>`}
    </div>`;
  }).join('');
}

// ── Community Tab ─────────────────────────
const _DEFAULT_EVENT_TYPES = [
  { id:'birthday',     icon:'🎂', labelHe:'יום הולדת', labelEn:'Birthday',    mDate:true,  mTime:true,  mLoc:true,  hasGenderFilter:true  },
  { id:'trip',         icon:'🚌', labelHe:'טיול',       labelEn:'Trip',        mDate:true,  mTime:false, mLoc:false, hasGenderFilter:false },
  { id:'party',        icon:'🎉', labelHe:'מסיבה',      labelEn:'Party',       mDate:true,  mTime:true,  mLoc:true,  hasGenderFilter:false },
  { id:'announcement', icon:'📢', labelHe:'הודעה',      labelEn:'Announcement',mDate:false, mTime:false, mLoc:false, hasGenderFilter:false },
  { id:'other',        icon:'📝', labelHe:'אחר',         labelEn:'Other',       mDate:false, mTime:false, mLoc:false, hasGenderFilter:false },
];
let _eventTypesCfg = _DEFAULT_EVENT_TYPES.map(t => ({ ...t, enabled:true }));
let _evtCfgLoaded  = false;

async function loadEventTypesCfg() {
  try {
    const snap = await fbDb.collection('appConfig').doc('eventTypes').get();
    if (snap.exists && Array.isArray(snap.data().types) && snap.data().types.length) {
      _eventTypesCfg = snap.data().types;
    }
  } catch(e) { /* keep defaults */ }
}
async function _saveEventTypesCfg() {
  await fbDb.collection('appConfig').doc('eventTypes').set({ types: _eventTypesCfg });
}
const getEventTypes = () => _eventTypesCfg.filter(t => t.enabled !== false);

function eventTypeIcon(type) { return _eventTypesCfg.find(e=>e.id===type)?.icon || '📝'; }
function eventTypeName(type) {
  const cfg = _eventTypesCfg.find(e => e.id === type);
  if (cfg) return getLang() === 'he' ? (cfg.labelHe || cfg.id) : (cfg.labelEn || cfg.labelHe || cfg.id);
  return type;
}
function classLabelFromId(classId) {
  if (!classId) return '';
  const [city, school, grade, classNum] = classId.split('~~');
  return `${school || city} · כיתה ${grade || ''}${classNum ? "'" + classNum : ''}`;
}

function classLabelFor(school) {
  if (!school) return '';
  const parts = [school.city, school.name];
  if (school.grade) parts.push('כיתה ' + school.grade + (school.classNum ? '\'' + school.classNum : ''));
  return parts.filter(Boolean).join(', ');
}
function isEventUpcoming(dateStr) {
  if (!dateStr) return true;
  const [y,m,d] = dateStr.split('-').map(Number);
  return new Date(y, m-1, d+1) >= new Date();
}
function timeAgo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2)   return 'עכשיו';
  if (mins < 60)  return `לפני ${mins} דק'`;
  const h = Math.floor(mins / 60);
  if (h < 24)     return `לפני ${h} שע'`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'אתמול';
  if (days < 7)   return `לפני ${days} ימים`;
  return fmtDate(d.toISOString().slice(0, 10));
}
function fmtEventDate(dateStr) {
  if (!dateStr) return '';
  const [y,m,d] = dateStr.split('-').map(Number);
  const date = new Date(y, m-1, d);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return t('todayLabel');
  if (diff === 1) return t('commTomorrow');
  if (diff > 1 && diff <= 14) return t('commInDays', diff);
  if (diff < 0 && diff >= -7) return t('commDaysAgo', -diff);
  return date.toLocaleDateString(t('locale'), {month:'short', day:'numeric'});
}

let _commCache       = {}; // { [classId]: { classmates, events, loadedAt, error? } }
let _commListeners   = {}; // { [classId]: [unsubFn, ...] }
let _commAddOpen     = {}; // { [classId]: bool }
let _commVisibleCids = []; // cids currently rendered in community tab
let _commVisibleKids = []; // { name, cid } for kids currently rendered

function _unsubCommClass(cid) {
  (_commListeners[cid] || []).forEach(fn => fn());
  delete _commListeners[cid];
}
function unsubscribeAllComm() {
  Object.keys(_commListeners).forEach(_unsubCommClass);
}

function subscribeToCommClass(cid) {
  if (_commListeners[cid]) return; // already subscribed
  _commListeners[cid] = [];
  const rerender = () => { if (S.tab === 'community') renderCommunity(); };

  // Live: class events
  _commListeners[cid].push(
    fbDb.collection('schoolClasses').doc(cid).collection('events').orderBy('date')
      .onSnapshot(snap => {
        if (!_commCache[cid]) return;
        _commCache[cid].events = snap.docs.map(d => ({id:d.id,...d.data(),scope:'class',scopeId:cid}));
        rerender();
      }, e => console.warn('[community] events:', e.code))
  );

  // Live: pending events (committee / admin)
  if (isCommitteeFor(cid)) {
    _commListeners[cid].push(
      fbDb.collection('schoolClasses').doc(cid).collection('pendingEvents')
        .onSnapshot(snap => {
          if (!_commCache[cid]) return;
          _commCache[cid].pendingEvents = snap.docs.map(d => ({id:d.id,...d.data()}))
            .sort((a,b) => (a.createdAt?.toMillis?.()||0) - (b.createdAt?.toMillis?.()||0));
          rerender();
        }, e => console.warn('[community] pendingEvents:', e.code))
    );
  }

  // Live: committee applications
  _commListeners[cid].push(
    fbDb.collection('committeeApplications')
      .where('classId','==',cid).where('status','==','pending')
      .onSnapshot(snap => {
        if (!_commCache[cid]) return;
        _commCache[cid].applications = snap.docs.map(d => ({id:d.id,...d.data()}));
        rerender();
      }, e => console.warn('[community] applications:', e.code))
  );

  // Live: class members — updates classmates list in real-time and notifies on new joins
  let _membersInited = false;
  _commListeners[cid].push(
    fbDb.collection('schoolClasses').doc(cid).collection('members')
      .onSnapshot(snap => {
        if (!_commCache[cid]) return;
        const all = snap.docs.map(d => d.data()).filter(m => m.familyUid !== S.uid);
        if (!_membersInited) {
          _membersInited = true;
          _commCache[cid].classmates = all;
        } else {
          const prev = new Set(_commCache[cid].classmates.map(m => m.familyUid + '__' + (m.kidName||m.name)));
          all.forEach(m => {
            const key = m.familyUid + '__' + (m.kidName||m.name);
            if (!prev.has(key)) {
              const isHe = getLang() === 'he';
              fbDb.collection('families').doc(S.uid).collection('notifications').add({
                type: 'class_member_joined',
                message: isHe
                  ? `🎉 ${esc(m.kidName||m.name)} הצטרף/ה לכיתה!`
                  : `🎉 ${esc(m.kidName||m.name)} joined the class!`,
                dismissed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              }).catch(() => {});
            }
          });
          _commCache[cid].classmates = all;
        }
        rerender();
      }, e => console.warn('[community] members:', e.code))
  );
}

async function loadCommunityData(kidsWithSchool) {
  // Only load classes that don't have an active listener yet
  const toLoad = kidsWithSchool.filter(kid => {
    const cid = classIdFor(kid.school);
    return cid && !_commListeners[cid];
  });
  await Promise.all(toLoad.map(async kid => {
    const cid = classIdFor(kid.school);
    const gid = gradeIdFor(kid.school);
    const sid = schoolIdFor(kid.school);
    const safeGet = q => q.get().catch(() => ({docs:[]}));
    try {
      // Fetch static data once (classmates, grade events, school events rarely change)
      const [membersSnap, gradeSnap, schoolSnap] = await Promise.all([
        fbDb.collection('schoolClasses').doc(cid).collection('members').get(),
        gid ? safeGet(fbDb.collection('schoolGrades').doc(gid).collection('events').orderBy('date')) : Promise.resolve({docs:[]}),
        sid ? safeGet(fbDb.collection('schools').doc(sid).collection('events').orderBy('date')) : Promise.resolve({docs:[]}),
      ]);
      const classmates = membersSnap.docs.map(d=>d.data()).filter(m=>m.familyUid!==S.uid);
      // Fetch classmate roles (admin-only)
      // classmateRoles: { [familyUid]: { parents: [{name, emoji, isCommittee}], legacyComm } }
      const classmateRoles = {};
      if (isAdmin() && classmates.length) {
        try {
          const raw = await fbFunctions.httpsCallable('getClassParents')({ classId: cid });
          Object.entries(raw.data || {}).forEach(([familyUid, info]) => {
            const legacyComm = info.legacyComm || [];
            classmateRoles[familyUid] = {
              parents: (info.parents || []).map(m => {
                const perMember = m.committeeClasses;
                const isComm = Array.isArray(perMember)
                  ? (perMember.includes(cid) || perMember.includes('*'))
                  : (legacyComm.includes(cid) || legacyComm.includes('*'));
                return { name: m.name, emoji: m.emoji || '👤', isCommittee: isComm };
              }),
              legacyComm,
            };
          });
        } catch(e) { console.warn('getClassParents failed:', e.message); }
      }
      // Seed cache with static data; live fields start empty — onSnapshot fills them
      _commCache[cid] = {
        classmates,
        classmateRoles,
        events:        [],
        gradeEvents:   gradeSnap.docs.map(d=>({id:d.id,...d.data(),scope:'grade',scopeId:gid})),
        schoolEvents:  schoolSnap.docs.map(d=>({id:d.id,...d.data(),scope:'school',scopeId:sid})),
        pendingEvents: [],
        applications:  [],
        loadedAt:      Date.now(),
      };
      // Start live listeners for events / pending events / applications
      subscribeToCommClass(cid);
    } catch(e) {
      console.error('loadCommunityData error (classId=' + cid + '):', e);
      _commCache[cid] = { classmates:[], classmateRoles:{}, events:[], gradeEvents:[], schoolEvents:[], pendingEvents:[], applications:[], loadedAt:Date.now(), error: e.code||e.message };
    }
  }));
}

function scopeBadge(scope) {
  if (!scope || scope === 'class') return ''; // class is the default — no badge needed
  if (scope === 'grade')  return `<span class="scope-badge scope-grade">${t('commScopeGrade')}</span>`;
  if (scope === 'school') return `<span class="scope-badge scope-school">${t('commScopeSchool')}</span>`;
  return '';
}
// Colored initial avatar for posters from other families
function _authorAvatar(name) {
  const palette = ['#6C8CFF','#FFB86B','#6DD3A0','#f093fb','#fa709a','#4facfe','#f9d423','#667eea'];
  const color = palette[(name||'?').charCodeAt(0) % palette.length];
  const letter = (name||'?')[0].toUpperCase();
  return `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:${color}22;color:${color};font-size:18px;font-weight:800;border-radius:50%">${letter}</span>`;
}

function renderPostCard(ev, cid) {
  const cache    = _commCache[cid] || {};
  const canDel   = isParent() && ev.postedBy?.familyUid === S.uid;
  const sid      = ev.scopeId || cid;
  const scope    = ev.scope || 'class';
  const author   = personFullName(ev.postedBy) || 'הורה';
  // Poster's child: look up by familyUid in classmates
  const classmate = cache.classmates?.find(c => c.familyUid === ev.postedBy?.familyUid);
  const kidName   = classmate?.kidName || '';
  const ago      = timeAgo(ev.createdAt);
  const avatarHtml   = ev.postedBy?.familyUid === S.uid
    ? getAvatar(ev.postedBy.firstName)
    : _authorAvatar(ev.postedBy?.firstName || '?');

  const scopeTag = scopeBadge(scope);
  return `<div class="post-card" data-ev-id="${ev.id}">
    <div class="post-card-header">
      <div class="post-card-avatar">${avatarHtml}</div>
      <div class="post-card-meta">
        <div class="post-card-author">${esc(author)}</div>
        ${kidName ? `<div class="post-card-child">${esc(kidName)}</div>` : ''}
        <div class="post-card-sub">${eventTypeIcon(ev.type)} ${esc(classLabelFromId(cid))}${ago ? ' · ' + ago : ''}${scopeTag ? ' ' + scopeTag : ''}</div>
      </div>
      ${canDel ? `<button class="post-card-del" onclick="deleteClassEvent('${scope}','${sid}','${ev.id}')">×</button>` : ''}
    </div>
    <div class="post-card-body">
      <div class="post-card-title">${esc(ev.title)}</div>
      ${ev.location ? `<div class="post-card-location">${_ico.pin} ${esc(ev.location)}</div>` : ''}
      ${ev.note ? `<div class="post-card-note">${esc(ev.note)}</div>` : ''}
      ${ev.payboxUrl ? `<a class="paybox-btn" href="${esc(ev.payboxUrl)}" target="_blank" rel="noopener noreferrer">${t('commPayNow')}</a>` : ''}
    </div>
    ${ev.date || ev.time ? `<div class="post-card-date">${ev.date ? '📅 ' + fmtEventDate(ev.date) : ''}${ev.time ? (ev.date ? ' · ' : '') + '🕐 ' + ev.time : ''}</div>` : ''}
    <div class="post-card-reactions">
      ${_reactionBtns(ev, scope, sid)}
    </div>
  </div>`;
}

const _REACTIONS = [
  { key: 'thumbsUp', emoji: '👍' },
  { key: 'heart',    emoji: '❤️' },
  { key: 'party',    emoji: '🎉' },
];

function _reactionBtns(ev, scope, sid) {
  const readOnly = isKid() && _isOwner(); // parent switched to kid view — not a real kid account
  return _REACTIONS.map(r => {
    // backward compat: treat likedBy as heart
    const arr = r.key === 'heart'
      ? [...(ev.reactions?.heart || []), ...(ev.likedBy || [])]
        .filter((v, i, a) => a.indexOf(v) === i)  // dedupe
      : (ev.reactions?.[r.key] || []);
    const active = arr.includes(S.uid);
    const count  = arr.length;
    return `<button class="post-reaction${active ? ' post-reaction-active' : ''}${readOnly ? ' post-reaction-readonly' : ''}"
      data-reaction="${r.key}"
      ${readOnly ? '' : `onclick="toggleReaction('${scope}','${sid}','${ev.id}','${r.key}')"`}>
      <span class="post-reaction-emoji">${r.emoji}</span>${count ? `<span class="post-reaction-count">${count}</span>` : ''}
    </button>`;
  }).join('');
}

async function toggleReaction(scope, scopeId, evId, reactionKey) {
  if (isKid() && _isOwner()) return; // parent viewing as kid — read-only
  const collName = scope === 'grade' ? 'schoolGrades' : scope === 'school' ? 'schools' : 'schoolClasses';
  const ref = fbDb.collection(collName).doc(scopeId).collection('events').doc(evId);
  const allCached = Object.values(_commCache).flatMap(c => [...(c.events||[]),...(c.gradeEvents||[]),...(c.schoolEvents||[])]);
  const ev = allCached.find(e => e.id === evId);
  if (!ev) return;

  if (!ev.reactions) ev.reactions = {};

  // Find which reaction (if any) the user already voted for
  const prevKey = _REACTIONS.map(r => r.key).find(k => {
    const a = k === 'heart'
      ? [...(ev.reactions?.heart || []), ...(ev.likedBy || [])].filter((v,i,arr) => arr.indexOf(v) === i)
      : (ev.reactions?.[k] || []);
    return a.includes(S.uid);
  }) || null;

  const active = prevKey === reactionKey; // tapping own current reaction → deselect

  // Optimistic update — mutate cache immediately
  // Remove from previous reaction key (if different)
  if (prevKey && prevKey !== reactionKey) {
    if (!ev.reactions[prevKey]) ev.reactions[prevKey] = [];
    ev.reactions[prevKey] = ev.reactions[prevKey].filter(u => u !== S.uid);
    if (prevKey === 'heart') ev.likedBy = (ev.likedBy || []).filter(u => u !== S.uid);
  }
  // Toggle on the tapped key
  if (!ev.reactions[reactionKey]) ev.reactions[reactionKey] = [];
  if (active) {
    ev.reactions[reactionKey] = ev.reactions[reactionKey].filter(u => u !== S.uid);
    if (reactionKey === 'heart') ev.likedBy = (ev.likedBy || []).filter(u => u !== S.uid);
  } else {
    if (!ev.reactions[reactionKey].includes(S.uid))
      ev.reactions[reactionKey] = [...ev.reactions[reactionKey], S.uid];
  }

  // Re-render just the reactions row for this card + animate the tapped button
  const cardEl = document.querySelector(`.post-card[data-ev-id="${evId}"]`);
  if (cardEl) {
    const row = cardEl.querySelector('.post-card-reactions');
    if (row) {
      row.innerHTML = _reactionBtns(ev, scope, scopeId);
      const btn = row.querySelector(`[data-reaction="${reactionKey}"]`);
      if (btn && !active) {
        btn.classList.add('post-reaction-bounce');
        btn.addEventListener('animationend', () => btn.classList.remove('post-reaction-bounce'), { once: true });
      }
    }
  }

  // Sync to Firestore in background
  try {
    const update = {};
    // Remove from old reaction key in Firestore
    if (prevKey && prevKey !== reactionKey) {
      update[`reactions.${prevKey}`] = firebase.firestore.FieldValue.arrayRemove(S.uid);
      if (prevKey === 'heart') update.likedBy = firebase.firestore.FieldValue.arrayRemove(S.uid);
    }
    // Add or remove the tapped key
    update[`reactions.${reactionKey}`] = active
      ? firebase.firestore.FieldValue.arrayRemove(S.uid)
      : firebase.firestore.FieldValue.arrayUnion(S.uid);
    if (reactionKey === 'heart' && active && (ev.likedBy || []).includes(S.uid))
      update.likedBy = firebase.firestore.FieldValue.arrayRemove(S.uid);
    await ref.update(update);
  } catch(e) { console.error('toggleReaction:', e); }
}

function filterClassmates(cid, q) {
  const list = el('commMatesList_' + cid);
  if (!list) return;
  const term = q.trim().toLowerCase();
  list.querySelectorAll('.comm-mate').forEach(row => {
    row.style.display = (!term || (row.dataset.name||'').includes(term)) ? '' : 'none';
  });
}

function renderCommCard(kid) {
  const cid    = classIdFor(kid.school);
  const cache  = _commCache[cid] || { classmates:[], classmateRoles:{}, events:[], gradeEvents:[], schoolEvents:[], pendingEvents:[], applications:[] };
  const addOpen = _commAddOpen[cid];

  const allEvs = [...(cache.events||[]), ...(cache.gradeEvents||[]), ...(cache.schoolEvents||[])]
    .filter(e => matchesGenderFilter(e, kid.name));
  const _cutoff = new Date(); _cutoff.setDate(_cutoff.getDate() - 14);
  const _today  = new Date().toISOString().slice(0,10);
  const upcoming = allEvs.filter(e => {
    if (!e.date) return true;
    const [ey,em,ed] = e.date.split('-').map(Number);
    return new Date(ey, em-1, ed) >= _cutoff;
  }).sort((a,b) => {
    const af = !a.date || a.date >= _today, bf = !b.date || b.date >= _today;
    if (af !== bf) return af ? -1 : 1;        // upcoming before past
    return (a.date||'').localeCompare(b.date||'');  // both asc
  });

  return `<div class="card" id="commCard_${cid}">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:#f0f4ff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${getAvatar(kid.name)}</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:900;color:#1a202c">${esc(kid.name)}</div>
        <div style="font-size:11px;color:#718096;font-weight:600">🏫 ${esc(classLabelFor(kid.school))}</div>
      </div>
      <button onclick="refreshCommunity()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#c8d3e8;padding:4px;line-height:1" title="רענן">↻</button>
    </div>

    ${isCommitteeFor(cid) && !isAdmin() ? `<div style="text-align:end;margin:-4px 0 8px"><button class="comm-leave-btn" onclick="leaveCommittee('${cid}')">${t('commLeaveCommittee')}</button></div>` : ''}

    ${upcoming.length
      ? `<div class="post-feed">${upcoming.map(ev=>renderPostCard(ev,cid)).join('')}</div>`
      : `<div class="post-feed-empty">${t('commNoEvents')}</div>`}

    ${(() => {
      if (!isCommitteeFor(cid) || !cache.pendingEvents?.length) return '';
      const activePend  = cache.pendingEvents.filter(ev => !ev.date || isEventUpcoming(ev.date));
      const expiredPend = cache.pendingEvents.filter(ev => ev.date && !isEventUpcoming(ev.date));
      return activePend.length ? `
        <div class="comm-section-label" style="margin-top:16px;display:flex;align-items:center;gap:8px">
          <span>${t('pendingSection')}</span>
          <span class="comm-count">${activePend.length}</span>
        </div>
        ${activePend.map(ev => `<div class="pending-event-row">
          <div class="pending-event-info">
            <span class="pending-event-title">${esc(ev.title)}</span>
            <span class="pending-event-meta">${esc(personFullName(ev.postedBy))}${ev.date ? ' · ' + fmtEventDate(ev.date) : ''}</span>
          </div>
          <div class="pending-event-actions">
            <button class="pending-approve-btn" onclick="approveEvent('${cid}','${ev.id}')">${t('pendingApprove')}</button>
            <button class="pending-reject-btn"  onclick="rejectEvent('${cid}','${ev.id}')">${t('pendingReject')}</button>
          </div>
        </div>`).join('')}` : '';
    })()}

    ${(() => {
  const apps = cache.applications || [];
  if (!apps.length && (isCommitteeFor(cid) || isAdmin())) return '';
  if (!apps.length && !isCommitteeFor(cid)) {
    // Show apply button if this parent hasn't applied yet and isn't committee for this class
    if (!isParent() || isCommitteeFor(cid)) return '';
    return `<button class="apply-committee-btn" onclick="applyForCommittee('${cid}')">${t('commApplyCommittee')}</button>`;
  }
  const myApp = apps.find(a => a.applicantUid === S.uid);
  const otherApps = apps.filter(a => a.applicantUid !== S.uid);
  const canApply = isParent() && !isCommitteeFor(cid) && !myApp;
  let html = `<div class="comm-section-label" style="margin-top:16px">${t('commApplicationsTitle')}</div>`;
  if (myApp) {
    const pct = Math.min(100, Math.round((myApp.voteCount||0)/15*100));
    const exp = myApp.expiresAt?.toDate ? fmtDate(myApp.expiresAt.toDate().toISOString().slice(0,10)) : '';
    html += `<div class="application-row">
      <div class="application-info">
        <div class="application-name">✋ ${t('commMyApplication')}</div>
        <div class="application-meta">${myApp.voteCount||0}/15 תמיכות${exp ? ' · ' + t('commApplicationExpires',exp) : ''}</div>
        <div class="application-progress"><div class="application-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <button class="comm-cancel-app-btn" onclick="cancelCommitteeApplication('${myApp.id}','${cid}')">${t('commCancelApplication')}</button>
    </div>`;
  }
  otherApps.forEach(app => {
    const voted = (app.votes||[]).includes(S.uid);
    const pct = Math.min(100, Math.round((app.voteCount||0)/15*100));
    const exp = app.expiresAt?.toDate ? fmtDate(app.expiresAt.toDate().toISOString().slice(0,10)) : '';
    const approveBtn = isAdmin() ? `<button class="pending-approve-btn" onclick="adminApproveApplication('${app.id}','${cid}')" style="font-size:11px">${t('commApplicationApprove')}</button><button class="pending-reject-btn" onclick="adminDenyApplication('${app.id}','${cid}')" style="font-size:11px">${t('commApplicationDeny')}</button>` : '';
    const voteBtn = !isAdmin() && !isCommitteeFor(cid) && isParent()
      ? (voted
          ? `<span style="font-size:12px;font-weight:700;color:var(--gray-400)">${t('commApplicationVoted')}</span>`
          : `<button class="pending-approve-btn" onclick="voteForApplication('${app.id}','${cid}')">${t('commApplicationVote')}</button>`)
      : '';
    html += `<div class="application-row">
      <div class="application-info">
        <div class="application-name">👤 ${esc(app.applicantName)}</div>
        <div class="application-meta">${app.voteCount||0}/15 תמיכות${exp ? ' · ' + t('commApplicationExpires',exp) : ''}</div>
        <div class="application-progress"><div class="application-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">${approveBtn}${voteBtn}</div>
    </div>`;
  });
  if (canApply) {
    html += `<button class="apply-committee-btn" onclick="applyForCommittee('${cid}')">${t('commApplyCommittee')}</button>`;
  }
  return html;
})()}

    ${isParent() ? `
    <div class="comm-add-form${addOpen?' open':''}" id="commAddForm_${cid}">
      <div style="font-size:13px;font-weight:900;color:#1a202c;margin-bottom:10px">➕ ${t('commNewEvent')}</div>
      <input class="auth-input" id="commEvTitle_${cid}" placeholder="${t('commEventTitle')}" style="margin-bottom:6px" oninput="this.classList.remove('input-error');el('commEvError_${cid}').style.display='none'">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <input type="date" class="auth-input" id="commEvDate_${cid}" style="margin-bottom:0;width:100%" onchange="this.classList.remove('input-error');el('commEvError_${cid}').style.display='none'">
          <div id="commEvDateHint_${cid}" style="display:none;font-size:11px;color:var(--gray-400);font-weight:600;margin-top:3px;padding-right:2px">תאריך אופציונלי לסוג זה</div>
        </div>
        <input type="time" class="auth-input" id="commEvTime_${cid}" style="flex:0 0 110px;margin-bottom:0" onchange="this.classList.remove('input-error');el('commEvError_${cid}').style.display='none'">
      </div>
      <div style="margin-bottom:6px">
        <div id="commEvTypeDd_${cid}" style="width:100%"></div>
        <select id="commEvType_${cid}" style="display:none" onchange="onCommEvTypeChange('${cid}')">
          ${getEventTypes().map(et=>`<option value="${et.id}">${et.icon} ${eventTypeName(et.id)}</option>`).join('')}
        </select>
      </div>
      <div id="commEvGenderWrap_${cid}" style="margin-bottom:6px;display:${(getEventTypes()[0]?.hasGenderFilter) ? '' : 'none'}">
        <div style="font-size:12px;font-weight:700;color:#718096;margin-bottom:6px">מי מוזמן?</div>
        <div style="display:flex;gap:8px">
          <label style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;cursor:pointer"><input type="radio" name="commEvGender_${cid}" value="all"   checked> כולם</label>
          <label style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;cursor:pointer"><input type="radio" name="commEvGender_${cid}" value="boys">  👦 בנים בלבד</label>
          <label style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;cursor:pointer"><input type="radio" name="commEvGender_${cid}" value="girls"> 👧 בנות בלבד</label>
        </div>
      </div>
      ${canPublishDirectly(cid) ? `
      <div style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
        <span style="font-size:12px;font-weight:700;color:#718096;white-space:nowrap">${t('commScopeLabel')}:</span>
        <select class="auth-input" id="commEvScope_${cid}" style="flex:1">
          <option value="class">🏫 ${t('commScopeClass')}</option>
          <option value="grade">📚 ${t('commScopeGrade')}</option>
          <option value="school">🏛 ${t('commScopeSchool')}</option>
        </select>
      </div>` : `<input type="hidden" id="commEvScope_${cid}" value="class">`}
      <input class="auth-input" id="commEvLocation_${cid}" placeholder="📍 מיקום (אופציונלי)" style="margin-bottom:6px" oninput="this.classList.remove('input-error');el('commEvError_${cid}').style.display='none'">
      <input class="auth-input" id="commEvNote_${cid}" placeholder="${t('commEventNote')}" style="margin-bottom:6px">
      <input class="auth-input" id="commEvPaybox_${cid}" placeholder="${t('commEventPaybox')}" style="margin-bottom:10px" type="url" dir="ltr">
      <div id="commEvError_${cid}" style="display:none;font-size:12px;color:var(--error);font-weight:700;margin-bottom:8px;padding:6px 10px;background:var(--error-bg);border-radius:8px"></div>
      <div style="display:flex;gap:8px">
        <button class="auth-btn-main" style="flex:1;padding:10px" onclick="submitClassEvent('${cid}')">${t('commPost')}</button>
        <button class="auth-btn-back" style="flex:1;padding:10px" onclick="toggleCommAddForm('${cid}')">ביטול</button>
      </div>
    </div>
` : ''}

    <div class="comm-section-label" style="margin-top:16px;display:flex;align-items:center;gap:8px">
      <span>👥 ${t('commClassmates')}</span>
      <span class="comm-count">${cache.classmates.length}</span>
    </div>
    ${cache.classmates.length ? `
    <input class="comm-search" placeholder="🔍 חיפוש..." oninput="filterClassmates('${cid}',this.value)">` : ''}
    <div id="commMatesList_${cid}">
    ${cache.error
      ? `<div style="font-size:12px;color:#e53e3e;padding:6px 0;font-weight:700">⚠ שגיאת Firestore: ${esc(cache.error)}<br><span style="opacity:0.6;font-weight:600">יש לעדכן את חוקי האבטחה ב-Firebase Console</span></div>`
      : cache.classmates.length
        ? cache.classmates.map(c => {
            const familyInfo = (cache.classmateRoles||{})[c.familyUid] || { parents: [] };
            const anyComm = familyInfo.parents.some(p => p.isCommittee)
              || (familyInfo.legacyComm||[]).includes(cid);
            return `<div class="comm-mate" data-name="${esc((c.kidName+' '+(c.familyName||'')).toLowerCase())}">
              ${_ico.fam}
              <span class="comm-mate-name">${esc(c.kidName)} ${esc(c.familyName||'')}</span>
              ${anyComm ? `<span class="role-badge-committee">${t('roleCommittee')}</span>` : ''}
            </div>`;
          }).join('')
        : `<div style="font-size:12px;color:#a0aec0;padding:4px 0;font-weight:600">אין עדיין ילדים מהכיתה ב-FamilyHub</div>`}
    </div>
  </div>`;
}

async function renderCommunity() {
  const container = el('communityContent');
  if (!container) return;
  const commChipsEl = el('communityChips');
  if (commChipsEl) { commChipsEl.innerHTML = _kidChipsHtml(); _applyChipsSpread('communityChips'); }

  const filteredKids = (S.filter !== 'All' && getKids().includes(S.filter))
    ? [S.filter] : getKids();
  const kidsWithSchool = filteredKids
    .map(name => getMembers().find(m => m.name === name))
    .filter(m => m?.school?.city && m?.school?.grade);

  if (!kidsWithSchool.length) {
    container.innerHTML = `<div class="card"><div class="empty" style="padding:20px 0;text-align:center">
      <div style="font-size:40px;margin-bottom:10px">🏫</div>
      <div style="font-weight:800;color:#4a5568;font-size:15px">${t('commNoSchool')}</div>
      <div style="font-size:12px;color:var(--primary-500);margin-top:4px;cursor:pointer;font-weight:700;text-decoration:underline" onclick="closeMenu();openMgmt()">${t('commNoSchoolHint')}</div>
    </div></div>`;
    return;
  }

  // Show skeleton while loading
  const needsLoad = kidsWithSchool.some(kid => {
    const cid = classIdFor(kid.school);
    return !cid || !_commCache[cid];
  });
  if (needsLoad) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:24px;color:#a0aec0;font-size:14px;font-weight:700">⏳ טוען...</div>`;
  }

  await loadCommunityData(kidsWithSchool);
  renderHomeUpcoming();
  _commVisibleCids = kidsWithSchool.map(k => classIdFor(k.school)).filter(Boolean);
  _commVisibleKids = kidsWithSchool
    .map(k => ({ name: k.name, cid: classIdFor(k.school) }))
    .filter(k => k.cid);
  const adminBtn = (isCommittee() && !isKid())
    ? `<div id="commPendingBanner"></div>`
    : '';
  const fabHtml = isParent() ? `
    <div class="comm-fab-wrap" id="commFabWrap">
      <div class="comm-fab-picker" id="commFabPicker"></div>
      <button class="comm-fab${Object.values(_commAddOpen).some(v=>v)?' comm-fab-open':''}" id="commFab" onclick="commFabClick()" title="${t('commAddEvent')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>` : '';
  container.innerHTML = adminBtn + kidsWithSchool.map(kid => renderCommCard(kid)).join('') + fabHtml;
  const bannerEl = el('commPendingBanner');
  if (bannerEl) _renderCommPendingBanner(bannerEl);
  kidsWithSchool.forEach(kid => {
    const cid = classIdFor(kid.school);
    if (cid) _buildSoftDd('commEvTypeDd_' + cid, 'commEvType_' + cid);
  });
}

function onCommEvTypeChange(cid) {
  const type    = el('commEvType_' + cid)?.value;
  const typeCfg = _eventTypesCfg.find(t => t.id === type) || {};
  const genderWrap = el('commEvGenderWrap_' + cid);
  if (genderWrap) genderWrap.style.display = typeCfg.hasGenderFilter ? '' : 'none';
  const dateHint = el('commEvDateHint_' + cid);
  if (dateHint) dateHint.style.display = typeCfg.mDate ? 'none' : '';
}

function matchesGenderFilter(ev, kidName) {
  if (!ev.genderFilter || ev.genderFilter === 'all') return true;
  // Poster always sees their own event
  if (ev.postedBy?.familyUid === S.uid) return true;
  const needed = ev.genderFilter === 'boys' ? 'boy' : 'girl';
  if (kidName) {
    const m = getMembers().find(m => m.name === kidName);
    return m?.gender === needed;
  }
  return getKids().some(name => getMembers().find(m => m.name === name)?.gender === needed);
}

function toggleCommAddForm(cid) {
  _commAddOpen[cid] = !_commAddOpen[cid];
  const form = el('commAddForm_' + cid);
  form?.classList.toggle('open', !!_commAddOpen[cid]);
  if (_commAddOpen[cid]) {
    setTimeout(() => {
      _buildSoftDd('commEvTypeDd_' + cid, 'commEvType_' + cid);
      form?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
  // Sync FAB icon
  const fab = el('commFab');
  if (fab) fab.classList.toggle('comm-fab-open', Object.values(_commAddOpen).some(v => v));
}

function commFabClick() {
  if (!_commVisibleCids.length) return;
  // If any form already open — close it and hide picker
  const openCid = _commVisibleCids.find(c => _commAddOpen[c]);
  if (openCid) { toggleCommAddForm(openCid); _commHidePicker(); return; }
  // Single kid — open directly
  if (_commVisibleKids.length <= 1) {
    toggleCommAddForm(_commVisibleCids[0]);
    return;
  }
  // Multiple kids — toggle picker
  const picker = el('commFabPicker');
  if (!picker) return;
  if (picker.classList.contains('open')) { _commHidePicker(); return; }
  picker.innerHTML = _commVisibleKids.map(k =>
    `<button class="comm-fab-pick-item" onclick="_commPickKid('${k.cid}')">
      <span class="comm-fab-pick-avatar">${getAvatar(k.name)}</span>
      <span>${esc(k.name)}</span>
    </button>`
  ).join('');
  picker.classList.add('open');
  el('commFab')?.classList.add('comm-fab-open');
  setTimeout(() => {
    document.addEventListener('click', function _h(e) {
      if (!el('commFabWrap')?.contains(e.target)) { _commHidePicker(); document.removeEventListener('click', _h); }
    });
  }, 0);
}

function _commPickKid(cid) {
  _commHidePicker();
  toggleCommAddForm(cid);
}

function _commHidePicker() {
  const picker = el('commFabPicker');
  if (picker) picker.classList.remove('open');
  if (!_commVisibleCids.some(c => _commAddOpen[c]))
    el('commFab')?.classList.remove('comm-fab-open');
}

async function submitClassEvent(cid) {
  const title      = el('commEvTitle_'  + cid)?.value.trim();
  const date       = el('commEvDate_'   + cid)?.value;
  const time       = el('commEvTime_'   + cid)?.value || '';
  const type       = el('commEvType_'   + cid)?.value || 'other';
  const scope      = el('commEvScope_'  + cid)?.value || 'class';
  const location   = el('commEvLocation_'+ cid)?.value.trim() || '';
  const note       = el('commEvNote_'   + cid)?.value.trim() || '';
  const payboxRaw  = el('commEvPaybox_' + cid)?.value.trim() || '';
  const payboxUrl  = payboxRaw && (payboxRaw.startsWith('http://') || payboxRaw.startsWith('https://')) ? payboxRaw : '';
  const typeCfg  = _eventTypesCfg.find(t => t.id === type) || {};
  const genderFilter = typeCfg.hasGenderFilter
    ? (document.querySelector(`input[name="commEvGender_${cid}"]:checked`)?.value || 'all')
    : 'all';
  const _errEl   = el('commEvError_'   + cid);
  const _titleEl = el('commEvTitle_'   + cid);
  const _dateEl  = el('commEvDate_'    + cid);
  const _locEl   = el('commEvLocation_'+ cid);
  const _timeEl  = el('commEvTime_'   + cid);
  const _showErr = (msg, fieldEl) => {
    if (_errEl) { _errEl.textContent = msg; _errEl.style.display = ''; }
    if (fieldEl) { fieldEl.classList.add('input-error'); fieldEl.focus(); }
  };
  if (!title)              { _showErr('יש להזין כותרת לאירוע', _titleEl);             return; }
  if (typeCfg.mDate && !date)     { _showErr('יש לבחור תאריך לסוג אירוע זה', _dateEl);  return; }
  if (typeCfg.mTime && !time)     { _showErr('יש להזין שעה לסוג אירוע זה', _timeEl);    return; }
  if (typeCfg.mLoc  && !location) { _showErr('יש להזין מיקום לסוג אירוע זה', _locEl);   return; }
  if (_errEl) _errEl.style.display = 'none';
  const docData = { title, date, type, note, scope,
    postedBy: { familyUid: S.uid, firstName: S.user, familyName: familyData?.familyName||'' },
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    genderFilter,
  };
  if (time) docData.time = time;
  if (location) docData.location = location;
  if (payboxUrl) docData.payboxUrl = payboxUrl;

  // Resolve target collection and document ID
  const kid = getKids().map(n=>getMembers().find(m=>m.name===n)).find(m=>classIdFor(m?.school)===cid);
  let collName = 'schoolClasses', docId = cid;
  if (scope === 'grade') { collName = 'schoolGrades'; docId = gradeIdFor(kid?.school) || cid; }
  if (scope === 'school') { collName = 'schools'; docId = schoolIdFor(kid?.school) || cid; }

  try {
    if (canPublishDirectly(cid)) {
      await fbDb.collection(collName).doc(docId).collection('events').add(docData);
    } else {
      // Regular parent: send to pending queue for committee/admin approval (class scope only)
      await fbDb.collection('schoolClasses').doc(cid).collection('pendingEvents').add({ ...docData, status: 'pending' });
      _alert(t('pendingSubmitted'));
    }
    _commAddOpen[cid] = false;
    // onSnapshot will update the cache and re-render automatically
  } catch(e) { console.error('submitClassEvent:', e); }
}

async function deleteClassEvent(scope, scopeId, eventId) {
  const collName = scope === 'grade' ? 'schoolGrades' : scope === 'school' ? 'schools' : 'schoolClasses';
  try {
    await fbDb.collection(collName).doc(scopeId).collection('events').doc(eventId).delete();
    if (scope !== 'class') {
      // grade/school events are static-fetched; force full reload
      unsubscribeAllComm(); _commCache = {};
      await renderCommunity();
    }
    // class events: onSnapshot handles the re-render automatically
  } catch(e) { console.error('deleteClassEvent:', e); }
}

async function approveEvent(cid, pendingId) {
  try {
    await fbFunctions.httpsCallable('approveEvent')({ cid, pendingId });
    await renderPendingPanel();
    // onSnapshot handles community re-render
  } catch(e) { console.error('approveEvent:', e); }
}

async function rejectEvent(cid, pendingId) {
  if (!await _confirm('לדחות את הבקשה?', { danger: true, okLabel: 'דחה' })) return;
  try {
    await fbFunctions.httpsCallable('rejectEvent')({ cid, pendingId });
    await renderPendingPanel();
    // onSnapshot handles community re-render
  } catch(e) { console.error('rejectEvent:', e); }
}

function openAdminPanel(showLog = true, historyOnly = false) {
  el('adminPanel').classList.remove('hidden');
  const logSection = el('adminLogSection');
  const settingsSection = el('adminSettingsSection');
  if (logSection) logSection.style.display = showLog ? '' : 'none';
  if (settingsSection) settingsSection.style.display = historyOnly ? 'none' : '';
  const titleEl = el('adminPanel').querySelector('.mgmt-header-title');
  if (titleEl) titleEl.textContent = historyOnly ? '📋 היסטוריית בקשות' : '⚙️ הגדרות מערכת';
  renderAdminPanel(showLog);
}
function closeAdminPanel() { el('adminPanel').classList.add('hidden'); }

// ── Feedback / Contact Admin ──────────────────────────────
const FEEDBACK_TOPICS = [
  { id:'improvement', label:'💡 הצעות לשיפור' },
  { id:'bug',         label:'🐛 דיווח על תקלה' },
  { id:'question',    label:'❓ שאלה' },
  { id:'praise',      label:'🌟 מחמאה' },
  { id:'other',       label:'💬 אחר' },
];
let _feedbackTopicVal = FEEDBACK_TOPICS[0].id;

function openFeedback() {
  el('feedbackPanel').classList.remove('hidden');
  el('feedbackForm').style.display = '';
  el('feedbackSuccess').style.display = 'none';
  el('feedbackError').style.display = 'none';
  el('feedbackText').value = '';
  _feedbackTopicVal = FEEDBACK_TOPICS[0].id;
  _renderFeedbackTopicDD();
  loadFeedbackHistory();
}

async function loadFeedbackHistory() {
  const wrap = el('feedbackHistory');
  if (!wrap) return;
  wrap.innerHTML = `<div style="margin-top:16px;border-top:1px solid var(--gray-100);padding-top:16px;display:flex;align-items:center;gap:10px;color:var(--gray-400)">
    <div class="fh-spinner" style="zoom:0.5;flex-shrink:0"></div>
    <span style="font-size:13px;font-weight:700">טוען פניות קודמות...</span>
  </div>`;
  try {
    const { data } = await fbFunctions.httpsCallable('getUserFeedbacks')();
    renderFeedbackHistory(data.msgs || []);
  } catch(e) {
    console.warn('loadFeedbackHistory:', e);
    wrap.innerHTML = '';
  }
}

function renderFeedbackHistory(msgs) {
  const wrap = el('feedbackHistory');
  if (!wrap) return;
  if (!msgs.length) { wrap.innerHTML = ''; return; }
  const fmtDate = ms => ms ? new Date(ms).toLocaleDateString('he-IL', { day:'numeric', month:'short', year:'numeric' }) : '';
  wrap.innerHTML = `
    <div style="border-top:1px solid var(--gray-100);margin-top:16px;padding-top:16px">
      <div style="font-size:12px;font-weight:800;color:var(--gray-400);margin-bottom:10px;letter-spacing:0.04em">הפניות שלי</div>
      ${msgs.map(m => `
        <div style="margin-bottom:12px;border:1px solid var(--gray-100);border-radius:var(--r-sm);overflow:hidden">
          <div style="padding:10px 12px;background:var(--gray-50)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:12px;font-weight:800;color:var(--gray-700)">${esc(m.topicLabel || m.topic)}</span>
              <span style="font-size:11px;color:var(--gray-400)">${fmtDate(m.createdAt)}</span>
            </div>
            <div style="font-size:13px;color:var(--gray-700);white-space:pre-wrap;line-height:1.5">${esc(m.text)}</div>
          </div>
          ${m.replied
            ? `<div style="padding:10px 12px;background:#f0fff4;border-top:1px solid #9ae6b4">
                 <div style="font-size:11px;font-weight:800;color:#276749;margin-bottom:4px">↩ תגובה מהמנהל · ${fmtDate(m.repliedAt)}</div>
                 <div style="font-size:13px;color:#276749;white-space:pre-wrap;line-height:1.5">${esc(m.replyText)}</div>
               </div>`
            : `<div style="padding:8px 12px;background:var(--surface);border-top:1px solid var(--gray-100)">
                 <span style="font-size:11px;color:var(--gray-400);font-weight:700">⏳ ממתינה לתגובה</span>
               </div>`
          }
        </div>`).join('')}
    </div>`;
}

function closeFeedback() { el('feedbackPanel').classList.add('hidden'); }

function _renderFeedbackTopicDD() {
  const wrap = el('ddFeedbackTopic');
  if (!wrap) return;
  wrap.style.cssText = 'position:relative';
  wrap.innerHTML = `
  <div onclick="_toggleFeedbackTopicDD(this)"
    style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1.5px solid var(--gray-200);border-radius:var(--r-sm);background:var(--surface);cursor:pointer;font-size:14px;font-weight:700">
    <span>${FEEDBACK_TOPICS.find(t=>t.id===_feedbackTopicVal)?.label || FEEDBACK_TOPICS[0].label}</span>
    <span style="font-size:10px;color:var(--gray-400)">▼</span>
  </div>
  <div style="display:none;position:absolute;top:calc(100% + 4px);inset-inline-start:0;inset-inline-end:0;background:var(--surface);border:1.5px solid var(--gray-200);border-radius:var(--r-sm);box-shadow:0 4px 12px rgba(0,0,0,.1);z-index:200;overflow:hidden">
    ${FEEDBACK_TOPICS.map(t=>`<div onclick="_pickFeedbackTopic('${t.id}')"
      style="padding:10px 14px;font-size:14px;font-weight:700;cursor:pointer;background:${t.id===_feedbackTopicVal?'var(--primary-50,#eff6ff)':'transparent'}">${t.label}</div>`).join('')}
  </div>`;
}

function _toggleFeedbackTopicDD(trigger) {
  const list = trigger.parentElement.children[1];
  list.style.display = list.style.display === 'none' ? '' : 'none';
}

function _pickFeedbackTopic(id) {
  _feedbackTopicVal = id;
  _renderFeedbackTopicDD();
}

async function sendFeedback() {
  const text = el('feedbackText').value.trim();
  const errEl = el('feedbackError');
  errEl.style.display = 'none';
  if (!text) {
    errEl.textContent = 'יש להזין הודעה לפני השליחה';
    errEl.style.display = '';
    el('feedbackText').focus();
    return;
  }
  const btn = el('feedbackPanel').querySelector('button.btn');
  const btnLabel = btn?.textContent || '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="fh-spinner" style="margin:0 auto"><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span></div>'; }
  try {
    await fbFunctions.httpsCallable('submitFeedback')({
      topic:      _feedbackTopicVal,
      topicLabel: FEEDBACK_TOPICS.find(t=>t.id===_feedbackTopicVal)?.label || '',
      text,
      senderName: S.user,
      familyName: familyData?.familyName || '',
    });
    el('feedbackForm').style.display = 'none';
    el('feedbackSuccess').style.display = '';
    loadFeedbackHistory();
  } catch(e) {
    errEl.textContent = 'שגיאה בשליחה: ' + (e.message || String(e));
    errEl.style.display = '';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
  }
}

const NOTIF_DEFAULTS = {
  committeeApplications: { expiryDays: 5, reminderHoursBeforeExpiry: 24, notifyOnDecision: true },
  pendingEvents:         { expiryDays: 7, reminderHoursBeforeExpiry: 24, notifyOnDecision: true },
};

async function loadNotifSettings() {
  try {
    const snap = await fbDb.collection('appConfig').doc('notifications').get();
    const data = snap.exists ? snap.data() : {};
    return {
      committeeApplications: { ...NOTIF_DEFAULTS.committeeApplications, ...(data.committeeApplications || {}) },
      pendingEvents:         { ...NOTIF_DEFAULTS.pendingEvents,         ...(data.pendingEvents || {}) },
    };
  } catch(e) { return NOTIF_DEFAULTS; }
}

function _renderNotifSettingsFromCfg(cfg) {
  const types = [
    { key: 'committeeApplications', label: '🗳️ מועמדויות לוועד' },
    { key: 'pendingEvents',         label: '📋 אירועים ממתינים לאישור' },
  ];
  el('adminNotifSettings').innerHTML = types.map(({ key, label }) => {
    const c = cfg[key];
    return `<div class="card" style="margin-bottom:12px;padding:12px">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">${label}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label style="font-size:13px;display:flex;align-items:center;gap:8px">
          תפוגה (ימים):
          <input type="number" min="1" max="365" value="${c.expiryDays}"
            id="notif_${key}_expiry" style="width:60px;padding:4px 8px;border:1px solid #d0d9e8;border-radius:6px;font-family:inherit">
        </label>
        <label style="font-size:13px;display:flex;align-items:center;gap:8px">
          תזכורת (שעות לפני תפוגה):
          <input type="number" min="1" max="720" value="${c.reminderHoursBeforeExpiry}"
            id="notif_${key}_reminder" style="width:60px;padding:4px 8px;border:1px solid #d0d9e8;border-radius:6px;font-family:inherit">
        </label>
        <label style="font-size:13px;display:flex;align-items:center;gap:8px">
          <input type="checkbox" id="notif_${key}_notify" ${c.notifyOnDecision ? 'checked' : ''}
            style="width:16px;height:16px">
          עדכן מגיש על החלטה
        </label>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="admin-btn" onclick="saveNotifSettings('${key}')" style="flex:1;padding:8px;font-size:13px">💾 שמור</button>
          <button class="admin-btn" onclick="nudgePendingNow('${key}')" style="flex:1;padding:8px;font-size:13px">🔔 שלח תזכורת עכשיו</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function renderNotifSettings() {
  _renderNotifSettingsFromCfg(await loadNotifSettings());
}

async function saveNotifSettings(key) {
  const expiryDays             = parseInt(el(`notif_${key}_expiry`)?.value) || NOTIF_DEFAULTS[key].expiryDays;
  const reminderHoursBeforeExpiry = parseInt(el(`notif_${key}_reminder`)?.value) || NOTIF_DEFAULTS[key].reminderHoursBeforeExpiry;
  const notifyOnDecision       = el(`notif_${key}_notify`)?.checked ?? true;
  try {
    await fbDb.collection('appConfig').doc('notifications').set(
      { [key]: { expiryDays, reminderHoursBeforeExpiry, notifyOnDecision } },
      { merge: true }
    );
    _adminPanelCache = null;
    _alert('הגדרות נשמרו');
  } catch(e) { _alert('שגיאה: ' + e.message); }
}

async function nudgePendingNow(type) {
  try {
    const nudge = fbFunctions.httpsCallable('nudgePending');
    const result = await nudge({ type });
    _alert(`נשלחו ${result.data.sent} תזכורות`);
  } catch(e) { _alert('שגיאה: ' + e.message); }
}

function _renderLeaderboardFromDays(days) {
  el('adminLeaderboardSettings').innerHTML = `
    <div class="card" style="margin-bottom:12px;padding:12px">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">🏆 לוח המובילים</div>
      <label style="font-size:13px;display:flex;align-items:center;gap:8px">
        מדידת פעילות ב-
        <input type="number" min="1" max="365" value="${days}" id="leaderboardDaysInput"
          style="width:60px;padding:4px 8px;border:1px solid #d0d9e8;border-radius:6px;font-family:inherit">
        הימים האחרונים
      </label>
      <button class="admin-btn" onclick="saveLeaderboardSettings()" style="margin-top:10px;padding:8px;font-size:13px;width:100%">💾 שמור</button>
    </div>`;
}

async function renderLeaderboardSettings() {
  const snap = await fbDb.collection('appConfig').doc('leaderboard').get().catch(() => null);
  _renderLeaderboardFromDays(snap?.exists ? (snap.data().days || 30) : 30);
}

async function saveLeaderboardSettings() {
  const days = parseInt(el('leaderboardDaysInput')?.value) || 30;
  try {
    await fbDb.collection('appConfig').doc('leaderboard').set({ days }, { merge: true });
    _adminPanelCache = null;
    _alert('הגדרות נשמרו');
  } catch(e) { _alert('שגיאה: ' + e.message); }
}

async function renderAdminMessages() {
  const wrap = el('adminMessages');
  if (!wrap) return;
  wrap.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px 0">טוען...</div>';
  try {
    const result = await fbFunctions.httpsCallable('getAdminMessages')();
    const msgs = result.data || [];
    if (!msgs.length) {
      wrap.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px 0">אין פניות עדיין</div>';
      return;
    }
    wrap.innerHTML = `<div class="card" style="padding:0;overflow:hidden">` +
      msgs.map((m, i) => {
        const ts = m.createdAt ? new Date(m.createdAt) : null;
        const dateStr = ts ? ts.toLocaleDateString('he-IL') + ' ' + ts.toLocaleTimeString('he-IL', { hour:'2-digit', minute:'2-digit' }) : '';
        const unread = m.read === false;
        return `<div id="adminMsg_${m.id}" style="padding:12px${i < msgs.length-1 ? ';border-bottom:1px solid var(--gray-100)' : ''}${unread ? ';background:var(--primary-50,#eff6ff)' : ''}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            ${unread ? `<span class="adminmsg-dot" style="width:8px;height:8px;border-radius:50%;background:var(--primary-500);flex-shrink:0;display:inline-block"></span>` : ''}
            <span style="font-size:13px;font-weight:900;color:var(--gray-900);flex:1">${esc(m.topicLabel || m.topic || '—')}</span>
            <span style="font-size:11px;color:var(--gray-400)">${dateStr}</span>
            ${unread ? `<button onclick="markAdminMsgRead('${m.id}',this)" style="font-size:11px;border:none;background:none;color:var(--primary-500);cursor:pointer;font-family:inherit;font-weight:700;padding:0;min-width:70px;text-align:end">סמן כנקרא</button>` : ''}
          </div>
          <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">${esc(m.senderName || '')}${m.familyName ? ' · ' + esc(m.familyName) : ''}</div>
          <div style="font-size:13px;color:var(--gray-700);white-space:pre-wrap;margin-bottom:8px">${esc(m.text || '')}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <button onclick="createChoreFromFeedback(${JSON.stringify(m.text||'').replace(/"/g,'&quot;')})" style="font-size:11px;border:none;background:var(--gray-100);color:var(--gray-600);cursor:pointer;font-family:inherit;font-weight:700;padding:4px 10px;border-radius:var(--r-pill)">🧹 צור משימה</button>
            ${m.replied
              ? `<span style="font-size:11px;color:#276749;font-weight:700">✅ נענה · ${esc(m.replyText||'')}</span>`
              : `<button id="adminReplyBtn_${m.id}" onclick="openReplyToFeedback('${m.id}')" style="font-size:11px;border:none;background:var(--primary-50,#eff6ff);color:var(--primary-600);cursor:pointer;font-family:inherit;font-weight:700;padding:4px 10px;border-radius:var(--r-pill)">💬 השב</button>`
            }
          </div>
          <div id="adminReplyForm_${m.id}" style="display:none;margin-top:8px">
            <textarea id="adminReplyText_${m.id}" rows="2" placeholder="כתוב תגובה לפונה..." style="width:100%;box-sizing:border-box;font-family:inherit;font-size:13px;border:1px solid var(--gray-200);border-radius:8px;padding:8px;resize:vertical"></textarea>
            <div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-top:4px">
              <div id="adminReplyErr_${m.id}" style="display:none;font-size:12px;color:var(--error);flex:1"></div>
              <button onclick="sendReplyToFeedback('${m.id}',this)" style="font-size:12px;border:none;background:var(--primary-500);color:white;cursor:pointer;font-family:inherit;font-weight:700;padding:5px 14px;border-radius:var(--r-pill)">שלח</button>
            </div>
          </div>
        </div>`;
      }).join('') + `</div>`;
  } catch(e) {
    wrap.innerHTML = `<div style="font-size:12px;color:var(--error);padding:8px 0">שגיאה: ${esc(e.message)}</div>`;
  }
}

async function markAdminMsgRead(id, btn) {
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="fh-spinner" style="zoom:0.45;display:inline-block;vertical-align:middle"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>'; }
  try {
    await fbFunctions.httpsCallable('markAdminMessageRead')({ msgId: id });
    const row = el('adminMsg_' + id);
    if (row) {
      row.style.background = '';
      row.querySelector('.adminmsg-dot')?.remove();
      row.querySelector('button[onclick*="markAdminMsgRead"]')?.remove();
    }
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'סמן כנקרא'; }
    console.error('markAdminMsgRead:', e);
  }
}

function openReplyToFeedback(id) {
  const form = el('adminReplyForm_' + id);
  if (!form) return;
  const isHidden = form.style.display === 'none';
  form.style.display = isHidden ? '' : 'none';
  if (isHidden) form.querySelector('textarea')?.focus();
}

async function sendReplyToFeedback(id, btn) {
  const textarea = el('adminReplyText_' + id);
  const text = textarea?.value?.trim();
  if (!text) { textarea?.focus(); return; }
  const errEl = el('adminReplyErr_' + id);
  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="fh-spinner" style="zoom:0.45;display:inline-block;vertical-align:middle"><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span></div>'; }
  try {
    await fbFunctions.httpsCallable('adminReplyToFeedback')({ msgId: id, replyText: text });
    const form = el('adminReplyForm_' + id);
    if (form) form.innerHTML = '<div style="font-size:12px;color:#276749;padding:4px 0;font-weight:700">✅ תגובה נשלחה</div>';
    const replyBtn = el('adminReplyBtn_' + id);
    if (replyBtn) { replyBtn.textContent = '✅ נענה'; replyBtn.disabled = true; replyBtn.style.opacity = '0.5'; }
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'שלח'; }
    if (errEl) { errEl.textContent = 'שגיאה: ' + (e.message || String(e)); errEl.style.display = ''; }
  }
}

function renderMaintenanceTools() {
  el('adminMaintenance').innerHTML = `
    <div class="card" style="margin-bottom:12px;padding:12px">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px">🔑 קודים אישיים לילדים</div>
      <div style="font-size:13px;color:#4a5568;margin-bottom:10px">הפק קודי הצטרפות אישיים לכל ילד שעדיין אין לו קוד (משפחות קיימות).</div>
      <button class="admin-btn" id="migrateKidCodesBtn" onclick="migrateKidCodes()" style="width:100%;padding:9px;font-size:13px">הפק קודים חסרים ◀</button>
      <div id="migrateKidCodesResult" style="font-size:12px;margin-top:8px;color:#276749"></div>
    </div>
    <div class="card" style="margin-bottom:12px;padding:12px">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px">👥 ניוד תפקידי ועד לפי כיתה</div>
      <div style="font-size:13px;color:#4a5568;margin-bottom:10px">המר משפחות עם <code>role:'committee'</code> ישן ל-<code>committeeClasses</code> לפי כיתות ילדיהן.</div>
      <button class="admin-btn" id="migrateCommitteeBtn" onclick="migrateCommitteeRoles()" style="width:100%;padding:9px;font-size:13px">נרמל תפקידי ועד ◀</button>
      <div id="migrateCommitteeResult" style="font-size:12px;margin-top:8px;color:#276749"></div>
    </div>
    <div class="card" style="margin-bottom:12px;padding:12px;border:1.5px solid var(--error-light,#fed7d7)">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:var(--error)">🏫 מחיקת עיר / בית ספר</div>
      <div style="font-size:12px;color:#718096;margin-bottom:10px">מוחק כיתות ורישומי ילדים — לא מוחק את הילדים עצמם.</div>

      <div style="border-bottom:1px solid var(--error-light,#fed7d7);padding-bottom:12px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">מחיקת עיר</div>
        <div style="font-size:12px;color:#718096;margin-bottom:8px">מוחק את כל בתי הספר, הכיתות ורישומי הילדים של העיר מהמערכת.</div>
        <input class="auth-input" id="deleteCityInput" placeholder="שם העיר" style="margin-bottom:8px;text-align:right" oninput="onDeleteCityAc(this)" onfocus="onDeleteCityAc(this)" onblur="scheduleHideAc()">
        <button class="admin-btn" id="deleteCityBtn" onclick="adminDeleteCity()" style="width:100%;padding:8px;font-size:13px;background:var(--error);color:#fff;border-color:var(--error)">מחק עיר ◀</button>
        <div id="deleteCityResult" style="font-size:12px;margin-top:6px"></div>
      </div>

      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">מחיקת בית ספר</div>
        <div style="font-size:12px;color:#718096;margin-bottom:8px">מוחק את כל הכיתות ורישומי הילדים של בית הספר.</div>
        <input class="auth-input" id="deleteSchoolCityInput" placeholder="שם העיר" style="margin-bottom:6px;text-align:right" oninput="onDeleteSchoolCityAc(this)" onfocus="onDeleteSchoolCityAc(this)" onblur="scheduleHideAc()">
        <input class="auth-input" id="deleteSchoolNameInput" placeholder="שם בית הספר" style="margin-bottom:8px;text-align:right" oninput="onDeleteSchoolNameAc(this)" onfocus="onDeleteSchoolNameAc(this)" onblur="scheduleHideAc()" disabled>
        <button class="admin-btn" id="deleteSchoolBtn" onclick="adminDeleteSchool()" style="width:100%;padding:8px;font-size:13px;background:var(--error);color:#fff;border-color:var(--error)">מחק בית ספר ◀</button>
        <div id="deleteSchoolResult" style="font-size:12px;margin-top:6px"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:12px;padding:12px;border:1.5px solid var(--error-light,#fed7d7)">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:var(--error)">🗑 פעולות מחיקה</div>
      <div style="font-size:11px;color:#718096;margin-bottom:10px">ה-UID שלך: <code style="user-select:all;background:#f7fafc;padding:1px 4px;border-radius:4px">${S.uid}</code> <button onclick="el('resetFamilyUidInput').value='${S.uid}';el('deleteFamilyUidInput').value='${S.uid}'" style="border:none;background:none;font-size:11px;color:var(--primary-500);cursor:pointer;padding:0;font-family:inherit;font-weight:700">← הכנס</button></div>

      <div style="border-bottom:1px solid var(--error-light,#fed7d7);padding-bottom:12px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">איפוס נתונים</div>
        <div style="font-size:12px;color:#718096;margin-bottom:8px">מוחק משימות, קניות, שיעורים, אירועים וכוכבים — שומר חברי משפחה וקוד.</div>
        <input class="auth-input" id="resetFamilyUidInput" placeholder="Family UID" style="margin-bottom:8px;font-family:monospace;font-size:13px">
        <button class="admin-btn" id="resetFamilyBtn" onclick="adminResetFamilyData()" style="width:100%;padding:8px;font-size:13px;background:var(--error);color:#fff;border-color:var(--error)">איפוס נתונים ◀</button>
        <div id="resetFamilyResult" style="font-size:12px;margin-top:6px"></div>
      </div>

      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">מחיקת משפחה מלאה</div>
        <div style="font-size:12px;color:#718096;margin-bottom:8px">מוחק את כל נתוני המשפחה, חשבון ה-Auth, קודי הצטרפות ורישום בכיתות. פעולה בלתי הפיכה לחלוטין.</div>
        <input class="auth-input" id="deleteFamilyUidInput" placeholder="Family UID" style="margin-bottom:8px;font-family:monospace;font-size:13px">
        <button class="admin-btn" id="deleteFamilyBtn" onclick="adminDeleteFamily()" style="width:100%;padding:8px;font-size:13px;background:#7b2020;color:#fff;border-color:#7b2020">מחיקה מלאה ◀</button>
        <div id="deleteFamilyResult" style="font-size:12px;margin-top:6px"></div>
      </div>
    </div>`;
}

async function migrateKidCodes() {
  const btn = el('migrateKidCodesBtn');
  const res = el('migrateKidCodesResult');
  btn.disabled = true;
  res.textContent = 'מריץ... (עשוי לקחת כמה שניות)';

  try {
    const fn = firebase.functions().httpsCallable('migrateKidCodes');
    const result = await fn();
    const { generated, skipped, errors } = result.data;
    res.textContent = `✓ הושלם: ${generated} קודים נוצרו, ${skipped} משפחות דולגו${errors ? ', ' + errors + ' שגיאות' : ''}.`;
  } catch(e) {
    res.textContent = 'שגיאה: ' + (e.message || String(e));
    console.error('migrateKidCodes:', e);
  } finally {
    btn.disabled = false;
  }
}

async function adminResetFamilyData() {
  const uid = el('resetFamilyUidInput').value.trim();
  const res = el('resetFamilyResult');
  const btn = el('resetFamilyBtn');
  if (!uid) { res.style.color = 'var(--error)'; res.textContent = 'יש להזין Family UID'; return; }
  if (!await _confirm(`למחוק את כל הנתונים של המשפחה ${uid}?\n\nפעולה זו בלתי הפיכה.`, { danger: true, okLabel: 'אפס נתונים' })) return;
  btn.disabled = true;
  res.style.color = '#718096';
  res.textContent = 'מאפס...';
  try {
    const result = await fbFunctions.httpsCallable('adminResetFamily')({ familyUid: uid });
    res.style.color = '#276749';
    res.textContent = `✓ הנתונים של "${result.data?.familyName || uid}" אופסו בהצלחה`;
    el('resetFamilyUidInput').value = '';
  } catch(e) {
    res.style.color = 'var(--error)';
    const msg = e?.details?.message || e?.message || String(e);
    res.textContent = 'שגיאה: ' + msg;
    console.error('adminResetFamilyData:', e);
  } finally {
    btn.disabled = false;
  }
}

async function adminDeleteCity() {
  const city = el('deleteCityInput').value.trim();
  const res  = el('deleteCityResult');
  const btn  = el('deleteCityBtn');
  if (!city) { res.style.color = 'var(--error)'; res.textContent = 'יש להזין שם עיר'; return; }
  if (!await _confirm(`למחוק את העיר "${city}" ואת כל בתי הספר והכיתות שלה?\n\nרישומי הילדים יוסרו, אך הילדים עצמם לא יימחקו.`, { danger: true, okLabel: 'מחק עיר' })) return;
  btn.disabled = true; res.style.color = '#718096'; res.textContent = 'מוחק...';
  try {
    const r = await fbFunctions.httpsCallable('adminDeleteCity')({ city });
    res.style.color = '#276749';
    res.textContent = `✓ העיר "${city}" נמחקה — ${r.data.classesDeleted} כיתות, ${r.data.kidsUnlinked} ילדים שוחררו`;
    el('deleteCityInput').value = '';
  } catch(e) {
    res.style.color = 'var(--error)';
    res.textContent = 'שגיאה: ' + (e?.details?.message || e?.message || String(e));
  } finally { btn.disabled = false; }
}

async function adminDeleteSchool() {
  const city       = el('deleteSchoolCityInput').value.trim();
  const schoolName = el('deleteSchoolNameInput').value.trim();
  const res = el('deleteSchoolResult');
  const btn = el('deleteSchoolBtn');
  if (!city || !schoolName) { res.style.color = 'var(--error)'; res.textContent = 'יש להזין עיר ושם בית ספר'; return; }
  if (!await _confirm(`למחוק את "${schoolName}" (${city}) ואת כל הכיתות שלו?\n\nרישומי הילדים יוסרו, אך הילדים עצמם לא יימחקו.`, { danger: true, okLabel: 'מחק בית ספר' })) return;
  btn.disabled = true; res.style.color = '#718096'; res.textContent = 'מוחק...';
  try {
    const r = await fbFunctions.httpsCallable('adminDeleteSchool')({ city, schoolName });
    res.style.color = '#276749';
    res.textContent = `✓ "${schoolName}" נמחק — ${r.data.classesDeleted} כיתות, ${r.data.kidsUnlinked} ילדים שוחררו`;
    el('deleteSchoolCityInput').value = ''; el('deleteSchoolNameInput').value = '';
  } catch(e) {
    res.style.color = 'var(--error)';
    res.textContent = 'שגיאה: ' + (e?.details?.message || e?.message || String(e));
  } finally { btn.disabled = false; }
}

async function adminDeleteFamily() {
  const uid = el('deleteFamilyUidInput').value.trim();
  const res = el('deleteFamilyResult');
  const btn = el('deleteFamilyBtn');
  if (!uid) { res.style.color = 'var(--error)'; res.textContent = 'יש להזין Family UID'; return; }
  if (uid === S.uid) { res.style.color = 'var(--error)'; res.textContent = 'לא ניתן למחוק את המשפחה הנוכחית'; return; }
  if (!await _confirm(`למחוק לצמיתות את המשפחה ${uid}?\n\nכל הנתונים, חשבון Auth, קודי הצטרפות ורישום בכיתות יימחקו.\n\nפעולה זו בלתי הפיכה לחלוטין.`, { danger: true, okLabel: 'מחק לצמיתות' })) return;
  btn.disabled = true;
  res.style.color = '#718096';
  res.textContent = 'מוחק...';
  try {
    const result = await fbFunctions.httpsCallable('adminDeleteFamily')({ familyUid: uid });
    res.style.color = '#276749';
    res.textContent = `✓ המשפחה "${result.data?.familyName || uid}" נמחקה בהצלחה`;
    el('deleteFamilyUidInput').value = '';
  } catch(e) {
    res.style.color = 'var(--error)';
    const msg = e?.details?.message || e?.message || String(e);
    res.textContent = 'שגיאה: ' + msg;
    console.error('adminDeleteFamily:', e);
  } finally {
    btn.disabled = false;
  }
}

function createChoreFromFeedback(text) {
  closeMessageCenter();
  switchTab('chores');
  setTimeout(() => {
    const inp = el('newChoreText');
    if (!inp) return;
    inp.value = text;
    inp.style.height = inp.scrollHeight + 'px';
    inp.focus();
    inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
}

async function migrateCommitteeRoles() {
  const btn = el('migrateCommitteeBtn');
  const res = el('migrateCommitteeResult');
  btn.disabled = true;
  res.textContent = 'מריץ... (עשוי לקחת כמה שניות)';

  try {
    const fn = firebase.functions().httpsCallable('migrateCommitteeRoles');
    const result = await fn();
    const { migrated, skipped, errors } = result.data;
    res.textContent = `✓ הושלם: ${migrated} משפחות עודכנו, ${skipped} דולגו${errors ? ', ' + errors + ' שגיאות' : ''}.`;
  } catch(e) {
    res.textContent = 'שגיאה: ' + (e.message || String(e));
    console.error('migrateCommitteeRoles:', e);
  } finally {
    btn.disabled = false;
  }
}

function renderShoppingHistorySettings() {
  const ttl = getShoppingHistoryTtlDays();
  el('adminShoppingHistorySettings').innerHTML = `
    <div style="padding:8px 0">
      <div style="font-size:13px;color:#4a5568;margin-bottom:8px">כמה ימים לשמור היסטוריית קניות (0 = ללא הגבלה)</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:nowrap">
        <input type="number" min="0" max="365" value="${ttl}" id="adminHistoryTtlInput"
          style="width:72px;text-align:center;border:1.5px solid #e2e8f0;border-radius:8px;padding:6px;font-size:14px;font-family:inherit">
        <span style="font-size:13px;color:#4a5568;line-height:1">ימים</span>
        <button class="admin-btn" onclick="adminSaveHistoryTtl()" style="padding:6px 14px;font-size:13px;line-height:1;margin-bottom:0">שמור</button>
        <span id="adminHistoryTtlMsg" style="font-size:12px;color:#38a169;min-width:40px"></span>
      </div>
    </div>`;
}

async function adminSaveHistoryTtl() {
  const val = parseInt(el('adminHistoryTtlInput').value, 10);
  if (isNaN(val) || val < 0) return;
  await saveShoppingHistoryTtl(val);
  const msg = el('adminHistoryTtlMsg');
  if (msg) { msg.textContent = 'נשמר ✓'; setTimeout(() => { msg.textContent = ''; }, 2000); }
}

let _adminPanelCache = null;
const _ADMIN_CACHE_TTL = 120_000; // 2 minutes

function _adminLogHtml(combined) {
  const items = isAdmin() ? combined : combined.filter(entry => {
    if (entry._type === 'expired') return isCommitteeFor(entry.classId || '');
    return entry.actionBy?.familyUid === S.uid;
  });
  if (!items.length) return '<div style="font-size:13px;color:#a0aec0;padding:6px 0">אין היסטוריה עדיין</div>';
  return items.map(entry => {
    if (entry._type === 'expired') {
      return `<div class="admin-log-row" style="opacity:0.6">
        <div class="admin-log-title">
          <span class="admin-log-badge" style="background:#f3f4f6;color:#6b7280">⏱ פג תוקף</span>${esc(entry.title||'')}
        </div>
        <div class="admin-log-meta">הוגש על ידי: ${esc(personFullName(entry.postedBy)||'?')} · תאריך: ${entry.date ? fmtEventDate(entry.date) : '?'}</div>
        <div class="admin-log-meta">כיתה: ${esc(classLabelFromId(entry.classId||''))}</div>
      </div>`;
    }
    const approved = entry.action === 'approved';
    const dt = entry.actionAt?.toDate ? entry.actionAt.toDate().toLocaleString('he-IL') : '';
    return `<div class="admin-log-row">
      <div class="admin-log-title">
        <span class="admin-log-badge ${approved ? 'approved' : 'rejected'}">${approved ? '✓ אושר' : '✕ נדחה'}</span>${esc(entry.eventTitle)}
      </div>
      <div class="admin-log-meta">הוגש על ידי: ${esc(personFullName(entry.submittedBy)||'?')} · ${approved ? 'אושר' : 'נדחה'} על ידי: ${esc(personFullName(entry.actionBy)||'?')} · ${dt}</div>
      <div class="admin-log-meta">כיתה: ${esc(classLabelFromId(entry.classId||''))}</div>
    </div>`;
  }).join('');
}

async function _fetchAdminPanelData() {
  const [logSnap, expiredSnap, notifSnap, lbSnap] = await Promise.all([
    fbDb.collection('adminLog').orderBy('actionAt', 'desc').limit(100).get(),
    fbDb.collectionGroup('pendingEvents').get(),
    fbDb.collection('appConfig').doc('notifications').get().catch(() => null),
    fbDb.collection('appConfig').doc('leaderboard').get().catch(() => null),
  ]);
  const log = logSnap.docs.map(d => ({ _type: 'log', ...d.data() }));
  const expiredPending = expiredSnap.docs
    .map(d => ({ _type: 'expired', id: d.id, classId: d.ref.parent.parent.id, ...d.data() }))
    .filter(ev => ev.date && !isEventUpcoming(ev.date));
  const sortKey = e => e._type === 'log'
    ? (e.actionAt?.toDate?.() || new Date(0)).getTime()
    : new Date(e.date || 0).getTime();
  const combined = [...log, ...expiredPending].sort((a, b) => sortKey(b) - sortKey(a));
  const notifData = notifSnap?.exists ? notifSnap.data() : {};
  const notifCfg = {
    committeeApplications: { ...NOTIF_DEFAULTS.committeeApplications, ...(notifData.committeeApplications || {}) },
    pendingEvents:         { ...NOTIF_DEFAULTS.pendingEvents,         ...(notifData.pendingEvents || {}) },
  };
  const lbDays = lbSnap?.exists ? (lbSnap.data().days || 30) : 30;
  return { combined, notifCfg, lbDays, ts: Date.now() };
}

function _applyAdminPanelCache(data, showLog) {
  if (showLog) el('adminLogList').innerHTML = _adminLogHtml(data.combined);
  _renderNotifSettingsFromCfg(data.notifCfg);
  _renderLeaderboardFromDays(data.lbDays);
  renderShoppingHistorySettings();
  renderMaintenanceTools();
  renderAdminEventTypes();
}

function renderAdminEventTypes() {
  const container = el('adminEventTypes');
  if (!container) return;
  const mFields = [['mDate','תאריך'],['mTime','שעה'],['mLoc','מיקום']];
  const chkStyle = 'display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer';
  const inp = 'width:100%;box-sizing:border-box;padding:7px 10px;border:1.5px solid var(--gray-200);border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;background:var(--surface)';
  container.innerHTML = `
    <div class="card" style="padding:0;margin-bottom:8px;overflow:hidden">
      ${_eventTypesCfg.map((t, i) => `
        <div style="padding:12px${i < _eventTypesCfg.length - 1 ? ';border-bottom:1px solid var(--gray-100)' : ''}">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <input id="evtIcon_${i}" value="${esc(t.icon)}" maxlength="2"
              style="width:42px;flex-shrink:0;text-align:center;font-size:20px;border:1.5px solid var(--gray-200);border-radius:8px;padding:5px 2px;font-family:inherit;background:var(--surface)">
            <input id="evtLabelHe_${i}" value="${esc(t.labelHe)}" placeholder="שם בעברית"
              style="${inp};text-align:right">
          </div>
          <div style="margin-bottom:8px">
            <input id="evtLabelEn_${i}" value="${esc(t.labelEn)}" placeholder="English name" dir="ltr"
              style="${inp}">
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;background:var(--gray-50);border-radius:8px;padding:8px 10px">
            <span style="font-size:11px;font-weight:800;color:var(--gray-400);width:100%;margin-bottom:2px">שדות חובה</span>
            ${mFields.map(([key,lbl]) => `
              <label style="${chkStyle}">
                <input type="checkbox" id="evt_${key}_${i}" ${t[key] ? 'checked' : ''} style="width:15px;height:15px">
                ${lbl}
              </label>`).join('')}
            <label style="${chkStyle}">
              <input type="checkbox" id="evtGender_${i}" ${t.hasGenderFilter ? 'checked' : ''} style="width:15px;height:15px">
              פילטר בנים/בנות
            </label>
            <label style="${chkStyle};margin-right:auto">
              <input type="checkbox" id="evtEnabled_${i}" ${t.enabled !== false ? 'checked' : ''} style="width:15px;height:15px">
              פעיל
            </label>
          </div>
          <div style="display:flex;gap:8px">
            <button class="admin-btn" onclick="saveEventTypeRow(${i})" style="flex:1;padding:6px;font-size:12px">💾 שמור</button>
            <button onclick="deleteEventType('${esc(t.id)}')" style="padding:6px 12px;background:var(--error-bg);color:var(--error);border:none;border-radius:var(--r-sm);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer">🗑</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="card" style="padding:12px">
      <div style="font-size:13px;font-weight:900;color:var(--gray-900);margin-bottom:10px">➕ הוסף סוג אירוע</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <input id="newEvtIcon" maxlength="2" placeholder="📝"
          style="width:42px;flex-shrink:0;text-align:center;font-size:20px;border:1.5px solid var(--gray-200);border-radius:8px;padding:5px 2px;font-family:inherit;background:var(--surface)">
        <input id="newEvtLabelHe" placeholder="שם בעברית"
          style="${inp};text-align:right">
      </div>
      <div style="margin-bottom:10px">
        <input id="newEvtLabelEn" placeholder="English name" dir="ltr" style="${inp}">
      </div>
      <button class="admin-btn" onclick="addEventType()" style="width:100%;padding:8px">+ הוסף</button>
    </div>`;
}

async function saveEventTypeRow(i) {
  const t = _eventTypesCfg[i];
  if (!t) return;
  t.icon            = el(`evtIcon_${i}`)?.value.trim()    || t.icon;
  t.labelHe         = el(`evtLabelHe_${i}`)?.value.trim() || t.labelHe;
  t.labelEn         = el(`evtLabelEn_${i}`)?.value.trim() || t.labelEn;
  t.enabled         = el(`evtEnabled_${i}`)?.checked ?? true;
  t.mDate           = el(`evt_mDate_${i}`)?.checked ?? false;
  t.mTime           = el(`evt_mTime_${i}`)?.checked ?? false;
  t.mLoc            = el(`evt_mLoc_${i}`)?.checked  ?? false;
  t.hasGenderFilter = el(`evtGender_${i}`)?.checked ?? false;
  try {
    await _saveEventTypesCfg();
    showToast((getLang()==='he' ? 'נשמר ✓' : 'Saved ✓'), 'success');
  } catch(e) { showToast('שגיאה בשמירה', 'error'); }
}

async function deleteEventType(id) {
  const t = _eventTypesCfg.find(x => x.id === id);
  const name = t ? (getLang()==='he' ? t.labelHe : t.labelEn) : id;
  if (!await _confirm(`למחוק את סוג האירוע "${name}"?`, { okLabel: 'מחק' })) return;
  _eventTypesCfg = _eventTypesCfg.filter(x => x.id !== id);
  try {
    await _saveEventTypesCfg();
    renderAdminEventTypes();
  } catch(e) { showToast('שגיאה בשמירה', 'error'); }
}

async function addEventType() {
  const icon    = el('newEvtIcon')?.value.trim()    || '📝';
  const labelHe = el('newEvtLabelHe')?.value.trim() || '';
  const labelEn = el('newEvtLabelEn')?.value.trim() || '';
  if (!labelHe) { el('newEvtLabelHe')?.classList.add('input-error'); el('newEvtLabelHe')?.focus(); return; }
  const id = 'custom_' + Date.now();
  _eventTypesCfg.push({ id, icon, labelHe, labelEn: labelEn || labelHe, mDate:false, mTime:false, mLoc:false, hasGenderFilter:false, enabled:true });
  try {
    await _saveEventTypesCfg();
    renderAdminEventTypes();
  } catch(e) { showToast('שגיאה בשמירה', 'error'); }
}

async function renderAdminPanel(showLog = true) {
  const cached = _adminPanelCache;
  if (cached) {
    // Render immediately from cache — user sees content with no wait
    _applyAdminPanelCache(cached, showLog);
    // Refresh in background if stale
    if (Date.now() - cached.ts > _ADMIN_CACHE_TTL) {
      _fetchAdminPanelData().then(data => {
        _adminPanelCache = data;
        if (!el('adminPanel')?.classList.contains('hidden')) {
          _applyAdminPanelCache(data, showLog);
        }
      }).catch(e => console.error('adminPanel bg refresh:', e));
    }
    return;
  }
  // First load — show spinner, fetch all 4 in parallel, cache and render
  if (showLog) el('adminLogList').innerHTML = '<div style="color:#a0aec0;font-size:13px;padding:8px 0">טוען...</div>';
  try {
    const data = await _fetchAdminPanelData();
    _adminPanelCache = data;
    _applyAdminPanelCache(data, showLog);
  } catch(e) {
    console.error('renderAdminPanel:', e);
    if (showLog) el('adminLogList').innerHTML = `<div style="color:#e53e3e;font-size:12px">${e.message}</div>`;
  }
}

async function setCommitteeRole(familyUid, memberName, grant, cid) {
  try {
    const famDoc = await fbDb.collection('families').doc(familyUid).get();
    if (!famDoc.exists) return;
    const fd = famDoc.data();
    // Update per-member committeeClasses
    const updatedMembers = (fd.members||[]).map(m => {
      if (m.name !== memberName || m.role !== 'parent') return m;
      // Seed from legacy family-level if member has no per-member data yet
      const current = m.committeeClasses ?? (
        (fd.committeeClasses||[]).includes(cid) || fd.role === 'committee' ? [cid] : []
      );
      const newClasses = grant
        ? [...new Set([...current, cid])]
        : current.filter(c => c !== cid);
      return { ...m, committeeClasses: newClasses };
    });
    // Rebuild family-level union so Cloud Functions still work
    const familyCommitteeClasses = [...new Set(
      updatedMembers.flatMap(m => m.committeeClasses || [])
    )];
    await fbDb.collection('families').doc(familyUid).update({
      members: updatedMembers,
      committeeClasses: familyCommitteeClasses,
    });
    // classmateRoles are static-fetched; force full reload so badges update
    unsubscribeAllComm(); _commCache = {};
    await renderCommunity();
  } catch(e) { console.error('setCommitteeRole:', e); }
}

// Fallback for families whose member list couldn't be read — sets committee at family level
async function setCommitteeRoleLegacy(familyUid, grant, cid) {
  try {
    const update = grant
      ? { committeeClasses: firebase.firestore.FieldValue.arrayUnion(cid) }
      : { committeeClasses: firebase.firestore.FieldValue.arrayRemove(cid) };
    await fbDb.collection('families').doc(familyUid).update(update);
    unsubscribeAllComm(); _commCache = {};
    await renderCommunity();
  } catch(e) { console.error('setCommitteeRoleLegacy:', e); }
}

async function applyForCommittee(cid) {
  if (!await _confirm('להגיש מועמדות לוועד ההורים?', { okLabel: 'הגש' })) return;
  try {
    await fbDb.collection('committeeApplications').add({
      applicantUid: S.uid,
      applicantName: myFullName(),
      classId: cid,
      appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      votes: [],
      voteCount: 0,
    });
    // onSnapshot handles re-render
  } catch(e) { console.error('applyForCommittee:', e); }
}

async function cancelCommitteeApplication(appId, cid) {
  if (!await _confirm('לבטל את המועמדות לוועד?', { danger: true, okLabel: 'בטל מועמדות' })) return;
  try {
    await fbDb.collection('committeeApplications').doc(appId).delete();
    // onSnapshot handles re-render
  } catch(e) { console.error('cancelCommitteeApplication:', e); }
}

async function leaveCommittee(cid) {
  if (!await _confirm('לעזוב את ועד ההורים של כיתה זו?', { danger: true, okLabel: 'עזוב ועד' })) return;
  try {
    await setCommitteeRole(S.uid, S.user, false, cid);
    // setCommitteeRole handles re-render
  } catch(e) { console.error('leaveCommittee:', e); }
}

async function voteForApplication(appId, cid) {
  try {
    const ref = fbDb.collection('committeeApplications').doc(appId);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if (!doc.exists || doc.data().status !== 'pending') return;
      const votes = doc.data().votes || [];
      if (votes.includes(S.uid)) return;
      const newVotes = [...votes, S.uid];
      const newCount = newVotes.length;
      const update = { votes: newVotes, voteCount: newCount };
      if (newCount >= 15) {
        update.status = 'approved';
        update.decisionReason = 'vote';
        update.decidedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      tx.update(ref, update);
    });
    // onSnapshot handles re-render
  } catch(e) { console.error('voteForApplication:', e); }
}

async function adminApproveApplication(appId, cid) {
  try {
    await fbFunctions.httpsCallable('adminApproveApplication')({ appId });
    await renderPendingPanel();
    // onSnapshot handles community re-render
  } catch(e) { console.error('adminApproveApplication:', e); }
}

async function adminDenyApplication(appId, cid) {
  if (!await _confirm('לדחות מועמדות זו?', { danger: true, okLabel: 'דחה' })) return;
  try {
    await fbFunctions.httpsCallable('adminDenyApplication')({ appId });
    await renderPendingPanel();
    // onSnapshot handles community re-render
  } catch(e) { console.error('adminDenyApplication:', e); }
}

async function approveSchoolPart(id, part) {
  try {
    if (part === 'city') {
      const docSnap = await fbDb.collection('pendingSchools').doc(id).get();
      if (docSnap.exists) await updateSchoolIndex(docSnap.data().city, null);
    }
    await fbFunctions.httpsCallable('resolveSchoolPart')({ id, part, action: 'approved', adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('approveSchoolPart:', e); _alert('שגיאה: ' + e.message); }
}

async function denySchoolPart(id, part) {
  try {
    await fbFunctions.httpsCallable('resolveSchoolPart')({ id, part, action: 'denied', adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('denySchoolPart:', e); _alert('שגיאה: ' + e.message); }
}

async function approveSchool(id) {
  try {
    const docSnap = await fbDb.collection('pendingSchools').doc(id).get();
    if (!docSnap.exists) return;
    const req = docSnap.data();
    await updateSchoolIndex(req.city, req.schoolName);
    // registerInClass is now handled by the Cloud Function with the correct familyUid
    await fbFunctions.httpsCallable('approveSchoolRequest')({ id, adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('approveSchool:', e); _alert('שגיאה: ' + e.message); }
}

async function denySchool(id) {
  try {
    await fbFunctions.httpsCallable('denySchoolRequest')({ id, adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('denySchool:', e); _alert('שגיאה: ' + e.message); }
}

async function refreshCommunity() {
  unsubscribeAllComm();
  _commCache = {};
  await renderCommunity();
}

// ── Grocery Categories ───────────────────
function renderMgmtCats() {
  const cats = getGroceryCats();
  el('mgmtCatList').innerHTML = cats.length ? cats.map((c, i) => `
    <div>
      <div class="mgmt-item-row">
        <span style="font-size:22px;width:28px;text-align:center;flex-shrink:0">${esc(c.emoji||'🛒')}</span>
        <div class="mgmt-item-label">${esc(c.name)}</div>
        <button class="mgmt-icon-btn purple" onclick="toggleMgmtCatEdit(${i})" title="ערוך">✏️</button>
        <button class="mgmt-icon-btn red" onclick="mgmtRemoveCat('${esc(c.name)}')">🗑</button>
      </div>
      <div class="mgmt-edit-panel" id="mgmtCatPanel_${i}">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
          <input class="mgmt-input mgmt-emoji-input" id="mgmtCatEmoji_${i}" value="${esc(c.emoji||'🛒')}" maxlength="4"
            oninput="this.dataset.manual='1'" title="אימוג'י">
          <input class="mgmt-input" id="mgmtCatName_${i}" value="${esc(c.name)}"
            oninput="autoSuggestCatEmoji(this.value,'mgmtCatEmoji_${i}')"
            onkeydown="if(event.key==='Enter')saveMgmtCatEdit(${i},'${esc(c.name)}')">
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="auth-btn-main" style="padding:8px 16px;width:auto" onclick="saveMgmtCatEdit(${i},'${esc(c.name)}')">✓ שמור</button>
          <button class="auth-btn-back" onclick="toggleMgmtCatEdit(${i})">ביטול</button>
        </div>
      </div>
    </div>`).join('') : '<div class="empty" style="padding:8px 0">אין קטגוריות</div>';
}

function toggleMgmtCatEdit(i) {
  const panel = el(`mgmtCatPanel_${i}`);
  const opening = !panel.classList.contains('open');
  // Close all other cat panels
  getGroceryCats().forEach((_, j) => { if (j !== i) el(`mgmtCatPanel_${j}`)?.classList.remove('open'); });
  panel.classList.toggle('open', opening);
  if (opening) el(`mgmtCatName_${i}`)?.focus();
}

async function saveMgmtCatEdit(i, originalName) {
  const newName  = el(`mgmtCatName_${i}`).value.trim();
  const newEmoji = el(`mgmtCatEmoji_${i}`).value.trim() || suggestCatEmoji(newName) || '🛒';
  if (!newName) return;
  const cats = getGroceryCats().map((c, ci) => ci === i ? { name: newName, emoji: newEmoji } : c);
  if (familyData) familyData.groceryCategories = cats;
  if (newName !== originalName) {
    S.grocery = S.grocery.map(g => g.category === originalName ? { ...g, category: newName } : g);
    S.groceryPool  = S.groceryPool.map(p  => p.category  === originalName ? { ...p,  category: newName } : p);
    S.shoppingList = S.shoppingList.map(x => x.category  === originalName ? { ...x,  category: newName } : x);
    S.inCart       = S.inCart.map(x       => x.category  === originalName ? { ...x,  category: newName } : x);
    await fbDb.collection('families').doc(S.uid).update({
      groceryCategories: cats, grocery: S.grocery,
      groceryPool: S.groceryPool, shoppingList: S.shoppingList, inCart: S.inCart,
    });
  } else {
    await fbDb.collection('families').doc(S.uid).update({ groceryCategories: cats });
  }
  el(`mgmtCatPanel_${i}`).classList.remove('open');
  renderMgmtCats(); renderStatic(); renderSupermarket();
}

async function mgmtAddCat() {
  const name     = el('mgmtNewCatName').value.trim();
  const emojiEl  = el('mgmtNewCatEmoji');
  const emoji    = emojiEl.value.trim() || suggestCatEmoji(name) || '🛒';
  if (!name) { el('mgmtNewCatName').focus(); return; }
  const cats = [...getGroceryCats(), { name, emoji }];
  if (familyData) familyData.groceryCategories = cats;
  await fbDb.collection('families').doc(S.uid).update({ groceryCategories: cats });
  el('mgmtNewCatName').value = '';
  emojiEl.value = ''; emojiEl.placeholder = '🛒'; delete emojiEl.dataset.manual;
  renderMgmtCats(); renderStatic();
}

async function mgmtRemoveCat(name) {
  const cats = getGroceryCats().filter(c => c.name !== name);
  if (familyData) familyData.groceryCategories = cats;
  await fbDb.collection('families').doc(S.uid).update({ groceryCategories: cats });
  renderMgmtCats(); renderStatic(); renderSupermarket();
}

// ── Homework Subjects ────────────────────
function renderMgmtSubjects() {
  const subs = getSubjects();
  el('mgmtSubjectList').innerHTML = subs.length ? subs.map((s, i) => `
    <div>
      <div class="mgmt-item-row">
        <span class="badge" style="${subjectBadgeStyle(s.name)};flex-shrink:0">${esc(s.nameHe || s.name)}</span>
        <div class="mgmt-item-label"></div>
        <button class="mgmt-icon-btn purple" onclick="toggleMgmtSubjectEdit(${i})" title="ערוך">✏️</button>
        <button class="mgmt-icon-btn red" onclick="mgmtRemoveSubject('${esc(s.name)}')">🗑</button>
      </div>
      <div class="mgmt-edit-panel" id="mgmtSubjectPanel_${i}">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
          <input class="mgmt-input" id="mgmtSubjectNameHe_${i}" value="${esc(s.nameHe || s.name)}" placeholder="שם הנושא"
            onkeydown="if(event.key==='Enter')saveMgmtSubjectEdit(${i},'${esc(s.name)}')">
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="auth-btn-main" style="padding:8px 16px;width:auto" onclick="saveMgmtSubjectEdit(${i},'${esc(s.name)}')">✓ שמור</button>
          <button class="auth-btn-back" onclick="toggleMgmtSubjectEdit(${i})">ביטול</button>
        </div>
      </div>
    </div>`).join('') : '<div class="empty" style="padding:8px 0">אין נושאים</div>';
}

function toggleMgmtSubjectEdit(i) {
  const panel = el(`mgmtSubjectPanel_${i}`);
  const opening = !panel.classList.contains('open');
  getSubjects().forEach((_, j) => { if (j !== i) el(`mgmtSubjectPanel_${j}`)?.classList.remove('open'); });
  panel.classList.toggle('open', opening);
  if (opening) el(`mgmtSubjectNameHe_${i}`)?.focus();
}

async function saveMgmtSubjectEdit(i, originalName) {
  const newNameHe = el(`mgmtSubjectNameHe_${i}`).value.trim();
  if (!newNameHe) return;
  // Keep internal name key unchanged; only update the display label
  const subs = getSubjects().map((s, si) => si === i ? { ...s, nameHe: newNameHe } : s);
  if (familyData) familyData.subjects = subs;
  await fbDb.collection('families').doc(S.uid).update({ subjects: subs });
  el(`mgmtSubjectPanel_${i}`).classList.remove('open');
  renderMgmtSubjects(); renderStatic(); renderHomework();
}

async function mgmtAddSubject() {
  const nameHe = el('mgmtNewSubjectNameHe').value.trim();
  if (!nameHe) { el('mgmtNewSubjectNameHe').focus(); return; }
  const subs = getSubjects();
  const { bg, color } = SUBJECT_COLOR_POOL[subs.length % SUBJECT_COLOR_POOL.length];
  // Use Hebrew name as the internal key too (guaranteed unique by UI)
  const entry = { name: nameHe, nameHe, bg, color };
  const updated = [...subs, entry];
  if (familyData) familyData.subjects = updated;
  await fbDb.collection('families').doc(S.uid).update({ subjects: updated });
  el('mgmtNewSubjectNameHe').value = '';
  renderMgmtSubjects(); renderStatic();
}

async function mgmtRemoveSubject(name) {
  const updated = getSubjects().filter(s => s.name !== name);
  if (familyData) familyData.subjects = updated;
  await fbDb.collection('families').doc(S.uid).update({ subjects: updated });
  renderMgmtSubjects(); renderStatic();
}

// ════════════════════════════════════════
//  PHOTO MANAGEMENT
// ════════════════════════════════════════
let _photoTarget = null;

function pickPhoto(name) {
  _photoTarget = name;
  el('photoInput').value = '';
  el('photoInput').click();
}
async function handlePhotoFile(event) {
  const file = event.target.files[0];
  if (!file || !_photoTarget) return;
  const photo = await resizePhoto(file, 120);
  if (!photo) return;
  await saveMemberPhoto(_photoTarget, photo);
  if (!el('mgmtScreen').classList.contains('hidden')) renderMgmtMembers();
  renderHeader();
  if (_menuOpen) renderMenu();
}
function resizePhoto(file, size) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width  - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
async function saveMemberPhoto(name, photo) {
  if (!S.uid || !fbDb) return;
  const members = getMembers().map(m => m.name === name ? { ...m, photo } : m);
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({ members });
}
async function removePhoto(name) {
  if (!S.uid || !fbDb) return;
  const members = getMembers().map(m => {
    if (m.name !== name) return m;
    const copy = { ...m }; delete copy.photo; return copy;
  });
  if (familyData) familyData.members = members;
  await fbDb.collection('families').doc(S.uid).update({ members });
  if (!el('mgmtScreen').classList.contains('hidden')) renderMgmtMembers();
  renderHeader();
  if (_menuOpen) renderMenu();
}

// ════════════════════════════════════════
//  HAMBURGER MENU
// ════════════════════════════════════════
let _menuOpen = false;

// ── Header collapse (mobile) ─────────────────────────────────
function toggleHeaderCollapse() {
  const body = el('headerBody');
  const btn  = el('headerCollapseBtn');
  if (!body) return;
  const collapsed = body.classList.toggle('collapsed');
  if (btn) btn.classList.toggle('collapsed', collapsed);
  localStorage.setItem('familyhub_header_collapsed', collapsed ? '1' : '');
}
function _initHeaderCollapse() {
  if (localStorage.getItem('familyhub_header_collapsed')) {
    const body = el('headerBody');
    const btn  = el('headerCollapseBtn');
    if (body) body.classList.add('collapsed');
    if (btn)  btn.classList.add('collapsed');
  }
}
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _installPrompt = e; });
// SVG icons for the drawer menu
const DRAWER_ICONS = {
  mgmt:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  photos:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>`,
  tabs:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  home_ed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  lang:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  switch:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="23" y2="11"/><line x1="20" y1="14" x2="23" y2="11"/></svg>`,
  install: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  admin:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  gcal:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  signout:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  tour:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  feedback: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
};

function _drawerItem(icon, label, onclick, opts = {}) {
  const cls = ['menu-item', opts.active ? 'active' : '', opts.danger ? 'danger' : ''].filter(Boolean).join(' ');
  const badge = opts.badge ? `<span class="menu-item-badge">${opts.badge}</span>` : '';
  const keyBadge = opts.adminKey ? `<span class="menu-item-key">🔑</span>` : '';
  return `<button class="${cls}" onclick="${onclick}">
    <span class="menu-item-icon">${DRAWER_ICONS[icon] || ''}</span>
    <span class="menu-item-label">${label}</span>
    ${keyBadge}${badge}
  </button>`;
}

function toggleMenu(btn) { _menuOpen ? closeMenu() : openMenu(btn); }

function openMenu() {
  _menuOpen = true;
  const isHe = getLang() === 'he';
  const familyName = familyData?.familyName || '';
  const notifCount = parseInt(el('notifBellBadge')?.textContent || '0') || 0;
  const pendingCount = parseInt(el('pendingReqBadge')?.textContent || '0') || 0;

  const mainItems = [
    isParent() ? _drawerItem('mgmt',    isHe ? 'הגדרות' : 'Settings',           `closeMenu();openMgmt()`)          : '',
    isParent() ? _drawerItem('home_ed', isHe ? 'התאמת דף הבית' : 'Customize home', `closeMenu();openHomeEditor()`)   : '',
    isParent() ? _drawerItem('tabs',    isHe ? 'התאמת לשוניות' : 'Customize tabs', `closeMenu();openTabEditor()`)    : '',
    (gcalConnected() || gcalWasConnected()) ? _drawerItem('gcal', isHe ? 'נתק Google Calendar' : 'Disconnect GCal', `closeMenu();disconnectGCal()`) : '',
  ].filter(Boolean).join('');

  const secondaryItems = [
    !S.lockedMember ? _drawerItem('switch', isHe ? 'החלף משתמש' : 'Switch member', `closeMenu();switchUser()`) : '',
    _drawerItem('install',  isHe ? 'הוסף לדף הבית' : 'Add to home screen', `closeMenu();installApp()`),
    _drawerItem('feedback', isHe ? 'פנייה למנהל המערכת' : 'Contact admin', `closeMenu();openFeedback()`),
    ...(!isParent() ? [] : Object.keys(_tutDefs()).map(tab =>
      _drawerItem('tour', isHe ? `סיור ב${tabLabel(tab)}` : `${tabLabel(tab)} tour`, `closeMenu();replayTutorial('${tab}')`)
    )),
    isAdmin() ? _drawerItem('admin', isHe ? 'הגדרות מערכת' : 'System settings', `closeMenu();openAdminPanel(false)`, { adminKey: true }) : '',
  ].filter(Boolean).join('');

  const signoutItem = _drawerItem('signout', isHe ? 'יציאה מהחשבון' : 'Sign out', `closeMenu();authSignOut()`, { danger: true });

  el('menuDropdown').innerHTML = `
    <div class="drawer-user-section">
      <div class="drawer-user-top">
        <div class="drawer-avatar-wrap">
          <div class="drawer-avatar">${getAvatar(S.user) || getEmoji(S.user)}</div>
          <button class="drawer-avatar-edit" onclick="pickPhoto('${esc(S.user)}')" title="${isHe ? 'החלף תמונה' : 'Change photo'}">${_ico.pencil}</button>
        </div>
        <button class="drawer-lang-btn" onclick="closeMenu();toggleLang()" title="${isHe ? 'Switch to English' : 'עבור לעברית'}">${DRAWER_ICONS.lang}</button>
      </div>
      <div class="drawer-user-name">${esc(S.user)}</div>
      <div class="drawer-user-sub">${esc(familyName)}</div>
      <div class="drawer-user-uid" onclick="navigator.clipboard?.writeText('${S.uid}').then(()=>showToast('${isHe?'UID הועתק':'UID copied'}','info'))" title="${isHe?'לחץ להעתקה':'Click to copy'}">${S.uid}</div>
    </div>
    <nav class="drawer-nav">
      ${mainItems}
      <div class="drawer-nav-sep"></div>
      ${secondaryItems}
    </nav>
    <div class="drawer-footer">
      ${signoutItem}
    </div>`;

  const dd = el('menuDropdown');
  dd.style.display = 'flex';
  requestAnimationFrame(() => dd.classList.add('open'));
  el('menuOverlay').classList.add('open');
}

function closeMenu() {
  _menuOpen = false;
  const dd = el('menuDropdown');
  dd.classList.remove('open');
  el('menuOverlay').classList.remove('open');
  setTimeout(() => { if (!_menuOpen) dd.style.display = 'none'; }, 280);
}

async function installApp() {
  const isHe = getLang() === 'he';
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  if (isStandalone) {
    showToast(isHe ? 'האפליקציה כבר מותקנת 👍' : 'App is already installed 👍', 'info');
    return;
  }
  if (_installPrompt) {
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    if (outcome === 'accepted') _installPrompt = null;
    return;
  }
  // iOS — no install prompt API, show manual instructions
  if (isIos) {
    showToast(
      isHe
        ? 'כדי להוסיף לדף הבית: לחץ על כפתור השיתוף ⎋ ואז "הוסף למסך הבית"'
        : 'To install: tap the Share button ⎋ then "Add to Home Screen"',
      'info', 7000
    );
    return;
  }
  // Chrome desktop / other — guide to address bar
  showToast(
    isHe
      ? 'לחץ על סמל ההתקנה בשורת הכתובת של הדפדפן'
      : 'Click the install icon in your browser\'s address bar',
    'info', 5000
  );
}

// ── Priority segmented control ────────────
function _priSegPick(val) {
  const sel = el('newChorePriority');
  if (sel) sel.value = val;
  document.querySelectorAll('#priSegControl .pri-seg-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.val === val));
}

// ── Soft Card Dropdown ────────────────────
function _buildSoftDd(ddId, selectId, dotMap) {
  const dd = el(ddId);
  const sel = el(selectId);
  if (!dd || !sel) return;
  const options = Array.from(sel.options);
  const curVal  = sel.value || (options[0]?.value || '');
  const curText = options.find(o => o.value === curVal)?.text || '';
  const items = options.map(o => {
    const dot = dotMap?.[o.value] ? `<span class="chore-dot ${dotMap[o.value]}" style="flex-shrink:0;margin-inline-end:8px"></span>` : '';
    return `<button class="sd-item${o.value===curVal?' sd-selected':''}" data-val="${esc(o.value)}" onclick="_softDdPick('${ddId}','${selectId}','${esc(o.value)}')">${dot}${esc(o.text)}</button>`;
  }).join('');
  dd.innerHTML = `<button class="sd-trigger" onclick="_softDdToggle('${ddId}')"><span id="${ddId}Lbl">${esc(curText)}</span></button><div class="sd-panel" id="${ddId}Panel">${items}</div>`;
}

function _softDdToggle(ddId) {
  const panel = el(ddId + 'Panel');
  const dd    = el(ddId);
  if (!panel || !dd) return;
  document.querySelectorAll('.sd-panel.open').forEach(p => { if (p !== panel) p.classList.remove('open'); });
  if (panel.classList.contains('open')) { panel.classList.remove('open'); return; }
  const rect = dd.querySelector('.sd-trigger').getBoundingClientRect();
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.bottom - 8;
  const spaceAbove = rect.top - 8;
  if (spaceBelow >= spaceAbove || spaceBelow >= 120) {
    panel.style.top       = (rect.bottom + 4) + 'px';
    panel.style.bottom    = 'auto';
    panel.style.maxHeight = Math.min(vh * 0.6, spaceBelow) + 'px';
  } else {
    panel.style.bottom    = (vh - rect.top + 4) + 'px';
    panel.style.top       = 'auto';
    panel.style.maxHeight = Math.min(vh * 0.6, spaceAbove) + 'px';
  }
  panel.style.right = (window.innerWidth - rect.right) + 'px';
  panel.style.left  = 'auto';
  panel.classList.add('open');
  setTimeout(() => {
    document.addEventListener('click', function _h(e) {
      if (!dd.contains(e.target)) { panel.classList.remove('open'); document.removeEventListener('click', _h); }
    });
  }, 0);
}

function _softDdPick(ddId, selectId, value) {
  const sel = el(selectId);
  if (!sel) return;
  sel.value = value;
  sel.dispatchEvent(new Event('change'));
  const lbl = el(ddId + 'Lbl');
  if (lbl) lbl.textContent = Array.from(sel.options).find(o => o.value === value)?.text || value;
  const panel = el(ddId + 'Panel');
  if (panel) {
    panel.querySelectorAll('.sd-item').forEach(b => b.classList.toggle('sd-selected', b.dataset.val === value));
    panel.classList.remove('open');
  }
}

function renderStatic() {
  const lb=el('langBtn');   if(lb) lb.textContent = t('langToggle');
  const sb=el('switchBtn'); if(sb) sb.textContent = t('switchUser');
  el('starChartTitle').textContent   = t('starChart');
  el('hwDueSoonTitle').textContent   = t('hwDueSoon');
  el('poolTitle').textContent        = t('superPoolTitle');
  el('shoppingListTitle').textContent = t('superListTitle');
  el('addEventTitle').textContent    = t('addEventTitle');
  el('newChoreText').placeholder  = t('chorePlaceholder');
  el('poolItemInput').placeholder = t('poolAddPlaceholder');
  el('hwDesc').placeholder        = t('hwPlaceholder');
  el('newEventTitle').placeholder = t('eventPlaceholder');
  el('addHwBtn').innerHTML   = _ico.plus;
  el('addPoolBtn').innerHTML = _ico.plus;
  el('addEventBtn').textContent  = t('add');
  el('doneShoppingBtn').textContent   = t('doneShopping');
  el('historyTitle').textContent      = t('shoppingHistoryTitle');
  const lbl=el('gcalSyncLabel');if(lbl)lbl.textContent=t('gcalSyncOption');
  el('newChorePriority').innerHTML = `
    <option value="high">${t('high')}</option>
    <option value="medium" selected>${t('medium')}</option>
    <option value="low">${t('low')}</option>`;
  el('poolCatSelect').innerHTML = getGroceryCats().map(c =>
    `<option value="${esc(c.name)}">${c.emoji} ${esc(c.name)}</option>`).join('');
  _buildSoftDd('ddPoolCat', 'poolCatSelect');
  el('hwSubject').innerHTML = getSubjects().map(s =>
    `<option value="${esc(s.name)}">${esc(subjectLabel(s.name))}</option>`).join('');
  _buildSoftDd('ddHwSubject', 'hwSubject');
  renderEventPersonPicker();
}

function applyRoleUI() {
  el('poolAddTrigger').style.display = isParent()?'':'none';
  el('poolAddForm').style.display = 'none';
}

// ════════════════════════════════════════
//  HEADER
// ════════════════════════════════════════
function renderHeader() {
  const avatarBtn = el('headerAvatarBtn');
  if (avatarBtn) avatarBtn.innerHTML = getAvatar(S.user, 28) || `<span style="font-size:18px">${getEmoji(S.user)||'👤'}</span>`;
  const titleEl = el('headerTabTitle');
  if (titleEl) titleEl.textContent = tabLabel(S.tab);
}

// ── Tab chip helpers ──────────────────────────
function _allGroupAvatar() {
  const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">
    <circle cx="15" cy="8" r="3"/>
    <path d="M22 20c0-3.3-3.1-6-7-6"/>
    <circle cx="9" cy="8" r="3"/>
    <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
  </svg>`;
  return `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#a0aec0"><span style="width:72%;height:72%;display:flex">${svg}</span></span>`;
}
function _applyChipsSpread(rowId) {
  const row = el(rowId);
  if (!row) return;
  const count = row.querySelectorAll('.avatar-chip').length;
  row.classList.toggle('chips-spread', count > 0 && count <= 6);
}

function _allMemberChipsHtml() {
  if (!isParent()) return '';
  const allNames = getAllMemberNames();
  if (allNames.length < 2) return ''; // single chip rule
  const members = [{name:'All'}, ...allNames.map(n=>({name:n}))];
  return members.map(f => {
    const isAll = f.name === 'All';
    return `<div class="avatar-chip${isAll?' avatar-chip-all':''}${S.filter===f.name?' active':''}" onclick="setFilter('${esc(f.name)}')">
      <div class="avatar-bubble">${isAll ? _allGroupAvatar() : getAvatar(f.name)}</div>
      <div class="avatar-label">${isAll ? t('all') : esc(f.name)}</div>
    </div>`;
  }).join('');
}

function _kidChipsHtml() {
  if (!isParent()) return '';
  const kids = getKids();
  if (kids.length < 2) return ''; // single chip rule
  return kids.map(k => `
    <div class="avatar-chip${S.filter===k?' active':''}" onclick="setFilter('${esc(k)}')">
      <div class="avatar-bubble">${getAvatar(k)}</div>
      <div class="avatar-label">${esc(k)}</div>
    </div>`).join('');
}

function _hwKidChipsHtml(kids) {
  return kids.map(k =>
    `<div class="avatar-chip${S.child===k?' active':''}" onclick="switchChild('${esc(k)}')">
      <div class="avatar-bubble">${getAvatar(k)}</div>
      <div class="avatar-label">${esc(k)}</div>
    </div>`
  ).join('');
}

// ════════════════════════════════════════
//  HOME
// ════════════════════════════════════════
async function refreshHomeUpcoming() {
  const kidsWithSchool = getKids()
    .map(name => getMembers().find(m => m.name === name))
    .filter(m => m?.school?.city && m?.school?.grade);
  if (kidsWithSchool.length) await loadCommunityData(kidsWithSchool);
  renderHomeUpcoming();
}

function renderHomeUpcoming() {
  const card = el('homeUpcomingCard');
  const container = el('homeUpcoming');
  if (!card || !container) return;

  // Personal calendar events
  const personal = (S.events || [])
    .filter(e => isEventUpcoming(e.date))
    .filter(e => isParent() || _calEventVisibleToKid(e, S.user))
    .map(e => ({ ...e, _src: 'personal' }));

  // Class/grade/school events from cache
  const classEvs = [];
  const _seenHomeClassKeys = new Set();
  getKids().forEach(name => {
    if (!isParent() && name !== S.user) return; // kids only see their own class
    const member = getMembers().find(m => m.name === name);
    if (!member?.school) return;
    const cid = classIdFor(member.school);
    if (!cid || !_commCache[cid]) return;
    const cache = _commCache[cid];
    [...(cache.events||[]), ...(cache.gradeEvents||[]), ...(cache.schoolEvents||[])].forEach(ev => {
      if (isEventUpcoming(ev.date) && matchesGenderFilter(ev, name)) {
        const key = `${ev.id}_${name}`;
        if (!_seenHomeClassKeys.has(key)) { _seenHomeClassKeys.add(key); classEvs.push({ ...ev, _src: 'class', _kid: name }); }
      }
    });
  });

  // Merge, deduplicate, sort, take 5
  const seen = new Set();
  const all = [...personal, ...classEvs]
    .filter(e => {
      if (!e.date) return false;
      const key = `${e.title}_${e.date}_${e._kid || ''}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    })
    .sort((a, b) => {
      const d = (a.date||'').localeCompare(b.date||'');
      return d !== 0 ? d : (a.time||'').localeCompare(b.time||'');
    })
    .slice(0, 5);

  if (!all.length) { card.style.display = 'none'; return; }
  card.style.display = '';
  container.innerHTML = all.map(ev => {
    const isClass = ev._src === 'class';
    const kidArg = isClass && ev._kid ? esc(ev._kid).replace(/'/g,"\\'") : '';
    return `<div class="home-event-row" onclick="navToCalendarDate('${ev.date}','${ev._src||''}','${kidArg}')">
      <div class="home-event-icon">${eventTypeIcon(ev.type)}</div>
      <div class="home-event-body">
        <div class="home-event-title">${esc(ev.title)}${isClass ? scopeBadge(ev.scope) : ''}</div>
        <div class="home-event-meta">${fmtDate(ev.date)}${ev.time ? ' · ' + ev.time : ''}${ev.location ? ' · ' + _ico.pin + ' ' + esc(ev.location) : ''}${isClass && ev._kid ? ' · ' + esc(ev._kid) : ''}</div>
      </div>
      <span class="home-chevron">›</span>
    </div>`;
  }).join('');
}

let _homeQuickPickId = null;
let _quickAddConfirm = 0; // timestamp — renders ✓ while within 1.5s

function renderHomeShopping() {
  const sec = el('homeSection-shopping');
  if (!sec) return;
  const placeholder = t('locale') === 'he-IL' ? 'חפש מהמאגר...' : 'Search pool…';
  sec.innerHTML = `<div class="card">
    <div class="card-title">🛒 קניות מהירות</div>
    <div class="home-quick-ac-outer">
      <div class="home-quick-add-wrap">
        <input class="home-quick-add-input" id="homeQuickAddInput" type="text"
          placeholder="${placeholder}" autocomplete="off"
          oninput="homeQuickAcInput(this)"
          onblur="setTimeout(()=>{const d=el('homeQuickAcDrop');if(d)d.style.display='none'},160)"
          onkeydown="homeQuickAcKey(event)">
        ${Date.now() - _quickAddConfirm < 1500
          ? `<button class="home-quick-add-btn" style="background:#38a169" onclick="homeQuickAddShop()"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:block"><polyline points="20 6 9 17 4 12"/></svg></button>`
          : `<button class="home-quick-add-btn" onclick="homeQuickAddShop()"><svg viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;display:block"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg></button>`
        }
      </div>
      <div class="home-quick-ac-drop" id="homeQuickAcDrop" style="display:none"></div>
    </div>
  </div>`;
}

function homeQuickAcInput(inp) {
  _homeQuickPickId = null;
  const q = inp.value.trim().toLowerCase();
  const drop = el('homeQuickAcDrop');
  if (!drop) return;
  if (!q) { drop.style.display = 'none'; drop.innerHTML = ''; return; }
  const matches = S.groceryPool.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  if (!matches.length) { drop.style.display = 'none'; drop.innerHTML = ''; return; }
  drop.innerHTML = matches.map(p => {
    const inList = S.shoppingList.some(x => x.poolId === p.id);
    const catLabel = p.category ? `<span class="home-quick-ac-cat">${esc(p.category)}</span>` : '';
    const check = inList ? `<span class="home-ac-check">✓</span>` : '';
    return `<div class="home-quick-ac-item${inList ? ' in-list' : ''}" onmousedown="homeQuickAcPick(${p.id})">
      ${check}<span>${esc(p.name)}</span>${catLabel}
    </div>`;
  }).join('');
  drop.style.display = 'block';
}

function homeQuickAcPick(poolId) {
  const pool = S.groceryPool.find(p => p.id === poolId);
  if (!pool) return;
  _homeQuickPickId = poolId;
  const inp = el('homeQuickAddInput');
  if (inp) inp.value = pool.name;
  const drop = el('homeQuickAcDrop');
  if (drop) drop.style.display = 'none';
  homeQuickAddShop();
}

function homeQuickAcKey(e) {
  if (e.key === 'Enter') { homeQuickAddShop(); return; }
  if (e.key === 'Escape') {
    const drop = el('homeQuickAcDrop');
    if (drop) drop.style.display = 'none';
  }
}

function homeQuickAddShop() {
  const input = el('homeQuickAddInput');
  if (!input) return;
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  let pool = _homeQuickPickId ? S.groceryPool.find(p => p.id === _homeQuickPickId) : null;
  if (!pool) pool = S.groceryPool.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!pool) {
    // Auto-create pool item under כללי with qty 1
    const newItem = { id: Date.now(), name, category: 'כללי', qtyType: 'count' };
    S.groceryPool.push(newItem);
    pool = newItem;
  }
  if (!S.shoppingList.some(x => x.poolId === pool.id)) {
    const qty = pool.lastQty || 1;
    S.shoppingList.push({ id: Date.now(), poolId: pool.id, name: pool.name, category: pool.category, qty, qtyType: pool.qtyType || 'count', requestedQty: qty });
    saveGrocery();
    renderPool();
    renderShoppingList();
  }
  input.value = '';
  _homeQuickPickId = null;
  _quickAddConfirm = Date.now();
  renderHomeShopping();
  setTimeout(() => { _quickAddConfirm = 0; renderHomeShopping(); el('homeQuickAddInput')?.focus(); }, 1500);
  input.focus();
}

// ════════════════════════════════════════
//  WEATHER WIDGET
// ════════════════════════════════════════
let _weatherCache = null;   // { ts, temp, code, isDay, city }
let _weatherLoading = false;

function _wxInfo(code, isDay) {
  if (code === 0)                                   return isDay ? {type:'sunny',  desc:'שמש מלאה'}   : {type:'night',  desc:'לילה בהיר'};
  if (code <= 3)                                    return isDay ? {type:'partly', desc:'מעונן חלקית'} : {type:'cloudy', desc:'מעונן'};
  if (code <= 48)                                   return {type:'foggy',   desc:'ערפל'};
  if (code <= 55)                                   return {type:'drizzle', desc:'טפטוף קל'};
  if (code <= 67 || (code >= 80 && code <= 82))     return {type:'rainy',   desc:'גשם'};
  if (code <= 77)                                   return {type:'snowy',   desc:'שלג'};
  if (code >= 95)                                   return {type:'stormy',  desc:'סופה ורעמים'};
  return {type:'cloudy', desc:'מעונן'};
}

function _wxSceneHTML(type) {
  if (type === 'sunny') {
    const rays = [0,45,90,135,180,225,270,315].map(deg =>
      `<div class="wx-ray" style="transform-origin:50% 36px;transform:rotate(${deg}deg) translateY(-30px)"></div>`
    ).join('');
    return `<div class="wx-rays-wrap">${rays}</div><div class="wx-sun-circle"></div>`;
  }
  if (type === 'night') {
    const stars = [{w:4,t:8,l:12,d:'0s'},{w:3,t:18,l:60,d:'0.6s'},{w:5,t:5,l:45,d:'1.1s'},{w:3,t:30,l:28,d:'0.3s'}]
      .map(({w,t,l,d}) => `<div class="wx-star-dot" style="width:${w}px;height:${w}px;top:${t}px;left:${l}px;animation-delay:${d}"></div>`).join('');
    return `${stars}<div class="wx-moon"></div>`;
  }
  if (type === 'partly') {
    return `<div class="wx-sun-circle" style="width:32px;height:32px;top:10px;left:8px;transform:none;position:absolute"></div>
            <div class="wx-cloud" style="width:50px;height:19px;top:34px;left:14px;animation:wx-drift 3s ease-in-out infinite"></div>`;
  }
  if (type === 'cloudy') {
    return `<div class="wx-cloud" style="width:44px;height:17px;top:12px;left:6px;opacity:0.7;animation:wx-drift 4s ease-in-out infinite"></div>
            <div class="wx-cloud" style="width:52px;height:20px;top:32px;left:16px;animation:wx-drift2 3.2s ease-in-out infinite"></div>
            <div class="wx-cloud" style="width:36px;height:15px;top:50px;left:4px;opacity:0.55;animation:wx-drift 5s ease-in-out infinite"></div>`;
  }
  if (type === 'drizzle' || type === 'rainy') {
    const h = type === 'rainy' ? 16 : 10;
    const durs = [0.75, 0.9, 0.7, 0.85, 0.8];
    const drops = [{l:14,d:'0s'},{l:26,d:'0.25s'},{l:40,d:'0.5s'},{l:54,d:'0.15s'},{l:66,d:'0.4s'}]
      .map(({l,d},i) => `<div class="wx-drop" style="left:${l}px;top:36px;height:${h}px;animation-duration:${durs[i]}s;animation-delay:${d}"></div>`).join('');
    return `<div class="wx-cloud" style="width:52px;height:19px;top:8px;left:10px;animation:wx-drift 3.5s ease-in-out infinite"></div>${drops}`;
  }
  if (type === 'snowy') {
    const sizes = [5,6,4,6,4,5], durs = [1.5,1.8,1.4,1.7,1.6,1.9];
    const flakes = [{l:12,d:'0s'},{l:28,d:'0.4s'},{l:42,d:'0.9s'},{l:56,d:'0.2s'},{l:68,d:'0.65s'},{l:20,d:'1.1s'}]
      .map(({l,d},i) => `<div class="wx-flake" style="width:${sizes[i]}px;height:${sizes[i]}px;left:${l}px;top:24px;animation-duration:${durs[i]}s;animation-delay:${d}"></div>`).join('');
    return `<div class="wx-cloud" style="width:52px;height:19px;top:6px;left:10px;animation:wx-drift 4s ease-in-out infinite"></div>${flakes}`;
  }
  if (type === 'stormy') {
    const drops = [{l:10,d:'0s'},{l:24,d:'0.3s'},{l:38,d:'0.6s'},{l:52,d:'0.15s'},{l:64,d:'0.45s'}]
      .map(({l,d}) => `<div class="wx-drop" style="left:${l}px;top:36px;height:14px;background:rgba(150,180,255,0.7);animation-duration:0.65s;animation-delay:${d}"></div>`).join('');
    return `<div class="wx-cloud" style="width:54px;height:21px;top:6px;left:8px;background:#888;animation:wx-drift2 4s ease-in-out infinite"></div>${drops}<div class="wx-lightning">⚡</div>`;
  }
  if (type === 'foggy') {
    return [{w:'76%',l:'6%',t:20,d:'0s'},{w:'58%',l:'18%',t:38,d:'0.8s'},{w:'70%',l:'8%',t:54,d:'0.4s'}]
      .map(({w,l,t,d}) => `<div class="wx-fog-bar" style="width:${w};left:${l};top:${t}px;animation-delay:${d}"></div>`).join('');
  }
  return `<div class="wx-cloud" style="width:52px;height:19px;top:30px;left:10px"></div>`;
}

async function _getWeatherCoords() {
  // 1. Browser geolocation
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {timeout:5000}));
      return {lat: pos.coords.latitude, lon: pos.coords.longitude, city: null};
    } catch(_) {}
  }
  // 2. Kid's school city → geocode
  const kid = getMembers().find(m => m.role==='kid' && m.school?.city);
  if (kid) {
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(kid.school.city)}&count=1`);
      const j = await r.json();
      if (j.results?.[0]) return {lat: j.results[0].latitude, lon: j.results[0].longitude, city: kid.school.city};
    } catch(_) {}
  }
  // 3. IP-based fallback (no key required)
  try {
    const r = await fetch('https://ipapi.co/json/');
    const j = await r.json();
    if (j.latitude && j.longitude) return {lat: j.latitude, lon: j.longitude, city: j.city || null};
  } catch(_) {}
  return null;
}

async function loadWeather() {
  if (_weatherLoading) return;
  if (_weatherCache && Date.now() - _weatherCache.ts < 30*60*1000) { renderWeatherWidget(); return; }
  _weatherLoading = true;
  _showWeatherLoading();
  try {
    const coords = await _getWeatherCoords();
    if (!coords) { _weatherLoading = false; const wx = el('weatherWidget'); if (wx) wx.innerHTML = ''; return; }
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weathercode,is_day&timezone=auto`);
    const j = await r.json();
    _weatherCache = {ts:Date.now(), temp:Math.round(j.current.temperature_2m), code:j.current.weathercode, isDay:j.current.is_day===1, city:coords.city||null};
  } catch(e) { console.warn('[weather]', e); }
  _weatherLoading = false;
  renderWeatherWidget();
}

function _showWeatherLoading() {
  const wx = el('weatherWidget');
  if (!wx) return;
  const allHidden = HOME_SECTIONS.every(s => getHomePrefs().hidden.includes(s.id));
  wx.innerHTML = `<div class="wx-card wx-partly${allHidden?' hero':''}">
    <div class="wx-scene"><div style="font-size:36px;animation:wx-spin 2s linear infinite;display:inline-block;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">🌀</div></div>
    <div class="wx-info"><div class="wx-desc" style="opacity:0.8">טוען מזג אוויר...</div></div>
  </div>`;
}

const _wxEmoji = { sunny:'☀️', night:'🌙', partly:'⛅', cloudy:'☁️', foggy:'🌫️', drizzle:'🌦️', rainy:'🌧️', snowy:'❄️', stormy:'⛈️' };
function renderWeatherWidget() {
  if (!_weatherCache) return;
  const {temp, code, isDay} = _weatherCache;
  const {type} = _wxInfo(code, isDay);
  const emoji = _wxEmoji[type] || '🌡️';
  const hw = el('headerWeather');
  const sep = el('headerWeatherSep');
  if (hw) hw.innerHTML = `<span class="header-weather-inline">${emoji} ${temp}°</span>`;
  if (sep) sep.style.display = '';
}

function renderHome() {
  const homeChipsEl = el('homeChips');
  if (homeChipsEl) { homeChipsEl.innerHTML = _allMemberChipsHtml(); _applyChipsSpread('homeChips'); }
  const bannerEl = el('welcomeBanner');
  if (isKid()) {
    const col = getKidGradient(S.user);
    const n = S.stars[S.user]||0;
    bannerEl.innerHTML = `<div class="welcome-banner" style="background:linear-gradient(135deg,${col})">
      <div class="wb-emoji">${getAvatar(S.user, 48)}</div>
      <div class="wb-name">${t('wbHi',S.user)}</div>
      <div class="wb-sub">${t('wbStars',n)}</div></div>`;
  } else {
    const h = new Date().getHours();
    const g = h<12?t('greetMorning'):h<17?t('greetAfternoon'):t('greetEvening');
    const dateStr = new Date().toLocaleDateString(t('locale'),{weekday:'long',month:'long',day:'numeric'});
    bannerEl.innerHTML = `<div class="home-greeting-card">
      <div class="hgc-line1">${esc(g)}, <strong>${esc(S.user)}</strong>! <span style="display:inline-flex;vertical-align:middle;margin:0 2px">${getAvatar(S.user, 20)}</span>&nbsp;<span class="header-role-badge">${currentUserRoleBadge()}</span></div>
      <div class="hgc-line2"><span>${dateStr}</span><span class="header-date-sep" id="headerWeatherSep" style="display:none">·</span><span id="headerWeather"></span></div>
    </div>`;
  }

  renderWeatherWidget();

  el('homeChoresTitle').textContent = S.filter==='All'?t('todayChores'):t('personChores',S.filter);
  let tasks = S.chores.filter(c=>!c.done);
  if (S.filter!=='All') tasks = tasks.filter(c=>c.assignee===S.filter);
  el('homeTasks').innerHTML = tasks.length
    ? tasks.slice(0,8).map(c => {
        const can = isParent()||c.assignee===S.user;
        const showSub = isParent() && c.assignee && c.assignee !== 'All';
        return `<div class="task-row home-task-row">
          <div class="check-box ${c.done?'done':''} ${can?'':'readonly'}" ${can?`onclick="toggleChore(${c.id})"`:''}>
            ${c.done?`<svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>`:''}
          </div>
          <div class="task-body">
            <div class="task-text ${c.done?'done':''}">${esc(c.text)}</div>
            ${showSub?`<div class="task-sub">${esc(c.assignee)}</div>`:''}
          </div>
          <div class="home-type-icon home-type-chore">🧹</div>
        </div>`;
      }).join('')
    : t('allDone');

  renderStarChart();


  let hw = S.homework.filter(h=>!h.done);
  if (isKid()) hw = hw.filter(h=>h.child===S.user);
  else if (S.filter!=='All'&&getKids().includes(S.filter)) hw = hw.filter(h=>h.child===S.filter);
  // Sort by nearest due date first; items with no due date go last
  hw.sort((a,b)=>{
    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due.localeCompare(b.due);
  });
  el('hwSummary').innerHTML = hw.length
    ? hw.map(h => `<div class="task-row home-task-row">
        <div class="check-box readonly"></div>
        <div class="task-body">
          <div class="task-text">${esc(h.desc)}</div>
          <div class="task-sub">${(()=>{const parts=[];if(isParent())parts.push(esc(h.child));if(h.subject)parts.push(`<span style="${subjectBadgeStyle(h.subject)};padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700">${esc(subjectLabel(h.subject))}</span>`);if(h.due)parts.push(fmtDate(h.due));return parts.join(' · ');})()}</div>
        </div>
        <div class="home-type-icon home-type-hw">📚</div>
      </div>`).join('')
    : t('noPendingHw');

  renderHomeUpcoming();
  renderHomeShopping();
  applyHomePrefs();
}

// ════════════════════════════════════════
//  STARS
// ════════════════════════════════════════
function renderStarChart() {
  const ed = isParent();
  const kids = getKids();
  if (!kids.length) { el('starChart').innerHTML=''; return; }
  el('starChart').innerHTML = kids.map(kid => {
    const n = S.stars[kid]||0, me = kid===S.user;
    return `<div class="star-row ${me?'mine':''}">
      <div class="star-person"><span class="star-person-emoji">${getAvatar(kid, 24)}</span><span class="star-person-name">${kid}</span></div>
      <div class="stars">${[1,2,3,4,5].map(i=>`<span class="star ${n>=i?'on':''} ${ed?'':'readonly'}" ${ed?`onclick="setStar('${kid}',${i})"`:''}>⭐</span>`).join('')}</div>
      <span class="star-count">${n}/5</span></div>`;
  }).join('');
}
function setStar(kid,val){
  if(!isParent())return;
  S.stars[kid]=S.stars[kid]===val?val-1:val;
  save();renderStarChart();if(isKid())renderHome();
}

// ════════════════════════════════════════
//  CHORES
// ════════════════════════════════════════
// ── Chore history state ───────────────────
let _choreHistOpen   = false;
let _choreHistSearch = '';
let _pendingDelete = null;
let _snackTimer = null;
let _chore3dotActiveId = null;

function renderChores() {
  const choresChipsEl = el('choresChips');
  if (choresChipsEl) { choresChipsEl.innerHTML = _allMemberChipsHtml(); _applyChipsSpread('choresChips'); }
  const fabWrap = el('choreFabWrap');
  // Reset assignee state when filter changes
  if (S.filter !== 'All') { _choreFabAssignee = null; }
  _updateChoreFormAssignee();
  let items = S.filter==='All' ? S.chores : S.chores.filter(c=>c.assignee===S.filter);
  const active = items.filter(c=>!c.done).sort((a,b) => _choreSortScore(a) - _choreSortScore(b));
  if (fabWrap) fabWrap.style.display = (S.tab === 'chores' && isParent() && (S.filter === 'All' || active.length > 0)) ? '' : 'none';
  const showAssignee = S.filter==='All';
  const inner = active.length ? active.map(c=>{
    const can = isParent()||c.assignee===S.user;
    const priDotCls = c.priority==='high' ? 'chore-dot-high' : c.priority==='medium' ? 'chore-dot-med' : 'chore-dot-low';
    const priLabel = t(c.priority);
    const whenMeta  = _choreDueLabel(c.due) || _choreWhen(c.id);
    const dueClass  = c.due && c.due < today ? ' chore-meta-overdue' : '';
    const threeDotSVG = `<svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;height:14px;display:block"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>`;
    return `<div class="chore-card" data-chore-id="${c.id}">
      ${isParent()?`<div class="chore-reveal-zone">
        <button class="chore-action-btn chore-action-delete" onclick="deleteChore(${c.id})">${_ico.trash}</button>
        <div class="chore-action-sep"></div>
        <button class="chore-action-btn chore-action-edit" onclick="startEditChore(${c.id})">${_ico.edit}</button>
      </div>`:''}
      <div class="chore-slide">
        <div class="check-box chore-check ${can?'':'readonly'}" ${can?`onclick="toggleChore(${c.id})"`:''}>
          <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="chore-body" id="choreBody_${c.id}">
          <div class="chore-text" onclick="this.classList.toggle('expanded');event.stopPropagation()">${esc(c.text)}</div>
          <div class="chore-meta-row">
            <span class="chore-meta${dueClass}">${whenMeta}</span><span class="chore-meta-sep">•</span><span class="chore-dot ${priDotCls}"></span><span class="chore-pri-label">${priLabel}</span>
          </div>
        </div>
        ${showAssignee && c.assignee ? `<div class="chore-assignee-av" title="${esc(c.assignee)}">${getAvatar(c.assignee, 30)}</div>` : ''}
        ${isParent()?`<div class="chore-3dot" id="chore3dot_${c.id}">
          <button class="chore-3dot-btn" onclick="_chore3dotToggle(${c.id});event.stopPropagation()">${threeDotSVG}</button>
        </div>`:''}
      </div>
    </div>`;
  }).join('') : `<div class="chore-empty-cta" onclick="el('newChoreText').focus()">
    <div class="chore-empty-title">${S.filter==='All' ? 'אין משימות' : `אין משימות ל${S.filter}`} 🎉</div>
    <div class="chore-empty-sub">${t('noChores')}</div>
  </div>`;
  el('choresContent').innerHTML = `<div class="chore-list">${inner}</div>`;
  _initChoreSwipes();
  renderChoreHistory(S.filter);
}

function renderChoreHistory(filter) {
  const wrap = el('choreHistoryWrap');
  if (!wrap) return;
  let allDone = S.chores.filter(c=>c.done);
  if (filter!=='All') allDone = allDone.filter(c=>c.assignee===filter);
  allDone.sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  if (!allDone.length) { wrap.innerHTML=''; return; }
  const q = _choreHistSearch.toLowerCase();
  const filtered = q ? allDone.filter(c=>
    c.text.toLowerCase().includes(q)||c.assignee.toLowerCase().includes(q)
  ) : allDone;
  wrap.innerHTML=`<div class="card" style="margin-top:0">
    <div class="hw-hist-hdr" onclick="toggleChoreHistory()">
      <span style="color:#a0aec0;font-size:12px;margin-inline-end:6px">${_choreHistOpen?'▲':'▼'}</span>
      <span class="hw-hist-title">${t('choreHistory')}</span>
      <span class="hw-hist-count">${allDone.length}</span>
    </div>
    ${_choreHistOpen?`
      <input class="hw-hist-search" placeholder="${t('choreHistorySearch')}"
        value="${esc(_choreHistSearch)}"
        oninput="_choreHistSearch=this.value;filterChoreHistory('${esc(filter)}')">
      <div id="choreHistList">${choreHistListHTML(filtered,filter)}</div>`:''}
  </div>`;
}

function choreHistListHTML(filtered, filter) {
  return filtered.length ? filtered.map(c=>`
    <div class="hw-hist-item" data-chore-id="${c.id}">
      ${filter==='All'?`<span style="font-size:16px;flex-shrink:0">${getAvatar(c.assignee,16)}</span>`:''}
      <div class="hw-hist-desc" style="flex:1">${esc(c.text)}</div>
      <span class="hw-hist-ts">${fmtDoneAt(c.doneAt)}</span>
      ${isParent()?`<button class="del-btn" title="בטל סימון" onclick="toggleChore(${c.id})">${_ico.undo}</button>`:''}
      ${isParent()?`<button class="del-btn" onclick="deleteChore(${c.id})">${_ico.x}</button>`:''}</div>`
  ).join('') : `<div class="empty" style="padding:8px 0">${t('choreHistoryEmpty')}</div>`;
}

function filterChoreHistory(filter) {
  const listEl = el('choreHistList');
  if (!listEl) return;
  let allDone = S.chores.filter(c=>c.done);
  if (filter!=='All') allDone = allDone.filter(c=>c.assignee===filter);
  allDone.sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const q = _choreHistSearch.toLowerCase();
  const filtered = q ? allDone.filter(c=>
    c.text.toLowerCase().includes(q)||c.assignee.toLowerCase().includes(q)
  ) : allDone;
  listEl.innerHTML = choreHistListHTML(filtered, filter);
}

function toggleChoreHistory() {
  _choreHistOpen = !_choreHistOpen;
  renderChoreHistory(S.filter);
}

function toggleChore(id) {
  const c=S.chores.find(x=>x.id===id);
  if(!c||(!isParent()&&c.assignee!==S.user))return;
  if(!c.done){
    const row=document.querySelector(`.hw-item[data-chore-id="${id}"]`);
    if(row){
      row.classList.remove('hw-fly-in-active');
      void row.offsetWidth;
      row.classList.add('hw-fly-out');
      setTimeout(()=>{
        c.done=true; c.doneAt=Date.now();
        _choreHistOpen=true;
        save(); renderChores(); renderHome();
        requestAnimationFrame(()=>{
          const hist=document.querySelector(`.hw-hist-item[data-chore-id="${id}"]`);
          if(hist) hist.classList.add('hw-fly-in');
        });
      },270);
      return;
    }
    c.done=true; c.doneAt=Date.now(); _choreHistOpen=true;
  } else {
    const histRow=document.querySelector(`.hw-hist-item[data-chore-id="${id}"]`);
    if(histRow){
      histRow.classList.add('hw-fly-out-hist');
      setTimeout(()=>{
        c.done=false; delete c.doneAt;
        save(); renderChores(); renderHome();
        requestAnimationFrame(()=>{
          const active=document.querySelector(`.hw-item[data-chore-id="${id}"]`);
          if(active) active.classList.add('hw-fly-in-active');
        });
      },270);
      return;
    }
    c.done=false; delete c.doneAt;
  }
  save(); renderChores(); renderHome();
}

function deleteChore(id) {
  if (!isParent()) return;
  const idx = S.chores.findIndex(x => x.id === id);
  if (idx === -1) return;
  const chore = S.chores.splice(idx, 1)[0];
  if (_pendingDelete) { clearTimeout(_pendingDelete.timer); save(); }
  _pendingDelete = { id, chore,
    timer: setTimeout(() => { _pendingDelete = null; save(); renderHome(); }, 3000)
  };
  renderChores(); renderHome();
  _showSnackbar('המשימה נמחקה', () => {
    if (_pendingDelete && _pendingDelete.id === id) {
      clearTimeout(_pendingDelete.timer);
      S.chores.push(_pendingDelete.chore);
      _pendingDelete = null;
      save(); renderChores(); renderHome();
    }
  });
}

// ── Custom Modal ──────────────────────────────
let _cmodalResolve = null;
function _cmodalEl() {
  let ov = document.getElementById('_cmodalOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '_cmodalOverlay';
    ov.className = 'cmodal-overlay';
    ov.addEventListener('click', () => _cmodalClose(false));
    document.body.appendChild(ov);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && _cmodalResolve) _cmodalClose(false); });
  }
  return ov;
}
function _cmodalClose(val) {
  const ov = document.getElementById('_cmodalOverlay');
  if (!ov) return;
  ov.classList.remove('cmodal-visible');
  if (_cmodalResolve) { _cmodalResolve(val); _cmodalResolve = null; }
}
function _confirm(msg, opts = {}) {
  const ov = _cmodalEl();
  const dangerCls = opts.danger ? ' cmodal-danger' : '';
  const cancelLbl = opts.cancelLabel || 'ביטול';
  const okLbl     = opts.okLabel    || 'אישור';
  ov.innerHTML = `<div class="cmodal-box" onclick="event.stopPropagation()">
    <div class="cmodal-msg">${msg}</div>
    <div class="cmodal-btns">
      <button class="cmodal-btn cmodal-ok${dangerCls}" onclick="_cmodalClose(true)">${okLbl}</button>
      <button class="cmodal-btn cmodal-cancel" onclick="_cmodalClose(false)">${cancelLbl}</button>
    </div>
  </div>`;
  requestAnimationFrame(() => ov.classList.add('cmodal-visible'));
  return new Promise(res => { _cmodalResolve = res; });
}
function _alert(msg, opts = {}) {
  const ov = _cmodalEl();
  const okLbl = opts.okLabel || 'סגור';
  ov.innerHTML = `<div class="cmodal-box" onclick="event.stopPropagation()" style="max-width:320px">
    <div class="cmodal-msg">${msg}</div>
    <div class="cmodal-btns" style="justify-content:center">
      <button class="cmodal-btn cmodal-ok" style="flex:0 0 auto;min-width:110px" onclick="_cmodalClose(true)">${okLbl}</button>
    </div>
  </div>`;
  requestAnimationFrame(() => ov.classList.add('cmodal-visible'));
  return new Promise(res => { _cmodalResolve = res; });
}

function _showSnackbar(msg, undoFn) {
  let snack = el('appSnackbar');
  if (!snack) {
    snack = document.createElement('div');
    snack.id = 'appSnackbar';
    snack.className = 'snackbar';
    document.body.appendChild(snack);
  }
  snack.innerHTML = `<span class="snack-msg">${esc(msg)}</span>${undoFn ? '<button class="snack-undo" onclick="_snackUndo()">בטל</button>' : ''}`;
  snack._undoFn = undoFn;
  snack.classList.add('show');
  if (_snackTimer) clearTimeout(_snackTimer);
  _snackTimer = setTimeout(_hideSnackbar, 3000);
}
function _snackUndo() {
  const snack = el('appSnackbar');
  if (snack && snack._undoFn) snack._undoFn();
  _hideSnackbar();
}
function _hideSnackbar() {
  const snack = el('appSnackbar');
  if (snack) snack.classList.remove('show');
  if (_snackTimer) { clearTimeout(_snackTimer); _snackTimer = null; }
}
function _chore3dotToggle(id) {
  if (_chore3dotActiveId === id) { _chore3dotClose(); return; }
  _chore3dotClose();
  const cont = el('chore3dot_' + id);
  if (!cont) return;
  let panel = el('_choreGlobalMenu');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = '_choreGlobalMenu';
    document.body.appendChild(panel);
  }
  Object.assign(panel.style, {
    position:'fixed', zIndex:'9999', background:'#fff',
    borderRadius:'14px', boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
    border:'1px solid #e5e7eb', padding:'6px',
    display:'flex', flexDirection:'column', gap:'2px',
    minWidth:'110px', opacity:'0', pointerEvents:'none',
    transition:'opacity 160ms ease, transform 160ms ease',
    transform:'translateY(-6px) scale(0.96)', transformOrigin:'top left',
  });
  const btn = (emoji, text, danger, cb) => {
    const b = document.createElement('button');
    b.style.cssText = `display:flex;align-items:center;gap:8px;white-space:nowrap;padding:6px 10px;min-height:36px;border-radius:8px;border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;color:${danger?'#DC2626':'#111827'};width:100%;`;
    b.innerHTML = `<span style="width:20px;text-align:center;flex-shrink:0">${emoji}</span><span>${text}</span>`;
    b.onmouseenter = () => b.style.background = danger ? 'rgba(220,38,38,0.05)' : '#f9fafb';
    b.onmouseleave = () => b.style.background = 'transparent';
    b.onclick = cb;
    return b;
  };
  panel.innerHTML = '';
  panel.appendChild(btn('✏️', 'ערוך', false, () => { _chore3dotClose(); startEditChore(id); }));
  panel.appendChild(btn('🗑', 'מחק',  true,  () => { _chore3dotClose(); deleteChore(id); }));
  const rect = cont.querySelector('.chore-3dot-btn').getBoundingClientRect();
  panel.style.top   = (rect.bottom + 6) + 'px';
  panel.style.left  = rect.left + 'px';
  panel.style.right = 'auto';
  panel.style.opacity = '1';
  panel.style.pointerEvents = 'auto';
  panel.style.transform = 'translateY(0) scale(1)';
  _chore3dotActiveId = id;
  setTimeout(() => {
    document.addEventListener('click', function _h(e) {
      if (!panel.contains(e.target) && !cont.contains(e.target)) { _chore3dotClose(); document.removeEventListener('click', _h); }
    });
  }, 0);
}
function _chore3dotClose() {
  const p = el('_choreGlobalMenu');
  if (p) { p.style.opacity = '0'; p.style.pointerEvents = 'none'; p.style.transform = 'translateY(-6px) scale(0.96)'; }
  _chore3dotActiveId = null;
}

let _pool3dotActiveId = null;
function _pool3dotToggle(id) {
  if (_pool3dotActiveId === id) { _pool3dotClose(); return; }
  _pool3dotClose();
  const cont = el('pool3dot_' + id);
  if (!cont) return;
  let panel = el('_poolGlobalMenu');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = '_poolGlobalMenu';
    document.body.appendChild(panel);
  }
  Object.assign(panel.style, {
    position:'fixed', zIndex:'9999', background:'#fff',
    borderRadius:'14px', boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
    border:'1px solid #e5e7eb', padding:'6px',
    display:'flex', flexDirection:'column', gap:'2px',
    minWidth:'110px', opacity:'0', pointerEvents:'none',
    transition:'opacity 160ms ease, transform 160ms ease',
    transform:'translateY(-6px) scale(0.96)', transformOrigin:'top left',
  });
  const btn = (emoji, text, danger, cb) => {
    const b = document.createElement('button');
    b.style.cssText = `display:flex;align-items:center;gap:8px;white-space:nowrap;padding:6px 10px;min-height:36px;border-radius:8px;border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;color:${danger?'#DC2626':'#111827'};width:auto;`;
    b.innerHTML = `<span style="width:20px;text-align:center;flex-shrink:0">${emoji}</span><span>${text}</span>`;
    b.onmouseenter = () => b.style.background = danger ? 'rgba(220,38,38,0.05)' : '#f9fafb';
    b.onmouseleave = () => b.style.background = 'transparent';
    b.onclick = cb;
    return b;
  };
  panel.innerHTML = '';
  panel.appendChild(btn('✏️', 'ערוך', false, () => { _pool3dotClose(); startEditPoolItem(id); }));
  panel.appendChild(btn('🗑', 'מחק',  true,  () => { _pool3dotClose(); deletePoolItem(id); }));
  const rect = cont.querySelector('.chore-3dot-btn').getBoundingClientRect();
  panel.style.top  = (rect.bottom + 6) + 'px';
  panel.style.left = rect.left + 'px';
  panel.style.opacity = '1';
  panel.style.pointerEvents = 'auto';
  panel.style.transform = 'translateY(0) scale(1)';
  _pool3dotActiveId = id;
  setTimeout(() => {
    document.addEventListener('click', function _h(e) {
      if (!panel.contains(e.target) && !cont.contains(e.target)) { _pool3dotClose(); document.removeEventListener('click', _h); }
    });
  }, 0);
}
function _pool3dotClose() {
  const p = el('_poolGlobalMenu');
  if (p) { p.style.opacity = '0'; p.style.pointerEvents = 'none'; p.style.transform = 'translateY(-6px) scale(0.96)'; }
  _pool3dotActiveId = null;
}
function _initPoolSwipes() {
  if (!isParent()) return;
  const REVEAL = 90;
  document.querySelectorAll('.pool-item[data-pool-id]').forEach(row => {
    const slide = row.querySelector('.pool-slide');
    if (!slide) return;
    let startX = 0, startY = 0, curX = 0, active = false, locked = false, isOpen = false;
    slide.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      active = true; locked = false; slide.style.transition = 'none';
    }, { passive: true });
    slide.addEventListener('touchmove', e => {
      if (!active) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!locked) {
        if (Math.abs(dy) > Math.abs(dx)) { active = false; return; } // vertical scroll wins
        locked = true;
      }
      const raw = isOpen ? dx + REVEAL : dx;
      curX = Math.max(0, Math.min(REVEAL, raw));
      slide.style.transform = `translateX(${curX}px)`;
    }, { passive: true });
    slide.addEventListener('touchend', () => {
      active = false; slide.style.transition = 'transform 0.22s ease';
      if (!isOpen && curX > REVEAL / 2) { slide.style.transform = `translateX(${REVEAL}px)`; isOpen = true; }
      else if (isOpen && curX < REVEAL / 2) { slide.style.transform = 'translateX(0)'; isOpen = false; }
      else { slide.style.transform = isOpen ? `translateX(${REVEAL}px)` : 'translateX(0)'; }
      curX = 0;
    });
    slide.addEventListener('click', () => {
      if (isOpen) { slide.style.transition = 'transform 0.22s ease'; slide.style.transform = 'translateX(0)'; isOpen = false; }
    });
  });
}

function startEditChore(id) {
  // Snap slide back instantly (may be open from swipe reveal)
  const slide = document.querySelector(`[data-chore-id="${id}"] .chore-slide`);
  if (slide) { slide.style.transition = 'none'; slide.style.transform = 'translateX(0)'; }

  const body = document.querySelector(`[data-chore-id="${id}"] .chore-body`);
  const card = document.querySelector(`[data-chore-id="${id}"]`);
  if (!body || !card) return;
  const chore = S.chores.find(x => x.id === id);
  if (!chore) return;
  card.classList.add('editing');
  body.innerHTML = `<input class="chore-edit-input" id="choreEditInput_${id}" value="${esc(chore.text)}" onkeydown="if(event.key==='Enter')saveEditChore(${id});if(event.key==='Escape')cancelEditChore(${id})"><div class="chore-edit-date-row"><label class="chore-edit-date-label">📅 תאריך יעד:</label><input type="date" class="chore-qa-date chore-edit-date" id="choreEditDate_${id}" value="${chore.due||''}"><button class="chore-edit-date-clear" onclick="el('choreEditDate_${id}').value=''" title="נקה תאריך">✕</button></div><div class="chore-edit-actions"><button class="chore-edit-save" onclick="saveEditChore(${id});event.stopPropagation()">שמור</button><button class="chore-edit-cancel" onclick="cancelEditChore(${id});event.stopPropagation()">ביטול</button></div>`;
  const inp = el('choreEditInput_' + id);
  if (inp) { inp.focus(); inp.select(); }
}
function saveEditChore(id) {
  const inp = el('choreEditInput_' + id);
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  const dateInp = el('choreEditDate_' + id);
  const chore = S.chores.find(x => x.id === id);
  if (chore) {
    chore.text = text;
    chore.due = dateInp ? (dateInp.value || null) : chore.due;
  }
  save(); renderChores(); renderHome();
}
function cancelEditChore(id) { renderChores(); }
function _initChoreSwipes() {
  if (!isParent()) return;
  const REVEAL = 110;
  document.querySelectorAll('.chore-card[data-chore-id]').forEach(row => {
    const slide = row.querySelector('.chore-slide');
    if (!slide) return;
    let startX = 0, startY = 0, curX = 0, active = false, locked = false, isOpen = false;
    slide.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      active = true; locked = false; slide.style.transition = 'none';
    }, { passive: true });
    slide.addEventListener('touchmove', e => {
      if (!active) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!locked) {
        if (Math.abs(dy) > Math.abs(dx)) { active = false; return; } // vertical scroll wins
        locked = true;
      }
      curX = Math.max(0, Math.min(REVEAL, isOpen ? dx + REVEAL : dx));
      slide.style.transform = `translateX(${curX}px)`;
    }, { passive: true });
    slide.addEventListener('touchend', () => {
      active = false; slide.style.transition = 'transform 0.22s ease';
      if (!isOpen && curX > REVEAL / 2) { slide.style.transform = `translateX(${REVEAL}px)`; isOpen = true; }
      else if (isOpen && curX < REVEAL / 2) { slide.style.transform = 'translateX(0)'; isOpen = false; }
      else { slide.style.transform = isOpen ? `translateX(${REVEAL}px)` : 'translateX(0)'; }
      curX = 0;
    });
    slide.addEventListener('click', () => {
      if (isOpen) { slide.style.transition = 'transform 0.22s ease'; slide.style.transform = 'translateX(0)'; isOpen = false; }
    });
  });
}
let _choreFabAssignee = null;

function _updateChoreFormAssignee() {
  const lbl = el('choreAssigneeLabel');
  const inp = el('newChoreText');
  const name = S.filter !== 'All' ? S.filter : _choreFabAssignee;
  if (lbl) {
    if (name && isParent()) {
      lbl.style.display = '';
      lbl.innerHTML = `<span class="chore-qa-av">${getAvatar(name, 18)}</span>${esc(name)}`;
    } else {
      lbl.style.display = 'none';
    }
  }
  if (inp) inp.placeholder = name ? `הוסף משימה ל${name}...` : t('chorePlaceholder');
}

function choreFabClick() {
  if (!isParent() || S.filter !== 'All') {
    _choreOpenForm();
    return;
  }
  // All view — show member picker
  const picker = el('choreFabPicker');
  if (!picker) return;
  if (picker.classList.contains('open')) { _choreHidePicker(); return; }
  picker.innerHTML = getAllMemberNames().map(name =>
    `<button class="comm-fab-pick-item" onclick="_choreFabPick('${esc(name)}')">
      <span class="comm-fab-pick-avatar">${getAvatar(name)}</span>
      <span>${esc(name)}</span>
    </button>`
  ).join('');
  picker.classList.add('open');
  el('choreFab')?.classList.add('chore-fab-open');
  setTimeout(() => {
    document.addEventListener('click', function _h(e) {
      if (!el('choreFabWrap')?.contains(e.target)) { _choreHidePicker(); document.removeEventListener('click', _h); }
    });
  }, 0);
}

function _choreFabPick(name) {
  _choreFabAssignee = name;
  _choreHidePicker();
  _updateChoreFormAssignee();
  _choreOpenForm();
}

function _choreHidePicker() {
  el('choreFabPicker')?.classList.remove('open');
  el('choreFab')?.classList.remove('chore-fab-open');
}

function _choreOpenForm() {
  const card = el('addChoreCard');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => el('newChoreText')?.focus(), 300);
}

function _choreInputGrow(ta) {
  ta.style.height = 'auto';
  const lineH = parseFloat(getComputedStyle(ta).lineHeight) || 21;
  const padV  = parseFloat(getComputedStyle(ta).paddingTop) + parseFloat(getComputedStyle(ta).paddingBottom);
  const maxH  = lineH * 2 + padV;
  ta.style.overflowY = ta.scrollHeight > maxH ? 'auto' : 'hidden';
  ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px';
}

function addChore(){
  const text = el('newChoreText').value.trim();
  if (!text) return;
  const assignee = isParent()
    ? (S.filter !== 'All' ? S.filter : (_choreFabAssignee || getAllMemberNames()[0]))
    : S.user;
  const due = el('newChoreDate')?.value || '';
  const chore = {id:Date.now(),text,assignee,priority:el('newChorePriority').value,done:false};
  if (due) chore.due = due;
  S.chores.push(chore);
  const ta = el('newChoreText');
  ta.value='';
  ta.style.height='';
  ta.style.overflowY='hidden';
  const dateEl = el('newChoreDate');
  if (dateEl) dateEl.value='';
  _priSegPick('medium');
  _choreFabAssignee = null;
  _updateChoreFormAssignee();
  save(); renderHome(); renderChores();
}

// ════════════════════════════════════════
//  SUPERMARKET
// ════════════════════════════════════════
let _grocerySection = 'pool';
let _poolQtyActiveId = null;  // poolId whose inline qty control is visible (mobile)
let _poolEditFor = null;     // poolId currently being edited
let _poolEditQtyType = 'count'; // unit type in active edit row
let _poolNewQtyType = 'count';  // unit for next new pool item: 'count' | 'kg'
let _poolLastCat = null;        // last category chosen when adding a pool item
const _collapsedPoolCats     = new Set();
const _collapsedShoppingCats = new Set();
let _poolSearch = '';
let _poolCatFilter = new Set();
let _poolChipsOpen = false;
let _historySearch = '';
const _expandedHistoryDates = new Set();

function onHistorySearch(val) {
  _historySearch = val.trim().toLowerCase();
  renderShoppingHistory();
}

function toggleHistoryDate(el) {
  const key = el.dataset.datekey;
  if (_expandedHistoryDates.has(key)) _expandedHistoryDates.delete(key);
  else _expandedHistoryDates.add(key);
  renderShoppingHistory();
}

function onPoolSearch(val) {
  _poolSearch = val.trim().toLowerCase();
  renderPool();
}

function pickPoolCat(name) {
  if (!name) { _poolCatFilter.clear(); }
  else if (_poolCatFilter.has(name)) { _poolCatFilter.delete(name); }
  else { _poolCatFilter.add(name); }
  renderPool();
}
function togglePoolChips() {
  _poolChipsOpen = !_poolChipsOpen;
  renderPool();
}

function toggleCatCollapse(el) {
  const sec = el.dataset.section;
  const cat = el.dataset.cat;
  const set = sec === 'pool' ? _collapsedPoolCats : _collapsedShoppingCats;
  if (set.has(cat)) set.delete(cat); else set.add(cat);
  if (sec === 'pool') renderPool(); else renderShoppingList();
}

function togglePoolAddForm(forceOpen) {
  const form = el('poolAddForm');
  const wrap = el('poolAddWrap');
  if (!form) return;
  const open = forceOpen !== undefined ? forceOpen : form.style.display === 'none';
  form.style.display = open ? '' : 'none';
  if (wrap) wrap.classList.toggle('active', open);
  if (open) {
    if (_poolLastCat) {
      const sel = el('poolCatSelect');
      if (sel) { sel.value = _poolLastCat; _buildSoftDd('ddPoolCat', 'poolCatSelect'); }
    }
    setTimeout(() => el('poolItemInput')?.focus(), 30);
  }
}

function togglePoolNewQtyType() {
  _poolNewQtyType = _poolNewQtyType === 'count' ? 'kg' : 'count';
  const btn = el('poolUnitToggle');
  if (btn) {
    btn.textContent = _poolNewQtyType === 'kg' ? 'ק"ג' : 'יח\'';
    btn.classList.toggle('kg', _poolNewQtyType === 'kg');
  }
}

function fmtQty(qty, qtyType) {
  if (qtyType === 'kg') {
    const n = parseFloat(qty) || 0;
    return (Number.isInteger(n) ? n : n.toFixed(1)) + ' ק"ג';
  }
  return '×' + (parseInt(qty) || 1);
}

function migrateGroceryIfNeeded() {
  if (!S.groceryPool.length && S.grocery?.length) {
    S.groceryPool = S.grocery.map(g => ({ id: g.id, name: g.text, category: g.category || '' }));
    saveGrocery();
  }
}

async function saveGrocery() {
  if (!S.uid || !fbDb) return;
  try {
    await fbDb.collection('families').doc(S.uid).update({
      groceryPool: S.groceryPool, shoppingList: S.shoppingList, inCart: S.inCart,
    });
  } catch(e) { console.error('saveGrocery error:', e); }
}

async function saveShoppingHistory() {
  if (!S.uid || !fbDb) return;
  try {
    await fbDb.collection('families').doc(S.uid).update({ shoppingHistory: S.shoppingHistory });
  } catch(e) { console.error('saveShoppingHistory error:', e); }
}

function getShoppingHistoryTtlDays() {
  return familyData?.shoppingHistoryTtlDays ?? 60;
}

function pruneShoppingHistory() {
  const ttl = getShoppingHistoryTtlDays();
  if (!ttl || ttl <= 0) return; // 0 = keep forever
  const cutoff = Date.now() - ttl * 24 * 60 * 60 * 1000;
  const before = S.shoppingHistory.length;
  S.shoppingHistory = S.shoppingHistory.filter(e => e.ts >= cutoff);
  if (S.shoppingHistory.length < before) saveShoppingHistory();
}

async function saveShoppingHistoryTtl(days) {
  if (!S.uid || !fbDb) return;
  await fbDb.collection('families').doc(S.uid).update({ shoppingHistoryTtlDays: days });
  if (familyData) familyData.shoppingHistoryTtlDays = days;
  pruneShoppingHistory();
}

function _scrollY() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function _scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.scrollTo({ top: 0, behavior: 'smooth' });
}
function _updateScrollTopBtn() {
  const btn = el('scrollTopBtn');
  if (!btn) return;
  const show = _scrollY() > 80 && (S.tab === 'chores' || (_grocerySection === 'pool' && S.tab === 'grocery'));
  btn.classList.toggle('visible', show);
}
window.addEventListener('scroll', _updateScrollTopBtn, { passive: true });
document.addEventListener('scroll', _updateScrollTopBtn, { passive: true });
window.addEventListener('resize', () => {
  ['homeChips','choresChips','communityChips','childTabsContainer'].forEach(_applyChipsSpread);
}, { passive: true });

function switchGrocerySection(sec) {
  if (!isParent() && sec !== 'shopping') sec = 'shopping';
  _grocerySection = sec;
  ['pool','shopping','history'].forEach(s => {
    el(`grocerySec-${s}`).style.display = s === sec ? '' : 'none';
    el(`gtab-${s}`)?.classList.toggle('active', s === sec);
  });
  if (sec !== 'shopping') el('doneShoppingBtn').style.display = 'none';
  if (sec === 'pool')     renderPool();
  if (sec === 'shopping') renderShoppingList();
  if (sec === 'history')  renderShoppingHistory();
  _updateScrollTopBtn();
}

function renderSupermarket() {
  const kidMode = !isParent();
  el('gtab-pool')?.style.setProperty('display', kidMode ? 'none' : '');
  el('gtab-history')?.style.setProperty('display', kidMode ? 'none' : '');
  if (kidMode && _grocerySection !== 'shopping') switchGrocerySection('shopping');
  renderPool();
  if (_grocerySection === 'shopping') renderShoppingList();
  else if (_grocerySection === 'history') renderShoppingHistory();
}

function renderPool() {
  const ed = isParent();
  const cats = getGroceryCats();
  const knownCats = new Set(cats.map(c => c.name));
  let html = '';

  function poolItemHtml(p) {
    const inShoppingList = S.shoppingList.some(x => x.poolId === p.id);
    const inCartAlready  = !inShoppingList && S.inCart.some(x => x.poolId === p.id);
    const inList = inShoppingList || inCartAlready;
    const isKg = p.qtyType === 'kg';
    const unitLabel = isKg ? 'ק"ג' : 'יח\'';

    if (_poolEditFor === p.id) {
      const editIsKg = _poolEditQtyType === 'kg';
      const catOptions = getGroceryCats().map(c =>
        `<option value="${esc(c.name)}"${c.name===p.category?' selected':''}>${c.emoji} ${esc(c.name)}</option>`).join('');
      return `<div class="pool-item pool-item-edit-row">
        <input class="g-input" id="poolEditName_${p.id}" value="${esc(p.name)}"
          style="flex:1;min-width:80px;padding:6px 10px"
          onkeydown="if(event.key==='Enter')confirmEditPoolItem(${p.id})">
        <select id="poolEditCat_${p.id}" style="display:none">${catOptions}</select>
        <div id="poolEditCatDd_${p.id}" style="flex-shrink:0"></div>
        <button class="unit-toggle${editIsKg?' kg':''}" id="poolEditUnit_${p.id}"
          onclick="togglePoolEditQtyType(${p.id})">${editIsKg?'ק"ג':'יח\''}</button>
        <button class="cart-btn" onclick="confirmEditPoolItem(${p.id})">✓</button>
        <button class="pool-add-btn" onclick="cancelEditPoolItem()" style="border-color:#718096;color:#718096">✕</button>
      </div>`;
    }

    const threeDotSVG = `<svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;height:14px;display:block"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>`;
    const listItem = S.shoppingList.find(x => x.poolId === p.id);
    const qtyVal = listItem ? listItem.qty : (p.lastQty || 1);
    const isActive = _poolQtyActiveId === p.id;

    if (inCartAlready) {
      return `<div class="pool-item pool-item-in-cart" data-pool-id="${p.id}">
        ${ed?`<div class="pool-reveal-zone">
          <button class="chore-action-btn chore-action-delete" onclick="deletePoolItem(${p.id})">${_ico.trash}</button>
          <div class="chore-action-sep"></div>
          <button class="chore-action-btn chore-action-edit" onclick="startEditPoolItem(${p.id})">${_ico.edit}</button>
        </div>`:''}
        <div class="pool-slide">
          <span class="pool-in-cart-check">✓</span>
          <div class="pool-item-name">${esc(p.name)}<span class="unit-badge">${unitLabel}</span></div>
          ${ed?`<div class="pool-3dot" id="pool3dot_${p.id}"><button class="chore-3dot-btn" onclick="_pool3dotToggle(${p.id});event.stopPropagation()">${threeDotSVG}</button></div>`:''}
        </div>
      </div>`;
    }
    if (inShoppingList) {
      return `<div class="pool-item pool-item-in-list${isActive?' qty-active':''}" data-pool-id="${p.id}">
        ${ed?`<div class="pool-reveal-zone">
          <button class="chore-action-btn chore-action-delete" onclick="deletePoolItem(${p.id})">${_ico.trash}</button>
          <div class="chore-action-sep"></div>
          <button class="chore-action-btn chore-action-edit" onclick="startEditPoolItem(${p.id})">${_ico.edit}</button>
        </div>`:''}
        <div class="pool-slide pool-clickable" onclick="addPoolItemNow(${p.id})">
          <div class="pool-item-name">${esc(p.name)}<span class="unit-badge">${unitLabel}</span></div>
          <div class="pool-qty-inline" onclick="event.stopPropagation()">
            <input class="qty-input${isKg?' kg':''}" type="number"
              min="${isKg?'0.1':'1'}" step="${isKg?'0.1':'1'}" value="${qtyVal}"
              onfocus="this.select()"
              oninput="updatePoolQty(${p.id},this.value)${isKg?";this.value=this.value.replace(/(\\..{1})./g,'$1')":""}">
            <span class="qty-unit-label">${unitLabel}</span>
          </div>
          ${ed?`<div class="pool-3dot" id="pool3dot_${p.id}"><button class="chore-3dot-btn" onclick="_pool3dotToggle(${p.id});event.stopPropagation()">${threeDotSVG}</button></div>`:''}
        </div>
      </div>`;
    }
    return `<div class="pool-item" data-pool-id="${p.id}">
      ${ed?`<div class="pool-reveal-zone">
        <button class="chore-action-btn chore-action-delete" onclick="deletePoolItem(${p.id})">${_ico.trash}</button>
        <div class="chore-action-sep"></div>
        <button class="chore-action-btn chore-action-edit" onclick="startEditPoolItem(${p.id})">${_ico.edit}</button>
      </div>`:''}
      <div class="pool-slide pool-clickable" onclick="addPoolItemNow(${p.id})">
        <div class="pool-item-name">${esc(p.name)}<span class="unit-badge">${unitLabel}</span></div>
        ${ed?`<div class="pool-3dot" id="pool3dot_${p.id}"><button class="chore-3dot-btn" onclick="_pool3dotToggle(${p.id});event.stopPropagation()">${threeDotSVG}</button></div>`:''}
      </div>
    </div>`;
  }

  // Render category chips
  const chipCats = cats.filter(c => S.groceryPool.some(p => p.category === c.name));
  const hasOrphans = S.groceryPool.some(p => !knownCats.has(p.category));
  const chipsEl = el('poolCatChips');
  if (chipsEl) {
    const prevChipsScroll = chipsEl.querySelector('.cat-chips')?.scrollLeft ?? 0;
    const chipCount = chipCats.length + (hasOrphans ? 1 : 0);
    if (chipCount > 1) {
      const hasFilter = _poolCatFilter.size > 0;
      const clearX = (name) => `<span class="cat-chip-x" onclick="pickPoolCat('${name}');event.stopPropagation()">×</span>`;
      const chevron = _poolChipsOpen ? '▴' : '▾';
      // Active chips always shown inline next to toggle button
      const activeChips = [..._poolCatFilter].map(name => {
        const c = cats.find(x => x.name === name);
        const label = c ? `${c.emoji} ${esc(name)}` : name === '__other__' ? 'אחר' : esc(name);
        return `<button class="cat-chip active" onclick="pickPoolCat('${esc(name)}')">${label}${clearX(name)}</button>`;
      }).join('');
      const allChip = `<button class="cat-chip${!hasFilter?' active':''}" onclick="pickPoolCat(null)">הכל</button>`;
      const catChips = chipCats.map(c => {
        const active = _poolCatFilter.has(c.name);
        return `<button class="cat-chip${active?' active':''}" onclick="pickPoolCat('${esc(c.name)}')">${c.emoji} ${esc(c.name)}</button>`;
      }).join('');
      const orphanChip = hasOrphans
        ? (() => { const active = _poolCatFilter.has('__other__'); return `<button class="cat-chip${active?' active':''}" onclick="pickPoolCat('__other__')">אחר</button>`; })()
        : '';
      const chipsRow = _poolChipsOpen
        ? `<div class="cat-chips">${allChip}${catChips}${orphanChip}</div>`
        : '';
      chipsEl.innerHTML = `
        <div class="cat-chips-bar">
          <button class="cat-chips-toggle${hasFilter?' has-filter':''}" onclick="togglePoolChips()">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>
            סינון
            <span class="cat-chips-chevron">${chevron}</span>
          </button>${activeChips}
        </div>
        ${chipsRow}`;
      if (prevChipsScroll) {
        const newChips = chipsEl.querySelector('.cat-chips');
        if (newChips) newChips.scrollLeft = prevChipsScroll;
      }
    } else {
      chipsEl.innerHTML = '';
    }
  }

  const searching = _poolSearch.length > 0;
  let poolItems = _poolSearch.length > 0
    ? S.groceryPool.filter(p => p.name.toLowerCase().includes(_poolSearch))
    : S.groceryPool;
  if (_poolCatFilter.size > 0) {
    poolItems = poolItems.filter(p =>
      (_poolCatFilter.has('__other__') && !knownCats.has(p.category)) ||
      _poolCatFilter.has(p.category)
    );
  }

  function poolCatHtml(emoji, name, items) {
    const collapsed = !searching && _collapsedPoolCats.has(name);
    return `<div class="cat-title cat-collapsible" data-section="pool" data-cat="${esc(name)}" onclick="toggleCatCollapse(this)">
        <span class="cat-chevron">${collapsed?'▴':'▾'}</span>${emoji} ${esc(name)}<span class="cat-count">${collapsed?` (${items.length})`:''}</span>
      </div>${collapsed ? '' : items.map(poolItemHtml).join('')}`;
  }

  if (searching && !poolItems.length) {
    html = `<div class="empty">אין תוצאות עבור "${esc(_poolSearch)}"</div>`;
  } else {
    cats.forEach(cat => {
      const items = poolItems.filter(p => p.category === cat.name);
      if (!items.length) return;
      html += poolCatHtml(cat.emoji, cat.name, items);
    });
    const orphans = poolItems.filter(p => !knownCats.has(p.category));
    if (orphans.length) html += poolCatHtml('🛒', 'אחר', orphans);
  }
  el('poolList').innerHTML = html || `<div class="empty">${t('poolEmpty')}</div>`;
  _initPoolSwipes();
  if (_poolEditFor !== null) {
    const inp = el(`poolEditName_${_poolEditFor}`);
    if (inp) { inp.focus(); inp.select(); }
  }
}

function addPoolItem() {
  if (!isParent()) return;
  const name = el('poolItemInput').value.trim();
  if (!name) return;
  if (S.groceryPool.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    el('poolItemInput').value = '';
    return;
  }
  const category = el('poolCatSelect').value;
  _poolLastCat = category;
  S.groceryPool.push({ id: Date.now(), name, category, qtyType: _poolNewQtyType });
  el('poolItemInput').value = '';
  saveGrocery();
  renderPool();
  setTimeout(() => el('poolItemInput')?.focus(), 30);
}

function deletePoolItem(id) {
  if (!isParent()) return;
  S.groceryPool  = S.groceryPool.filter(p => p.id !== id);
  S.shoppingList = S.shoppingList.filter(x => x.poolId !== id);
  saveGrocery();
  renderPool();
}

function addPoolItemNow(poolId) {
  if (S.inCart.some(x => x.poolId === poolId)) return; // already in cart, ignore
  if (S.shoppingList.some(x => x.poolId === poolId)) {
    // Already in list — remove it (toggle off)
    removePoolItemFromList(poolId);
    return;
  }
  const pool = S.groceryPool.find(p => p.id === poolId);
  if (!pool) return;
  const qty = pool.lastQty || 1;
  S.shoppingList.push({ id: Date.now(), poolId, name: pool.name, category: pool.category, qty, qtyType: pool.qtyType || 'count', requestedQty: qty });
  _poolQtyActiveId = poolId;
  saveGrocery();
  renderPool();
  renderShoppingList();
}

function removePoolItemFromList(poolId) {
  if (!isParent()) return;
  const idx = S.shoppingList.findIndex(x => x.poolId === poolId);
  if (idx === -1) return;
  S.shoppingList.splice(idx, 1);
  if (_poolQtyActiveId === poolId) _poolQtyActiveId = null;
  saveGrocery();
  renderPool();
  renderShoppingList();
}

function setPoolQtyActive(poolId) {
  if (_poolQtyActiveId === poolId) return;
  // Update DOM classes directly — no full re-render
  if (_poolQtyActiveId !== null) {
    const old = document.querySelector(`[data-pool-id="${_poolQtyActiveId}"]`);
    if (old) old.classList.remove('qty-active');
  }
  _poolQtyActiveId = poolId;
  const cur = document.querySelector(`[data-pool-id="${poolId}"]`);
  if (cur) cur.classList.add('qty-active');
}

let _poolQtySaveTimer = null;
function updatePoolQty(poolId, rawValue) {
  const pool = S.groceryPool.find(p => p.id === poolId);
  if (!pool) return;
  const isKg = pool.qtyType === 'kg';
  const raw = isKg ? parseFloat(parseFloat(rawValue).toFixed(1)) : parseInt(rawValue);
  const qty = isKg ? Math.max(0.1, raw || 0.1) : Math.max(1, raw || 1);
  const listItem = S.shoppingList.find(x => x.poolId === poolId);
  if (listItem) listItem.qty = qty;
  pool.lastQty = qty;
  // Update the qty badge in the shopping list without a full re-render
  clearTimeout(_poolQtySaveTimer);
  _poolQtySaveTimer = setTimeout(() => { saveGrocery(); renderShoppingList(); }, 600);
}

// Legacy stubs (no longer used but kept in case of any lingering references)
function confirmAddToList() {}
function cancelAddToList() {}

function startEditPoolItem(id) {
  const pool = S.groceryPool.find(p => p.id === id);
  if (!pool) return;
  // Snap slide back instantly (may be open from swipe reveal)
  const slide = document.querySelector(`[data-pool-id="${id}"] .pool-slide`);
  if (slide) { slide.style.transition = 'none'; slide.style.transform = 'translateX(0)'; }
  _poolEditFor = id;
  _poolEditQtyType = pool.qtyType || 'count';
  _poolQtyActiveId = null; // close any active qty control
  renderPool();
  setTimeout(() => _buildSoftDd('poolEditCatDd_' + id, 'poolEditCat_' + id), 0);
}

function togglePoolEditQtyType(id) {
  _poolEditQtyType = _poolEditQtyType === 'count' ? 'kg' : 'count';
  const btn = el(`poolEditUnit_${id}`);
  if (btn) {
    btn.textContent = _poolEditQtyType === 'kg' ? 'ק"ג' : 'יח\'';
    btn.classList.toggle('kg', _poolEditQtyType === 'kg');
  }
}

function confirmEditPoolItem(id) {
  const pool = S.groceryPool.find(p => p.id === id);
  if (!pool) return;
  const newName = el(`poolEditName_${id}`)?.value.trim();
  if (!newName) return;
  const newCat  = el(`poolEditCat_${id}`)?.value || '';
  const oldName = pool.name;
  pool.name     = newName;
  pool.category = newCat;
  pool.qtyType  = _poolEditQtyType;
  // Sync name/category into existing shoppingList and inCart entries
  S.shoppingList.forEach(x => { if (x.poolId === id) { x.name = newName; x.category = newCat; x.qtyType = _poolEditQtyType; } });
  S.inCart.forEach(x =>       { if (x.poolId === id) { x.name = newName; x.category = newCat; x.qtyType = _poolEditQtyType; } });
  _poolEditFor = null;
  saveGrocery();
  renderPool();
}

function cancelEditPoolItem() {
  _poolEditFor = null;
  renderPool();
}

function renderShoppingList() {
  const ed = isParent();
  const hasContent = S.shoppingList.length || S.inCart.length;
  if (!hasContent) {
    el('shoppingListEl').innerHTML = `<div class="empty">${t('shoppingListEmpty')}</div>`;
    el('doneShoppingBtn').style.display = 'none';
    return;
  }
  let html = '';
  const cats = getGroceryCats();
  const knownCats = new Set(cats.map(c => c.name));

  function listItemHtml(item) {
    const isKg = item.qtyType === 'kg';
    const unitLabel = isKg ? 'ק"ג' : 'יח\'';
    const requested = item.requestedQty ?? item.qty ?? 1;
    const actual = item.qty ?? 1;
    const hasGap = actual < requested;
    const badgeStyle = hasGap
      ? 'background:#fff3e0;color:#e65100'
      : 'background:#e9f5ff;color:#2b6cb0';
    const qtyBadge = `<span class="unit-badge slist-req-badge" style="${badgeStyle}">${fmtQty(requested, item.qtyType)}</span>`;
    return `<div class="slist-item">
      <div class="slist-item-name">${esc(item.name)} ${qtyBadge}</div>
      <input class="qty-input${isKg?' kg':''}" type="number"
        min="${isKg?'0.1':'1'}" step="${isKg?'0.1':'1'}" value="${actual}"
        onfocus="this.select()"
        ${isKg?`oninput="this.value=this.value.replace(/(\\\.\\d{1})\\d+/,'$1')"`:``}
        onchange="updateListQty(${item.id},this.value)">
      <span class="qty-unit-label">${unitLabel}</span>
      <button class="cart-btn" onclick="moveToCart(${item.id})" aria-label="${t('toCart')}">${_ico.cart}</button>
      ${ed?`<button class="del-btn" onclick="removeFromShoppingList(${item.id})">${_ico.trash}</button>`:''}
    </div>`;
  }

  // Items still to grab
  if (S.shoppingList.length) {
    html += `<div class="super-section-label" style="display:flex;align-items:center;justify-content:space-between">
      <span>📋 ${t('stillNeed')} (${S.shoppingList.length})</span>
      ${ed?`<button class="clear-list-btn" onclick="clearShoppingList()">× נקה</button>`:''}
    </div>`;
    function shoppingCatHtml(emoji, name, items) {
      const collapsed = _collapsedShoppingCats.has(name);
      return `<div class="cat-title cat-collapsible" data-section="shopping" data-cat="${esc(name)}" onclick="toggleCatCollapse(this)">
          <span class="cat-chevron">${collapsed?'▴':'▾'}</span>${emoji} ${esc(name)}<span class="cat-count">${collapsed?` (${items.length})`:''}</span>
        </div>${collapsed ? '' : items.map(listItemHtml).join('')}`;
    }
    cats.forEach(cat => {
      const items = S.shoppingList.filter(x => x.category === cat.name);
      if (!items.length) return;
      html += shoppingCatHtml(cat.emoji, cat.name, items);
    });
    const orphans = S.shoppingList.filter(x => !knownCats.has(x.category));
    if (orphans.length) html += shoppingCatHtml('🛒', 'אחר', orphans);
  }

  // Items already in cart
  if (S.inCart.length) {
    html += `<div class="super-section-label">✅ ${t('inCartLabel')} (${S.inCart.length})</div>`;
    html += S.inCart.map(item => {
      const requested = item.requestedQty ?? item.qty ?? 1;
      const actual = item.qty ?? 1;
      const gapHtml = actual !== requested
        ? `<span class="cart-req-qty">מ-${fmtQty(requested, item.qtyType)}</span>`
        : '';
      return `<div class="cart-item">
        <div class="cart-item-name">${esc(item.name)} <span class="unit-badge" style="background:var(--gray-100);color:var(--gray-500)">${fmtQty(actual, item.qtyType)}</span>${gapHtml}</div>
        <button class="return-to-list-btn" onclick="returnToList(${item.id})">${t('returnToList')}</button>
      </div>`;
    }).join('');
  }

  el('shoppingListEl').innerHTML = html;
  el('doneShoppingBtn').style.display = (ed && hasContent && _grocerySection === 'shopping') ? '' : 'none';
}


function moveToCart(id) {
  const idx = S.shoppingList.findIndex(x => x.id === id);
  if (idx === -1) return;
  const item = S.shoppingList.splice(idx, 1)[0];
  S.inCart.push({ ...item, id: Date.now(), requestedQty: item.requestedQty ?? item.qty ?? 1 });
  saveGrocery();
  renderShoppingList();
  renderPool();
}

function updateCartQty(id, val) {
  const item = S.inCart.find(x => x.id === id);
  if (!item) return;
  item.qty = item.qtyType === 'kg'
    ? Math.max(0.1, Math.round(parseFloat(val) * 10) / 10 || 0.1)
    : Math.max(1, parseInt(val) || 1);
  saveGrocery();
  renderShoppingList();
}

function removeFromShoppingList(id) {
  if (!isParent()) return;
  S.shoppingList = S.shoppingList.filter(x => x.id !== id);
  saveGrocery();
  renderShoppingList();
}
async function clearShoppingList() {
  if (!isParent()) return;
  if (!await _confirm('לנקות את כל הרשימה?', { danger: true, okLabel: 'נקה' })) return;
  S.shoppingList = [];
  S.inCart = [];
  saveGrocery();
  renderShoppingList();
  renderPool();
}

function updateListQty(id, val) {
  const item = S.shoppingList.find(x => x.id === id);
  if (!item) return;
  const isKg = item.qtyType === 'kg';
  const parsed = isKg ? parseFloat(parseFloat(val).toFixed(1)) : parseInt(val);
  if (!isNaN(parsed) && parsed > 0) {
    item.qty = isKg ? Math.max(0.1, parsed) : Math.max(1, parsed);
    // Update badge color in-place (text stays as requestedQty, only color reflects gap)
    const inp = document.querySelector(`input[onchange="updateListQty(${id},this.value)"]`);
    const badge = inp?.closest('.slist-item')?.querySelector('.slist-req-badge');
    if (badge) {
      const requested = item.requestedQty ?? item.qty;
      const hasGap = item.qty < requested;
      badge.style.background = hasGap ? '#fff3e0' : '#e9f5ff';
      badge.style.color      = hasGap ? '#e65100' : '#2b6cb0';
    }
    saveGrocery();
  }
}

function updateCartQty(id, val) {
  const item = S.inCart.find(x => x.id === id);
  if (!item) return;
  const isKg = item.qtyType === 'kg';
  const parsed = isKg ? parseFloat(parseFloat(val).toFixed(1)) : parseInt(val);
  if (!isNaN(parsed) && parsed > 0) {
    item.qty = isKg ? Math.max(0.1, parsed) : Math.max(1, parsed);
    saveGrocery();
  }
}

function returnToList(id) {
  const idx = S.inCart.findIndex(x => x.id === id);
  if (idx === -1) return;
  const item = S.inCart.splice(idx, 1)[0];
  S.shoppingList.push({ ...item, id: Date.now() });
  saveGrocery();
  renderShoppingList();
  renderPool();
}

async function doneShopping() {
  if (!isParent()) return;
  const missed = [...S.shoppingList];
  const bought = S.inCart.length;
  const confirmMsg = t('doneShoppingConfirm', bought, missed.length);
  if (!await _confirm(confirmMsg, { okLabel: 'סיימתי' })) return;
  const msg = t('doneShoppingMsg', S.user, bought, missed.map(x => x.name));
  try {
    await fbDb.collection('families').doc(S.uid)
      .collection('notifications').add({
        type: 'shopping_done',
        message: msg,
        by: S.user,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        dismissed: false,
      });
  } catch(e) { console.error('doneShopping notif:', e); }
  // Save to history (keep last 50 sessions, most recent first)
  const entry = {
    id: Date.now(),
    ts: Date.now(),
    by: S.user,
    bought: S.inCart.map(x => ({ name: x.name, qty: x.qty || 1, qtyType: x.qtyType || 'count' })),
    missed: missed.map(x => ({ name: x.name, qty: x.qty || 1, qtyType: x.qtyType || 'count' })),
  };
  const ttlCutoff = Date.now() - getShoppingHistoryTtlDays() * 24 * 60 * 60 * 1000;
  S.shoppingHistory = [entry, ...S.shoppingHistory.filter(e => e.ts >= ttlCutoff)].slice(0, 50);
  S.shoppingList = [];
  S.inCart = [];
  saveGrocery();
  saveShoppingHistory();
  switchGrocerySection('shopping');
}

function _histEntryHtml(entry, searchTerm) {
  const d = new Date(entry.ts);
  const timeStr = d.toLocaleTimeString(t('locale'), { hour:'2-digit', minute:'2-digit' });
  const datePrefix = searchTerm
    ? `<span class="hist-search-date">${d.toLocaleDateString(t('locale'), { day:'numeric', month:'short', year:'numeric' })} · </span>`
    : '';
  const emoji = getEmoji(entry.by) || '🛒';

  const hl = name => {
    if (!searchTerm) return esc(name);
    const lo = name.toLowerCase(), idx = lo.indexOf(searchTerm);
    if (idx === -1) return esc(name);
    return esc(name.slice(0, idx))
      + `<mark>${esc(name.slice(idx, idx + searchTerm.length))}</mark>`
      + esc(name.slice(idx + searchTerm.length));
  };

  const boughtHtml = entry.bought.map(x =>
    `<span class="hist-item"><bdi>${hl(x.name)}</bdi><span class="hist-qty">${fmtQty(x.qty, x.qtyType)}</span></span>`
  ).join('<span class="hist-sep"> · </span>');
  const missedHtml = entry.missed.length
    ? `<div class="hist-missed-text"><span class="hist-missed-label">${t('historyMissed')}:</span> `
      + entry.missed.map(x => hl(x.name)).join(', ')
      + `</div>`
    : '';

  return `<div class="hist-entry">
    <div class="hist-header">
      <span class="hist-who">${emoji} ${esc(entry.by)}</span>
      <span class="hist-when">${datePrefix}${timeStr}</span>
    </div>
    <div class="hist-items-text">${boughtHtml}</div>
    ${missedHtml}
  </div>`;
}

function renderShoppingHistory() {
  const list = el('historyList');
  if (!list) return;
  if (!S.shoppingHistory.length) {
    list.innerHTML = `<div class="empty">${t('shoppingHistoryEmpty')}</div>`;
    return;
  }

  const search = _historySearch;

  // ── Search mode: flat results ──────────────────────────
  if (search) {
    const results = S.shoppingHistory.filter(e =>
      [...e.bought, ...e.missed].some(x => x.name.toLowerCase().includes(search))
    );
    if (!results.length) {
      list.innerHTML = `<div class="empty">לא נמצא "${esc(search)}" בהיסטוריה</div>`;
      return;
    }
    list.innerHTML = `<div class="hist-search-count">${results.length} תוצאות</div>`
      + results.map(e => _histEntryHtml(e, search)).join('');
    return;
  }

  // ── Grouped by date ────────────────────────────────────
  const groups = new Map();
  S.shoppingHistory.forEach(entry => {
    const key = new Date(entry.ts).toLocaleDateString(t('locale'), { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  let html = '';
  groups.forEach((entries, key) => {
    const expanded = _expandedHistoryDates.has(key);
    const count = entries.length;
    html += `<div class="hist-date-header" data-datekey="${esc(key)}" onclick="toggleHistoryDate(this)">
      <span class="cat-chevron">${expanded ? '▾' : '▴'}</span>
      <span class="hist-date-label">${key}</span>
      <span class="hist-date-count">${count} ${count > 1 ? 'קניות' : 'קנייה'}</span>
    </div>`;
    if (expanded) html += entries.map(e => _histEntryHtml(e, '')).join('');
  });
  list.innerHTML = html;
}

// ════════════════════════════════════════
//  HOMEWORK
// ════════════════════════════════════════
let _hwHistOpen = false;
let _hwHistSearch = '';
let _hwScope      = 'personal';
let _hwSubjectFilter = null;

function fmtDoneAt(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString(t('locale'), {hour:'2-digit', minute:'2-digit'});
  return d.toLocaleDateString(t('locale'), {month:'short', day:'numeric'});
}

function renderHomework(){
  if (!isParent() && S.child !== S.user) { S.child = S.user; }
  const kids=isParent()?getKids():getKids().filter(k=>k===S.user);
  const childTabsEl=el('childTabsContainer');
  const showKidChips = kids.length >= 2;
  childTabsEl.style.display = showKidChips ? '' : 'none';
  if (showKidChips) { childTabsEl.innerHTML = _hwKidChipsHtml(kids); _applyChipsSpread('childTabsContainer'); }

  // Scope toggle: parents only
  const scopeEl=el('hwScopeSeg');
  if(scopeEl)scopeEl.style.display=isParent()?'':'none';

  // Build full (unfiltered) lists first for subject chip computation
  let classHw=S.homework.filter(h=>h.scope==='class');
  const allPending=S.child
    ? S.homework.filter(h=>(!h.scope||h.scope==='personal')&&h.child===S.child&&!h.done)
    : [];

  // Subject filter chips — union of subjects with at least one pending item
  const subjChipsEl=el('hwSubjectChips');
  if(subjChipsEl){
    const classNotDone=classHw.filter(h=>!(h.doneBy&&h.doneBy[S.child]));
    const allSubjs=[...new Set([...classNotDone,...allPending].map(h=>h.subject).filter(Boolean))];
    if(allSubjs.length>=1){
      if(_hwSubjectFilter&&!allSubjs.includes(_hwSubjectFilter))_hwSubjectFilter=null;
      subjChipsEl.style.display='';
      subjChipsEl.innerHTML=allSubjs.map(s=>
        `<div class="hw-subj-chip${_hwSubjectFilter===s?' active':''}" style="${subjectBadgeStyle(s)}" onclick="switchHwSubject('${esc(s)}')">${esc(subjectLabel(s))}</div>`
      ).join('');
    } else {
      subjChipsEl.style.display='none';
      _hwSubjectFilter=null;
    }
  }

  // Apply subject filter
  if(_hwSubjectFilter) classHw=classHw.filter(h=>h.subject===_hwSubjectFilter);
  const pending=_hwSubjectFilter ? allPending.filter(h=>h.subject===_hwSubjectFilter) : allPending;

  // Webtop homework section
  const webtopSec=el('hwWebtopSection');
  const webtopListEl=el('hwWebtopList');
  if(webtopSec&&webtopListEl){
    const wtHw=_webtopHomework;
    if(!wtHw.length){
      webtopSec.style.display='none';
    } else {
      webtopSec.style.display='';
      webtopListEl.innerHTML=wtHw.map(h=>`
        <div class="hw-item hw-webtop-item">
          <div class="hw-head">
            <span class="hw-webtop-icon">📡</span>
            <div class="hw-desc-text">${esc(h.text)}</div>
            <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject)||h.subject)}</span>
          </div>
          ${h.date?`<div class="hw-due">${h.day||''} ${fmtDate(h.date)}</div>`:''}
        </div>`).join('');
    }
  }

  // Class homework section
  const classSec=el('hwClassSection');
  const classListEl=el('hwClassList');
  if(classSec&&classListEl){
    if(!classHw.length){
      classSec.style.display='none';
    } else {
      classSec.style.display='';
      const child=S.child;
      const allKids=getKids();
      classListEl.innerHTML=classHw.map(h=>{
        const myDone=!!(h.doneBy&&h.doneBy[child]);
        const can=child&&(isParent()||child===S.user);
        const doneCount=allKids.filter(k=>h.doneBy&&h.doneBy[k]).length;
        return `<div class="hw-item hw-class-item ${myDone?'hw-class-done':''}" data-hw-id="${h.id}">
          <div class="hw-head">
            <div class="check-box ${myDone?'done':''} ${can&&!myDone?'':'readonly'}" ${can&&!myDone?`onclick="toggleHW(${h.id})"`:''}>
            </div>
            <div class="hw-desc-text ${myDone?'done':''}">${esc(h.desc)}</div>
            ${doneCount>0?`<span class="hw-done-count">${doneCount}/${allKids.length}</span>`:''}
            <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span>
            ${isParent()?`<button class="del-btn" onclick="deleteHW(${h.id})">${_ico.x}</button>`:''}
          </div>
          ${h.due?`<div class="hw-due">${t('hwDueLabel',fmtDate(h.due))}</div>`:''}
          <div class="hw-done-by">${allKids.map(k=>`<span class="hw-done-pip ${h.doneBy&&h.doneBy[k]?'hw-done-pip-done':''}" title="${esc(k)}">${esc(k.charAt(0))}</span>`).join('')}</div>
        </div>`;
      }).join('');
    }
  }

  if(!S.child){
    el('hwCardTitle').textContent=t('hwTitle','');
    el('hwList').innerHTML=`<div class="empty">${t('noKids')}</div>`;
    el('addHwForm').style.display='none';
    el('hwHistoryWrap').innerHTML='';
    return;
  }
  el('hwCardTitle').textContent=t('hwTitle',S.child);
  const canAdd=isParent()||S.child===S.user;
  el('addHwForm').style.display=canAdd?'':'none';

  el('hwList').innerHTML=pending.length?pending.map(h=>{
    const can=isParent()||h.child===S.user;
    return `<div class="hw-item" data-hw-id="${h.id}">
      <div class="hw-head">
        <div class="check-box ${can?'':'readonly'}" ${can?`onclick="toggleHW(${h.id})"`:''}>
        </div>
        <div class="hw-desc-text">${esc(h.desc)}</div>
        <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span>
        ${isParent()?`<button class="del-btn" onclick="deleteHW(${h.id})">${_ico.x}</button>`:''}</div>
      ${h.due?`<div class="hw-due">${t('hwDueLabel',fmtDate(h.due))}</div>`:''}</div>`;
  }).join(''):`<div class="empty">${t('noHw')}</div>`;

  renderHwHistory(S.child);
}

function renderHwHistory(child) {
  const wrap = el('hwHistoryWrap');
  if (!wrap || !child) return;
  const personalDone=S.homework
    .filter(h=>(!h.scope||h.scope==='personal')&&h.child===child&&h.done)
    .map(h=>({...h,_doneAt:h.doneAt,_isClass:false}));
  const classDone=S.homework
    .filter(h=>h.scope==='class'&&h.doneBy&&h.doneBy[child])
    .map(h=>({...h,_doneAt:h.doneAtBy&&h.doneAtBy[child],_isClass:true}));
  const allDone=[...personalDone,...classDone].sort((a,b)=>(b._doneAt||0)-(a._doneAt||0));
  if (!allDone.length) { wrap.innerHTML = ''; return; }

  const q = _hwHistSearch.toLowerCase();
  const filtered = allDone.filter(h=>{
    if(_hwSubjectFilter&&h.subject!==_hwSubjectFilter)return false;
    if(!q)return true;
    return h.desc.toLowerCase().includes(q)||subjectLabel(h.subject).toLowerCase().includes(q);
  });
  const visibleCount = _hwSubjectFilter ? filtered.length : allDone.length;

  wrap.innerHTML = `<div class="card" style="margin-top:10px">
    <div class="hw-hist-hdr" onclick="toggleHwHistory()">
      <span style="color:#a0aec0;font-size:12px;margin-inline-end:6px">${_hwHistOpen?'▲':'▼'}</span>
      <span class="hw-hist-title">${t('hwHistory')}</span>
      <span class="hw-hist-count">${visibleCount}</span>
    </div>
    ${_hwHistOpen ? `
      <input class="hw-hist-search" placeholder="${t('hwHistorySearch')}"
        value="${esc(_hwHistSearch)}"
        oninput="_hwHistSearch=this.value;filterHwHistory('${esc(child)}')">
      <div id="hwHistList">${hwHistListHTML(filtered)}</div>` : ''}
  </div>`;
}

function hwHistListHTML(filtered) {
  return filtered.length ? filtered.map(h=>`
    <div class="hw-hist-item" data-hw-id="${h.id}">
      ${h._isClass?`<span class="hw-class-badge">כיתה</span>`:''}
      <div class="hw-hist-desc">${esc(h.desc)}</div>
      <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span>
      <span class="hw-hist-ts">${fmtDoneAt(h._doneAt)}</span>
      ${isParent()&&!h._isClass?`<button class="del-btn" title="בטל סימון" onclick="toggleHW(${h.id})">${_ico.undo}</button>`:''}
      ${h._isClass?`<button class="del-btn" title="בטל סימון" onclick="toggleHW(${h.id})">${_ico.undo}</button>`:''}
      ${isParent()?`<button class="del-btn" onclick="deleteHW(${h.id})">${_ico.x}</button>`:''}
    </div>`).join('')
  : `<div class="empty" style="padding:8px 0">${t('hwHistoryEmpty')}${_hwSubjectFilter ? ' ב' + esc(subjectLabel(_hwSubjectFilter)) : ''}</div>`;
}
function filterHwHistory(child) {
  const listEl = el('hwHistList');
  if (!listEl) return;
  const personalDone=S.homework
    .filter(h=>(!h.scope||h.scope==='personal')&&h.child===child&&h.done)
    .map(h=>({...h,_doneAt:h.doneAt,_isClass:false}));
  const classDone=S.homework
    .filter(h=>h.scope==='class'&&h.doneBy&&h.doneBy[child])
    .map(h=>({...h,_doneAt:h.doneAtBy&&h.doneAtBy[child],_isClass:true}));
  const allDone=[...personalDone,...classDone].sort((a,b)=>(b._doneAt||0)-(a._doneAt||0));
  const q = _hwHistSearch.toLowerCase();
  const filtered = allDone.filter(h=>{
    if(_hwSubjectFilter&&h.subject!==_hwSubjectFilter)return false;
    if(!q)return true;
    return h.desc.toLowerCase().includes(q)||subjectLabel(h.subject).toLowerCase().includes(q);
  });
  listEl.innerHTML = hwHistListHTML(filtered);
}
function toggleHwHistory() {
  _hwHistOpen = !_hwHistOpen;
  renderHwHistory(S.child);
}

function switchChild(c){if(!isParent()&&c!==S.user)return;S.child=c;_hwSubjectFilter=null;renderHomework();}
function switchHwSubject(s){_hwSubjectFilter=(_hwSubjectFilter===s)?null:s;renderHomework();}
function _hwScopePick(val) {
  _hwScope = val;
  document.querySelectorAll('#hwScopeSeg .hw-scope-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.val === val));
  const childTabsEl = el('childTabsContainer');
  if (childTabsEl) {
    const kids = isParent() ? getKids() : getKids().filter(k => k === S.user);
    childTabsEl.style.display = kids.length >= 2 ? '' : 'none';
  }
  const hwDescEl = el('hwDesc');
  if (hwDescEl) hwDescEl.placeholder = val === 'class' ? 'שיעור בית לכל הכיתה...' : t('hwPlaceholder');
}

function toggleHW(id){
  const h=S.homework.find(x=>x.id===id);
  if(!h)return;
  if(h.scope==='class'){
    const child=S.child;
    if(!child||(!isParent()&&child!==S.user))return;
    const isDone=!!(h.doneBy&&h.doneBy[child]);
    if(!isDone){
      const row=document.querySelector(`.hw-item[data-hw-id="${id}"]`);
      if(row){
        row.classList.add('hw-fly-out');
        setTimeout(()=>{
          if(!h.doneBy)h.doneBy={};
          if(!h.doneAtBy)h.doneAtBy={};
          h.doneBy[child]=true;h.doneAtBy[child]=Date.now();
          _hwHistOpen=true;save();renderHomework();renderHome();
        },270);return;
      }
      if(!h.doneBy)h.doneBy={};if(!h.doneAtBy)h.doneAtBy={};
      h.doneBy[child]=true;h.doneAtBy[child]=Date.now();_hwHistOpen=true;
    } else {
      const histRow=document.querySelector(`.hw-hist-item[data-hw-id="${id}"]`);
      if(histRow){
        histRow.classList.add('hw-fly-out-hist');
        setTimeout(()=>{
          delete h.doneBy[child];delete h.doneAtBy[child];
          save();renderHomework();renderHome();
        },270);return;
      }
      delete h.doneBy[child];delete h.doneAtBy[child];
    }
    save();renderHomework();renderHome();return;
  }
  // Personal item
  if(!isParent()&&h.child!==S.user)return;
  if(!h.done){
    const row=document.querySelector(`.hw-item[data-hw-id="${id}"]`);
    if(row){
      row.classList.remove('hw-fly-in-active');
      void row.offsetWidth;
      row.classList.add('hw-fly-out');
      setTimeout(()=>{
        h.done=true;h.doneAt=Date.now();
        _hwHistOpen=true;save();renderHomework();renderHome();
        requestAnimationFrame(()=>{
          const hist=document.querySelector(`.hw-hist-item[data-hw-id="${id}"]`);
          if(hist)hist.classList.add('hw-fly-in');
        });
      },270);return;
    }
    h.done=true;h.doneAt=Date.now();_hwHistOpen=true;
  } else {
    const histRow=document.querySelector(`.hw-hist-item[data-hw-id="${id}"]`);
    if(histRow){
      histRow.classList.add('hw-fly-out-hist');
      setTimeout(()=>{
        h.done=false;delete h.doneAt;
        save();renderHomework();renderHome();
        requestAnimationFrame(()=>{
          const active=document.querySelector(`.hw-item[data-hw-id="${id}"]`);
          if(active)active.classList.add('hw-fly-in-active');
        });
      },270);return;
    }
    h.done=false;delete h.doneAt;
  }
  save();renderHomework();renderHome();
}

function deleteHW(id){if(!isParent())return;S.homework=S.homework.filter(x=>x.id!==id);save();renderHomework();renderHome();}
function addHomework(){
  const descEl=el('hwDesc');
  const desc=descEl.value.trim();
  if(!desc){descEl.focus();descEl.classList.add('input-shake');setTimeout(()=>descEl.classList.remove('input-shake'),500);return;}
  if(_hwScope==='class'){
    if(!isParent())return;
    S.homework.push({id:Date.now(),scope:'class',subject:el('hwSubject').value,desc,due:el('hwDue').value,doneBy:{},doneAtBy:{}});
  } else {
    if(!S.child)return;
    if(!isParent()&&S.child!==S.user)return;
    S.homework.push({id:Date.now(),scope:'personal',child:S.child,subject:el('hwSubject').value,desc,due:el('hwDue').value,done:false});
  }
  el('hwDesc').value='';save();renderHomework();renderHome();
}

// ════════════════════════════════════════
//  CALENDAR
// ════════════════════════════════════════
let _calClassEventsOn = {}; // { [kidName]: bool }
let _calFilter = 'all'; // 'all' | 'class' | 'family'
let _syncedClassEvents = {}; // { [firestoreEventId]: gcalId }

function loadSyncedClassEvents(){
  try { _syncedClassEvents=JSON.parse(localStorage.getItem('familyhub_class_gcal_'+S.uid)||'{}'); } catch(e){ _syncedClassEvents={}; }
}
function saveSyncedClassEvents(){
  localStorage.setItem('familyhub_class_gcal_'+S.uid, JSON.stringify(_syncedClassEvents));
}
async function syncClassEventToGcal(evId, title, date, time){
  if(!gcalConnected()||!isParent())return;
  const gcalId=await gcalCreateEvent({title,date,time});
  if(gcalId){ _syncedClassEvents[evId]=gcalId; saveSyncedClassEvents(); renderCalendar(); }
}
async function unsyncClassEvent(evId){
  const gcalId=_syncedClassEvents[evId];
  if(!gcalId)return;
  await gcalDeleteEvent(gcalId);
  delete _syncedClassEvents[evId];
  saveSyncedClassEvents();
  renderCalendar();
}

function _calEventVisibleToKid(ev, kidName) {
  if (ev.gcal) return true;
  const ps = eventPersons(ev);
  return ps.includes('All') || ps.includes(kidName);
}

function allCalEvents(){
  const anyClassOn=Object.values(_calClassEventsOn).some(Boolean);
  const classEvs=[];
  const _seenClassEvKeys=new Set();
  getKids().forEach(name=>{
    if(!isParent() && name !== S.user) return; // kids only see their own class
    if(!_calClassEventsOn[name])return;
    const member=getMembers().find(m=>m.name===name);
    if(!member?.school)return;
    const cid=classIdFor(member.school);
    if(!cid)return;
    const cache=_commCache[cid];
    if(!cache)return;
    [...(cache.events||[]),...(cache.gradeEvents||[]),...(cache.schoolEvents||[])].forEach(ev=>{
      if(!ev.date)return;
      if(!matchesGenderFilter(ev,name))return;
      const key=`${ev.id}_${name}`;
      if(_seenClassEvKeys.has(key))return;
      _seenClassEvKeys.add(key);
      classEvs.push({...ev,classEvent:true,classKid:name,_cid:cid});
    });
  });
  if(anyClassOn&&_calFilter==='class') return classEvs;
  const syncedIds=new Set(S.events.filter(e=>e.gcalId).map(e=>e.gcalId));
  let personalEvs=[...S.events.filter(e=>!e.gcalId),...S.events.filter(e=>e.gcalId),...gcal.events.filter(e=>!syncedIds.has(e.gcalId))];
  if(!isParent()) personalEvs=personalEvs.filter(e=>_calEventVisibleToKid(e,S.user));
  if(_calFilter==='family') return personalEvs;
  return [...personalEvs,...classEvs];
}

function renderCalClassToggles(){
  const wrap=el('calClassToggles');
  if(!wrap)return;
  const isHe=getLang()==='he';

  if(!isParent()){
    // Kid view: just "All events" / "Class only" seg control
    const member=getMembers().find(m=>m.name===S.user);
    if(!member?.school?.city||!member?.school?.grade){wrap.innerHTML='';return;}
    wrap.innerHTML=`<div class="cal-view-seg" style="margin-bottom:8px">
      <div class="cal-view-seg-btn ${_calFilter==='all'?'active':''}"    onclick="kidCalViewAll()">${isHe?'הכל':'All'}</div>
      <div class="cal-view-seg-btn ${_calFilter==='class'?'active':''}"  onclick="kidCalViewClass()">${isHe?'כיתה':'כיתה'}</div>
      <div class="cal-view-seg-btn ${_calFilter==='family'?'active':''}" onclick="kidCalViewFamily()">${isHe?'משפחה':'Family'}</div>
    </div>`;
    // Auto-enable class events for this kid if not yet on
    if(!_calClassEventsOn[S.user]) kidCalViewAll();
    return;
  }

  const kids=getKids()
    .map(name=>getMembers().find(m=>m.name===name))
    .filter(m=>m?.school?.city&&m?.school?.grade);
  if(!kids.length){wrap.innerHTML='';return;}
  const anyOn=Object.values(_calClassEventsOn).some(Boolean);
  const segControl=anyOn?`<div class="cal-view-seg">
    <div class="cal-view-seg-btn ${_calFilter==='all'?'active':''}"    onclick="setCalFilter('all')">${isHe?'הכל':'All'}</div>
    <div class="cal-view-seg-btn ${_calFilter==='class'?'active':''}"  onclick="setCalFilter('class')">${isHe?'כיתה':'Class'}</div>
    <div class="cal-view-seg-btn ${_calFilter==='family'?'active':''}" onclick="setCalFilter('family')">${isHe?'משפחה':'Family'}</div>
  </div>`:'';
  wrap.innerHTML=`<div class="cal-class-toggles">${kids.map(m=>{
    const on=_calClassEventsOn[m.name];
    const col=getPersonColor(m.name);
    const s=m.school;
    const classLabel='כיתה '+s.grade+(s.classNum?'\''+s.classNum:'');
    return `<div class="cal-class-toggle"
      style="${on?`background:${col};border-color:${col};color:white`:`border-color:${col};color:${col}`}"
      onclick="toggleCalClassEvents('${esc(m.name)}')">
      <span>${getAvatar(m.name,14)}</span><span>${esc(m.name)}</span><span style="opacity:0.75">🏫 ${esc(classLabel)}</span>
    </div>`;
  }).join('')}</div>${segControl}`;
}

async function _ensureKidClassLoaded(){
  if(!_calClassEventsOn[S.user]){
    _calClassEventsOn[S.user]=true;
    const member=getMembers().find(m=>m.name===S.user);
    if(member?.school){
      const cid=classIdFor(member.school);
      if(cid&&(!_commCache[cid]||(Date.now()-(_commCache[cid].loadedAt||0))>120000))
        await loadCommunityData([member]);
    }
  }
}
async function kidCalViewAll()   { await _ensureKidClassLoaded(); _calFilter='all';    renderCalendar(); }
async function kidCalViewClass() { await _ensureKidClassLoaded(); _calFilter='class';  renderCalendar(); }
async function kidCalViewFamily(){ _calFilter='family'; renderCalendar(); }

function setCalFilter(val){
  _calFilter=val;
  renderCalendar();
}

async function toggleCalClassEvents(kidName){
  _calClassEventsOn[kidName]=!_calClassEventsOn[kidName];
  if(_calClassEventsOn[kidName]){
    const member=getMembers().find(m=>m.name===kidName);
    if(member?.school){
      const cid=classIdFor(member.school);
      if(cid&&(!_commCache[cid]||(Date.now()-_commCache[cid].loadedAt)>120000))
        await loadCommunityData([member]);
    }
  }
  renderCalendar();
}
function renderCalendar(){
  const yr=S.calYear,mo=S.calMonth;
  el('calMonthLabel').textContent=`${t('months')[mo]} ${yr}`;
  const di=el('newEventDate');if(di&&!di.value)di.value=S.calSelected;
  renderCalClassToggles();
  const events=allCalEvents();
  const dotMap={};
  events.forEach(ev=>{
    if(!dotMap[ev.date])dotMap[ev.date]=[];
    const col=ev.classEvent?getPersonColor(ev.classKid):ev.gcal?'#4285f4':getPersonColor(eventPersons(ev).includes('All')?'All':eventPersons(ev)[0]);
    dotMap[ev.date].push(col);
  });
  let html=t('dows').map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const firstDay=new Date(yr,mo,1).getDay(),daysInMo=new Date(yr,mo+1,0).getDate(),daysInPrev=new Date(yr,mo,0).getDate();
  for(let i=firstDay-1;i>=0;i--) html+=dayCell(`${yr}-${String(mo).padStart(2,'0')}-${String(daysInPrev-i).padStart(2,'0')}`,daysInPrev-i,true,dotMap);
  for(let d=1;d<=daysInMo;d++)   html+=dayCell(`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,d,false,dotMap);
  const rem=(firstDay+daysInMo)%7===0?0:7-(firstDay+daysInMo)%7;
  for(let d=1;d<=rem;d++)        html+=dayCell(`${yr}-${String(mo+2).padStart(2,'0')}-${String(d).padStart(2,'0')}`,d,true,dotMap);
  el('calGrid').innerHTML=html;
  renderDayPanel(events);
}
function dayCell(dateStr,num,other,dotMap){
  const isTod=dateStr===today,isSel=dateStr===S.calSelected;
  const dots=(dotMap[dateStr]||[]).slice(0,5);
  const cls=['cal-day',other?'other-month':'',isTod?'today':'',isSel?'selected':''].filter(Boolean).join(' ');
  return `<div class="${cls}" onclick="selectDay('${dateStr}')">
    <span class="cal-day-num">${num}</span>
    <div class="cal-dots">${dots.map(c=>`<span class="cal-dot" style="background:${c}"></span>`).join('')}</div>
  </div>`;
}
function selectDay(dateStr){S.calSelected=dateStr;const di=el('newEventDate');if(di)di.value=dateStr;renderCalendar();}
function renderDayPanel(events){
  const evs=(events||allCalEvents()).filter(e=>e.date===S.calSelected).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const title=S.calSelected===today?t('todayLabel'):fmtDateLong(S.calSelected);
  let html=`<div class="day-panel-title"><span style="display:inline-flex;vertical-align:middle;width:16px;height:16px;margin-inline-end:5px">${TAB_ICONS.calendar}</span>${title}</div>`;
  if(!evs.length){html+=`<div class="empty" style="padding:12px">${t('noEvents')}</div>`;}
  else html+=evs.map(e=>{
    if(e.classEvent){
      const col=getPersonColor(e.classKid);
      const synced=!!_syncedClassEvents[e.id];
      const gcalBtn=gcalConnected()&&isParent()
        ? synced
          ? `<button class="gcal-class-btn synced" title="הסר מ-Google Calendar" onclick="unsyncClassEvent('${e.id}')">G ✓</button>`
          : `<button class="gcal-class-btn" title="הוסף ל-Google Calendar" onclick="syncClassEventToGcal('${e.id}','${esc(e.title).replace(/'/g,"\\'")}','${e.date}','${e.time||''}')">+ G</button>`
        : '';
      const payBtn=e.payboxUrl?`<a class="paybox-btn" href="${esc(e.payboxUrl)}" target="_blank" rel="noopener noreferrer">${t('commPayNow')}</a>`:'';
      return `<div class="event-item" style="border-inline-start-color:${col};flex-wrap:wrap">
        <div class="event-body" style="width:100%">
          <div class="event-title">${eventTypeIcon(e.type)} ${esc(e.title)}</div>
          <div class="event-meta">${e.time?_ico.clock+' '+e.time:t('allDay')}${e.location?' · '+_ico.pin+' '+esc(e.location):''}${e.note?` · ${esc(e.note)}`:''}</div>
          ${payBtn}
        </div>
        <span class="event-person-chip" style="background:${col}22;color:${col}">🏫 ${esc(e.classKid)}</span>
        ${gcalBtn}
      </div>`;
    }
    const ps=eventPersons(e);
    const isAll=ps.includes('All');
    const color=e.gcal?'#4285f4':getPersonColor(isAll?'All':ps[0]);
    const personLabel=e.gcal?'':isAll
      ?`👨‍👩‍👧‍👧 ${t('everyone')}`
      :ps.map(n=>getEmoji(n)+' '+n).join(' · ');
    const canDel=(isAll&&isParent()&&(!e.gcal||gcalConnected()))||(!isAll&&ps.includes(S.user));
    return `<div class="event-item ${e.gcal?'gcal-event':''}" style="border-inline-start-color:${color}">
      <div class="event-body">
        <div class="event-title">${e.gcal?'<span class="g-badge">G</span>':''}${esc(e.title)}</div>
        <div class="event-meta">${e.time?_ico.clock+' '+e.time:t('allDay')}${e.location?' · '+_ico.pin+' '+esc(e.location):''}${e.gcal?' '+t('gcalSource'):''}</div>
      </div>
      ${personLabel?`<span class="event-person-chip" style="background:${color}22;color:${color}">${personLabel}</span>`:''}
      ${canDel?`<button class="del-btn" onclick="deleteEvent(${e.id},'${e.gcalId||''}')">${_ico.x}</button>`:''}</div>`;
  }).join('');
  el('dayPanel').innerHTML=html;
}
function calShift(d){S.calMonth+=d;if(S.calMonth>11){S.calMonth=0;S.calYear++;}if(S.calMonth<0){S.calMonth=11;S.calYear--;}renderCalendar();}
async function addEvent(){
  const title=el('newEventTitle').value.trim(),date=el('newEventDate').value;
  if(!title||!date)return;
  const person = _eventPersons.includes('All') ? 'All' : [...new Set([..._eventPersons, S.user])];
  const location=el('newEventLocation')?.value.trim()||'';
  const ev={id:Date.now(),title,date,time:el('newEventTime').value,person,...(location&&{location})};
  const syncGcal=gcalConnected()&&isParent()&&el('gcalSyncCheck').checked;
  if(syncGcal){const gcalId=await gcalCreateEvent(ev);if(gcalId)ev.gcalId=gcalId;}
  S.events.push(ev);el('newEventTitle').value='';el('newEventTime').value='';if(el('newEventLocation'))el('newEventLocation').value='';
  _eventPersons=['All']; renderEventPersonPicker();
  S.calSelected=date;const d2=new Date(date+'T00:00:00');S.calYear=d2.getFullYear();S.calMonth=d2.getMonth();
  save();if(syncGcal)await fetchGCalEvents();else renderCalendar();
}
async function deleteEvent(id,gcalId){
  const ev=typeof id==='number'?S.events.find(x=>x.id===id):null;
  if(ev){
    const ps=eventPersons(ev);
    if(!ps.includes('All')){
      // personal event — remove self only
      const remaining=ps.filter(n=>n!==S.user);
      if(remaining.length===0){
        if(gcalId&&gcalConnected())await gcalDeleteEvent(gcalId);
        S.events=S.events.filter(x=>x.id!==id);
      } else {
        ev.person=remaining;
      }
      save();if(gcalConnected())await fetchGCalEvents();else renderCalendar();
      return;
    }
  }
  // 'All' event or legacy — full delete, parents only
  if(!isParent())return;
  if(gcalId&&gcalConnected())await gcalDeleteEvent(gcalId);
  if(typeof id==='number')S.events=S.events.filter(x=>x.id!==id);
  save();if(gcalConnected())await fetchGCalEvents();else renderCalendar();
}

// ════════════════════════════════════════
//  TABS & FILTER
// ════════════════════════════════════════
const ALL_TABS = [
  { id:'home',      icon:'🏡', adminOnly: false },
  { id:'chores',    icon:'✅', adminOnly: false },
  { id:'grocery',   icon:'🛒', adminOnly: false },
  { id:'homework',  icon:'📚', adminOnly: false },
  { id:'calendar',  icon:'📅', adminOnly: false },
  { id:'community', icon:'🏫', adminOnly: false },
  { id:'analytics', icon:'📊', adminOnly: true },
];

// SVG icon library (Phosphor-style, 2px stroke, rounded caps)
const TAB_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  chores: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-4.5"/></svg>`,
  grocery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6L18 2z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  homework: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  community: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
};

// Filled icon variants for active state
const TAB_ICONS_FILLED = {
  home:      `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v9a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1v-9h1a1 1 0 00.707-1.707l-7-7z"/></svg>`,
  chores:    `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path fill-rule="evenodd" d="M12 2a10 10 0 100 20A10 10 0 0012 2zm4.707 8.293a1 1 0 00-1.414 0L10.5 15.086l-1.793-1.793a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l5.5-5.5a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>`,
  grocery:   `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 7H5L3.5 3H1v2h1.22L5.5 16.2A2 2 0 007.46 18h9.07a2 2 0 001.96-1.6L20.78 7H19zm-3 8a1 1 0 110 2 1 1 0 010-2zm-8 0a1 1 0 110 2 1 1 0 010-2z"/><rect x="8" y="10" width="8" height="2" rx="1"/></svg>`,
  homework:  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z"/></svg>`,
  calendar:  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`,
  community: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>`,
};

function tabIcon(id, active = false) {
  if (active && TAB_ICONS_FILLED[id]) return TAB_ICONS_FILLED[id];
  return TAB_ICONS[id] || '';
}

function scrollTabBar(dir) {
  const sc = el('tabScroll');
  if (!sc) return;
  // dir: -1 = scroll left (more tabs in RTL), +1 = scroll right (back to start in RTL)
  sc.scrollBy({ left: dir * -160, behavior: 'smooth' });
}

function updateTabArrows() {
  const sc = el('tabScroll');
  const prev = el('tabArrowPrev');
  const next = el('tabArrowNext');
  if (!sc || !prev || !next) return;
  const sl = Math.abs(sc.scrollLeft); // RTL scrollLeft can be negative in Chrome
  const max = sc.scrollWidth - sc.clientWidth;
  prev.classList.toggle('tab-arrow-hidden', sl <= 4);
  next.classList.toggle('tab-arrow-hidden', sl >= max - 4);
}
const TAB_IDX = { home:0, chores:1, grocery:2, homework:3, calendar:4, community:5, analytics:6 };
function tabLabel(id) { return t('tabs')[TAB_IDX[id]] || id; }

function getActiveTabs() {
  const visible = ALL_TABS.filter(t => !t.adminOnly || (isAdmin() && !isKid()));
  if (!S.uid || !S.user) return visible.map(t => t.id);
  // Prefer Firestore-synced prefs (available after familyData loads)
  const firestorePrefs = familyData?.tabPrefs?.[S.user];
  const raw = firestorePrefs
    || (() => { try { return JSON.parse(localStorage.getItem('familyhub_tabs_' + S.uid + '_' + S.user)); } catch(e) { return null; } })();
  if (raw) {
    const ids = raw.filter(id => visible.find(t => t.id === id));
    if (ids.length > 0) return ids;
  }
  return visible.map(t => t.id);
}
function saveActiveTabs(ids) {
  if (!S.uid || !S.user || !fbDb) return;
  // Update local cache immediately
  if (familyData) {
    if (!familyData.tabPrefs) familyData.tabPrefs = {};
    familyData.tabPrefs[S.user] = ids;
  }
  localStorage.setItem('familyhub_tabs_' + S.uid + '_' + S.user, JSON.stringify(ids));
  // Persist to Firestore so other devices pick it up
  fbDb.collection('families').doc(S.uid)
    .update(new firebase.firestore.FieldPath('tabPrefs', S.user), ids)
    .catch(e => console.error('[tabs] Firestore write failed — tabs will not sync to other devices:', e.message, e.code));
}

function renderTabBar() {
  const active = getActiveTabs();
  if (!active.includes(S.tab)) {
    S.tab = active[0];
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    el('tab-' + S.tab)?.classList.add('active');
  }

  const tabsHtml = active.map(id => {
    const tab = ALL_TABS.find(t => t.id === id);
    if (!tab) return '';
    const isActive = S.tab === id;
    const badge = (id === 'community' && _pendingCount > 0 && isCommittee() && !isKid())
      ? `<span class="tab-comm-badge">${_pendingCount}</span>` : '';
    return `<button class="tab${isActive ? ' active' : ''}" data-tab="${id}" onclick="switchTab('${id}')">
      <span class="tab-icon">${tabIcon(id, isActive)}</span>
      <span class="tab-label">${tabLabel(id)}</span>
      ${badge}
    </button>`;
  }).join('');

  el('tabBar').innerHTML = `
    <button class="tab-arrow tab-arrow-hidden" id="tabArrowPrev" onclick="scrollTabBar(-1)" aria-label="הקודם">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="tab-scroll" id="tabScroll">${tabsHtml}</div>
    <button class="tab-arrow tab-arrow-hidden" id="tabArrowNext" onclick="scrollTabBar(1)" aria-label="הבא">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

  const sc = el('tabScroll');
  sc.addEventListener('scroll', updateTabArrows, { passive: true });
  // Scroll active tab into view and update arrows after layout
  requestAnimationFrame(() => {
    sc.querySelector('.tab.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    updateTabArrows();
  });
}

function navToCalendarDate(dateStr, src, kid) {
  const [yr, mo] = dateStr.split('-').map(Number);
  S.calYear = yr;
  S.calMonth = mo - 1;
  S.calSelected = dateStr;
  if (src === 'class' && kid) {
    _calClassEventsOn[kid] = true;  // ensure kid's class events toggle is on
  } else {
    _calFilter = 'all';              // ensure personal events aren't hidden
  }
  switchTab('calendar');
  renderCalendar();
}

function switchTab(tab) {
  const active = getActiveTabs();
  const oldIdx = active.indexOf(S.tab);
  const newIdx = active.indexOf(tab);
  const enterClass = newIdx >= oldIdx ? 'tab-enter-right' : 'tab-enter-left';

  S.tab = tab;
  const _titleEl = el('headerTabTitle');
  if (_titleEl) _titleEl.textContent = tabLabel(tab);
  // Synchronous scroll reset — window.scrollTo is async on mobile Safari
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  el('tabBar').querySelectorAll('.tab').forEach(e =>
    e.classList.toggle('active', e.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(e =>
    e.classList.remove('active', 'tab-enter-right', 'tab-enter-left'));
  const newContent = el('tab-' + tab);
  if (newContent) {
    // Keep new content invisible while display:block takes effect (prevents
    // a one-frame flash at the final position before the animation's from-keyframe kicks in)
    newContent.style.opacity = '0';
    newContent.classList.add('active');
    requestAnimationFrame(() => {
      newContent.style.opacity = '';   // hand off to the animation's from { opacity:0 }
      newContent.classList.add(enterClass);
      setTimeout(() => newContent.classList.remove('tab-enter-right', 'tab-enter-left'), 220);
    });
  }
  // Scroll active tab button into view
  el('tabScroll')?.querySelector('.tab.active')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  updateTabArrows();
  _updateScrollTopBtn();
  if (tab !== 'chores') el('choreFabWrap')?.style.setProperty('display', 'none');
  if (tab === 'chores') renderChores();
  if (tab === 'community') renderCommunity();
  if (tab === 'analytics') renderAnalytics();
  if (tab === 'homework' && getKids().includes(S.filter)) S.child = S.filter;
  if (_tutDefs()[tab]) setTimeout(() => _tutMaybeTrigger(tab), 700);
  // Stop presence auto-refresh when leaving analytics
  if (tab !== 'analytics' && _presenceRefreshTimer) {
    clearInterval(_presenceRefreshTimer);
    _presenceRefreshTimer = null;
  }
}

// ════════════════════════════════════════
//  ANALYTICS DASHBOARD (admin only)
// ════════════════════════════════════════

let _analyticsCharts = {};
let _presenceRefreshTimer = null;
let _presencePrevOnline   = new Set();
let _presenceOnline       = [];
let _presenceOffline      = [];
let _presenceOfflineTotal = 0;
let _presenceStats        = null;
let _presenceSearchQ      = '';
let _presenceSearchData   = [];
let _presenceSearchTotal  = 0;
let _presenceSearchPage   = 0;
let _presenceLoadingMore  = false;
let _presenceExpanded     = { online: false, offline: false };
let _presenceSearchTimer  = null;

function _destroyCharts() {
  Object.values(_analyticsCharts).forEach(c => { try { c.destroy(); } catch(e){} });
  _analyticsCharts = {};
}

function _fmtDuration(ms) {
  if (!ms) return '0 דק׳';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  const rem   = mins % 60;
  return rem ? `${hours}ש׳ ${rem}ד׳` : `${hours} שע׳`;
}

function _presenceTimeAgo(ms) {
  if (!ms) return 'מעולם';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'הרגע';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  return `לפני ${Math.floor(hours/24)} ימים`;
}

async function loadPresenceSection() {
  const container = el('presenceGrid');
  if (!container) return;
  try {
    const fn = firebase.functions().httpsCallable('getPresence');
    const { data } = await fn({ mode: 'default' });
    _presenceOnline       = data.online || [];
    _presenceOffline      = data.offlineSlice || [];
    _presenceOfflineTotal = data.offlineTotal || 0;
    _presenceStats        = data.stats || null;
    _presenceSearchQ      = '';
    _presenceSearchData   = [];
    _presenceSearchTotal  = 0;
    _presenceSearchPage   = 0;
    if (el('presenceSearch')) el('presenceSearch').value = '';
    _renderPresenceGroups();
  } catch(e) {
    const c = el('presenceGrid');
    if (c) c.innerHTML = `<div style="color:#e53e3e;font-size:12px;padding:8px">${esc(e.message)}</div>`;
  }
}

async function _refreshPresenceOnline() {
  if (!el('presenceGrid')) return;
  try {
    const fn = firebase.functions().httpsCallable('getPresence');
    const { data } = await fn({ mode: 'online' });
    _presenceOnline = data.online || [];
    if (_presenceStats) {
      _presenceStats.pOnline = _presenceOnline.filter(m => m.role !== 'kid').length;
      _presenceStats.kOnline = _presenceOnline.filter(m => m.role === 'kid').length;
    }
    _renderPresenceGroups();
  } catch(_) {}
}

function _schedulePresenceSearch() {
  const q = (el('presenceSearch')?.value || '').trim();
  clearTimeout(_presenceSearchTimer);
  if (!q) {
    _presenceSearchQ    = '';
    _presenceSearchData = [];
    _presenceSearchTotal = 0;
    _presenceSearchPage  = 0;
    _renderPresenceGroups();
    return;
  }
  _presenceSearchTimer = setTimeout(() => _runPresenceSearch(q), 400);
}

async function _runPresenceSearch(q) {
  _presenceSearchQ     = q;
  _presenceSearchData  = [];
  _presenceSearchTotal = 0;
  _presenceSearchPage  = 0;
  const container = el('presenceGrid');
  if (!container) return;
  container.innerHTML = `<div style="color:#a0aec0;font-size:12px;padding:8px">מחפש...</div>`;
  try {
    const fn = firebase.functions().httpsCallable('getPresence');
    const { data } = await fn({ mode: 'search', search: q, page: 0 });
    _presenceSearchData  = data.members || [];
    _presenceSearchTotal = data.total   || 0;
    _presenceSearchPage  = 0;
    _renderPresenceGroups();
  } catch(e) {
    if (el('presenceGrid')) el('presenceGrid').innerHTML = `<div style="color:#e53e3e;font-size:12px;padding:8px">${esc(e.message)}</div>`;
  }
}

async function loadMorePresence() {
  if (_presenceLoadingMore) return;
  _presenceLoadingMore = true;
  _renderPresenceGroups();
  try {
    const fn = firebase.functions().httpsCallable('getPresence');
    if (_presenceSearchQ) {
      const nextPage = _presenceSearchPage + 1;
      const { data } = await fn({ mode: 'search', search: _presenceSearchQ, page: nextPage });
      _presenceSearchData  = [..._presenceSearchData, ...(data.members || [])];
      _presenceSearchPage  = nextPage;
    } else {
      const nextPage = Math.floor(_presenceOffline.length / 50);
      const { data } = await fn({ mode: 'browse', page: nextPage });
      _presenceOffline = [..._presenceOffline, ...(data.members || [])];
    }
  } finally {
    _presenceLoadingMore = false;
    _renderPresenceGroups();
  }
}

function togglePresenceGroup(group) {
  _presenceExpanded[group] = !_presenceExpanded[group];
  _renderPresenceGroups();
}

function _renderPresenceGroups() {
  const container = el('presenceGrid');
  if (!container) return;

  // Update header count
  const countEl = el('presenceOnlineCount');
  if (countEl && _presenceStats) {
    const total = _presenceStats.pOnline + _presenceStats.kOnline + _presenceStats.pOffline + _presenceStats.kOffline;
    countEl.textContent = `${_presenceStats.pOnline + _presenceStats.kOnline} מחוברים מתוך ${total}`;
  }

  const newOnline = new Set(_presenceOnline.map(m => m.familyUid + '_' + m.memberName));

  function memberCard(m) {
    const key        = m.familyUid + '_' + m.memberName;
    const justOnline = m.online && !_presencePrevOnline.has(key) && _presencePrevOnline.size > 0;
    const isKidRole  = m.role === 'kid';
    const badgeClass = isKidRole ? 'role-badge-kid' : 'role-badge-parent';
    const badgeLabel = isKidRole ? t('roleKid') : t('roleParent');
    const timeLabel  = m.online ? 'מחובר/ת' : _presenceTimeAgo(m.lastSeenMs);
    const clickable  = isAdmin() && !isKidRole;
    return `<div class="presence-card${justOnline ? ' just-online' : ''}${clickable ? ' presence-card-clickable' : ''}"
      ${clickable ? `onclick="openFamilyDetails('${m.familyUid}','${esc(m.memberName)}')"` : ''}>
      <div class="presence-dot ${m.online ? 'online' : 'offline'}"></div>
      <div class="presence-name">${esc(m.memberName)}<span>${esc(m.familyName)}</span></div>
      <span class="role-badge ${badgeClass}" style="font-size:9px;padding:1px 6px;flex-shrink:0">${badgeLabel}</span>
      <div class="presence-time ${m.online ? 'online' : ''}" style="font-size:11px;flex-shrink:0">${timeLabel}</div>
    </div>`;
  }

  function loadMoreBtn(remaining) {
    return remaining <= 0 ? '' : `
      <div style="text-align:center;padding:12px 0 4px">
        <button class="analytics-refresh-btn" style="padding:6px 18px;font-size:12px;font-weight:700"
          onclick="loadMorePresence()" ${_presenceLoadingMore ? 'disabled' : ''}>
          ${_presenceLoadingMore ? 'טוען...' : `+ ${remaining} נוספים`}
        </button>
      </div>`;
  }

  // ── Search mode ──────────────────────────────────────────
  if (_presenceSearchQ) {
    const remaining = _presenceSearchTotal - _presenceSearchData.length;
    container.innerHTML = `
      <div style="font-size:11px;color:#a0aec0;font-weight:700;padding:4px 0 8px">
        ${_presenceSearchTotal} תוצאות עבור &ldquo;${esc(_presenceSearchQ)}&rdquo;
      </div>
      <div class="presence-cards-grid">${_presenceSearchData.map(memberCard).join('')}</div>
      ${loadMoreBtn(remaining)}`;
    _presencePrevOnline = newOnline;
    return;
  }

  // ── Normal mode ──────────────────────────────────────────
  const onlineExp = _presenceExpanded.online;
  const onlineBody = onlineExp
    ? (_presenceOnline.length === 0
        ? `<div style="color:#a0aec0;font-size:12px;padding:10px 14px">אין משתמשים מחוברים כרגע</div>`
        : `<div class="presence-cards-grid">${_presenceOnline.map(memberCard).join('')}</div>`)
    : '';

  const offlineExp = _presenceExpanded.offline;
  const offlineRemaining = _presenceOfflineTotal - _presenceOffline.length;
  const offlineSection = _presenceOfflineTotal === 0 ? '' : `
    <div class="presence-group" style="margin-top:12px">
      <div class="presence-group-header presence-group-header-clickable" onclick="togglePresenceGroup('offline')">
        <span class="presence-group-chevron">${offlineExp ? '▾' : '◂'}</span>
        <span class="presence-group-label" style="color:#718096">לא מחוברים</span>
        <span class="presence-group-count">
          <span style="color:#a0aec0;font-weight:800">${_presenceOfflineTotal}</span>
          ${_presenceOffline.length < _presenceOfflineTotal ? `<span style="color:#a0aec0"> · מוצגים ${_presenceOffline.length}</span>` : ''}
        </span>
      </div>
      ${offlineExp ? `<div class="presence-cards-grid">${_presenceOffline.map(memberCard).join('')}</div>${loadMoreBtn(offlineRemaining)}` : ''}
    </div>`;

  container.innerHTML = `
    <div class="presence-group">
      <div class="presence-group-header presence-group-header-clickable" onclick="togglePresenceGroup('online')">
        <span class="presence-group-chevron">${onlineExp ? '▾' : '◂'}</span>
        <span class="presence-group-label">מחוברים עכשיו</span>
        <span class="presence-group-count">
          <span style="color:${_presenceOnline.length > 0 ? 'var(--primary-500)' : 'var(--gray-400)'};font-weight:800">${_presenceOnline.length}</span>
        </span>
      </div>
      ${onlineBody}
    </div>
    ${offlineSection}`;

  _presencePrevOnline = newOnline;
}

// ── Family Details Panel (admin) ─────────────────────────

async function openFamilyDetails(familyUid, clickedMemberName) {
  const panel = el('familyDetailsPanel');
  if (!panel) return;
  panel.classList.remove('hidden');
  panel.classList.add('mc-open');
  el('familyDetailsBody').innerHTML = '<div style="color:#a0aec0;font-size:13px;padding:16px">טוען...</div>';
  try {
    const { data } = await fbFunctions.httpsCallable('getFamilyDetails')({ familyUid });
    el('familyDetailsPanelTitle').textContent = `👨‍👩‍👧 משפחת ${data.familyName || ''}`;
    renderFamilyDetails(data, familyUid, clickedMemberName);
  } catch(e) {
    el('familyDetailsBody').innerHTML = `<div style="color:#e53e3e;font-size:13px">${esc(e.message)}</div>`;
  }
}

function closeFamilyDetails() {
  const panel = el('familyDetailsPanel');
  panel.classList.add('mc-closing');
  setTimeout(() => { panel.classList.add('hidden'); panel.classList.remove('mc-open','mc-closing'); }, 280);
}

function renderFamilyDetails(data, familyUid, clickedMemberName) {
  const members = data.members || [];
  const parents = members.filter(m => m.role !== 'kid');
  const kids    = members.filter(m => m.role === 'kid');

  function _classId(s) {
    if (!s?.city?.trim() || !s?.grade) return null;
    const n = v => (v||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
    return [n(s.city), n(s.name||''), s.grade, n(s.classNum||'')].join('~~');
  }
  function _classLabel(s) {
    if (!s?.city) return '';
    const grade = s.grade ? 'כיתה ' + s.grade + (s.classNum ? "'" + s.classNum : '') : '';
    return [s.name || s.city, grade].filter(Boolean).join(' · ');
  }

  // ── Parent nodes ───────────────────────────────────
  const kidClassIds = kids.map(k => ({ cid: _classId(k.school), label: _classLabel(k.school) })).filter(x => x.cid);

  const parentNodes = parents.map(p => {
    const isClicked   = p.name === clickedMemberName;
    const commClasses = p.committeeClasses || [];
    const anyComm     = commClasses.length > 0;

    const committeeSection = isAdmin() && kidClassIds.length ? `
      <div class="ftree-node-committee">
        ${kidClassIds.map(({ cid, label }) => {
          const on = commClasses.includes(cid) || commClasses.includes('*');
          return `<div class="ftree-node-comm-row">
            <span class="ftree-node-comm-class">${esc(label)}</span>
            <button class="ftree-comm-toggle${on ? ' on' : ''}"
              onclick="toggleCommitteeFromPanel('${familyUid}','${esc(p.name)}',${!on},'${cid}',this)">
              ${on ? '✓ ועד' : '+ ועד'}
            </button>
          </div>`;
        }).join('')}
      </div>` : '';

    return `<div class="ftree-node${isClicked ? ' highlighted' : ''}">
      <div class="ftree-node-emoji">${esc(p.emoji)}</div>
      <div class="ftree-node-name">${esc(p.name)}</div>
      ${anyComm ? `<span class="role-badge-committee" style="font-size:8px;padding:1px 5px;margin-top:1px">ועד</span>` : ''}
      ${committeeSection}
    </div>`;
  }).join('');

  // ── Kid nodes ───────────────────────────────────
  const kidNodes = kids.map(k => {
    const school = k.school?.city ? _classLabel(k.school) || k.school.city : null;
    return `<div class="ftree-kid-col">
      <div class="ftree-node">
        <div class="ftree-node-emoji">${esc(k.emoji)}</div>
        <div class="ftree-node-name">${esc(k.name)}</div>
        ${school ? `<div class="ftree-node-school">🏫 ${esc(school)}</div>` : ''}
        ${k.schoolPending ? `<span class="ftree-node-pending">⏳ ממתין</span>` : ''}
      </div>
    </div>`;
  }).join('');

  // ── Connecting lines ─────────────────────────────
  // Horizontal branch spans from center of first kid to center of last kid.
  // Each kid node is 90px wide + 12px gap. With N kids:
  // line left = 45/(N*90+(N-1)*12)*100%, right = same (symmetric)
  const N = kids.length;
  const branchLine = N > 1
    ? (() => {
        const nodeW = 116, gap = 18;
        const totalW = N * nodeW + (N - 1) * gap;
        const pct = (nodeW / 2 / totalW * 100).toFixed(1);
        return `<div class="ftree-branch-hline" style="left:${pct}%;right:${pct}%"></div>`;
      })()
    : '';

  const treeSection = (parents.length || kids.length) ? `
    <div class="ftree">
      ${parents.length ? `<div class="ftree-row">${parentNodes}</div>` : ''}
      ${parents.length && kids.length ? `<div class="ftree-trunk"></div>` : ''}
      ${kids.length ? `
        <div class="ftree-branch" style="width:${Math.min(kids.length * 102, 400)}px">
          ${branchLine}
          <div class="ftree-kids-row">${kidNodes}</div>
        </div>` : ''}
    </div>` : `<div style="font-size:13px;color:#a0aec0;padding:24px;text-align:center">אין נתונים למשפחה זו</div>`;

  el('familyDetailsBody').innerHTML =
    `<div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:6px">
       <span>UID:</span>
       <span style="font-family:monospace;letter-spacing:0.02em">${esc(familyUid)}</span>
       <button onclick="navigator.clipboard.writeText('${familyUid}').then(()=>showToast('UID הועתק','success'))"
         style="border:none;background:var(--gray-100);color:var(--gray-500);border-radius:6px;padding:2px 7px;font-size:10px;cursor:pointer;font-family:inherit;font-weight:700">העתק</button>
     </div>` + treeSection;
}

async function toggleCommitteeFromPanel(familyUid, memberName, grant, cid, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  try {
    await setCommitteeRole(familyUid, memberName, grant, cid);
    // Re-fetch and re-render the panel with updated data
    const { data } = await fbFunctions.httpsCallable('getFamilyDetails')({ familyUid });
    renderFamilyDetails(data, familyUid, memberName);
  } catch(e) {
    console.error('toggleCommitteeFromPanel:', e);
    btn.disabled = false;
    btn.textContent = grant ? t('grantCommittee') : t('revokeCommittee');
  }
}

function _loadChartJs() {
  return new Promise(resolve => {
    if (window.Chart) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

async function renderAnalytics(forceRefresh) {
  if (!isAdmin()) return;
  const container = el('analyticsContent');
  if (!container) return;

  container.innerHTML = `<div style="color:#a0aec0;text-align:center;padding:60px 0;font-size:14px;font-weight:700">טוען נתונים...</div>`;
  _destroyCharts();
  if (_presenceRefreshTimer) { clearInterval(_presenceRefreshTimer); _presenceRefreshTimer = null; }

  try {
    await _loadChartJs();
    const fn = firebase.functions().httpsCallable('getAnalytics');
    const result = await fn();
    const d = result.data;
    _renderAnalyticsUI(container, d);
    // Load presence section and start auto-refresh every 30s
    await loadPresenceSection();
    _presenceRefreshTimer = setInterval(_refreshPresenceOnline, 30 * 1000);
  } catch(e) {
    console.error('renderAnalytics:', e);
    container.innerHTML = `<div class="card" style="color:#e53e3e;padding:20px;text-align:center;font-size:13px;font-weight:700">שגיאה בטעינת נתונים: ${esc(e.message||String(e))}</div>`;
  }
}

function _renderAnalyticsUI(container, d) {
  const HE_MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'];

  // Build month labels for the last 6 months
  const monthLabels = d.eventsByMonth.map(([key]) => {
    const [y, m] = key.split('-');
    return HE_MONTHS[parseInt(m,10)-1] + ' ' + y.slice(2);
  });
  const monthValues = d.eventsByMonth.map(([,v]) => v);

  // Class labels (shorten)
  const classLabels = d.eventsByClass.map(([cid]) => {
    const parts = cid.split('~~');
    return (parts[1] || parts[0]) + ' · כיתה ' + (parts[2]||'') + (parts[3] ? "'" + parts[3] : '');
  });
  const classValues = d.eventsByClass.map(([,v]) => v);

  container.innerHTML = `
    <div style="padding:0 0 8px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:15px;font-weight:900;color:#1a202c">📊 לוח מחוונים</div>
      <div style="display:flex;align-items:center;gap:8px">
        <a href="https://console.firebase.google.com/project/familyhub-7fdd5/usage" target="_blank" rel="noopener noreferrer"
           style="font-size:11px;font-weight:800;color:#6a11cb;text-decoration:none;background:#f0e8ff;padding:3px 9px;border-radius:8px">📈 שימוש</a>
        <a href="https://console.firebase.google.com/project/familyhub-7fdd5/settings/billing" target="_blank" rel="noopener noreferrer"
           style="font-size:11px;font-weight:800;color:var(--primary-600);text-decoration:none;background:var(--primary-50);padding:3px 9px;border-radius:8px">💳 חיוב</a>
        <button class="analytics-refresh-btn" onclick="renderAnalytics(true)" title="רענן">↻</button>
      </div>
    </div>

    <div class="analytics-cards">
      <div class="analytics-card">
        <div class="analytics-card-icon">🏠</div>
        <div class="analytics-card-value">${d.familyCount}</div>
        <div class="analytics-card-label">משפחות</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-card-icon">👨‍👩‍👧</div>
        <div class="analytics-card-value">${d.parentCount + d.kidCount}</div>
        <div class="analytics-card-label">${d.parentCount} הורים · ${d.kidCount} ילדים</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-card-icon">🏫</div>
        <div class="analytics-card-value">${d.classCount}</div>
        <div class="analytics-card-label">כיתות פעילות</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-card-icon">✅</div>
        <div class="analytics-card-value">${d.approvedCount}</div>
        <div class="analytics-card-label">אירועים אושרו</div>
      </div>
    </div>

    <div class="analytics-section">
      <div class="analytics-section-title">
        🟢 נוכחות משתמשים
        <span id="presenceOnlineCount" style="margin-right:auto;font-size:10px;color:#a0aec0;font-weight:700"></span>
        <button class="analytics-refresh-btn" onclick="loadPresenceSection()" title="רענן">↻</button>
      </div>
      <input id="presenceSearch" type="search" placeholder="חיפוש משתמש..." class="presence-search"
        oninput="_schedulePresenceSearch()" />
      <div id="presenceGrid" class="presence-grid">
        <div style="color:#a0aec0;font-size:12px;padding:8px">טוען...</div>
      </div>
    </div>

    <div class="analytics-section">
      <div class="analytics-section-title">🏆 לוח מובילים <span style="font-size:10px;color:#a0aec0;font-weight:700;margin-right:auto">${d.leaderboardDays} ימים אחרונים</span></div>
      <div class="leaderboard-cards">
        <div class="leaderboard-card">
          <div class="lb-info">i<span class="lb-tooltip">העיר עם הכי הרבה ילדים רשומים באפליקציה</span></div>
          <div class="leaderboard-icon">🏙️</div>
          <div class="leaderboard-title">עיר מובילה</div>
          <div class="leaderboard-value">${d.topCity ? esc(d.topCity[0]) : '—'}</div>
          <div class="leaderboard-sub">${d.topCity ? d.topCity[1] + ' ילדים' : ''}</div>
        </div>
        <div class="leaderboard-card">
          <div class="lb-info">i<span class="lb-tooltip">בית הספר עם הכי הרבה ילדים רשומים באפליקציה</span></div>
          <div class="leaderboard-icon">🏫</div>
          <div class="leaderboard-title">בית ספר מוביל</div>
          <div class="leaderboard-value">${d.topSchool ? esc(d.topSchool[0]) : '—'}</div>
          <div class="leaderboard-sub">${d.topSchool ? d.topSchool[1] + ' ילדים' : ''}</div>
        </div>
        <div class="leaderboard-card">
          <div class="lb-info">i<span class="lb-tooltip">המשתמש שבילה הכי הרבה זמן באפליקציה ב-${d.leaderboardDays} הימים האחרונים</span></div>
          <div class="leaderboard-icon">⭐</div>
          <div class="leaderboard-title">משתמש פעיל ביותר</div>
          <div class="leaderboard-value">${d.topUser ? esc(d.topUser.memberName) : '—'}</div>
          <div class="leaderboard-sub">${d.topUser ? _fmtDuration(d.topUser.durationMs) + ' · ' + esc(d.topUser.familyName) : ''}</div>
        </div>
      </div>
    </div>

    <div class="analytics-charts-row">
      <div class="analytics-section">
        <div class="analytics-section-title">📈 אירועים שאושרו לפי חודש</div>
        <div class="chart-wrap"><canvas id="chartMonthly"></canvas></div>
      </div>
      <div class="analytics-section">
        <div class="analytics-section-title">🏫 כיתות הכי פעילות</div>
        <div class="chart-wrap"><canvas id="chartClasses"></canvas></div>
      </div>
    </div>

    <div class="analytics-charts-row">
      <div class="analytics-section">
        <div class="analytics-section-title">👥 מועמדויות ועד</div>
        <div class="chart-wrap" style="height:140px"><canvas id="chartApps"></canvas></div>
        <div style="text-align:center;font-size:11px;color:#718096;margin-top:6px;font-weight:700">
          ${d.appsPending} ממתינות · ${d.appsApproved} אושרו · ${d.appsDenied} נדחו
        </div>
      </div>
      <div class="analytics-section">
        <div class="analytics-section-title">🏫 בקשות בתי ספר</div>
        <div class="chart-wrap" style="height:140px"><canvas id="chartSchools"></canvas></div>
        <div style="text-align:center;font-size:11px;color:#718096;margin-top:6px;font-weight:700">
          ${d.schoolsPending} ממתינות · ${d.schoolsApproved} אושרו · ${d.schoolsDenied} נדחו
        </div>
      </div>
    </div>

    ${d.recentLog.length ? `
    <div class="analytics-section">
      <div class="analytics-section-title">🕓 פעילות אחרונה</div>
      ${d.recentLog.map(e => {
        const approved = e.action === 'approved';
        const dt = e.actionAt ? new Date(e.actionAt).toLocaleDateString('he-IL',{day:'numeric',month:'short'}) : '';
        return `<div class="analytics-log-row">
          <span class="analytics-log-action ${approved?'approved':'rejected'}">${approved?'אושר':'נדחה'}</span>
          <div>
            <div style="font-weight:800;color:#1a202c">${esc(e.eventTitle||'אירוע')}</div>
            <div class="analytics-log-meta">${esc(e.className||'')}${dt ? ' · ' + dt : ''}</div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;

  // Chart 1: Monthly events (line)
  if (monthLabels.length) {
    _analyticsCharts.monthly = new Chart(el('chartMonthly'), {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'אירועים',
          data: monthValues,
          borderColor: '#6a11cb',
          backgroundColor: 'rgba(106,17,203,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#6a11cb',
          pointRadius: 4,
          fill: true,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 10, family: 'Heebo' } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } } },
        },
      },
    });
  } else {
    el('chartMonthly').parentElement.innerHTML = '<div style="text-align:center;padding:40px 0;color:#a0aec0;font-size:13px;font-weight:700">אין נתונים עדיין</div>';
  }

  // Chart 2: Events per class (horizontal bar)
  if (classLabels.length) {
    _analyticsCharts.classes = new Chart(el('chartClasses'), {
      type: 'bar',
      data: {
        labels: classLabels,
        datasets: [{
          label: 'אירועים',
          data: classValues,
          backgroundColor: 'rgba(106,17,203,0.75)',
          borderRadius: 6,
          maxBarThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } } },
          y: { ticks: { font: { size: 10, family: 'Heebo' } } },
        },
      },
    });
  } else {
    el('chartClasses').parentElement.innerHTML = '<div style="text-align:center;padding:40px 0;color:#a0aec0;font-size:13px;font-weight:700">אין נתונים עדיין</div>';
  }

  // Chart 3: Applications doughnut
  const appTotal = d.appsPending + d.appsApproved + d.appsDenied;
  if (appTotal > 0) {
    _analyticsCharts.apps = new Chart(el('chartApps'), {
      type: 'doughnut',
      data: {
        labels: ['ממתינות', 'אושרו', 'נדחו'],
        datasets: [{
          data: [d.appsPending, d.appsApproved, d.appsDenied],
          backgroundColor: ['#fef3c7', '#d1fae5', '#fee2e2'],
          borderColor: ['#f59e0b', '#10b981', '#f87171'],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Heebo' }, boxWidth: 12 } } },
      },
    });
  } else {
    el('chartApps').parentElement.innerHTML = '<div style="text-align:center;padding:30px 0;color:#a0aec0;font-size:13px;font-weight:700">אין מועמדויות</div>';
  }

  // Chart 4: School requests doughnut
  const schoolTotal = d.schoolsPending + d.schoolsApproved + d.schoolsDenied;
  if (schoolTotal > 0) {
    _analyticsCharts.schools = new Chart(el('chartSchools'), {
      type: 'doughnut',
      data: {
        labels: ['ממתינות', 'אושרו', 'נדחו'],
        datasets: [{
          data: [d.schoolsPending, d.schoolsApproved, d.schoolsDenied],
          backgroundColor: ['#fef3c7', '#d1fae5', '#fee2e2'],
          borderColor: ['#f59e0b', '#10b981', '#f87171'],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Heebo' }, boxWidth: 12 } } },
      },
    });
  } else {
    el('chartSchools').parentElement.innerHTML = '<div style="text-align:center;padding:30px 0;color:#a0aec0;font-size:13px;font-weight:700">אין בקשות</div>';
  }
}

// ════════════════════════════════════════
//  TAB EDITOR
// ════════════════════════════════════════
function openTabEditor() { renderTabEditor(); el('tabEditorScreen').classList.remove('hidden'); }
function closeTabEditor() { el('tabEditorScreen').classList.add('hidden'); }

function renderTabEditor() {
  const visible  = ALL_TABS.filter(t => !t.adminOnly || isAdmin());
  const active   = getActiveTabs();
  const inactive = visible.map(t => t.id).filter(id => !active.includes(id));

  el('tabEditorActive').innerHTML = active.map((id, i) => {
    const tab = ALL_TABS.find(t => t.id === id);
    const first = i === 0, last = i === active.length - 1, only = active.length === 1;
    return `<div class="tab-ed-row" data-drag-idx="${i}">
      <span class="tab-ed-handle" onpointerdown="tabDragDown(event,${i})">⠿</span>
      <span class="tab-ed-icon">${tab.icon}</span>
      <span class="tab-ed-label">${tabLabel(id)}</span>
      <div class="tab-ed-btns">
        <button class="tab-ed-arrow" onclick="tabMoveUp('${id}')"   ${first?'disabled':''}>↑</button>
        <button class="tab-ed-arrow" onclick="tabMoveDown('${id}')" ${last ?'disabled':''}>↓</button>
        <button class="tab-ed-remove" onclick="tabRemove('${id}')"  ${only ?'disabled':''}>×</button>
      </div>
    </div>`;
  }).join('');

  el('tabEditorPool').innerHTML = inactive.length
    ? inactive.map(id => {
        const tab = ALL_TABS.find(t => t.id === id);
        return `<div class="tab-ed-row">
          <span class="tab-ed-icon">${tab.icon}</span>
          <span class="tab-ed-label">${tabLabel(id)}</span>
          <button class="tab-ed-add" onclick="tabAdd('${id}')">+ הוסף</button>
        </div>`;
      }).join('')
    : '<div style="padding:12px 0;color:#a0aec0;font-size:13px;font-weight:700;text-align:center">כל הלשוניות פעילות ✓</div>';
}

// ────────────────────────────────────────
//  Drag-and-drop reorder
// ────────────────────────────────────────
const _drag = { on:false, timer:null, idx:-1, hoverIdx:-1, y0:0, rowH:48, tops:[], handle:null };

function tabDragDown(e, idx) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.stopPropagation();
  // Capture pointer so move/up events always fire on this element even when finger drifts
  const handle = e.currentTarget;
  handle.setPointerCapture(e.pointerId);
  // Attach move/up directly to the handle (captured events fire here, not on the scroll container)
  _drag.handle = handle;
  handle.addEventListener('pointermove',   tabDragMove);
  handle.addEventListener('pointerup',     tabDragUp);
  handle.addEventListener('pointercancel', tabDragUp);
  _drag.y0 = e.clientY;
  _drag.timer = setTimeout(() => {
    _drag.on = true;
    _drag.idx = idx;
    _drag.hoverIdx = idx;
    const rows = [...el('tabEditorActive').querySelectorAll('.tab-ed-row')];
    _drag.rowH = rows[0]?.offsetHeight || 48;
    // Cache absolute tops at drag-start so moves are stable
    _drag.tops = rows.map(r => r.getBoundingClientRect().top);
    rows[idx]?.classList.add('tab-ed-dragging');
    if (navigator.vibrate) navigator.vibrate(40);
  }, 350);
}

function tabDragMove(e) {
  const y = e.clientY;
  // Cancel long-press if finger moved too much — use 15px to tolerate natural tremor on mobile
  if (_drag.timer && Math.abs(y - _drag.y0) > 15) {
    clearTimeout(_drag.timer); _drag.timer = null;
  }
  if (!_drag.on) return;
  e.preventDefault();

  const dy = y - _drag.y0;
  const rows = [...el('tabEditorActive').querySelectorAll('.tab-ed-row')];

  // Translate the dragged row freely
  rows[_drag.idx].style.transform = `translateY(${dy}px)`;
  rows[_drag.idx].style.zIndex    = '10';

  // Determine insertion slot: snap by row-height increments from origin
  const raw = _drag.idx + dy / _drag.rowH;
  _drag.hoverIdx = Math.max(0, Math.min(rows.length - 1, Math.round(raw)));

  // Shift displaced rows to visualise the gap
  rows.forEach((r, i) => {
    if (i === _drag.idx) return;
    let shift = 0;
    if (_drag.hoverIdx > _drag.idx && i > _drag.idx && i <= _drag.hoverIdx) shift = -_drag.rowH;
    if (_drag.hoverIdx < _drag.idx && i >= _drag.hoverIdx && i < _drag.idx) shift = _drag.rowH;
    r.style.transform  = shift ? `translateY(${shift}px)` : '';
  });
}

function tabDragUp(e) {
  if (_drag.timer) { clearTimeout(_drag.timer); _drag.timer = null; }
  // Remove listeners we attached in tabDragDown
  if (_drag.handle) {
    _drag.handle.removeEventListener('pointermove',   tabDragMove);
    _drag.handle.removeEventListener('pointerup',     tabDragUp);
    _drag.handle.removeEventListener('pointercancel', tabDragUp);
    _drag.handle = null;
  }
  if (!_drag.on) { _drag.on = false; return; }
  _drag.on = false;
  // Clear all inline transforms before re-render
  el('tabEditorActive').querySelectorAll('.tab-ed-row').forEach(r => {
    r.style.transform = r.style.zIndex = r.style.transition = '';
    r.classList.remove('tab-ed-dragging');
  });

  if (_drag.hoverIdx >= 0 && _drag.hoverIdx !== _drag.idx) {
    const active = getActiveTabs();
    const [moved] = active.splice(_drag.idx, 1);
    active.splice(_drag.hoverIdx, 0, moved);
    saveActiveTabs(active);
    renderTabBar();
  }
  _drag.idx = _drag.hoverIdx = -1;
  renderTabEditor();
}

function tabMoveUp(id) {
  const active = getActiveTabs(), i = active.indexOf(id);
  if (i <= 0) return;
  [active[i-1], active[i]] = [active[i], active[i-1]];
  saveActiveTabs(active); renderTabBar(); renderTabEditor();
}
function tabMoveDown(id) {
  const active = getActiveTabs(), i = active.indexOf(id);
  if (i < 0 || i >= active.length - 1) return;
  [active[i], active[i+1]] = [active[i+1], active[i]];
  saveActiveTabs(active); renderTabBar(); renderTabEditor();
}
function tabRemove(id) {
  const active = getActiveTabs();
  if (active.length <= 1) return;
  const updated = active.filter(x => x !== id);
  saveActiveTabs(updated);
  if (S.tab === id) switchTab(updated[0]);
  renderTabBar(); renderTabEditor();
}
function tabAdd(id) {
  const active = getActiveTabs();
  if (active.includes(id)) return;
  saveActiveTabs([...active, id]);
  renderTabBar(); renderTabEditor();
}
// ════════════════════════════════════════
//  HOME EDITOR
// ════════════════════════════════════════
const HOME_SECTIONS = [
  { id:'chores',   icon:'✅', labelKey:'todayChores' },
  { id:'stars',    icon:'⭐', labelKey:'starChart'   },
  { id:'homework', icon:'📚', labelKey:'hwDueSoon'   },
  { id:'upcoming', icon:'📅', labelHe:'אירועים קרובים', labelEn:'Upcoming events' },
  { id:'shopping', icon:'🛒', labelHe:'קניות מהירות',  labelEn:'Quick shopping' },
];

function _normaliseHomePrefs(p) {
  const allIds = HOME_SECTIONS.map(s => s.id);
  allIds.forEach(id => { if (!p.order.includes(id)) p.order.push(id); });
  p.order  = p.order.filter(id => allIds.includes(id));
  p.hidden = (p.hidden || []).filter(id => allIds.includes(id));
  return p;
}

function getHomePrefs() {
  const allIds = HOME_SECTIONS.map(s => s.id);
  const def = { order: [...allIds], hidden: [] };
  if (!S.uid || !S.user) return def;
  try {
    // Prefer Firestore-synced prefs (available after familyData loads)
    const firestorePrefs = familyData?.homePrefs?.[S.user];
    const raw = firestorePrefs
      || (() => { try { return JSON.parse(localStorage.getItem('familyhub_home_prefs_' + S.uid + '_' + S.user)); } catch(e) { return null; } })();
    if (!raw) return def;
    return _normaliseHomePrefs({ order: [...(raw.order||[])], hidden: [...(raw.hidden||[])] });
  } catch(e) { return def; }
}

function saveHomePrefs(prefs) {
  if (!S.uid || !S.user) return;
  // Update local cache immediately
  if (familyData) {
    if (!familyData.homePrefs) familyData.homePrefs = {};
    familyData.homePrefs[S.user] = prefs;
  }
  localStorage.setItem('familyhub_home_prefs_' + S.uid + '_' + S.user, JSON.stringify(prefs));
  // Persist to Firestore so other devices pick it up
  if (fbDb) fbDb.collection('families').doc(S.uid)
    .update(new firebase.firestore.FieldPath('homePrefs', S.user), prefs)
    .catch(e => console.error('[homePrefs] Firestore write failed:', e.message));
  applyHomePrefs();
}

function applyHomePrefs() {
  const { order, hidden } = getHomePrefs();
  order.forEach((id, i) => {
    const sec = el('homeSection-' + id);
    if (!sec) return;
    sec.style.order = i;
    if (id === 'stars' && !getKids().length) { sec.style.display = 'none'; return; }
    sec.style.display = hidden.includes(id) ? 'none' : '';
  });
}

function openHomeEditor()  { renderHomeEditor(); el('homeEditorScreen').classList.remove('hidden'); }
function closeHomeEditor() { el('homeEditorScreen').classList.add('hidden'); }

function _homeSectionLabel(s) {
  if (s.labelKey) return t(s.labelKey) || s.labelHe || s.id;
  return getLang() === 'he' ? (s.labelHe || s.id) : (s.labelEn || s.id);
}

function renderHomeEditor() {
  const { order, hidden } = getHomePrefs();
  const visible = HOME_SECTIONS.filter(s => s.id !== 'stars' || getKids().length > 0);
  const active   = order.filter(id => !hidden.includes(id) && visible.find(s => s.id === id));
  const inactive = order.filter(id =>  hidden.includes(id) && visible.find(s => s.id === id));
  el('homeEditorActive').innerHTML = active.length ? active.map((id, i) => {
    const s = HOME_SECTIONS.find(x => x.id === id);
    const first = i === 0, last = i === active.length - 1;
    return `<div class="tab-ed-row" data-drag-idx="${i}">
      <span class="tab-ed-handle" onpointerdown="homeDragDown(event,${i})">⠿</span>
      <span class="tab-ed-icon">${s.icon}</span>
      <span class="tab-ed-label">${_homeSectionLabel(s)}</span>
      <div class="tab-ed-btns">
        <button class="tab-ed-arrow" onclick="homeSectionMoveUp('${id}')"   ${first?'disabled':''}>↑</button>
        <button class="tab-ed-arrow" onclick="homeSectionMoveDown('${id}')" ${last ?'disabled':''}>↓</button>
        <button class="tab-ed-remove" onclick="homeSectionHide('${id}')">×</button>
      </div></div>`;
  }).join('') : `<div style="padding:12px 0;color:#a0aec0;font-size:13px;font-weight:700;text-align:center">הכל מוסתר</div>`;
  el('homeEditorHidden').innerHTML = inactive.length ? inactive.map(id => {
    const s = HOME_SECTIONS.find(x => x.id === id);
    return `<div class="tab-ed-row">
      <span class="tab-ed-icon">${s.icon}</span>
      <span class="tab-ed-label">${_homeSectionLabel(s)}</span>
      <button class="tab-ed-add" onclick="homeSectionShow('${id}')">+ הצג</button></div>`;
  }).join('') : `<div style="padding:12px 0;color:#a0aec0;font-size:13px;font-weight:700;text-align:center">כל הסקציות מוצגות ✓</div>`;
}

function homeSectionMoveUp(id) {
  const p = getHomePrefs();
  const vis = HOME_SECTIONS.filter(s => s.id !== 'stars' || getKids().length > 0);
  const activeIds = p.order.filter(i => !p.hidden.includes(i) && vis.find(s => s.id === i));
  const idx = activeIds.indexOf(id);
  if (idx <= 0) return;
  [activeIds[idx-1], activeIds[idx]] = [activeIds[idx], activeIds[idx-1]];
  let ai = 0;
  p.order = p.order.map(i => (!p.hidden.includes(i) && vis.find(s => s.id === i)) ? activeIds[ai++] : i);
  saveHomePrefs(p); renderHomeEditor(); renderHome();
}
function homeSectionMoveDown(id) {
  const p = getHomePrefs();
  const vis = HOME_SECTIONS.filter(s => s.id !== 'stars' || getKids().length > 0);
  const activeIds = p.order.filter(i => !p.hidden.includes(i) && vis.find(s => s.id === i));
  const idx = activeIds.indexOf(id);
  if (idx < 0 || idx >= activeIds.length - 1) return;
  [activeIds[idx], activeIds[idx+1]] = [activeIds[idx+1], activeIds[idx]];
  let ai = 0;
  p.order = p.order.map(i => (!p.hidden.includes(i) && vis.find(s => s.id === i)) ? activeIds[ai++] : i);
  saveHomePrefs(p); renderHomeEditor(); renderHome();
}
function homeSectionHide(id) {
  const p = getHomePrefs();
  if (!p.hidden.includes(id)) p.hidden.push(id);
  saveHomePrefs(p); renderHomeEditor();
}
function homeSectionShow(id) {
  const p = getHomePrefs();
  p.hidden = p.hidden.filter(x => x !== id);
  saveHomePrefs(p); renderHomeEditor();
}

// ────────────────────────────────────────
//  Drag-and-drop reorder — home editor
// ────────────────────────────────────────
const _homeDrag = { on:false, timer:null, idx:-1, hoverIdx:-1, y0:0, rowH:48, handle:null };

function homeDragDown(e, idx) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.stopPropagation();
  const handle = e.currentTarget;
  handle.setPointerCapture(e.pointerId);
  _homeDrag.handle = handle;
  handle.addEventListener('pointermove',   homeDragMove);
  handle.addEventListener('pointerup',     homeDragUp);
  handle.addEventListener('pointercancel', homeDragUp);
  _homeDrag.y0 = e.clientY;
  _homeDrag.timer = setTimeout(() => {
    _homeDrag.on = true;
    _homeDrag.idx = idx;
    _homeDrag.hoverIdx = idx;
    const rows = [...el('homeEditorActive').querySelectorAll('.tab-ed-row')];
    _homeDrag.rowH = rows[0]?.offsetHeight || 48;
    rows[idx]?.classList.add('tab-ed-dragging');
    if (navigator.vibrate) navigator.vibrate(40);
  }, 350);
}

function homeDragMove(e) {
  const y = e.clientY;
  if (_homeDrag.timer && Math.abs(y - _homeDrag.y0) > 15) {
    clearTimeout(_homeDrag.timer); _homeDrag.timer = null;
  }
  if (!_homeDrag.on) return;
  e.preventDefault();
  const dy = y - _homeDrag.y0;
  const rows = [...el('homeEditorActive').querySelectorAll('.tab-ed-row')];
  rows[_homeDrag.idx].style.transform = `translateY(${dy}px)`;
  rows[_homeDrag.idx].style.zIndex    = '10';
  const raw = _homeDrag.idx + dy / _homeDrag.rowH;
  _homeDrag.hoverIdx = Math.max(0, Math.min(rows.length - 1, Math.round(raw)));
  rows.forEach((r, i) => {
    if (i === _homeDrag.idx) return;
    let shift = 0;
    if (_homeDrag.hoverIdx > _homeDrag.idx && i > _homeDrag.idx && i <= _homeDrag.hoverIdx) shift = -_homeDrag.rowH;
    if (_homeDrag.hoverIdx < _homeDrag.idx && i >= _homeDrag.hoverIdx && i < _homeDrag.idx) shift = _homeDrag.rowH;
    r.style.transform = shift ? `translateY(${shift}px)` : '';
  });
}

function homeDragUp(e) {
  if (_homeDrag.timer) { clearTimeout(_homeDrag.timer); _homeDrag.timer = null; }
  if (_homeDrag.handle) {
    _homeDrag.handle.removeEventListener('pointermove',   homeDragMove);
    _homeDrag.handle.removeEventListener('pointerup',     homeDragUp);
    _homeDrag.handle.removeEventListener('pointercancel', homeDragUp);
    _homeDrag.handle = null;
  }
  if (!_homeDrag.on) { _homeDrag.on = false; return; }
  _homeDrag.on = false;
  el('homeEditorActive').querySelectorAll('.tab-ed-row').forEach(r => {
    r.style.transform = r.style.zIndex = '';
    r.classList.remove('tab-ed-dragging');
  });
  if (_homeDrag.hoverIdx >= 0 && _homeDrag.hoverIdx !== _homeDrag.idx) {
    const p = getHomePrefs();
    const vis = HOME_SECTIONS.filter(s => s.id !== 'stars' || getKids().length > 0);
    const activeIds = p.order.filter(id => !p.hidden.includes(id) && vis.find(s => s.id === id));
    const [moved] = activeIds.splice(_homeDrag.idx, 1);
    activeIds.splice(_homeDrag.hoverIdx, 0, moved);
    let ai = 0;
    p.order = p.order.map(id =>
      (!p.hidden.includes(id) && vis.find(s => s.id === id)) ? activeIds[ai++] : id
    );
    saveHomePrefs(p);
    renderHome();
  }
  _homeDrag.idx = _homeDrag.hoverIdx = -1;
  renderHomeEditor();
}

function setFilter(name){
  S.filter=(S.filter===name&&name!=='All')?'All':name;
  if (S.tab==='homework' && getKids().includes(S.filter)) S.child=S.filter;
  renderHeader();renderHome();renderChores();
  if (S.tab==='homework') renderHomework();
  if (S.tab==='community') renderCommunity();
}

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
if (!FB_CONFIGURED) {
  // Firebase not configured — show helpful message
  el('loadingScreen').querySelector('.loading-txt').textContent = '⚠ Firebase לא מוגדר';
  el('loadingScreen').querySelector('.loading-emoji').textContent = '⚙️';
} else {
  fbAuth.onAuthStateChanged(user => {
    if (_registering || _joining) return;
    if (user) {
      const familyUid = localStorage.getItem('familyhub_family_uid_' + user.uid) || user.uid;
      S.uid = familyUid;
      S.lockedMember = localStorage.getItem('familyhub_locked_member_' + user.uid) || null;
      el('authScreen').classList.add('hidden');
      subscribeToFamily(familyUid);
    } else {
      S.uid = null; familyData = null;
      el('loadingScreen').classList.add('hidden');
      el('authScreen').classList.remove('hidden');
      const joinParam = new URLSearchParams(location.search).get('join');
      if (joinParam) {
        setAuthMode('join');
        el('joinCode').value = joinParam.toUpperCase();
      } else {
        setAuthMode('signin');
      }
    }
  });
}

// ════════════════════════════════════════
//  TUTORIAL
// ════════════════════════════════════════
let _tutSteps  = [];
let _tutIdx    = 0;
let _tutTabKey = null;

function _tutIsMobile() { return window.innerWidth < 680; }

function _tutDefs() {
  const mob = _tutIsMobile();
  return {
    grocery: {
      steps: [
        {
          sel: '.grocery-subtabs',
          title: '3 לשוניות',
          text: '🏪 מאגר — רשימת המוצרים הקבועים שלכם.\n🛒 קניות — הרשימה שלוקחים לסופר.\n📋 היסטוריה — סיכומי קניות קודמות.',
        },
        {
          sel: '#poolAddWrap',
          title: 'הוספת מוצר למאגר',
          text: 'לחצו ➕ הוסף פריט להוספת מוצר חדש.\nניתן לבחור קטגוריה וסוג יחידה — יחידות (×) או משקל (ק"ג).',
        },
        {
          sel: '#grocerySec-pool .card',
          title: 'שליחה לרשימת הקניות',
          text: 'לחיצה על מוצר מוסיפה אותו לרשימה הפעילה — לחיצה חוזרת מסירה אותו.\nשינוי הכמות כאן מעדכן אוטומטית את הכמות המבוקשת ברשימה.',
        },
        {
          sel: '#grocerySec-pool .card',
          title: 'עריכה ומחיקה',
          text: mob
            ? 'החליקו מוצר שמאלה לחשיפת כפתורי עריכה ומחיקה.'
            : 'לחצו ⋮ ליד מוצר לתפריט עריכה ומחיקה.\nניתן גם להחליק שמאלה.',
        },
        {
          sel: '#grocerySec-shopping .card',
          title: 'בזמן הקניה',
          text: 'ליד שם כל מוצר מוצגת הכמות המבוקשת.\nניתן לשנות את הכמות שהבאתם בפועל — אם פחות מהמבוקש, הצבע ישתנה לכתום.\nבסיום לחצו ✓ סיימתי לקנות: הקניה תישמר בהיסטוריה וההורים האחרים יקבלו התראה על פריטים שלא הובאו.',
          before: () => switchGrocerySection('shopping'),
        },
      ],
      onEnd: () => switchGrocerySection('pool'),
    },
  };
}

function _tutDoneKey()  { return 'fh_tut_' + (S.uid || '_'); }
function _tutIsDone(tab) {
  try { return JSON.parse(localStorage.getItem(_tutDoneKey()) || '[]').includes(tab); } catch { return false; }
}
function _tutMarkDone(tab) {
  try {
    const k = _tutDoneKey();
    const d = JSON.parse(localStorage.getItem(k) || '[]');
    if (!d.includes(tab)) { d.push(tab); localStorage.setItem(k, JSON.stringify(d)); }
  } catch {}
}

function _tutMaybeTrigger(tab) {
  if (!isParent() || _tutIsDone(tab)) return;
  startTutorial(tab);
}

function replayTutorial(tab) {
  // Clear done flag so tutorial can re-run
  try {
    const k = _tutDoneKey();
    const d = JSON.parse(localStorage.getItem(k) || '[]').filter(t => t !== tab);
    localStorage.setItem(k, JSON.stringify(d));
  } catch {}
  // Navigate to the right tab, then start
  if (S.tab !== tab) {
    switchTab(tab);
    setTimeout(() => startTutorial(tab), 750);
  } else {
    startTutorial(tab);
  }
}

function startTutorial(tab) {
  const def = _tutDefs()[tab];
  if (!def?.steps?.length) return;
  _tutTabKey = tab;
  _tutSteps  = def.steps;
  _tutIdx    = 0;
  _tutShowStep(0);
}

function _tutShowStep(idx) {
  const step = _tutSteps[idx];
  if (!step) { _tutEnd(); return; }
  const expectedTab = _tutTabKey; // capture before any async gap
  if (step.before) step.before();
  setTimeout(() => {
    // Abort if tutorial ended, or user navigated away
    if (!_tutSteps.length || S.tab !== expectedTab) { if (_tutSteps.length) _tutEnd(); return; }

    const target = document.querySelector(step.sel);
    if (!target) { _tutIdx++; _tutShowStep(_tutIdx); return; }

    const rect = target.getBoundingClientRect();
    // If element is hidden (inside display:none parent), dimensions are zero — skip step
    if (rect.width === 0 && rect.height === 0) { _tutIdx++; _tutShowStep(_tutIdx); return; }

    const overlay = el('tutOverlay');
    if (!overlay) return;
    overlay.style.display = '';

    const pad  = 8;
    const spot = el('tutSpot');
    if (spot) {
      spot.style.top    = (rect.top    - pad) + 'px';
      spot.style.left   = (rect.left   - pad) + 'px';
      spot.style.width  = (rect.width  + pad * 2) + 'px';
      spot.style.height = (rect.height + pad * 2) + 'px';
    }

    const titleEl = el('tutTitle'); if (titleEl) titleEl.textContent = step.title;
    const textEl  = el('tutText');  if (textEl)  textEl.textContent  = step.text;
    const nextBtn = el('tutNextBtn'); if (nextBtn) nextBtn.textContent = idx === _tutSteps.length - 1 ? 'סיום ✓' : 'הבא ›';
    const dotsEl  = el('tutDots');
    if (dotsEl) dotsEl.innerHTML = _tutSteps.map((_, i) =>
      `<div class="tut-dot${i === idx ? ' active' : ''}"></div>`
    ).join('');

    const card  = el('tutCard');
    if (!card) return;
    const cardW = Math.min(300, window.innerWidth - 32);
    card.style.width     = cardW + 'px';
    card.style.transform = 'none'; // clear the default center transform
    const cardH = card.offsetHeight || 170;
    const vp    = window.innerHeight;
    let top  = rect.bottom + pad + 12;
    if (top + cardH > vp - 8) top = rect.top - pad - cardH - 12;
    top  = Math.max(8, Math.min(top, vp - cardH - 8));
    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - cardW - 8));
    card.style.top  = top  + 'px';
    card.style.left = left + 'px';
  }, 80);
}

function tutNext() {
  _tutIdx++;
  if (_tutIdx >= _tutSteps.length) _tutEnd();
  else _tutShowStep(_tutIdx);
}

function tutSkip() { _tutEnd(); }

function _tutEnd() {
  const _ov = el('tutOverlay'); if (_ov) _ov.style.display = 'none';
  _tutMarkDone(_tutTabKey);
  const def = _tutDefs()[_tutTabKey];
  if (def?.onEnd) def.onEnd();
  _tutSteps = []; _tutIdx = 0; _tutTabKey = null;
}