// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcYRC0zZY4BVGlxY0VGS9B-qQtT0nCgO4",
  authDomain: "meetup-app-2068d.firebaseapp.com",
  projectId: "meetup-app-2068d",
  storageBucket: "meetup-app-2068d.appspot.com",  // storage bucket
  messagingSenderId: "491566369762",
  appId: "1:491566369762:web:8d9d6d7b48251dbfdb87bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);   // Firestore for event data
const auth = getAuth(app);      // Auth for user login/signup

// Export Firestore and Auth so they can be used in the app
export { db, auth };
