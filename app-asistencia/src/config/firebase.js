import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmLxOk9lD1IPvGffm19B5SvRwAUWrfQhQ",
  authDomain: "nicolas-d-rodriguez.firebaseapp.com",
  projectId: "nicolas-d-rodriguez",
  storageBucket: "nicolas-d-rodriguez.firebasestorage.app",
  messagingSenderId: "880070527779",
  appId: "1:880070527779:web:4e00303e8bd0b8cfd7da96",
  measurementId: "G-B0DVXW03BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;