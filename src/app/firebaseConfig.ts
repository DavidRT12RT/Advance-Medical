// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHsDjymTINN2bcnRtMVop5-qu9wf9CNVU",
  authDomain: "smartroute-ca317.firebaseapp.com",
  projectId: "smartroute-ca317",
  storageBucket: "smartroute-ca317.appspot.com",
  messagingSenderId: "14900432578",
  appId: "1:14900432578:web:32d90f67eecab7bd20f55b",
  measurementId: "G-9Q1LEQSQ2S",
};
// Initialize Firebase
// Check if Firebase app is already initialized, to prevent initializing multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const storage = getStorage(app);
const firestore = getFirestore(app);

export { firestore, app, storage };
