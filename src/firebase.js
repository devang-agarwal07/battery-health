// ═══════════════════════════════════════════════════════════
// Firebase Configuration for VoltGuard Dashboard
// ═══════════════════════════════════════════════════════════
//
// HOW TO GET THESE VALUES:
//   1. Go to https://console.firebase.google.com
//   2. Select your project (or create one)
//   3. Click the gear icon → Project Settings
//   4. Scroll down to "Your apps" → Click the </> (Web) icon
//   5. Register your app → Copy the firebaseConfig object
//   6. Paste the values below
//
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",              // ← Replace
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",  // ← Must match Python script
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
