// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgpQgAf_3M4zblPAnaAhLcNmu8Iylg6TI",
  authDomain: "hirelens-4515f.firebaseapp.com",
  projectId: "hirelens-4515f",
  storageBucket: "hirelens-4515f.firebasestorage.app",
  messagingSenderId: "828498464122",
  appId: "1:828498464122:web:9ac184d365e33eaaa71ac3",
  measurementId: "G-814GT5HHFN"
};

// Initialize Firebase


// Avoid initializing twice in Next dev (hot reload)
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();