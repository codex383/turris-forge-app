import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  color: string;
  postedAt: number;
  postedBy: string;
}

export const createAnnouncement = async (a: Announcement): Promise<void> => {
  await setDoc(doc(db, "announcements", a.id), a);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "announcements", id));
};

export const subscribeToAnnouncements = (callback: (a: Announcement[]) => void) => {
  const q = query(collection(db, "announcements"), orderBy("postedAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Announcement));
  });
};
