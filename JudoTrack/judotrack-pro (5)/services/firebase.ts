// @ts-ignore
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getFirestore } from "firebase/firestore";

// Configurazione Firebase per judotrackpro
const firebaseConfig = {
  apiKey: "AIzaSyCAQwaT3GONZ5HPYaX5js-kK83HgszHVA0",
  authDomain: "judotrackpro.firebaseapp.com",
  projectId: "judotrackpro",
  storageBucket: "judotrackpro.firebasestorage.app",
  messagingSenderId: "343361342125",
  appId: "1:343361342125:web:b44eb2d516355884281424",
  measurementId: "G-FLDPYEF4EB"
};

let app;
let dbInstance;
let firebaseActive = false;

try {
  // Inizializza l'app Firebase
  app = initializeApp(firebaseConfig);
  // Inizializza Firestore
  dbInstance = getFirestore(app);
  firebaseActive = true;
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  console.warn("Falling back to local storage.");
  firebaseActive = false;
  dbInstance = null;
}

export const db = dbInstance;
export const USE_FIREBASE = firebaseActive;