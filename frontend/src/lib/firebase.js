import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import api from './axios';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let googleProvider = null;
let messaging = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
  }
} else {
  console.info('[Firebase] Config keys not provided in .env yet. Google Sign-In & FCM ready once keys are set.');
}

/**
 * Sign in with Google using Firebase Popup
 */
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase credentials not configured. Please add VITE_FIREBASE_API_KEY in .env file.');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  const idToken = await fbUser.getIdToken();

  return {
    idToken,
    googleId: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
    avatar: fbUser.photoURL || '',
  };
}

/**
 * Request Notification Permission and register FCM Token
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[FCM] Notifications not supported in this browser.');
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported || !app) return null;

    messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
    });

    if (token) {
      console.log('[FCM] Token registered:', token);
      // Register token with backend
      try {
        await api.post('/auth/fcm-token', { token });
      } catch (err) {
        console.warn('[FCM] Failed to sync token with backend:', err.message);
      }
      return token;
    }
  } catch (err) {
    console.warn('[FCM] Error requesting notification permission:', err);
  }
  return null;
}

/**
 * Foreground message listener
 */
export function onMessageListener(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground notification received:', payload);
    if (callback) callback(payload);
  });
}

export { app, auth, googleProvider, messaging, isConfigured };
export default app;
