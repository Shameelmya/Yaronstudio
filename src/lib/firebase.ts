import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBANKf2LlvCl1UF-FX_pIHlhpOTgd0uMHs",
  authDomain: "yaron-studio.firebaseapp.com",
  projectId: "yaron-studio",
  storageBucket: "yaron-studio.firebasestorage.app",
  messagingSenderId: "560025600043",
  appId: "1:560025600043:web:180b0c722ae6ffc420ea6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
