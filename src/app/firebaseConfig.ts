// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-aTZEfvEXUfTgzsv_KUzBJf8hKsZa1bM",
  authDomain: "advance-medical-ac3b2.firebaseapp.com",
  projectId: "advance-medical-ac3b2",
  storageBucket: "advance-medical-ac3b2.firebasestorage.app",
  messagingSenderId: "286219799190",
  appId: "1:286219799190:web:90a53686144ef165bed0b7",
  measurementId: "G-1WPRDDP4G3",
};
// Initialize Firebase
// Check if Firebase app is already initialized, to prevent initializing multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const storage = getStorage(app);
const firestore = getFirestore(app);

export { firestore, app, storage };
