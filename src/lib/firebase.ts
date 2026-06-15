import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBtk6JKEtKDHmjrgjRXs0SIsV3kAD796jk",
  authDomain: "turris-forge.firebaseapp.com",
  databaseURL: "https://turris-forge-default-rtdb.firebaseio.com",
  projectId: "turris-forge",
  storageBucket: "turris-forge.firebasestorage.app",
  messagingSenderId: "850138800359",
  appId: "1:850138800359:web:c4c63d431589edab970242"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
