import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import type { Customer, Lead, Task, Employee, CompanySettings, ActivityLog, UserProfile } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initial Seed Data for TRISHUL CRM
export const initialCustomers: Omit<Customer, 'id'>[] = [
  {
    name: "TechNova Pvt Ltd",
    company: "TechNova Solutions",
    phone: "+91 98765 43210",
    email: "contact@technova.in",
    address: "Cyber City, Gurugram, Haryana",
    status: "Active",
    notes: "Enterprise cloud CRM migration project. High priority account.",
    value: 380000,
    assignedTo: "Rahul Verma",
    createdAt: "2026-05-21T10:30:00.000Z"
  },
  {
    name: "Bright Solutions",
    company: "Bright Retail Group",
    phone: "+91 98123 45678",
    email: "info@brightsolutions.com",
    address: "Bandra Kurla Complex, Mumbai, Maharashtra",
    status: "Active",
    notes: "Quarterly ERP & lead automation maintenance contract.",
    value: 245000,
    assignedTo: "Ankit Sharma",
    createdAt: "2026-05-20T14:15:00.000Z"
  },
  {
    name: "NextGen Corp",
    company: "NextGen Logistics & AI",
    phone: "+91 97654 32109",
    email: "procurement@nextgencorp.org",
    address: "Koramangala, Bengaluru, Karnataka",
    status: "Active",
    notes: "Fleet tracking integration with CRM leads.",
    value: 195000,
    assignedTo: "Priya Singh",
    createdAt: "2026-05-19T09:00:00.000Z"
  },
  {
    name: "Apex Healthcare",
    company: "Apex Hospitals Network",
    phone: "+91 94551 09687",
    email: "support@apexhealth.in",
    address: "Salt Lake Sector V, Kolkata, West Bengal",
    status: "Pending",
    notes: "Patient relationship module quotation under review.",
    value: 125000,
    assignedTo: "Rahul Verma",
    createdAt: "2026-05-18T16:45:00.000Z"
  },
  {
    name: "Zenith Retailers",
    company: "Zenith Apparel Pvt Ltd",
    phone: "+91 99887 76655",
    email: "operations@zenithretail.com",
    address: "Connaught Place, New Delhi",
    status: "Inactive",
    notes: "Follow up for annual license renewal next month.",
    value: 85000,
    assignedTo: "Ankit Sharma",
    createdAt: "2026-05-12T11:20:00.000Z"
  }
];

export const initialLeads: Omit<Lead, 'id'>[] = [
  {
    name: "Rahul Verma",
    company: "Verma Infotech",
    phone: "+91 98765 11223",
    email: "rahul@vermainfotech.com",
    source: "Website",
    assignedUser: "Priya Singh",
    status: "New",
    estimatedValue: 140000,
    notes: "Inquired via landing page contact form for 20 agent licenses.",
    nextFollowUp: "2026-08-18",
    createdAt: "2026-08-12T08:30:00.000Z"
  },
  {
    name: "Ankit Sharma",
    company: "Sharma Global Traders",
    phone: "+91 98112 33445",
    email: "ankit@sharmatraders.in",
    source: "Referral",
    assignedUser: "Rahul Verma",
    status: "Contacted",
    estimatedValue: 220000,
    notes: "Demo scheduled for Thursday at 3 PM. Referred by TechNova.",
    nextFollowUp: "2026-08-19",
    createdAt: "2026-08-11T12:00:00.000Z"
  },
  {
    name: "Priya Singh",
    company: "Singh Media Dynamics",
    phone: "+91 97554 44332",
    email: "priya@singhmedia.co",
    source: "Advertisement",
    assignedUser: "Ankit Sharma",
    status: "Interested",
    estimatedValue: 180000,
    notes: "Interested in automated email follow-ups & AI summaries.",
    nextFollowUp: "2026-08-17",
    createdAt: "2026-08-10T15:20:00.000Z"
  },
  {
    name: "Vikram Malhotra",
    company: "Malhotra Heavy Industries",
    phone: "+91 94112 88990",
    email: "v.malhotra@malhotragroup.in",
    source: "Cold Call",
    assignedUser: "Rahul Verma",
    status: "Won",
    estimatedValue: 350000,
    notes: "Contract signed! Converted to onboarding stage.",
    nextFollowUp: "2026-08-25",
    createdAt: "2026-08-08T10:15:00.000Z"
  },
  {
    name: "Sneha Patel",
    company: "Patel E-Commerce Solutions",
    phone: "+91 93221 66554",
    email: "sneha@patelcommerce.com",
    source: "Social Media",
    assignedUser: "Priya Singh",
    status: "Lost",
    estimatedValue: 75000,
    notes: "Chose in-house spreadsheet solution for now. Revisit in Q4.",
    createdAt: "2026-08-05T14:40:00.000Z"
  }
];

export const initialTasks: Omit<Task, 'id'>[] = [
  {
    title: "Prepare Client Demo for TechNova",
    description: "Walk through custom sales pipeline and WhatsApp notifications.",
    assignedUserId: "emp-1",
    assignedUserName: "Rahul Verma",
    dueDate: "2026-08-16",
    priority: "High",
    status: "Pending",
    category: "Sales Demo",
    createdAt: "2026-08-13T09:00:00.000Z"
  },
  {
    title: "Send Proposal to Bright Solutions",
    description: "Revise pricing tier with 10% annual discount and SLA terms.",
    assignedUserId: "emp-2",
    assignedUserName: "Ankit Sharma",
    dueDate: "2026-08-17",
    priority: "High",
    status: "In Progress",
    category: "Proposal",
    createdAt: "2026-08-12T11:30:00.000Z"
  },
  {
    title: "Follow up with Priya Singh (Lead)",
    description: "Check if marketing team approved CRM software budget.",
    assignedUserId: "emp-2",
    assignedUserName: "Ankit Sharma",
    dueDate: "2026-08-18",
    priority: "Medium",
    status: "Pending",
    category: "Follow-up",
    createdAt: "2026-08-13T14:00:00.000Z"
  },
  {
    title: "Quarterly Performance Review Meeting",
    description: "Review sales targets and lead conversion ratios with supervisor.",
    assignedUserId: "emp-3",
    assignedUserName: "Priya Singh",
    dueDate: "2026-08-20",
    priority: "Low",
    status: "Pending",
    category: "Internal",
    createdAt: "2026-08-10T16:00:00.000Z"
  },
  {
    title: "Onboard NextGen Corp Team",
    description: "Initial user provisioning and admin permission setup completed.",
    assignedUserId: "emp-1",
    assignedUserName: "Rahul Verma",
    dueDate: "2026-08-14",
    priority: "Medium",
    status: "Completed",
    category: "Onboarding",
    completedAt: "2026-08-14T06:30:00.000Z",
    createdAt: "2026-08-09T10:00:00.000Z"
  }
];

export const initialEmployees: Employee[] = [
  {
    id: "emp-admin",
    name: "Somil Srivastav (Admin)",
    email: "somilsrivastav18@gmail.com",
    role: "admin",
    department: "Executive Management",
    phone: "+91 94551 09687",
    status: "Active",
    leadsClosed: 28,
    revenueGenerated: 1250000,
    tasksCompleted: 45,
    joinedDate: "2024-01-10"
  },
  {
    id: "emp-sup",
    name: "Sidharth Srivastava (Supervisor)",
    email: "srivastavasidharth180@gmail.com",
    role: "supervisor",
    department: "Sales & Operations",
    phone: "+91 94551 09687",
    status: "Active",
    supervisorId: "emp-admin",
    supervisorName: "Somil Srivastav (Admin)",
    leadsClosed: 22,
    revenueGenerated: 850000,
    tasksCompleted: 38,
    joinedDate: "2024-06-15"
  },
  {
    id: "emp-1",
    name: "Rahul Verma",
    email: "rahul.v@trishulcrm.com",
    role: "user",
    department: "Enterprise Sales",
    phone: "+91 98765 43210",
    status: "Active",
    supervisorId: "emp-sup",
    supervisorName: "Sidharth Srivastava (Supervisor)",
    leadsClosed: 12,
    revenueGenerated: 380000,
    tasksCompleted: 28,
    joinedDate: "2025-02-01"
  },
  {
    id: "emp-2",
    name: "Ankit Sharma",
    email: "ankit.s@trishulcrm.com",
    role: "user",
    department: "Account Management",
    phone: "+91 98123 45678",
    status: "Active",
    supervisorId: "emp-sup",
    supervisorName: "Sidharth Srivastava (Supervisor)",
    leadsClosed: 9,
    revenueGenerated: 275000,
    tasksCompleted: 22,
    joinedDate: "2025-03-15"
  },
  {
    id: "emp-3",
    name: "Priya Singh",
    email: "priya.s@trishulcrm.com",
    role: "user",
    department: "Inbound Marketing & Leads",
    phone: "+91 97654 32109",
    status: "Active",
    supervisorId: "emp-sup",
    supervisorName: "Sidharth Srivastava (Supervisor)",
    leadsClosed: 7,
    revenueGenerated: 190000,
    tasksCompleted: 19,
    joinedDate: "2025-05-10"
  }
];

export const initialSettings: CompanySettings = {
  companyName: "TRISHUL CRM & ENTERPRISE",
  tagline: "Innovate • Empower • Excel",
  email: "support@trishulcrm.com",
  phone: "+91 94551 09687",
  address: "Sector 62, Noida & Connaught Place, New Delhi, India",
  currencySymbol: "₹",
  taxNumber: "GSTIN07AAACT1234F1Z5",
  website: "https://trishulcrm.com",
  enableAiAssistant: true,
  theme: "dark"
};

// Seed Firestore helper
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const custSnap = await getDocs(collection(db, 'customers'));
    if (custSnap.empty) {
      console.log('Seeding initial Trishul CRM database in Firestore...');
      // Seed customers
      for (const cust of initialCustomers) {
        await addDoc(collection(db, 'customers'), cust);
      }
      // Seed leads
      for (const lead of initialLeads) {
        await addDoc(collection(db, 'leads'), lead);
      }
      // Seed tasks
      for (const task of initialTasks) {
        await addDoc(collection(db, 'tasks'), task);
      }
      // Seed employees
      for (const emp of initialEmployees) {
        await setDoc(doc(db, 'employees', emp.id), emp);
      }
      // Seed settings
      await setDoc(doc(db, 'settings', 'general'), initialSettings);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Firestore seed check/fallback to local runtime storage:', err);
    return false;
  }
}
