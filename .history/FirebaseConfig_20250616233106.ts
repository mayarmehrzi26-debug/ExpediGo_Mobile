import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Importer la base de données en temps réel
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBTbvL5x0nBMlSC_lo_yoI3jO9snLXBBHY",
  authDomain: "expedigo-1eaca.firebaseapp.com",
  projectId: "expedigo-1eaca",
  storageBucket: "expedigo-1eaca.firebasestorage.app",
  messagingSenderId: "508870204428",
  appId: "1:508870204428:web:d6284106cddd3513ff2229",
  measurementId: "G-YZRJ87EXQ1"
};

// Initialiser Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp); // Authentification
const firebasestore = getFirestore(firebaseApp); // Firestore
const realtimeDatabase = getDatabase(firebaseApp); // Realtime Database
const functions = getFunctions(firebaseApp);
const storage = getStorage(firebaseApp);
// Exportations
export { firebaseApp, firebaseAuth, firebasestore, functions, realtimeDatabase, storage }; // Ajouter realtimeDatabase aux exportations

