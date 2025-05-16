// Importations nécessaires pour Firebase
import { getFirestore } from "@react-native-firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp); // Pour l'authentification
export const firebaseStore = getFirestore(firebaseApp); // Pour Firestore