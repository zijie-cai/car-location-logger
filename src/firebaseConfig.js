// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6j53kYxiIci-m9IAOr0CBTSLYZF5qLmI",
  authDomain: "carlog-a2efb.firebaseapp.com",
  projectId: "carlog-a2efb",
  storageBucket: "carlog-a2efb.firebasestorage.app",
  messagingSenderId: "703407278020",
  appId: "1:703407278020:web:c1bfef53ee3d4d1218c691"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);