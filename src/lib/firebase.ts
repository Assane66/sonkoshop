
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
let app: ReturnType<typeof initializeApp>;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Lazy-load auth to avoid blocking initial page load
let authInstance: ReturnType<typeof getAuth> | null = null;
export const getFirebaseAuth = () => {
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
};

export { app, db };
