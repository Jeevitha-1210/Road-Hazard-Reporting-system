// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import { getFirestore, doc, setDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyA0lS_Ns4MhyRdSVMRLsgHNk4w8xYyL66Y",
//   authDomain: "campus-voice-91dda.firebaseapp.com",
//   projectId: "campus-voice-91dda",
//   storageBucket: "campus-voice-91dda.firebasestorage.app",
//   messagingSenderId: "54852741961",
//   appId: "1:54852741961:web:afe60d1ee0e3bb02c54898",
//   measurementId: "G-X7GSB78RDS"
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);

// let messaging;
// try {
//   messaging = getMessaging(app);
// } catch (e) {
//   console.warn("Messaging not supported", e);
// }

// // ✅ Save token to Firestore
// const saveUserToken = async (uid, token) => {
//   if (!uid || !token) return;
//   try {
//     await setDoc(doc(db, "users", uid), { fcmToken: token }, { merge: true });
//     console.log("Token saved to Firestore for user:", uid);
//   } catch (err) {
//     console.error("Error saving token:", err);
//   }
// };

// // ✅ Ask permission, get token, save it
// export const requestForToken = async (uid) => {
//   if (!messaging) return;

//   try {
//     const token = await getToken(messaging, {
//       vapidKey: "BIITnj2Khv7PJi7Uq96OG6cnEACvrPD-bjBaO0Iy9RmtiJ6mOo_MuKxQyyoNT2cb4w5sn9I5r4aEAgG7F1jOdrc",
//     });
//     if (token) {
//       console.log("FCM Token:", token);
//       await saveUserToken(uid, token);
//     } else {
//       console.log("No registration token available. Request permission.");
//     }
//   } catch (err) {
//     console.error("Error retrieving token", err);
//   }
// };

// // ✅ Foreground message listener
// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     if (!messaging) return;
//     onMessage(messaging, (payload) => {
//       resolve(payload);
//     });
//   });

// // ✅ "Refresh" by re-requesting token when app starts
// export const refreshTokenIfNeeded = async (uid) => {
//   await requestForToken(uid); // just call again
// };

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0lS_Ns4MhyRdSVMRLsgHNk4w8xYyL66Y",
  authDomain: "campus-voice-91dda.firebaseapp.com",
  projectId: "campus-voice-91dda",
  storageBucket: "campus-voice-91dda.firebasestorage.app",
  messagingSenderId: "54852741961",
  appId: "1:54852741961:web:afe60d1ee0e3bb02c54898",
  measurementId: "G-X7GSB78RDS",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let messaging;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Messaging not supported", e);
}

// ✅ Save FCM token in Firestore
const saveUserToken = async (uid, token) => {
  if (!uid || !token) return;
  try {
    await setDoc(doc(db, "users", uid), { fcmToken: token }, { merge: true });
  } catch (err) {
    console.error("Error saving FCM token:", err);
  }
};

// ✅ Request permission, get token, save it
export const requestForToken = async (uid) => {
  if (!messaging) return;
  try {
    const token = await getToken(messaging, {
      vapidKey: "BIITnj2Khv7PJi7Uq96OG6cnEACvrPD-bjBaO0Iy9RmtiJ6mOo_MuKxQyyoNT2cb4w5sn9I5r4aEAgG7F1jOdrc",
    });
    if (token) {
      await saveUserToken(uid, token);
      console.log("FCM token saved:", token);
    }
  } catch (err) {
    console.error("FCM error:", err);
  }
};

// ✅ Foreground message listener
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// ✅ Refresh token if needed
export const refreshTokenIfNeeded = async (uid) => {
  await requestForToken(uid);
};