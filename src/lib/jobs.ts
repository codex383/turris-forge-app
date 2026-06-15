import { db } from "./firebase";
import {
  collection, doc, setDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot,
  query, orderBy
} from "firebase/firestore";
import type { Job } from "../types";

const JOBS_COL = "jobs";

export const createJob = async (job: Job): Promise<void> => {
  await setDoc(doc(db, JOBS_COL, job.id), job);
};

export const getAllJobs = async (): Promise<Job[]> => {
  const snap = await getDocs(query(collection(db, JOBS_COL), orderBy("posted", "desc")));
  return snap.docs.map(d => d.data() as Job);
};

export const updateJob = async (id: string, updates: Partial<Job>): Promise<void> => {
  await updateDoc(doc(db, JOBS_COL, id), updates as any);
};

export const deleteJob = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, JOBS_COL, id));
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
  const q = query(collection(db, JOBS_COL), orderBy("posted", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Job));
  });
};
