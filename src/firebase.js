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
  apiKey: "AIzaSyCc4It2ymwT3vs5GRU8_9D-cE8R27gLBec",
  authDomain: "battery-health-b20fb.firebaseapp.com",
  databaseURL: "https://battery-health-b20fb-default-rtdb.firebaseio.com",
  projectId: "battery-health-b20fb",
  storageBucket: "battery-health-b20fb.firebasestorage.app",
  messagingSenderId: "614002307675",
  appId: "1:614002307675:web:de1d999ef48e993834857e",
  measurementId: "G-2V8K3QV53B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
