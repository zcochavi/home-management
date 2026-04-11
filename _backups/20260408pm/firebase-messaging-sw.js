importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyAlaDotuWTCk3GDqpgY-tEaNkpDrbOKM6M",
  authDomain:        "familyhub-7fdd5.firebaseapp.com",
  projectId:         "familyhub-7fdd5",
  storageBucket:     "familyhub-7fdd5.firebasestorage.app",
  messagingSenderId: "655474126170",
  appId:             "1:655474126170:web:65ffc8203c863bd47b9763",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'FamilyHub';
  const body  = payload.notification?.body  || '';
  self.registration.showNotification(title, {
    body,
    tag:  payload.data?.tag || 'familyhub',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const appUrl = 'https://zcochavi.github.io/home-management/';
      for (const c of list) {
        if (c.url.includes('home-management') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(appUrl);
    })
  );
});
