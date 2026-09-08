// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwhY5wK2ASqBKnxxFAALyyWlTUgjMKPXI",
  authDomain: "criptomining-8317d.firebaseapp.com",
  projectId: "criptomining-8317d",
  storageBucket: "criptomining-8317d.firebasestorage.app",
  messagingSenderId: "358690577184",
  appId: "1:358690577184:web:bb5270d9b393a9c7715545",
  measurementId: "G-BTYZ5HR3EB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;