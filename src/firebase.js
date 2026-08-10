// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2bOBRZykMRVfOCkDCeR5KkEtPevqjsLU",
  authDomain: "text2clip-9fe4c.firebaseapp.com",
  projectId: "text2clip-9fe4c",
  storageBucket: "text2clip-9fe4c.firebasestorage.app",
  messagingSenderId: "404326028113",
  appId: "1:404326028113:web:671800e6c13cac407fb970",
  measurementId: "G-Q4G4XKRES1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
export const auth = getAuth(app);