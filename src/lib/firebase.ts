
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added if needed

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2zVrQ6TT2fI4XUDkjsUIpPlmPyWscD_Y",
  authDomain: "lele-c3d7a.firebaseapp.com",
  projectId: "lele-c3d7a",
  storageBucket: "lele-c3d7a.firebasestorage.app",
  messagingSenderId: "83757012188",
  appId: "1:83757012188:web:13b15eb64c5939df189019",
  measurementId: "G-605KFW3PDV"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined; // Initialize Analytics only on client side if needed

export { app, db, auth };
