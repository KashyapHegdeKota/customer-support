import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "customersupportai-8b552.firebaseapp.com",
  projectId: "customersupportai-8b552",
  storageBucket: "customersupportai-8b552.appspot.com",
  messagingSenderId: "274368256166",
  appId: "1:274368256166:web:51d63a74df1655766dfc67",
  measurementId: "G-SVZZD84C4E",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, firestore, auth, provider, signInWithPopup, signOut };
