import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";

// Enable persistence (KEEP USER LOGGED IN)
setPersistence(auth, browserLocalPersistence);

export const register = async (email: string, password: string, name?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  const user = userCredential.user;

  // 🔥 SAVE TO FIRESTORE (THIS IS WHAT YOU WERE MISSING)
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    name: name || "",
    role: "worker", // default role
   balance: 0, // 🔥 ADD THIS
    createdAt: Date.now(),
  });

  return userCredential;
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  const user = userCredential.user;

  const snap = await getDoc(doc(db, "users", user.uid));

  return {
    user: {
      uid: user.uid,
      email: user.email,
      ...snap.data(),
    },
  };
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};
