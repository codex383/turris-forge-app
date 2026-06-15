import { db } from "./firebase";
import {
  collection, doc, setDoc, getDocs,
  updateDoc, query, orderBy, onSnapshot
} from "firebase/firestore";
import type { WithdrawalRequest } from "../types";

const COL = "withdrawals";

export const createWithdrawal = async (w: WithdrawalRequest): Promise<void> => {
  await setDoc(doc(db, COL, w.id), w);
};

export const updateWithdrawal = async (id: string, updates: Partial<WithdrawalRequest>): Promise<void> => {
  await updateDoc(doc(db, COL, id), updates as any);
};

export const subscribeToWithdrawals = (callback: (w: WithdrawalRequest[]) => void) => {
  const q = query(collection(db, COL), orderBy("requestedAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as WithdrawalRequest));
  });
};

export const subscribeToWorkerWithdrawals = (workerId: string, callback: (w: WithdrawalRequest[]) => void) => {
  const q = query(collection(db, COL), orderBy("requestedAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as WithdrawalRequest).filter(w => w.workerId === workerId));
  });
};
