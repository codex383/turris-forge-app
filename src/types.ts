export interface Submission {
  workerId: string;
  notes: string;
  submittedAt: number;
  pay: number;
  late: boolean;
  files: UploadedFile[];
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  publicId?: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  pay: number;
  deadline: number;
  status: string;
  submissions: Submission[];
  visibility: string;
  allowedWorkers?: string[];
  posted: number;
  refNote?: string;
  refFiles?: { name: string; size: number; type: string; url: string; publicId?: string; }[];
  messages: Message[];
  acceptedBy?: string;
  startedAt?: number;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  fromRole: "worker" | "admin";
  text: string;
  at: number;
  read: boolean;
}

export interface PaymentRecord {
  jobId: string;
  title: string;
  amount: number;
  date: number;
  status: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: "worker" | "admin";
  skills: string[];
  balance: number;
  joined: number;
  bio: string;
  portfolio: string;
  history: PaymentRecord[];
  rating: number;
  ratingCount: number;
  banned?: boolean;
  banReason?: string;
  verifiedSkills?: string[];
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface ActiveJob {
  job: Job;
  deadline: number;
  startedAt: number;
  pay: number;
}

export interface Notification {
  id: string;
  text: string;
  at: number;
  read: boolean;
  jobId?: string;
  type: "job_match" | "approved" | "rejected" | "message" | "submitted";
}

export interface WithdrawalRequest {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "Pending" | "Paid" | "Rejected";
  requestedAt: number;
  resolvedAt?: number;
  note?: string;
}
