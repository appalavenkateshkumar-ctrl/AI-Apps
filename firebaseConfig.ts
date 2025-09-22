// FIX: Updated to use Firebase v8 API which is compatible with the project's setup.
// The v9 modular API was causing an import error.
// FIX: Use the v9 compat libraries to provide the v8 API surface. This fixes the type errors on `initializeApp` and `auth`.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. In your project settings, find the "General" tab.
// 3. Under "Your apps", find your web app configuration.
// 4. Copy the configuration object and paste it here, replacing the placeholder.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBagGg9kXkVfCkddBQvNvchAfVzWLiqN-E",
  authDomain: "rhythmfit-f3cee.firebaseapp.com",
  projectId: "rhythmfit-f3cee",
  storageBucket: "rhythmfit-f3cee.firebasestorage.app",
  messagingSenderId: "644994653081",
  appId: "1:644994653081:web:ea8280a94764806628d108",
  measurementId: "G-402XSHKN8P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();