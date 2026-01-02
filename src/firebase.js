import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdL60YBRb4dXFplRrRd21Fjvbhu6BVS94",
  authDomain: "gravio-a926d.firebaseapp.com",
  projectId: "gravio-a926d",
  storageBucket: "gravio-a926d.firebasestorage.app",
  messagingSenderId: "126147597070",
  appId: "1:126147597070:web:2174c67ac12ff1eea1fd5f",
  measurementId: "G-YV2RBPRFFD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
