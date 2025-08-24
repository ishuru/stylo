// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add your own Firebase configuration from your project settings
const firebaseConfig = {
  "projectId": "invite-canvas",
  "appId": "1:8150896981:web:d179de5e0ad148a9afdfdc",
  "storageBucket": "invite-canvas.firebasestorage.app",
  "apiKey": "AIzaSyCtYHxxqaXnYK-TjLJDij5OqOWMRxo5X98",
  "authDomain": "invite-canvas.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "8150896981"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

export { db };
