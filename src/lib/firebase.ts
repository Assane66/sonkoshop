
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFXFq3DmwcXSDx3Reg6vaK_1cdxoCZ5tM",
  authDomain: "sonko-storefront.firebaseapp.com",
  projectId: "sonko-storefront",
  storageBucket: "sonko-storefront.firebasestorage.app",
  messagingSenderId: "223267010003",
  appId: "1:223267010003:web:0a419a101aca787159ab26"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
