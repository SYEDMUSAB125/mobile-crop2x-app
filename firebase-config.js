// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1EMSkDpDJ9k-8fyoF6aQXrFqLj05pAp4",
  authDomain: "native-3e450.firebaseapp.com",
  databaseURL: "https://native-3e450-default-rtdb.firebaseio.com",
  projectId: "native-3e450",
  storageBucket: "native-3e450.appspot.com", // Corrected the typo from "firebasestorage.app"
  messagingSenderId: "474327895978",
  appId: "1:474327895978:web:a9e137dbc8e11091a2a5d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const db = getDatabase(app); // Realtime Database

// Export initialized instances
export { app, db };
