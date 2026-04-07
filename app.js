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
    noChores:'🎉 אין משימות להציג',
    choreHistory:'✅ היסטוריה', choreHistoryEmpty:'אין משימות שהושלמו עדיין', choreHistorySearch:'חיפוש בהיסטוריה...',
    high:'גבוה', medium:'בינוני', low:'נמוך',
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
    cats:{ 'Fruit & Veg':'פירות וירקות','Dairy & Eggs':'חלב וביצים','Pantry':'מזווה','Meat & Fish':'בשר ודגים' },
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
    noChores:'🎉 No chores to show',
    choreHistory:'✅ History', choreHistoryEmpty:'No completed chores yet', choreHistorySearch:'Search history…',
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
// Returns <img> if member has a photo, else emoji string.
// sizePx = explicit px (for inline/text contexts); omit to fill container (width/height 100%).
function getAvatar(name, sizePx) {
  const member = getMembers().find(m => m.name === name);
  if (member?.photo) {
    const s = sizePx != null ? `width:${sizePx}px;height:${sizePx}px` : 'width:100%;height:100%';
    return `<img src="${esc(member.photo)}" style="${s};object-fit:cover;border-radius:50%;display:block">`;
  }
  return member?.emoji || '👤';
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
  { name:'Fruit & Veg', emoji:'🥦' },
  { name:'Dairy & Eggs', emoji:'🥛' },
  { name:'Pantry', emoji:'🥫' },
  { name:'Meat & Fish', emoji:'🥩' },
];
const DEFAULT_SUBJECTS = [
  { name:'Maths',   nameHe:'מתמטיקה', bg:'#3b82f6', color:'#ffffff' },
  { name:'English', nameHe:'אנגלית',  bg:'#10b981', color:'#ffffff' },
  { name:'Science', nameHe:'מדעים',   bg:'#8b5cf6', color:'#ffffff' },
  { name:'History', nameHe:'היסטוריה',bg:'#f59e0b', color:'#ffffff' },
  { name:'Art',     nameHe:'אמנות',   bg:'#ec4899', color:'#ffffff' },
];
const SUBJECT_COLOR_POOL = [
  { bg:'#ef4444', color:'#ffffff' },{ bg:'#14b8a6', color:'#ffffff' },
  { bg:'#f97316', color:'#ffffff' },{ bg:'#6366f1', color:'#ffffff' },
  { bg:'#84cc16', color:'#ffffff' },{ bg:'#06b6d4', color:'#ffffff' },
  { bg:'#a855f7', color:'#ffffff' },{ bg:'#0ea5e9', color:'#ffffff' },
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
  return 'background:#f0f4ff;color:#718096';
}
function subjectLabel(name) {
  const s = getSubjects().find(s => s.name === name);
  if (getLang() === 'he') return s?.nameHe || s?.name || name;
  return s?.name || name;
}

const _now     = new Date();
const today    = _now.toISOString().slice(0,10);
const tomorrow = new Date(_now.getTime()+864e5).toISOString().slice(0,10);

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
let _draftMembers = [];
let _mbRole   = 'parent';
let _mbEmoji  = EMOJI_OPTIONS[0];
let _mbGender = null;
let _mbDob    = '';

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
  const entry = { name, emoji: _mbEmoji, role: _mbRole };
  if (_mbRole === 'kid') {
    if (_mbGender) entry.gender = _mbGender;
    const dob = el('mbDob')?.value;
    if (dob) entry.dob = dob;
  }
  _draftMembers.push(entry);
  el('mbName').value = '';
  if (el('mbDob')) el('mbDob').value = '';
  _mbGender = null;
  el('mbGenderBoy') ?.classList.remove('active');
  el('mbGenderGirl')?.classList.remove('active');
  renderMemberPreview();
}
function removeDraftMember(i) {
  _draftMembers.splice(i, 1);
  renderMemberPreview();
}
function renderMemberPreview() {
  el('memberPreview').innerHTML = _draftMembers.map((m, i) => {
    const genderLabel = m.gender === 'boy' ? ' · 👦' : m.gender === 'girl' ? ' · 👧' : '';
    const dobLabel    = m.dob ? ' · ' + m.dob : '';
    return `<div class="member-chip">
      <span class="member-chip-emoji">${m.emoji}</span>
      <span class="member-chip-name">${esc(m.name)}${genderLabel}${dobLabel}</span>
      <span class="member-chip-role">${m.role==='parent'?'הורה':'ילד/ה'}</span>
      <button class="member-chip-del" onclick="removeDraftMember(${i})">×</button>
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
  _draftMembers = [];
  renderMemberPreview();
  initEmojiRow();
}
function signupBack() {
  el('signupPanel2').style.display = 'none';
  el('signupPanel1').style.display = '';
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
  }
}

async function doSignUp() {
  if (!FB_CONFIGURED) return;
  el('su2Error').textContent = '';
  const validMembers = _draftMembers.filter(m => m.name.trim());
  if (validMembers.length === 0) { el('su2Error').textContent = 'יש להוסיף לפחות איש משפחה אחד'; return; }
  const members = validMembers.map(m => ({ name:m.name.trim(), emoji:m.emoji, role:m.role }));
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
    const localRaw = localStorage.getItem('familyhub_v3');
    let init = { chores:[], grocery:[], homework:[], events:[], stars:{} };
    if (localRaw) { try { Object.assign(init, JSON.parse(localRaw)); } catch(e){} }
    await fbDb.collection('families').doc(ownerUid).set({
      familyName, email, members, familyCode: code,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      chores: init.chores||[], grocery: init.grocery||[],
      homework: init.homework||[], events: init.events||[], stars: init.stars||{},
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
}

function getAuthError(code) {
  const m = {
    'auth/user-not-found':         'לא נמצא חשבון עם אימייל זה',
    'auth/wrong-password':         'סיסמה שגויה',
    'auth/invalid-credential':     'אימייל או סיסמה שגויים',
    'auth/email-already-in-use':   'כתובת האימייל כבר בשימוש',
    'auth/invalid-email':          'כתובת אימייל לא תקינה',
    'auth/weak-password':          'הסיסמה חלשה מדי (6 תווים לפחות)',
    'auth/network-request-failed': 'בעיית חיבור לרשת',
    'auth/too-many-requests':      'יותר מדי ניסיונות, נסה שוב מאוחר יותר',
    'permission-denied':           'אין הרשאה לכתוב למסד הנתונים — יש לעדכן את חוקי האבטחה ב-Firebase Console',
  };
  return m[code] || 'שגיאה: ' + code;
}

let _sessionRef      = null;
let _sessionStartMs  = null;

function _applyAdminUI() {
  const btn = el('pendingReqBtn');
  if (btn) btn.style.display = isCommittee() ? '' : 'none';
  if (isCommittee()) _fetchPendingBadge();
}

// ── Toast (temporary on-screen info, no bell) ────────────────
function showToast(msg, type = 'info', duration = 4000) {
  let wrap = el('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:50%;transform:translateX(50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:90%;max-width:360px';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  const bg = type === 'error' ? '#c53030' : type === 'success' ? '#276749' : '#4a6fa5';
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
let _allNotifs = []; // cached for message center

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
      const _visibleNotif = n => !n.dismissed && (
        !['school_pending','event_pending','application_pending'].includes(n.type) ||
        (n.recipientUid === S.uid && n.requestedByUid !== S.uid)
      ) && (n.type !== 'member_joined' || isParent());
      renderNotifBanners(_allNotifs.filter(_visibleNotif).reverse());
      // Patch old school_pending notifications that are missing reqId
      if (isAdmin()) _patchMissingReqIds(_allNotifs);
      _updateBellBadge();
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
    (n.type !== 'member_joined' || isParent())
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
    const isInfo     = n.type === 'shopping_done';
    const isGood     = n.type?.includes('approved') || n.type === 'member_joined';
    const isDenied   = n.type?.includes('denied') || n.type?.includes('rejected');
    const bg     = isInfo ? '#fffbeb' : isGood ? '#f0fff4' : isDenied ? '#fff5f5' : '#ebf8ff';
    const border = isInfo ? '#f6e05e' : isGood ? '#9ae6b4' : isDenied ? '#feb2b2' : '#90cdf4';
    const color  = isInfo ? '#744210' : isGood ? '#276749' : isDenied ? '#c53030' : '#2b6cb0';
    const icon   = isInfo ? '🛒' : isGood ? '✅' : isDenied ? '❌' : isRequest ? '📋' : '🔔';
    const div = document.createElement('div');
    div.className = 'notif-banner notif-banner-in';
    div.id = 'notifBanner_' + n.id;
    div.style.cssText = `background:${bg};border-color:${border};color:${color}`;
    const requestActions = isRequest && isAdmin()
      ? (n.reqId
          ? `<div class="notif-banner-actions">
               <button class="notif-banner-act approve" onclick="quickApproveReq('${n.id}','${n.type}','${n.reqId}',this)" title="אישור">✓</button>
               <button class="notif-banner-act deny"    onclick="quickDenyReq('${n.id}','${n.type}','${n.reqId}',this)"    title="דחייה">✗</button>
             </div>`
          : `<div class="notif-banner-actions">
               <button class="notif-banner-act approve" onclick="closeMenu();openPendingPanel()" title="פתח בקשות">📋</button>
             </div>`)
      : '';
    div.innerHTML = `<span class="notif-banner-icon">${icon}</span>
      <span class="notif-banner-text">${esc(n.message)}</span>
      ${requestActions}
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
      if (docSnap.exists) await updateSchoolIndex(docSnap.data().city, docSnap.data().schoolName);
      await fbFunctions.httpsCallable('approveSchoolRequest')({ id: reqId, adminName: myFullName() });
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
  if (!confirm('לדחות את הבקשה?')) return;
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

// ── Message center ────────────────────────────────────────────
function openMessageCenter() {
  const panel = el('messageCenterPanel');
  panel.classList.remove('hidden');
  panel.classList.add('mc-open');
  renderMessageCenter();
}
function closeMessageCenter() {
  const panel = el('messageCenterPanel');
  panel.classList.add('mc-closing');
  setTimeout(() => { panel.classList.add('hidden'); panel.classList.remove('mc-open','mc-closing'); }, 280);
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
    el('ppEventsList').innerHTML = pending.length
      ? pending.map(ev => `
          <div class="pending-event-row">
            <div class="pending-event-info">
              <span class="pending-event-title">${esc(ev.title)}</span>
              <span class="pending-event-meta">${esc(personFullName(ev.postedBy))}${ev.date ? ' · ' + ev.date : ''} · ${esc(classLabelFromId(ev.classId))}</span>
            </div>
            <div class="pending-event-actions">
              <button class="pending-approve-btn" onclick="approveEvent('${ev.classId}','${ev.id}')">${t('pendingApprove')}</button>
              <button class="pending-reject-btn"  onclick="rejectEvent('${ev.classId}','${ev.id}')">${t('pendingReject')}</button>
            </div>
          </div>`).join('')
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
    const total = pending.length + adminCount;
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
    const evCount = admin
      ? evSnap.size
      : evSnap.docs.filter(d => isCommitteeFor(d.ref.parent.parent.id)).length;
    const total = evCount + (appsSnap?.size || 0) + (schoolsSnap?.size || 0);
    const badge = el('pendingReqBadge');
    if (badge) { badge.textContent = total || ''; badge.classList.toggle('hidden', !total); }
  } catch(e) {}
}

function renderMessageCenter() {
  const list = el('messageCenterList');
  if (!list) return;
  const notifs = _allNotifs.filter(n => !['school_pending','event_pending','application_pending'].includes(n.type));
  el('mcCount').textContent = notifs.length ? `${notifs.length} הודעות` : '';
  el('mcDeleteAllBtn').style.display = notifs.length ? '' : 'none';
  const toolbar = el('mcSelectAllRow');
  if (toolbar) toolbar.style.display = notifs.length ? '' : 'none';
  if (!notifs.length) {
    list.innerHTML = '<div style="text-align:center;color:#a0aec0;font-size:13px;font-weight:700;padding:40px 0">אין הודעות</div>';
    return;
  }
  list.innerHTML = notifs.map(n => {
    const isGood = n.type?.includes('approved');
    const icon   = n.type === 'shopping_done' ? '🛒' : isGood ? '✅' : '❌';
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
      if (btn) { btn.textContent = '✓ הועתק!'; setTimeout(() => { if(el('shareBtn')) el('shareBtn').textContent = '📤 שתף'; }, 2200); }
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
      alert('✓ הועתק!');
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
    alert('שגיאה ביצירת קוד: ' + e.message);
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
    alert('שגיאה: ' + e.message);
  }
}

function shareSpouseCode(name, code) {
  const url  = location.origin + location.pathname + '?join=' + code;
  const text = `הצטרפ/י כ-${name} למשפחת ${familyData?.familyName || ''} ב-FamilyHub!\nקוד כניסה אישי: ${code}\n${url}`;
  if (navigator.share) {
    navigator.share({ title: 'FamilyHub', text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ הועתק!');
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
        .set({ token, platform, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
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
  if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
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

function afterLoad() {
  const kids = getKids();
  if (!S.child || !kids.includes(S.child)) S.child = kids[0] || null;
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
    renderAll(); tryAutoConnectGCal(); initPresence(); initNotifBanners(); _applyAdminUI(); _initHeaderCollapse();
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

// ════════════════════════════════════════
//  LOGIN / MEMBER PICKER
// ════════════════════════════════════════
function renderLoginScreen() {
  el('loginFamilyName').textContent = familyData?.familyName || '';
  el('loginSub').textContent = STRINGS.he.loginSub;
  const members = getMembers();
  // Restrict visible members based on current context
  let visibleMembers = members;
  if (S.lockedMember) {
    // Locked device: only show the locked member
    visibleMembers = members.filter(m => m.name === S.lockedMember);
  } else if (S.user && getParents().includes(S.user)) {
    // Parent device: show self + all kids, not other parents
    visibleMembers = members.filter(m => m.name === S.user || m.role === 'kid');
  }
  el('loginGrid').innerHTML = visibleMembers.map((m, i) => `
    <div class="login-card${i===visibleMembers.length-1&&visibleMembers.length%2!==0?' login-card-solo':''}" onclick="login('${esc(m.name)}')">
      <div class="login-card-emoji">${getAvatar(m.name)}</div>
      <div class="login-card-name">${esc(m.name)}</div>
      <div class="login-card-role">${roleBadgeHtml(m.role, m.role==='parent'?S.uid:null)}</div>
    </div>`).join('');
}

function login(name) {
  S.user = name; S.filter = name;
  if (getKids().includes(name)) S.child = name;
  if (!S.child && getKids().length > 0) S.child = getKids()[0];
  localStorage.setItem('familyhub_member_' + S.uid, name);
  el('loginScreen').classList.add('hidden');
  el('app').classList.add('visible');
  loadSyncedClassEvents();
  applyDir(); renderAll(); tryAutoConnectGCal();
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
    { key:'All', label:t('everyone'), emoji:'👨‍👩‍👧‍👧' },
    ...others.map(n => ({ key:n, label:n, emoji:getEmoji(n) })),
  ];
  picker.innerHTML = chips.map(c =>
    `<div class="ep-chip ${_eventPersons.includes(c.key)?'selected':''}" onclick="toggleEventPerson('${esc(c.key)}')">
       <span>${c.emoji}</span><span>${esc(c.label)}</span>
     </div>`).join('');
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
  const ttlEl = el('mgmtHistoryTtl');
  if (ttlEl) ttlEl.value = getShoppingHistoryTtlDays();
}

async function mgmtSaveHistoryTtl() {
  const val = parseInt(el('mgmtHistoryTtl').value, 10);
  if (isNaN(val) || val < 0) return;
  await saveShoppingHistoryTtl(val);
  const msg = el('mgmtHistoryTtlMsg');
  if (msg) { msg.style.color = '#38a169'; msg.textContent = 'נשמר ✓'; setTimeout(() => { msg.textContent = ''; }, 2000); }
}

// ── Members ──────────────────────────────
function renderMgmtMembers() {
  const members = getMembers();
  _mgmtEditEmoji = {};
  members.forEach((m, i) => { _mgmtEditEmoji[i] = m.emoji; });

  el('mgmtMemberList').innerHTML = members.map((m, i) => {
    const canDel = members.length > 1 && m.name !== S.user &&
                   !(m.role==='parent' && getParents().length===1);
    return `
    <div class="mgmt-member-row">
      <div class="mgmt-avatar">${getAvatar(m.name)}</div>
      <div class="mgmt-member-info">
        <div class="mgmt-member-name">${esc(m.name)}</div>
        <div class="mgmt-member-role">${m.role==='parent'?'הורה':'ילד/ה'}</div>
        ${m.role==='kid'&&m.school?.city ? `<div class="mgmt-school-info">🏫 ${esc(m.school.city)}${m.school.name?', '+esc(m.school.name):''}${m.school.grade?', כיתה '+esc(m.school.grade)+(m.school.classNum?'\''+esc(m.school.classNum):''):''} ${m.schoolPending?'<span style="background:#fef3c7;color:#92400e;font-size:10px;padding:1px 6px;border-radius:8px;font-weight:700">⏳ ממתין</span>':''}</div>` : ''}
        ${m.role === 'kid' && m.joinCode ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:11px;color:#6a11cb;font-weight:700;background:#f0e6ff;padding:2px 8px;border-radius:8px;letter-spacing:1px">${esc(m.joinCode)}</span>
            <button style="background:none;border:none;font-size:13px;cursor:pointer;padding:2px 4px" onclick="shareKidCode('${esc(m.name)}','${esc(m.joinCode)}')" title="שתף קוד">📤</button>
          </div>` : ''}
        ${m.role === 'parent' && m.name !== S.user ? (m.joinCode ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:10px;color:#718096;margin-left:2px">🔑</span>
            <span style="font-size:11px;color:#276749;font-weight:700;background:#c6f6d5;padding:2px 8px;border-radius:8px;letter-spacing:1px">${esc(m.joinCode)}</span>
            <button style="background:none;border:none;font-size:13px;cursor:pointer;padding:2px 4px" onclick="shareSpouseCode('${esc(m.name)}','${esc(m.joinCode)}')" title="שתף קוד">📤</button>
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
          <input class="auth-input" id="mgmtEditClassNum_${i}" placeholder="מספר כיתה" value="${esc(m.school?.classNum||'')}" style="flex:1" maxlength="3" ${!m.school?.name ? 'disabled' : ''}>
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
    S.homework = S.homework.map(h => h.child===originalName    ? {...h,child:newName}    : h);
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
  if (!confirm(`הסר את ${name}?`)) return;
  const removedMember = getMembers().find(m => m.name === name);
  if (removedMember?.role === 'kid' && removedMember?.school)
    unregisterFromClass(name, removedMember.school); // fire-and-forget
  const members = getMembers().filter(m => m.name !== name);
  S.chores   = S.chores.filter(c   => c.assignee !== name);
  S.homework = S.homework.filter(h => h.child    !== name);
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
          <span style="font-size:18px">👨‍👩‍👧</span>
          <span class="comm-mate-family">${esc(c.familyName||'משפחה')}</span>
          <span class="comm-mate-kid">${esc(c.kidName)}</span>
        </div>`).join('')
      : `<div style="font-size:12px;color:#a0aec0;padding:4px 0">אין עדיין ילדים מהכיתה ב-FamilyHub</div>`}
    </div>`;
  }).join('');
}

// ── Community Tab ─────────────────────────
const EVENT_TYPES = [
  { id:'birthday',     icon:'🎂' },
  { id:'trip',         icon:'🚌' },
  { id:'party',        icon:'🎉' },
  { id:'announcement', icon:'📢' },
  { id:'other',        icon:'📝' },
];
function eventTypeIcon(type) { return EVENT_TYPES.find(e=>e.id===type)?.icon||'📝'; }
function eventTypeName(type) {
  const keys = { birthday:'evBirthday', trip:'evTrip', party:'evParty', announcement:'evAnnouncement', other:'evOther' };
  return t(keys[type]||'evOther');
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

let _commCache     = {}; // { [classId]: { classmates, events, loadedAt, error? } }
let _commListeners = {}; // { [classId]: [unsubFn, ...] }
let _commAddOpen   = {}; // { [classId]: bool }

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
  if (!scope || scope === 'class') return `<span class="scope-badge scope-class">${t('commScopeClass')}</span>`;
  if (scope === 'grade')  return `<span class="scope-badge scope-grade">${t('commScopeGrade')}</span>`;
  if (scope === 'school') return `<span class="scope-badge scope-school">${t('commScopeSchool')}</span>`;
  return '';
}
function renderEventRow(ev, cid, isPast) {
  const canDel = isParent() && ev.postedBy?.familyUid === S.uid;
  const sid = ev.scopeId || cid;
  return `<div class="comm-event${isPast?' comm-past-event':''}">
    <div class="comm-event-icon">${eventTypeIcon(ev.type)}</div>
    <div class="comm-event-body">
      <div class="comm-event-title">${esc(ev.title)}${scopeBadge(ev.scope)}</div>
      <div class="comm-event-meta">
        <span class="comm-event-date">${fmtEventDate(ev.date)}</span>
        ${ev.postedBy ? ` · ${esc(personFullName(ev.postedBy))}` : ''}
      </div>
      ${ev.note ? `<div class="comm-event-note">${esc(ev.note)}</div>` : ''}
      ${ev.payboxUrl ? `<a class="paybox-btn" href="${esc(ev.payboxUrl)}" target="_blank" rel="noopener noreferrer">${t('commPayNow')}</a>` : ''}
    </div>
    ${canDel ? `<button class="del-btn" onclick="deleteClassEvent('${ev.scope||'class'}','${sid}','${ev.id}')">×</button>` : ''}
  </div>`;
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
  const upcoming = allEvs.filter(e=>isEventUpcoming(e.date))
    .sort((a,b)=>(a.date||'').localeCompare(b.date||''));

  return `<div class="card" id="commCard_${cid}">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:#f0f4ff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${getAvatar(kid.name)}</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:900;color:#1a202c">${esc(kid.name)}</div>
        <div style="font-size:11px;color:#718096;font-weight:600">🏫 ${esc(classLabelFor(kid.school))}</div>
      </div>
      <button onclick="refreshCommunity()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#c8d3e8;padding:4px;line-height:1" title="רענן">↻</button>
    </div>

    <div class="comm-section-label">📅 ${t('commClassEvents')}</div>
    ${upcoming.length
      ? upcoming.map(ev=>renderEventRow(ev,cid,false)).join('')
      : `<div style="font-size:13px;color:#a0aec0;padding:6px 0;font-weight:600">${t('commNoEvents')}</div>`}

    ${isCommitteeFor(cid) && cache.pendingEvents?.length ? `
    <div class="comm-section-label" style="margin-top:16px;display:flex;align-items:center;gap:8px;color:#92400e">
      <span>${t('pendingSection')}</span>
      <span class="comm-count" style="background:#fef3c7;color:#92400e">${cache.pendingEvents.length}</span>
    </div>
    ${cache.pendingEvents.map(ev=>`
      <div class="pending-event-row">
        <div class="pending-event-info">
          <span class="pending-event-title">${esc(ev.title)}</span>
          <span class="pending-event-meta">${esc(personFullName(ev.postedBy))}${ev.date ? ' · ' + ev.date : ''}</span>
        </div>
        <div class="pending-event-actions">
          <button class="pending-approve-btn" onclick="approveEvent('${cid}','${ev.id}')">${t('pendingApprove')}</button>
          <button class="pending-reject-btn"  onclick="rejectEvent('${cid}','${ev.id}')">${t('pendingReject')}</button>
        </div>
      </div>`).join('')}` : ''}

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
    </div>`;
  }
  otherApps.forEach(app => {
    const voted = (app.votes||[]).includes(S.uid);
    const pct = Math.min(100, Math.round((app.voteCount||0)/15*100));
    const exp = app.expiresAt?.toDate ? fmtDate(app.expiresAt.toDate().toISOString().slice(0,10)) : '';
    const approveBtn = isAdmin() ? `<button class="pending-approve-btn" onclick="adminApproveApplication('${app.id}','${cid}')" style="font-size:11px">${t('commApplicationApprove')}</button><button class="pending-reject-btn" onclick="adminDenyApplication('${app.id}','${cid}')" style="font-size:11px">${t('commApplicationDeny')}</button>` : '';
    const voteBtn = !isAdmin() && !isCommitteeFor(cid) && isParent()
      ? (voted
          ? `<span style="font-size:12px;font-weight:800;color:#48bb78">${t('commApplicationVoted')}</span>`
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
      <input class="auth-input" id="commEvTitle_${cid}" placeholder="${t('commEventTitle')}" style="margin-bottom:6px">
      <div style="display:flex;gap:8px;margin-bottom:6px">
        <input type="date" class="auth-input" id="commEvDate_${cid}" style="flex:1">
        <select class="auth-input" id="commEvType_${cid}" style="flex:1" onchange="onCommEvTypeChange('${cid}')">
          ${EVENT_TYPES.map(et=>`<option value="${et.id}">${et.icon} ${eventTypeName(et.id)}</option>`).join('')}
        </select>
      </div>
      <div id="commEvGenderWrap_${cid}" style="display:none;margin-bottom:6px">
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
      <input class="auth-input" id="commEvNote_${cid}" placeholder="${t('commEventNote')}" style="margin-bottom:6px">
      <input class="auth-input" id="commEvPaybox_${cid}" placeholder="${t('commEventPaybox')}" style="margin-bottom:10px" type="url" dir="ltr">
      <div style="display:flex;gap:8px">
        <button class="auth-btn-main" style="flex:1;padding:10px" onclick="submitClassEvent('${cid}')">${t('commPost')}</button>
        <button class="auth-btn-back" style="flex:1;padding:10px" onclick="toggleCommAddForm('${cid}')">ביטול</button>
      </div>
    </div>
    <button class="btn-ghost" style="width:100%;margin-top:8px" id="commAddBtn_${cid}" onclick="toggleCommAddForm('${cid}')">
      ${addOpen ? '✕ סגור' : t('commAddEvent')}
    </button>` : ''}

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
              <span style="font-size:18px">👨‍👩‍👧</span>
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

  const kidsWithSchool = getKids()
    .map(name => getMembers().find(m => m.name === name))
    .filter(m => m?.school?.city && m?.school?.grade);

  if (!kidsWithSchool.length) {
    container.innerHTML = `<div class="card"><div class="empty" style="padding:20px 0;text-align:center">
      <div style="font-size:40px;margin-bottom:10px">🏫</div>
      <div style="font-weight:800;color:#4a5568;font-size:15px">${t('commNoSchool')}</div>
      <div style="font-size:12px;color:#a0aec0;margin-top:4px">${t('commNoSchoolHint')}</div>
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
  const adminBtn = isAdmin()
    ? `<button class="admin-btn" onclick="openAdminPanel()">🔧 ניהול אירועים</button>`
    : '';
  container.innerHTML = adminBtn + kidsWithSchool.map(kid => renderCommCard(kid)).join('');
}

function onCommEvTypeChange(cid) {
  const type = el('commEvType_' + cid)?.value;
  const wrap = el('commEvGenderWrap_' + cid);
  if (wrap) wrap.style.display = type === 'birthday' ? '' : 'none';
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
  el('commAddForm_' + cid)?.classList.toggle('open', !!_commAddOpen[cid]);
  const btn = el('commAddBtn_' + cid);
  if (btn) btn.textContent = _commAddOpen[cid] ? '✕ סגור' : t('commAddEvent');
}

async function submitClassEvent(cid) {
  const title      = el('commEvTitle_'  + cid)?.value.trim();
  const date       = el('commEvDate_'   + cid)?.value;
  const type       = el('commEvType_'   + cid)?.value || 'other';
  const scope      = el('commEvScope_'  + cid)?.value || 'class';
  const note       = el('commEvNote_'   + cid)?.value.trim() || '';
  const payboxRaw  = el('commEvPaybox_' + cid)?.value.trim() || '';
  const payboxUrl  = payboxRaw && (payboxRaw.startsWith('http://') || payboxRaw.startsWith('https://')) ? payboxRaw : '';
  const genderFilter = type === 'birthday'
    ? (document.querySelector(`input[name="commEvGender_${cid}"]:checked`)?.value || 'all')
    : 'all';
  if (!title || !date) return;
  const docData = { title, date, type, note, scope,
    postedBy: { familyUid: S.uid, firstName: S.user, familyName: familyData?.familyName||'' },
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    genderFilter,
  };
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
      alert(t('pendingSubmitted'));
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
  if (!confirm('לדחות את הבקשה?')) return;
  try {
    await fbFunctions.httpsCallable('rejectEvent')({ cid, pendingId });
    await renderPendingPanel();
    // onSnapshot handles community re-render
  } catch(e) { console.error('rejectEvent:', e); }
}

function openAdminPanel(showLog = true) {
  el('adminPanel').classList.remove('hidden');
  const logSection = el('adminLogSection');
  if (logSection) logSection.style.display = showLog ? '' : 'none';
  renderAdminPanel(showLog);
}
function closeAdminPanel() { el('adminPanel').classList.add('hidden'); }

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

async function renderNotifSettings() {
  const cfg = await loadNotifSettings();
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
          <button class="admin-btn" onclick="nudgePendingNow('${key}')" style="flex:1;padding:8px;font-size:13px;background:#f0fff4;color:#276749;border-color:#9ae6b4">🔔 שלח תזכורת עכשיו</button>
        </div>
      </div>
    </div>`;
  }).join('');
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
    alert('הגדרות נשמרו');
  } catch(e) { alert('שגיאה: ' + e.message); }
}

async function nudgePendingNow(type) {
  try {
    const nudge = fbFunctions.httpsCallable('nudgePending');
    const result = await nudge({ type });
    alert(`נשלחו ${result.data.sent} תזכורות`);
  } catch(e) { alert('שגיאה: ' + e.message); }
}

async function renderLeaderboardSettings() {
  const snap = await fbDb.collection('appConfig').doc('leaderboard').get().catch(() => null);
  const days = snap?.exists ? (snap.data().days || 30) : 30;
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

async function saveLeaderboardSettings() {
  const days = parseInt(el('leaderboardDaysInput')?.value) || 30;
  try {
    await fbDb.collection('appConfig').doc('leaderboard').set({ days }, { merge: true });
    alert('הגדרות נשמרו');
  } catch(e) { alert('שגיאה: ' + e.message); }
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

async function renderAdminPanel(showLog = true) {
  if (!showLog) {
    await renderNotifSettings();
    await renderLeaderboardSettings();
    renderMaintenanceTools();
    return;
  }
  el('adminLogList').innerHTML = '<div style="color:#a0aec0;font-size:13px;padding:8px 0">טוען...</div>';
  try {
    const logSnap = await fbDb.collection('adminLog').orderBy('actionAt', 'desc').limit(100).get();

    // Log
    const log = logSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    el('adminLogList').innerHTML = log.length
      ? log.map(entry => {
          const approved = entry.action === 'approved';
          const dt = entry.actionAt?.toDate ? entry.actionAt.toDate().toLocaleString('he-IL') : '';
          return `<div class="admin-log-row">
            <div class="admin-log-title">
              <span class="admin-log-badge ${approved ? 'approved' : 'rejected'}">${approved ? '✓ אושר' : '✕ נדחה'}</span>${esc(entry.eventTitle)}
            </div>
            <div class="admin-log-meta">הוגש על ידי: ${esc(personFullName(entry.submittedBy)||'?')} · ${approved ? 'אושר' : 'נדחה'} על ידי: ${esc(personFullName(entry.actionBy)||'?')} · ${dt}</div>
            <div class="admin-log-meta">כיתה: ${esc(classLabelFromId(entry.classId||''))}</div>
          </div>`;
        }).join('')
      : '<div style="font-size:13px;color:#a0aec0;padding:6px 0">אין היסטוריה עדיין</div>';

    await renderNotifSettings();
    await renderLeaderboardSettings();
    renderMaintenanceTools();
  } catch(e) {
    console.error('renderAdminPanel:', e);
    el('adminLogList').innerHTML = `<div style="color:#e53e3e;font-size:12px">${e.message}</div>`;
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
  if (!confirm('להגיש מועמדות לוועד ההורים?')) return;
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
  if (!confirm('לדחות מועמדות זו?')) return;
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
  } catch(e) { console.error('approveSchoolPart:', e); alert('שגיאה: ' + e.message); }
}

async function denySchoolPart(id, part) {
  try {
    await fbFunctions.httpsCallable('resolveSchoolPart')({ id, part, action: 'denied', adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('denySchoolPart:', e); alert('שגיאה: ' + e.message); }
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
  } catch(e) { console.error('approveSchool:', e); alert('שגיאה: ' + e.message); }
}

async function denySchool(id) {
  try {
    await fbFunctions.httpsCallable('denySchoolRequest')({ id, adminName: myFullName() });
    await renderPendingPanel();
  } catch(e) { console.error('denySchool:', e); alert('שגיאה: ' + e.message); }
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

function openPhotoModal() {
  renderPhotoModal();
  el('photoModal').style.display = 'flex';
}
function closePhotoModal() {
  el('photoModal').style.display = 'none';
}
function renderPhotoModal() {
  const members = getMembers().filter(m => isParent() || m.name === S.user);
  el('photoMemberList').innerHTML = members.map(m => `
    <div class="photo-member-row">
      <div class="photo-member-avatar">${getAvatar(m.name)}</div>
      <div class="photo-member-name">${esc(m.name)}</div>
      <button class="photo-upload-btn" onclick="pickPhoto('${esc(m.name)}')">📷 ${m.photo ? 'החלף' : 'העלה'}</button>
      ${m.photo ? `<button class="photo-remove-btn" onclick="removePhoto('${esc(m.name)}')">×</button>` : ''}
    </div>`).join('');
}
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
  renderPhotoModal();
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
  renderPhotoModal();
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
function toggleMenu(btn) { _menuOpen ? closeMenu() : openMenu(btn); }
function openMenu(btn) {
  _menuOpen = true;
  const lang = getLang();
  const isHe = lang === 'he';
  const parentItems = isParent() ? `
    <div class="menu-item" onclick="closeMenu();openMgmt()">
      <span class="menu-item-icon">⚙️</span>
      <span>${isHe ? 'ניהול' : 'Management'}</span>
    </div>
    <div class="menu-sep"></div>` : '';
  const gcalItem = (gcalConnected() || gcalWasConnected()) ? `
    <div class="menu-item" onclick="closeMenu();disconnectGCal()" style="color:#4285f4">
      <span class="menu-item-icon">📅</span>
      <span>${isHe ? 'נתק Google Calendar' : 'Disconnect Google Calendar'}</span>
    </div>
    <div class="menu-sep"></div>` : '';
  const adminItem = isAdmin() ? `
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();openAdminPanel(false)">
      <span class="menu-item-icon">🔧</span>
      <span>${isHe ? 'הגדרות מערכת' : 'System settings'}</span>
    </div>` : '';
  el('menuDropdown').innerHTML = parentItems + gcalItem + `
    <div class="menu-item" onclick="closeMenu();openPhotoModal()">
      <span class="menu-item-icon">📷</span>
      <span>${isHe ? 'תמונות משפחה' : 'Family photos'}</span>
    </div>
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();openTabEditor()">
      <span class="menu-item-icon">🗂</span>
      <span>${isHe ? 'התאמת לשוניות' : 'Customize tabs'}</span>
    </div>` + adminItem + `
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();toggleLang()">
      <span class="menu-item-icon">🌐</span>
      <span>${isHe ? 'Switch to English' : 'עבור לעברית'}</span>
    </div>
    ${!S.lockedMember ? `<div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();switchUser()">
      <span class="menu-item-icon">👤</span>
      <span>${isHe ? 'החלף משתמש' : 'Switch member'}</span>
    </div>` : ''}
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();installApp()">
      <span class="menu-item-icon">📲</span>
      <span>${isHe ? 'הוסף לדף הבית' : 'Add to home screen'}</span>
    </div>
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="closeMenu();authSignOut()" style="color:#e53e3e">
      <span class="menu-item-icon">🚪</span>
      <span>${isHe ? 'יציאה מהחשבון' : 'Sign out'}</span>
    </div>`;
  // Position dropdown relative to the ☰ button
  const dd = el('menuDropdown');
  dd.style.display = 'block';
  const r = btn ? btn.getBoundingClientRect() : el('menuDropdown').getBoundingClientRect();
  const ddW = dd.offsetWidth || 200;
  // Align to whichever edge of the button is closer to the nearest app boundary
  const spaceRight = window.innerWidth - r.right;
  const spaceLeft  = r.left;
  if (spaceRight >= spaceLeft) {
    dd.style.left  = r.left + 'px';
    dd.style.right = '';
  } else {
    dd.style.right = (window.innerWidth - r.right) + 'px';
    dd.style.left  = '';
  }
  dd.style.top = (r.bottom + 6) + 'px';
  el('menuOverlay').style.display = 'block';
}
function closeMenu() {
  _menuOpen = false;
  el('menuDropdown').style.display = 'none';
  el('menuOverlay').style.display  = 'none';
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

function renderStatic() {
  const lb=el('langBtn');   if(lb) lb.textContent = t('langToggle');
  const sb=el('switchBtn'); if(sb) sb.textContent = t('switchUser');
  el('starChartTitle').textContent   = t('starChart');
  el('hwDueSoonTitle').textContent   = t('hwDueSoon');
  el('poolTitle').textContent        = t('superPoolTitle');
  el('shoppingListTitle').textContent = t('superListTitle');
  el('addChoreTitle').textContent    = t('addChoreTitle');
  el('addEventTitle').textContent    = t('addEventTitle');
  el('newChoreText').placeholder  = t('chorePlaceholder');
  el('poolItemInput').placeholder = t('poolAddPlaceholder');
  el('hwDesc').placeholder        = t('hwPlaceholder');
  el('newEventTitle').placeholder = t('eventPlaceholder');
  el('addChoreBtn').textContent  = t('add');
  el('addHwBtn').textContent     = t('add');
  el('addEventBtn').textContent  = t('add');
  el('doneShoppingBtn').textContent   = t('doneShopping');
  el('historyTitle').textContent      = t('shoppingHistoryTitle');
  const lbl=el('gcalSyncLabel');if(lbl)lbl.textContent=t('gcalSyncOption');
  el('newChorePriority').innerHTML = `
    <option value="high">🔴 ${t('high')}</option>
    <option value="medium">🟡 ${t('medium')}</option>
    <option value="low">🟢 ${t('low')}</option>`;
  el('poolCatSelect').innerHTML = getGroceryCats().map(c =>
    `<option value="${esc(c.name)}">${c.emoji} ${esc(c.name)}</option>`).join('');
  el('hwSubject').innerHTML = getSubjects().map(s =>
    `<option value="${esc(s.name)}">${esc(subjectLabel(s.name))}</option>`).join('');
  // Dynamic member dropdowns
  el('newChoreAssignee').innerHTML = getAllMemberNames().map(n =>
    `<option value="${esc(n)}">${getEmoji(n)} ${esc(n)}</option>`).join('');
  renderEventPersonPicker();
}

function applyRoleUI() {
  // Kids can add chores for themselves but can't pick assignee
  el('newChoreAssignee').style.display = isParent()?'':'none';
  el('poolAddForm').style.display      = isParent()?'':'none';
}

// ════════════════════════════════════════
//  HEADER
// ════════════════════════════════════════
function renderHeader() {
  const h = new Date().getHours();
  const g = h<12?t('greetMorning'):h<17?t('greetAfternoon'):t('greetEvening');
  el('headerGreeting').innerHTML = `${esc(g)}, ${esc(S.user)}! ${getEmoji(S.user)} <span class="header-role-badge">${currentUserRoleBadge()}</span>`;
  el('headerDate').textContent = new Date().toLocaleDateString(t('locale'),{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const allNames = getAllMemberNames();
  const members = isParent()
    ? [{name:'All',emoji:'👨‍👩‍👧‍👧'}, ...allNames.map(n=>({name:n,emoji:getEmoji(n)}))]
    : [{name:'All',emoji:'👨‍👩‍👧‍👧'}, {name:S.user,emoji:getEmoji(S.user)}];
  el('avatarRow').innerHTML = members.map(f => `
    <div class="avatar-chip ${S.filter===f.name?'active':''}" onclick="setFilter('${esc(f.name)}')">
      <div class="avatar-bubble">${f.name==='All' ? '👨‍👩‍👧‍👧' : getAvatar(f.name)}</div>
      <div class="avatar-label">${f.name==='All'?t('all'):f.name}</div>
    </div>`).join('');
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
    .map(e => ({ ...e, _src: 'personal' }));

  // Class/grade/school events from cache
  const classEvs = [];
  getKids().forEach(name => {
    const member = getMembers().find(m => m.name === name);
    if (!member?.school) return;
    const cid = classIdFor(member.school);
    if (!cid || !_commCache[cid]) return;
    const cache = _commCache[cid];
    [...(cache.events||[]), ...(cache.gradeEvents||[]), ...(cache.schoolEvents||[])].forEach(ev => {
      if (isEventUpcoming(ev.date) && matchesGenderFilter(ev, name))
        classEvs.push({ ...ev, _src: 'class', _kid: name });
    });
  });

  // Merge, deduplicate, sort, take 5
  const seen = new Set();
  const all = [...personal, ...classEvs]
    .filter(e => {
      if (!e.date) return false;
      const key = (e.id || e.title) + '_' + e.date;
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
    return `<div class="task-row" style="gap:8px;padding:6px 0;align-items:flex-start">
      <span style="font-size:18px;flex-shrink:0;line-height:1.4">${eventTypeIcon(ev.type)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:#1a202c">${esc(ev.title)}${isClass ? scopeBadge(ev.scope) : ''}</div>
        <div style="font-size:11px;color:#718096;font-weight:600;margin-top:2px">${fmtDate(ev.date)}${ev.time ? ' · ' + ev.time : ''}</div>
      </div>
      ${isClass && ev._kid ? `<span class="mini-avatar">${getAvatar(ev._kid)}</span>` : ''}
    </div>`;
  }).join('');
}

function renderHome() {
  const bannerEl = el('welcomeBanner');
  if (isKid()) {
    const col = getKidGradient(S.user);
    const n = S.stars[S.user]||0;
    bannerEl.innerHTML = `<div class="welcome-banner" style="background:linear-gradient(135deg,${col})">
      <div class="wb-emoji">${getAvatar(S.user, 48)}</div>
      <div class="wb-name">${t('wbHi',S.user)}</div>
      <div class="wb-sub">${t('wbStars',n)}</div></div>`;
  } else { bannerEl.innerHTML = ''; }

  el('homeChoresTitle').textContent = S.filter==='All'?t('todayChores'):t('personChores',S.filter);
  let tasks = S.chores.filter(c=>!c.done);
  if (S.filter!=='All') tasks = tasks.filter(c=>c.assignee===S.filter);
  el('homeTasks').innerHTML = tasks.length
    ? tasks.slice(0,8).map(c => {
        const can = isParent()||c.assignee===S.user;
        return `<div class="task-row">
          <div class="check-box ${c.done?'done':''} ${can?'':'readonly'}" ${can?`onclick="toggleChore(${c.id})"`:''}>
            ${c.done?'✓':''}</div>
          <div class="task-text ${c.done?'done':''}">${esc(c.text)}</div>
          ${isParent()?`<div class="mini-avatar">${getAvatar(c.assignee)}</div>`:''}
          <span class="pri pri-${c.priority}">${t(c.priority)}</span></div>`;
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
    ? hw.map(h => `<div class="task-row">
        ${isParent()?`<div class="mini-avatar">${getAvatar(h.child)}</div>`:''}
        <div class="task-text">${esc(h.desc)}</div>
        ${h.due?`<span style="font-size:11px;color:#a0aec0;font-weight:600;white-space:nowrap">${fmtDate(h.due)}</span>`:''}
        <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span></div>`).join('')
    : t('noPendingHw');

  renderHomeUpcoming();
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

function renderChores() {
  // Show assignee dropdown only when no specific member is focused
  if (isParent()) {
    const assigneeEl = el('newChoreAssignee');
    if (assigneeEl) assigneeEl.style.display = S.filter === 'All' ? '' : 'none';
  }
  // Update add-chore title to reflect focused member
  const choreTitleEl = el('addChoreTitle');
  if (choreTitleEl) {
    choreTitleEl.textContent = S.filter === 'All'
      ? t('addChoreTitle')
      : `➕ הוסף משימה ל${S.filter}`;
  }
  let items = S.filter==='All' ? S.chores : S.chores.filter(c=>c.assignee===S.filter);
  const active = items.filter(c=>!c.done);
  const showAssignee = S.filter==='All';
  const inner = active.length ? active.map(c=>{
    const can = isParent()||c.assignee===S.user;
    return `<div class="hw-item" data-chore-id="${c.id}">
      <div class="hw-head">
        <div class="check-box ${can?'':'readonly'}" ${can?`onclick="toggleChore(${c.id})"`:''}>
        </div>
        ${showAssignee?`<span style="font-size:18px;flex-shrink:0;line-height:1">${getAvatar(c.assignee,20)}</span>`:''}
        <div class="hw-desc-text" style="flex:1">${esc(c.text)}</div>
        <span class="pri pri-${c.priority}">${t(c.priority)}</span>
        ${isParent()?`<button class="del-btn" onclick="deleteChore(${c.id})">×</button>`:''}
      </div>
    </div>`;
  }).join('') : `<div class="empty">${t('noChores')}</div>`;
  el('choresContent').innerHTML = `<div class="card">${inner}</div>`;
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
      <span class="hw-hist-title">${t('choreHistory')}</span>
      <span class="hw-hist-count">${allDone.length}</span>
      <span style="color:#a0aec0;font-size:12px;margin-inline-start:4px">${_choreHistOpen?'▲':'▼'}</span>
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
      ${isParent()?`<button class="del-btn" style="opacity:0.5;font-size:14px" title="בטל סימון" onclick="toggleChore(${c.id})">↩</button>`:''}
      ${isParent()?`<button class="del-btn" onclick="deleteChore(${c.id})">×</button>`:''}</div>`
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

function deleteChore(id){
  if(!isParent())return;
  S.chores=S.chores.filter(x=>x.id!==id);
  save(); renderHome(); renderChores();
}
function addChore(){
  const text=el('newChoreText').value.trim();if(!text)return;
  const assignee=isParent()
    ?(S.filter!=='All'?S.filter:el('newChoreAssignee').value)
    :S.user;
  S.chores.push({id:Date.now(),text,assignee,priority:el('newChorePriority').value,done:false});
  el('newChoreText').value='';save();renderHome();renderChores();
}

// ════════════════════════════════════════
//  SUPERMARKET
// ════════════════════════════════════════
let _grocerySection = 'pool';
let _poolQtyFor = null;      // poolId currently showing qty input
let _poolEditFor = null;     // poolId currently being edited
let _poolEditQtyType = 'count'; // unit type in active edit row
let _poolNewQtyType = 'count';  // unit for next new pool item: 'count' | 'kg'
const _collapsedPoolCats     = new Set();
const _collapsedShoppingCats = new Set();
let _poolSearch = '';
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

function toggleCatCollapse(el) {
  const sec = el.dataset.section;
  const cat = el.dataset.cat;
  const set = sec === 'pool' ? _collapsedPoolCats : _collapsedShoppingCats;
  if (set.has(cat)) set.delete(cat); else set.add(cat);
  if (sec === 'pool') renderPool(); else renderShoppingList();
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

function switchGrocerySection(sec) {
  _grocerySection = sec;
  ['pool','shopping','history'].forEach(s => {
    el(`grocerySec-${s}`).style.display = s === sec ? '' : 'none';
    el(`gtab-${s}`)?.classList.toggle('active', s === sec);
  });
  if (sec === 'pool')     renderPool();
  if (sec === 'shopping') renderShoppingList();
  if (sec === 'history')  renderShoppingHistory();
}

function renderSupermarket() {
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
    const inList = S.shoppingList.some(x => x.poolId === p.id);
    const qtyActive = _poolQtyFor === p.id;
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
        <select class="g-cat" id="poolEditCat_${p.id}">${catOptions}</select>
        <button class="unit-toggle${editIsKg?' kg':''}" id="poolEditUnit_${p.id}"
          onclick="togglePoolEditQtyType(${p.id})">${editIsKg?'ק"ג':'יח\''}</button>
        <button class="cart-btn" onclick="confirmEditPoolItem(${p.id})">✓</button>
        <button class="pool-add-btn" onclick="cancelEditPoolItem()" style="border-color:#718096;color:#718096">✕</button>
      </div>`;
    }

    if (qtyActive) {
      return `<div class="pool-item pool-item-qty-row">
        <div class="pool-item-name">${esc(p.name)}</div>
        <input class="qty-input${isKg?' kg':''}" id="poolQtyInput_${p.id}"
          type="number" min="${isKg?'0.1':'1'}" step="${isKg?'0.1':'1'}" value="${p.lastQty||1}"
          ${isKg?`oninput="this.value=this.value.replace(/(\\.\\d{1})\\d+/,'$1')"`:''}
          onkeydown="if(event.key==='Enter')confirmAddToList(${p.id})">
        <span class="qty-unit-label">${unitLabel}</span>
        <button class="cart-btn" onclick="confirmAddToList(${p.id})">✓</button>
        <button class="pool-add-btn" onclick="cancelAddToList()" style="border-color:#718096;color:#718096">✕</button>
      </div>`;
    }
    return `<div class="pool-item">
      <div class="pool-item-name">${esc(p.name)}<span class="unit-badge">${unitLabel}</span></div>
      <button class="pool-add-btn${inList?' in-list':''}" onclick="togglePoolItem(${p.id})">${inList?t('inList'):t('addToList')}</button>
      ${ed?`<button class="del-btn" style="color:#a0aec0" onclick="startEditPoolItem(${p.id})">✏️</button>`:''}
      ${ed?`<button class="del-btn" onclick="deletePoolItem(${p.id})">🗑</button>`:''}
    </div>`;
  }

  const searching = _poolSearch.length > 0;
  const poolItems = searching
    ? S.groceryPool.filter(p => p.name.toLowerCase().includes(_poolSearch))
    : S.groceryPool;

  function poolCatHtml(emoji, name, items) {
    const collapsed = !searching && _collapsedPoolCats.has(name);
    return `<div class="cat-title cat-collapsible" data-section="pool" data-cat="${esc(name)}" onclick="toggleCatCollapse(this)">
        <span class="cat-chevron">${collapsed?'◀':'▾'}</span>${emoji} ${esc(name)}<span class="cat-count">${collapsed?` (${items.length})`:''}</span>
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
  if (_poolQtyFor !== null) {
    const inp = el(`poolQtyInput_${_poolQtyFor}`);
    if (inp) { inp.focus(); inp.select(); }
  }
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
  S.groceryPool.push({ id: Date.now(), name, category, qtyType: _poolNewQtyType });
  el('poolItemInput').value = '';
  saveGrocery();
  renderPool();
}

function deletePoolItem(id) {
  if (!isParent()) return;
  S.groceryPool  = S.groceryPool.filter(p => p.id !== id);
  S.shoppingList = S.shoppingList.filter(x => x.poolId !== id);
  saveGrocery();
  renderPool();
}

function togglePoolItem(poolId) {
  const idx = S.shoppingList.findIndex(x => x.poolId === poolId);
  if (idx !== -1) {
    // Already in list — remove it (parents only)
    if (!isParent()) return;
    S.shoppingList.splice(idx, 1);
    saveGrocery();
    renderPool();
  } else {
    // Show inline qty input
    _poolQtyFor = poolId;
    renderPool();
  }
}

function confirmAddToList(poolId) {
  const pool = S.groceryPool.find(p => p.id === poolId);
  if (!pool) return;
  const inp = el(`poolQtyInput_${poolId}`);
  const isKg = pool.qtyType === 'kg';
  const raw = isKg ? parseFloat(parseFloat(inp?.value).toFixed(1)) : parseInt(inp?.value);
  const qty = isKg ? Math.max(0.1, raw || 1) : Math.max(1, raw || 1);
  pool.lastQty = qty;
  S.shoppingList.push({ id: Date.now(), poolId, name: pool.name, category: pool.category, qty, qtyType: pool.qtyType || 'count' });
  _poolQtyFor = null;
  saveGrocery();
  renderPool();
}

function cancelAddToList() {
  _poolQtyFor = null;
  renderPool();
}

function startEditPoolItem(id) {
  const pool = S.groceryPool.find(p => p.id === id);
  if (!pool) return;
  _poolEditFor = id;
  _poolEditQtyType = pool.qtyType || 'count';
  _poolQtyFor = null; // close qty row if open
  renderPool();
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
    const qtyBadge = `<span class="unit-badge" style="background:#e9f5ff;color:#2b6cb0">${fmtQty(item.qty||1, item.qtyType)}</span>`;
    return `<div class="slist-item">
      <div class="slist-item-name">${esc(item.name)} ${qtyBadge}</div>
      <input class="qty-input${isKg?' kg':''}" type="number"
        min="${isKg?'0.1':'1'}" step="${isKg?'0.1':'1'}" value="${item.qty||1}"
        ${isKg?`oninput="this.value=this.value.replace(/(\\\.\\d{1})\\d+/,'$1')"`:``}
        onchange="updateListQty(${item.id},this.value)">
      <span class="qty-unit-label">${unitLabel}</span>
      <button class="cart-btn" onclick="moveToCart(${item.id})">${t('toCart')}</button>
      ${ed?`<button class="del-btn" onclick="removeFromShoppingList(${item.id})">🗑</button>`:''}
    </div>`;
  }

  // Items still to grab
  if (S.shoppingList.length) {
    html += `<div class="super-section-label">📋 ${t('stillNeed')} (${S.shoppingList.length})</div>`;
    function shoppingCatHtml(emoji, name, items) {
      const collapsed = _collapsedShoppingCats.has(name);
      return `<div class="cat-title cat-collapsible" data-section="shopping" data-cat="${esc(name)}" onclick="toggleCatCollapse(this)">
          <span class="cat-chevron">${collapsed?'◀':'▾'}</span>${emoji} ${esc(name)}<span class="cat-count">${collapsed?` (${items.length})`:''}</span>
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
    html += S.inCart.map(item => `<div class="cart-item">
      <div class="cart-item-name">${esc(item.name)} <span class="unit-badge" style="background:#c6f6d5;color:#276749">${fmtQty(item.qty||1, item.qtyType)}</span></div>
      <button class="pool-add-btn" onclick="returnToList(${item.id})" style="border-color:#e53e3e;color:#e53e3e;font-size:11px">${t('returnToList')}</button>
    </div>`).join('');
  }

  el('shoppingListEl').innerHTML = html;
  el('doneShoppingBtn').style.display = (ed && hasContent) ? '' : 'none';
}


function moveToCart(id) {
  const idx = S.shoppingList.findIndex(x => x.id === id);
  if (idx === -1) return;
  const item = S.shoppingList.splice(idx, 1)[0];
  S.inCart.push({ ...item, id: Date.now() });
  saveGrocery();
  renderShoppingList();
}

function removeFromShoppingList(id) {
  if (!isParent()) return;
  S.shoppingList = S.shoppingList.filter(x => x.id !== id);
  saveGrocery();
  renderShoppingList();
}

function updateListQty(id, val) {
  const item = S.shoppingList.find(x => x.id === id);
  if (!item) return;
  const isKg = item.qtyType === 'kg';
  const parsed = isKg ? parseFloat(parseFloat(val).toFixed(1)) : parseInt(val);
  if (!isNaN(parsed) && parsed > 0) {
    item.qty = isKg ? Math.max(0.1, parsed) : Math.max(1, parsed);
    // Update badge in-place without full re-render
    const inp = document.querySelector(`input[onchange="updateListQty(${id},this.value)"]`);
    const badge = inp?.closest('.slist-item')?.querySelector('.unit-badge');
    if (badge) badge.textContent = fmtQty(item.qty, item.qtyType);
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
}

async function doneShopping() {
  if (!isParent()) return;
  const missed = [...S.shoppingList];
  const bought = S.inCart.length;
  const confirmMsg = t('doneShoppingConfirm', bought, missed.length);
  if (!confirm(confirmMsg)) return;
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
    `<span class="hist-item bought">${hl(x.name)} <span class="hist-qty">${fmtQty(x.qty, x.qtyType)}</span></span>`
  ).join('');
  const missedHtml = entry.missed.length
    ? `<div class="hist-missed-row"><span class="hist-missed-label">${t('historyMissed')}:</span> `
      + entry.missed.map(x => `<span class="hist-item missed">${hl(x.name)}</span>`).join('')
      + `</div>`
    : '';

  return `<div class="hist-entry">
    <div class="hist-header">
      <span class="hist-who">${emoji} ${esc(entry.by)}</span>
      <span class="hist-when">${datePrefix}${timeStr}</span>
    </div>
    <div class="hist-items-row">${boughtHtml}</div>
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
      <span class="cat-chevron">${expanded ? '▾' : '◀'}</span>
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

function fmtDoneAt(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString(t('locale'), {hour:'2-digit', minute:'2-digit'});
  return d.toLocaleDateString(t('locale'), {month:'short', day:'numeric'});
}

function renderHomework(){
  const kids = isParent() ? getKids() : getKids().filter(k=>k===S.user);
  const filterActive = getKids().includes(S.filter);
  const childTabsEl = el('childTabsContainer');
  childTabsEl.style.display = filterActive ? 'none' : '';
  childTabsEl.innerHTML = kids.map(k =>
    `<div class="child-tab ${S.child===k?'active':''}" onclick="switchChild('${esc(k)}')">${getEmoji(k)} ${k}</div>`
  ).join('');

  if (!S.child) {
    el('hwCardTitle').textContent = t('hwTitle','');
    el('hwList').innerHTML = `<div class="empty">${t('noKids')}</div>`;
    el('addHwForm').style.display = 'none';
    el('hwHistoryWrap').innerHTML = '';
    return;
  }
  el('hwCardTitle').textContent = t('hwTitle', S.child);
  const canAdd = isParent()||S.child===S.user;
  el('addHwForm').style.display = canAdd ? '' : 'none';

  // Active (not done) items only
  const pending = S.homework.filter(h=>h.child===S.child && !h.done);
  el('hwList').innerHTML = pending.length ? pending.map(h=>{
    const can=isParent()||h.child===S.user;
    return `<div class="hw-item" data-hw-id="${h.id}">
      <div class="hw-head">
        <div class="check-box ${can?'':'readonly'}" ${can?`onclick="toggleHW(${h.id})"`:''}>
        </div>
        <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span>
        <div class="hw-desc-text">${esc(h.desc)}</div>
        ${isParent()?`<button class="del-btn" onclick="deleteHW(${h.id})">×</button>`:''}</div>
      ${h.due?`<div class="hw-due">${t('hwDueLabel',fmtDate(h.due))}</div>`:''}</div>`;
  }).join('') : `<div class="empty">${t('noHw')}</div>`;

  renderHwHistory(S.child);
}

function renderHwHistory(child) {
  const wrap = el('hwHistoryWrap');
  if (!wrap || !child) return;
  const allDone = S.homework.filter(h=>h.child===child && h.done)
    .sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  if (!allDone.length) { wrap.innerHTML = ''; return; }

  const q = _hwHistSearch.toLowerCase();
  const filtered = q ? allDone.filter(h=>
    h.desc.toLowerCase().includes(q) || subjectLabel(h.subject).toLowerCase().includes(q)
  ) : allDone;

  wrap.innerHTML = `<div class="card" style="margin-top:10px">
    <div class="hw-hist-hdr" onclick="toggleHwHistory()">
      <span class="hw-hist-title">${t('hwHistory')}</span>
      <span class="hw-hist-count">${allDone.length}</span>
      <span style="color:#a0aec0;font-size:12px;margin-inline-start:4px">${_hwHistOpen?'▲':'▼'}</span>
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
      <span class="badge" style="${subjectBadgeStyle(h.subject)}">${esc(subjectLabel(h.subject))}</span>
      <div class="hw-hist-desc">${esc(h.desc)}</div>
      <span class="hw-hist-ts">${fmtDoneAt(h.doneAt)}</span>
      ${isParent()?`<button class="del-btn" style="opacity:0.5;font-size:14px" title="בטל סימון" onclick="toggleHW(${h.id})">↩</button>`:''}
      ${isParent()?`<button class="del-btn" onclick="deleteHW(${h.id})">×</button>`:''}
    </div>`).join('')
  : `<div class="empty" style="padding:8px 0">${t('hwHistoryEmpty')}</div>`;
}
function filterHwHistory(child) {
  const listEl = el('hwHistList');
  if (!listEl) return;
  const allDone = S.homework.filter(h=>h.child===child && h.done)
    .sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const q = _hwHistSearch.toLowerCase();
  const filtered = q ? allDone.filter(h=>
    h.desc.toLowerCase().includes(q) || subjectLabel(h.subject).toLowerCase().includes(q)
  ) : allDone;
  listEl.innerHTML = hwHistListHTML(filtered);
}
function toggleHwHistory() {
  _hwHistOpen = !_hwHistOpen;
  renderHwHistory(S.child);
}

function switchChild(c){S.child=c;renderHomework();}

function toggleHW(id){
  const h=S.homework.find(x=>x.id===id);
  if(!h||(!isParent()&&h.child!==S.user))return;
  if(!h.done){
    // Animate the item out, then mark done
    const row=document.querySelector(`.hw-item[data-hw-id="${id}"]`);
    if(row){
      row.classList.remove('hw-fly-in-active');
      void row.offsetWidth; // force reflow so animation restarts clean
      row.classList.add('hw-fly-out');
      setTimeout(()=>{
        h.done=true; h.doneAt=Date.now();
        _hwHistOpen=true;  // auto-open history so user sees where it went
        save(); renderHomework(); renderHome();
        requestAnimationFrame(()=>{
          const hist=document.querySelector(`.hw-hist-item[data-hw-id="${id}"]`);
          if(hist) hist.classList.add('hw-fly-in');
        });
      },270);
      return;
    }
    h.done=true; h.doneAt=Date.now(); _hwHistOpen=true;
  } else {
    // Animate history item out, then restore to active list
    const histRow=document.querySelector(`.hw-hist-item[data-hw-id="${id}"]`);
    if(histRow){
      histRow.classList.add('hw-fly-out-hist');
      setTimeout(()=>{
        h.done=false; delete h.doneAt;
        save(); renderHomework(); renderHome();
        requestAnimationFrame(()=>{
          const active=document.querySelector(`.hw-item[data-hw-id="${id}"]`);
          if(active) active.classList.add('hw-fly-in-active');
        });
      },270);
      return;
    }
    h.done=false; delete h.doneAt;
    save(); renderHomework(); renderHome();
  }
}

function deleteHW(id){if(!isParent())return;S.homework=S.homework.filter(x=>x.id!==id);save();renderHomework();renderHome();}
function addHomework(){
  if(!S.child)return;
  const desc=el('hwDesc').value.trim();if(!desc||(!isParent()&&S.child!==S.user))return;
  S.homework.push({id:Date.now(),child:S.child,subject:el('hwSubject').value,desc,due:el('hwDue').value,done:false});
  el('hwDesc').value='';save();renderHomework();renderHome();
}

// ════════════════════════════════════════
//  CALENDAR
// ════════════════════════════════════════
let _calClassEventsOn = {}; // { [kidName]: bool }
let _calClassOnly = false;  // true = show class events only
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

function allCalEvents(){
  const anyClassOn=Object.values(_calClassEventsOn).some(Boolean);
  const classEvs=[];
  getKids().forEach(name=>{
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
      classEvs.push({...ev,classEvent:true,classKid:name,_cid:cid});
    });
  });
  if(anyClassOn&&_calClassOnly) return classEvs;
  const syncedIds=new Set(S.events.filter(e=>e.gcalId).map(e=>e.gcalId));
  const base=[...S.events.filter(e=>!e.gcalId),...S.events.filter(e=>e.gcalId),...gcal.events.filter(e=>!syncedIds.has(e.gcalId))];
  return [...base,...classEvs];
}

function renderCalClassToggles(){
  const wrap=el('calClassToggles');
  if(!wrap)return;
  const kids=getKids()
    .map(name=>getMembers().find(m=>m.name===name))
    .filter(m=>m?.school?.city&&m?.school?.grade);
  if(!kids.length){wrap.innerHTML='';return;}
  const anyOn=Object.values(_calClassEventsOn).some(Boolean);
  const isHe=getLang()==='he';
  const segControl=anyOn?`<div class="cal-view-seg">
    <div class="cal-view-seg-btn ${!_calClassOnly?'active':''}" onclick="setCalClassOnly(false)">${isHe?'כל האירועים':'All events'}</div>
    <div class="cal-view-seg-btn ${_calClassOnly?'active':''}" onclick="setCalClassOnly(true)">${isHe?'כיתה בלבד':'Class only'}</div>
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

function setCalClassOnly(val){
  _calClassOnly=val;
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
  let html=`<div class="day-panel-title">📆 ${title}</div>`;
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
          <div class="event-meta">${e.time?'🕐 '+e.time:t('allDay')}${e.note?` · ${esc(e.note)}`:''}</div>
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
    const canDel=isParent()&&(!e.gcal||gcalConnected());
    return `<div class="event-item ${e.gcal?'gcal-event':''}" style="border-inline-start-color:${color}">
      <div class="event-body">
        <div class="event-title">${e.gcal?'<span class="g-badge">G</span>':''}${esc(e.title)}</div>
        <div class="event-meta">${e.time?'🕐 '+e.time:t('allDay')}${e.gcal?' '+t('gcalSource'):''}</div>
      </div>
      ${personLabel?`<span class="event-person-chip" style="background:${color}22;color:${color}">${personLabel}</span>`:''}
      ${canDel?`<button class="del-btn" onclick="deleteEvent(${e.id},'${e.gcalId||''}')">×</button>`:''}</div>`;
  }).join('');
  el('dayPanel').innerHTML=html;
}
function calShift(d){S.calMonth+=d;if(S.calMonth>11){S.calMonth=0;S.calYear++;}if(S.calMonth<0){S.calMonth=11;S.calYear--;}renderCalendar();}
async function addEvent(){
  const title=el('newEventTitle').value.trim(),date=el('newEventDate').value;
  if(!title||!date)return;
  const person = _eventPersons.length===1&&_eventPersons[0]==='All' ? 'All' : _eventPersons;
  const ev={id:Date.now(),title,date,time:el('newEventTime').value,person};
  const syncGcal=gcalConnected()&&isParent()&&el('gcalSyncCheck').checked;
  if(syncGcal){const gcalId=await gcalCreateEvent(ev);if(gcalId)ev.gcalId=gcalId;}
  S.events.push(ev);el('newEventTitle').value='';el('newEventTime').value='';
  _eventPersons=['All']; renderEventPersonPicker();
  S.calSelected=date;const d2=new Date(date+'T00:00:00');S.calYear=d2.getFullYear();S.calMonth=d2.getMonth();
  save();if(syncGcal)await fetchGCalEvents();else renderCalendar();
}
async function deleteEvent(id,gcalId){
  if(!isParent())return;
  if(gcalId&&gcalConnected())await gcalDeleteEvent(gcalId);
  if(typeof id==='number')S.events=S.events.filter(x=>x.id!==id);
  save();if(gcalConnected())await fetchGCalEvents();else renderCalendar();
}

// ════════════════════════════════════════
//  TABS & FILTER
// ════════════════════════════════════════
const ALL_TABS = [
  { id:'home',      icon:'🏡' },
  { id:'chores',    icon:'✅' },
  { id:'grocery',   icon:'🛒' },
  { id:'homework',  icon:'📚' },
  { id:'calendar',  icon:'📅' },
  { id:'community', icon:'🏫' },
  { id:'analytics', icon:'📊', adminOnly: true },
];
const TAB_IDX = { home:0, chores:1, grocery:2, homework:3, calendar:4, community:5, analytics:6 };
function tabLabel(id) { return t('tabs')[TAB_IDX[id]] || id; }

function getActiveTabs() {
  const visible = ALL_TABS.filter(t => !t.adminOnly || isAdmin());
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
  // If current tab was removed, fall back to first active
  if (!active.includes(S.tab)) {
    S.tab = active[0];
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    el('tab-' + S.tab)?.classList.add('active');
  }
  el('tabBar').innerHTML = active.map(id => {
    const tab = ALL_TABS.find(t => t.id === id);
    if (!tab) return '';
    return `<div class="tab ${S.tab===id?'active':''}" data-tab="${id}" onclick="switchTab('${id}')">
      <span class="tab-icon">${tab.icon}</span>
      <span class="tab-label">${tabLabel(id)}</span>
    </div>`;
  }).join('');
}

function switchTab(tab) {
  S.tab = tab;
  el('tabBar').querySelectorAll('.tab').forEach(e =>
    e.classList.toggle('active', e.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  el('tab-' + tab).classList.add('active');
  if (tab === 'community') renderCommunity();
  if (tab === 'analytics') renderAnalytics();
  if (tab === 'homework' && getKids().includes(S.filter)) S.child = S.filter;
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
let _presencePrevOnline  = new Set();
let _presenceCachedData  = null;
let _presenceExpanded    = { parent: false, kid: false };

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
    const { data } = await fn();
    _presenceCachedData = data.members || [];
    _renderPresenceGroups();
  } catch(e) {
    const c = el('presenceGrid');
    if (c) c.innerHTML = `<div style="color:#e53e3e;font-size:12px;padding:8px">${esc(e.message)}</div>`;
  }
}

function togglePresenceGroup(role) {
  _presenceExpanded[role] = !_presenceExpanded[role];
  _renderPresenceGroups();
}

function _renderPresenceGroups() {
  const container = el('presenceGrid');
  if (!container || !_presenceCachedData) return;

  const q = (el('presenceSearch')?.value || '').trim().toLowerCase();
  const members = q
    ? _presenceCachedData.filter(m =>
        (m.memberName || '').toLowerCase().includes(q) ||
        (m.familyName || '').toLowerCase().includes(q))
    : _presenceCachedData;

  const parents = members.filter(m => m.role !== 'kid');
  const kids    = members.filter(m => m.role === 'kid');
  const pOnline = parents.filter(m => m.online).length;
  const kOnline = kids.filter(m => m.online).length;

  const countEl = el('presenceOnlineCount');
  if (countEl) countEl.textContent = `${pOnline + kOnline} מחוברים מתוך ${members.length}`;

  const newOnline = new Set(members.filter(m => m.online).map(m => m.familyUid + '_' + m.memberName));

  // Auto-expand groups that have search results
  if (q) {
    if (parents.length) _presenceExpanded.parent = true;
    if (kids.length)    _presenceExpanded.kid    = true;
  }

  const groupHtml = (role, label, group, onlineCount) => {
    const expanded = _presenceExpanded[role];
    const cardsHtml = expanded ? group.map(m => {
      const key = m.familyUid + '_' + m.memberName;
      const justOnline = m.online && !_presencePrevOnline.has(key) && _presencePrevOnline.size > 0;
      const isKidRole  = m.role === 'kid';
      const badgeClass = isKidRole ? 'role-badge-kid' : 'role-badge-parent';
      const badgeLabel = isKidRole ? t('roleKid') : t('roleParent');
      const timeLabel  = m.online ? 'מחובר/ת' : _presenceTimeAgo(m.lastSeenMs);
      const clickable = isAdmin() && m.role !== 'kid';
      return `<div class="presence-card${justOnline ? ' just-online' : ''}${clickable ? ' presence-card-clickable' : ''}"
        ${clickable ? `onclick="openFamilyDetails('${m.familyUid}','${esc(m.memberName)}')"` : ''}>
        <div class="presence-dot ${m.online ? 'online' : 'offline'}"></div>
        <div class="presence-name">${esc(m.memberName)}<br><span style="font-weight:700;color:#718096">${esc(m.familyName)}</span></div>
        <span class="role-badge ${badgeClass}" style="font-size:9px;padding:1px 6px">${badgeLabel}</span>
        <div class="presence-time ${m.online ? 'online' : ''}">${timeLabel}</div>
      </div>`;
    }).join('') : '';
    return `
      <div class="presence-group">
        <div class="presence-group-header" onclick="togglePresenceGroup('${role}')">
          <span class="presence-group-chevron">${expanded ? '▾' : '◂'}</span>
          <span class="presence-group-label">${label}</span>
          <span class="presence-group-count">
            <span style="color:${onlineCount > 0 ? '#48bb78' : '#a0aec0'};font-weight:800">${onlineCount}</span>
            <span style="color:#a0aec0">/ ${group.length} מחוברים</span>
          </span>
        </div>
        ${expanded ? `<div class="presence-cards-grid">${cardsHtml}</div>` : ''}
      </div>`;
  };

  container.innerHTML =
    groupHtml('parent', 'הורים', parents, pOnline) +
    groupHtml('kid',    'ילדים',  kids,    kOnline);

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

  el('familyDetailsBody').innerHTML = treeSection;
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
    _presenceRefreshTimer = setInterval(loadPresenceSection, 30 * 1000);
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
           style="font-size:11px;font-weight:800;color:#276749;text-decoration:none;background:#e6f4ea;padding:3px 9px;border-radius:8px">💳 חיוב</a>
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
        oninput="_renderPresenceGroups()" />
      <div id="presenceGrid" class="presence-grid">
        <div style="color:#a0aec0;font-size:12px;padding:8px">טוען...</div>
      </div>
    </div>

    <div class="analytics-section">
      <div class="analytics-section-title">🏆 לוח מובילים <span style="font-size:10px;color:#a0aec0;font-weight:700;margin-right:auto">${d.leaderboardDays} ימים אחרונים</span></div>
      <div class="leaderboard-cards">
        <div class="leaderboard-card">
          <div class="leaderboard-icon">🏙️</div>
          <div class="leaderboard-title">עיר מובילה</div>
          <div class="leaderboard-value">${d.topCity ? esc(d.topCity[0]) : '—'}</div>
          <div class="leaderboard-sub">${d.topCity ? d.topCity[1] + ' ילדים' : ''}</div>
        </div>
        <div class="leaderboard-card">
          <div class="leaderboard-icon">🏫</div>
          <div class="leaderboard-title">בית ספר מוביל</div>
          <div class="leaderboard-value">${d.topSchool ? esc(d.topSchool[0]) : '—'}</div>
          <div class="leaderboard-sub">${d.topSchool ? d.topSchool[1] + ' ילדים' : ''}</div>
        </div>
        <div class="leaderboard-card">
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
function setFilter(name){
  S.filter=(S.filter===name&&name!=='All')?'All':name;
  if (S.tab==='homework' && getKids().includes(S.filter)) S.child=S.filter;
  renderHeader();renderHome();renderChores();
  if (S.tab==='homework') renderHomework();
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