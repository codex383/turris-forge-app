import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: "worker" | "admin";
  balance?: number;
  skills?: string[];
  bio?: string;
  portfolio?: string;
  history?: any[];
  rating?: number;
  ratingCount?: number;
  joined?: number;
};

export const createUserProfile = async (profile: UserProfile) => {
  await setDoc(doc(db, "users", profile.uid), profile);
};

export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfile;
  return {
    ...data,
    skills:    data.skills    ?? [],
    balance:   data.balance   ?? 0,
    bio:       data.bio       ?? "",
    portfolio: data.portfolio ?? "",
  };
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const saveNotifications = async (uid: string, notifications: any[]): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { notifications });
};

export const loadNotifications = async (uid: string): Promise<any[]> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  return snap.data().notifications || [];
};
