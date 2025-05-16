// Importations nécessaires pour Firebase Web
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC9Kn09bQSAGnWnYLvueOYfRrO_QYOdyao",
  authDomain: "intigo-37c79.firebaseapp.com",
  projectId: "intigo-37c79",
  storageBucket: "intigo-37c79.appspot.com",
  messagingSenderId: "911106373842",
  appId: "1:911106373842:web:ec88f94e771b03d20f950b",
  measurementId: "G-SSZ95B9RYH",
};

// Initialiser Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp); // Authentification
const firestor = getFirestore(firebaseApp); // Firestore

// Exportations
export { firebaseApp, firebaseAuth, firebaseStore };
