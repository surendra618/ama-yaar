import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
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

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== ''
);

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
    throw new Error('Google Sign-In is not initialized. Please add your Firebase credentials in frontend/.env (VITE_FIREBASE_API_KEY & VITE_FIREBASE_PROJECT_ID).');
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

/**
 * Get or create invisible reCAPTCHA verifier for Phone Auth
 * @param {string|HTMLElement} containerIdOrElement
 */
export function getRecaptchaVerifier(containerIdOrElement = 'recaptcha-container') {
  if (!auth) {
    throw new Error(
      'Firebase Auth is not initialized. Please configure VITE_FIREBASE_API_KEY & VITE_FIREBASE_PROJECT_ID in frontend/.env'
    );
  }

  // Clear previous verifier instance to prevent "RecaptchaVerifier already rendered" error
  if (typeof window !== 'undefined' && window.ayRecaptchaVerifier) {
    try {
      window.ayRecaptchaVerifier.clear();
    } catch (_) {}
    window.ayRecaptchaVerifier = null;
  }

  // Ensure DOM container exists
  let targetContainer = containerIdOrElement;
  if (typeof containerIdOrElement === 'string' && typeof document !== 'undefined') {
    let el = document.getElementById(containerIdOrElement);
    if (!el) {
      el = document.createElement('div');
      el.id = containerIdOrElement;
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    targetContainer = el;
  }

  const verifier = new RecaptchaVerifier(auth, targetContainer, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('[Firebase Phone Auth] reCAPTCHA token expired. Resetting verifier...');
      if (typeof window !== 'undefined' && window.ayRecaptchaVerifier) {
        try {
          window.ayRecaptchaVerifier.clear();
        } catch (_) {}
        window.ayRecaptchaVerifier = null;
      }
    },
  });

  if (typeof window !== 'undefined') {
    window.ayRecaptchaVerifier = verifier;
  }

  return verifier;
}

/**
 * Send SMS OTP to 10-digit mobile number using Firebase Phone Authentication
 * @param {string} phoneNumber - Indian mobile number (e.g. 9876543210 or +919876543210)
 * @param {string|HTMLElement} container - DOM element or ID for invisible reCAPTCHA
 * @returns {Promise<import('firebase/auth').ConfirmationResult>}
 */
export async function sendFirebasePhoneOtp(phoneNumber, container = 'recaptcha-container') {
  if (!auth) {
    throw new Error(
      'Firebase credentials not configured. Please add VITE_FIREBASE_API_KEY in frontend/.env'
    );
  }

  const digits = String(phoneNumber).replace(/\D/g, '');
  const clean10 = digits.slice(-10);
  if (clean10.length !== 10) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  // E.164 formatted number (+91XXXXXXXXXX)
  const formattedPhone = String(phoneNumber).startsWith('+') ? phoneNumber : `+91${clean10}`;

  const appVerifier = getRecaptchaVerifier(container);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  return confirmationResult;
}

export { app, auth, googleProvider, messaging, isConfigured };
export default app;
