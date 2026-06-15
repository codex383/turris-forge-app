import type { Worker } from "../types";

const USERS_KEY = "tforge_users";
const SESSION_KEY = "tforge_session";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "worker" | "admin";
  skills: string[];
  balance: number;
  joined: number;
  bio: string;
  portfolio: string;
  history: Worker["history"];
};

function hashPassword(p: string): string {
  let h = 0;
  for (let i = 0; i < p.length; i++) { h = (Math.imul(31, h) + p.charCodeAt(i)) | 0; }
  return "h" + Math.abs(h).toString(36);
}

export function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(
  name: string, email: string, password: string,
  role: "worker" | "admin",
  extras: Partial<StoredUser> = {}
): { ok: boolean; error?: string; user?: StoredUser } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: StoredUser = {
    id: role + "_" + Date.now(),
    name, email, passwordHash: hashPassword(password),
    role, skills: [], balance: 0, joined: Date.now(),
    bio: "", portfolio: "", history: [],
    ...extras,
  };
  saveUsers([...users, user]);
  return { ok: true, user };
}

export function loginUser(
  email: string, password: string
): { ok: boolean; error?: string; user?: StoredUser } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: "No account found with this email." };
  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Incorrect password." };
  }
  return { ok: true, user };
}

export function updateStoredUser(id: string, updates: Partial<StoredUser>) {
  const users = getUsers();
  saveUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
}

export function saveSession(user: StoredUser) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): StoredUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function storedToWorker(u: StoredUser): Worker {
  return { id: u.id, name: u.name, email: u.email, role: u.role as "worker", skills: u.skills, balance: u.balance, joined: u.joined, bio: u.bio, portfolio: u.portfolio, history: u.history };
}
