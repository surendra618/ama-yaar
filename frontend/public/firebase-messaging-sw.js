// Firebase Cloud Messaging Service Worker
// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'AMA-YAAR';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new update from AMA-YAAR!',
      icon: payload.notification?.icon || '/logo.png',
      data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
