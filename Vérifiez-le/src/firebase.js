import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2Xp7MceOWTK6fRN2BMlgSOrI7eLez4r0",
  authDomain: "verifiez-le.firebaseapp.com",
  databaseURL: "https://verifiez-le-default-rtdb.firebaseio.com",
  projectId: "verifiez-le",
  storageBucket: "verifiez-le.firebasestorage.app",
  messagingSenderId: "338436682896",
  appId: "1:338436682896:web:219e76dc1ee51809ae1415",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
