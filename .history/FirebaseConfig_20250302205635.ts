// Importations nécessaires pour Firebase
// Importations pour React Native Firebase
// Vérifie si Firebase est déjà initialisé
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp();
}
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

// Exportations
export { firebaseApp };
export const firebaseAuth = auth(); // Authentification
export const firebaseStore = firestore(); // Firestore