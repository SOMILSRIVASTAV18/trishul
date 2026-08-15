import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import {
  db,
  auth,
  googleProvider,
  initialCustomers,
  initialLeads,
  initialTasks,
  initialEmployees,
  initialSettings,
  seedFirestoreIfEmpty
} from '../lib/firebase';
import type { Customer, Lead, Task, Employee, CompanySettings, ActivityLog, UserRole, UserProfile, CrmNotification } from '../types';

// Synthesized gentle notification audio chime
const playNotificationTone = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.33);
  } catch (e) {
    // Gracefully handle browser autoplay policies
  }
};

interface CrmContextType {
  // Current user & role
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  setCurrentUserRole: (role: UserRole) => void;
  switchUserAccount: (employeeId: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthScreenOpen: boolean;
  setIsAuthScreenOpen: (open: boolean) => void;

  // Data Collections
  customers: Customer[];
  leads: Lead[];
  tasks: Task[];
  employees: Employee[];
  settings: CompanySettings;
  activityLogs: ActivityLog[];
  isLoading: boolean;

  // Real Notifications Engine
  notifications: CrmNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<CrmNotification, 'id' | 'timestamp' | 'read'> & { read?: boolean; timestamp?: string }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playNotificationSound: () => void;

  // Customer Operations
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Lead Operations
  addLead: (data: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToCustomer: (leadId: string) => Promise<void>;

  // Task Operations
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;

  // Employee Operations (Admin & Supervisor)
  addEmployee: (data: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Settings
  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<void>;
  resetToSampleData: () => Promise<void>;

  // UI Theme & Intro animation
  theme: 'dark' | 'light';
  isDarkMode: boolean;
  toggleTheme: () => void;
  showIntroAnimation: boolean;
  replayIntro: () => void;
  finishIntro: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trishul_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('trishul_company_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real Notifications State
  const [notifications, setNotifications] = useState<CrmNotification[]>(() => {
    const saved = localStorage.getItem('trishul_crm_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('trishul_notif_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('trishul_notif_sound', String(enabled));
  };

  const saveNotifications = (newNotifs: CrmNotification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('trishul_crm_notifications', JSON.stringify(newNotifs));
  };

  const addNotification = (notif: Omit<CrmNotification, 'id' | 'timestamp' | 'read'> & { read?: boolean; timestamp?: string }) => {
    const newEntry: CrmNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: notif.read ?? false,
      ...notif
    };
    saveNotifications([newEntry, ...notifications.slice(0, 49)]); // Keep last 50
    if (soundEnabled) {
      playNotificationTone();
    }
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Theme & Intro Animation
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('trishul_theme') as 'dark' | 'light') || 'dark';
  });

  const [showIntroAnimation, setShowIntroAnimation] = useState<boolean>(() => {
    // Show intro on first visit or when triggered
    const seen = sessionStorage.getItem('trishul_intro_seen');
    return !seen;
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('trishul_theme', next);
  };

  const replayIntro = () => {
    setShowIntroAnimation(true);
  };

  const finishIntro = () => {
    setShowIntroAnimation(false);
    sessionStorage.setItem('trishul_intro_seen', 'true');
  };

  // Sync theme class with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        const profile = getRoleAndProfileForEmail(
          user.email,
          user.displayName,
          user.photoURL
        );
        setCurrentUser(profile);
        localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
      }
    });
    return () => unsubscribe();
  }, [employees]);

  // Initialize and subscribe to Firestore collections
  useEffect(() => {
    let unsubCustomers: () => void = () => {};
    let unsubLeads: () => void = () => {};
    let unsubTasks: () => void = () => {};
    let unsubEmployees: () => void = () => {};
    let unsubSettings: () => void = () => {};

    const setupSubscriptions = async () => {
      try {
        await seedFirestoreIfEmpty();

        // Customers Real-time Listener
        unsubCustomers = onSnapshot(
          collection(db, 'customers'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Customer));
              setCustomers(list);
            } else {
              // Fallback to initial if empty
              setCustomers(initialCustomers.map((c, i) => ({ id: `cust-${i+1}`, ...c })));
            }
            setIsLoading(false);
          },
          (err) => {
            console.warn('Customers firestore snapshot error, fallback to local dataset:', err);
            setCustomers(initialCustomers.map((c, i) => ({ id: `cust-${i+1}`, ...c })));
            setIsLoading(false);
          }
        );

        // Leads Real-time Listener
        unsubLeads = onSnapshot(
          collection(db, 'leads'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Lead));
              setLeads(list);
            } else {
              setLeads(initialLeads.map((l, i) => ({ id: `lead-${i+1}`, ...l })));
            }
          },
          (err) => {
            console.warn('Leads snapshot fallback:', err);
            setLeads(initialLeads.map((l, i) => ({ id: `lead-${i+1}`, ...l })));
          }
        );

        // Tasks Real-time Listener
        unsubTasks = onSnapshot(
          collection(db, 'tasks'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Task));
              setTasks(list);
            } else {
              setTasks(initialTasks.map((t, i) => ({ id: `task-${i+1}`, ...t })));
            }
          },
          (err) => {
            console.warn('Tasks snapshot fallback:', err);
            setTasks(initialTasks.map((t, i) => ({ id: `task-${i+1}`, ...t })));
          }
        );

        // Employees Real-time Listener
        unsubEmployees = onSnapshot(
          collection(db, 'employees'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Employee));
              setEmployees(list);
            } else {
              setEmployees(initialEmployees);
            }
          },
          (err) => {
            console.warn('Employees snapshot fallback:', err);
            setEmployees(initialEmployees);
          }
        );

        // Settings Listener
        unsubSettings = onSnapshot(
          doc(db, 'settings', 'general'),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as CompanySettings;
              setSettings(data);
              localStorage.setItem('trishul_company_settings', JSON.stringify(data));
            }
          },
          (err) => {
            console.warn('Settings snapshot fallback:', err);
          }
        );

      } catch (e) {
        console.error('Error setting up firestore listeners:', e);
        setCustomers(initialCustomers.map((c, i) => ({ id: `cust-${i+1}`, ...c })));
        setLeads(initialLeads.map((l, i) => ({ id: `lead-${i+1}`, ...l })));
        setTasks(initialTasks.map((t, i) => ({ id: `task-${i+1}`, ...t })));
        setEmployees(initialEmployees);
        setIsLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      unsubCustomers();
      unsubLeads();
      unsubTasks();
      unsubEmployees();
      unsubSettings();
    };
  }, []);

  // Log activity helper
  const logActivity = (action: string, entityType: ActivityLog['entityType'], entityName: string) => {
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      action,
      entityType,
      entityName,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [log, ...prev].slice(0, 50));
  };

  // Role Switcher / User Switcher
  const setCurrentUserRole = (role: UserRole) => {
    const updated: UserProfile = {
      ...currentUser,
      role
    };
    setCurrentUser(updated);
    localStorage.setItem('trishul_user_profile', JSON.stringify(updated));
  };

  const switchUserAccount = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      const profile: UserProfile = {
        id: emp.id,
        email: emp.email,
        displayName: emp.name,
        role: emp.role,
        department: emp.department,
        phone: emp.phone,
        createdAt: emp.joinedDate
      };
      setCurrentUser(profile);
      localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
      logActivity(`Switched session to ${emp.name}`, 'employee', emp.name);
    }
  };

  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState<boolean>(false);

  // Helper to resolve designated roles and profile metadata
  const getRoleAndProfileForEmail = (
    email: string,
    providedName?: string | null,
    providedPhoto?: string | null
  ): UserProfile => {
    const lower = email.trim().toLowerCase();

    // 1. Enforce somilsrivastav18@gmail.com as Admin
    if (lower === 'somilsrivastav18@gmail.com') {
      return {
        id: 'emp-admin-somil',
        email: 'somilsrivastav18@gmail.com',
        displayName: providedName || 'Somil Srivastav (Admin)',
        role: 'admin',
        department: 'Executive Management',
        phone: '+91 94551 09687',
        avatar: providedPhoto || undefined,
        createdAt: '2024-01-10'
      };
    }

    // 2. Enforce srivastavasidharth180@gmail.com as Supervisor
    if (lower === 'srivastavasidharth180@gmail.com') {
      return {
        id: 'emp-sup-sidharth',
        email: 'srivastavasidharth180@gmail.com',
        displayName: providedName || 'Sidharth Srivastava (Supervisor)',
        role: 'supervisor',
        department: 'Sales & Operations',
        phone: '+91 94551 09687',
        avatar: providedPhoto || undefined,
        createdAt: '2024-06-15'
      };
    }

    // 3. Match against existing team employee records
    const matched = employees.find(e => e.email.toLowerCase() === lower);
    if (matched) {
      return {
        id: matched.id,
        email: matched.email,
        displayName: matched.name,
        role: matched.role,
        department: matched.department,
        phone: matched.phone,
        avatar: providedPhoto || undefined,
        createdAt: matched.joinedDate
      };
    }

    // 4. Default strictly to 'user' role for all new accounts
    const defaultName = providedName || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: `emp-${Date.now()}`,
      email,
      displayName: defaultName,
      role: 'user',
      department: 'Sales & Growth',
      phone: '+91 98765 43210',
      avatar: providedPhoto || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };
  };

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const profile = getRoleAndProfileForEmail(
          user.email,
          user.displayName,
          user.photoURL
        );

        // Ensure user is present in employees state/database
        const matched = employees.find(e => e.email.toLowerCase() === user.email?.toLowerCase());
        if (!matched) {
          const newEmp: Employee = {
            id: profile.id,
            name: profile.displayName,
            email: profile.email,
            role: profile.role,
            department: profile.department,
            phone: profile.phone || '+91 94551 09687',
            status: 'Active',
            leadsClosed: profile.role === 'admin' ? 28 : profile.role === 'supervisor' ? 22 : 5,
            revenueGenerated: profile.role === 'admin' ? 1250000 : profile.role === 'supervisor' ? 850000 : 150000,
            tasksCompleted: profile.role === 'admin' ? 45 : profile.role === 'supervisor' ? 38 : 12,
            joinedDate: profile.createdAt
          };
          await addEmployee(newEmp);
        }

        setCurrentUser(profile);
        localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
        logActivity(`Authenticated via Google SSO as ${profile.displayName}`, 'employee', profile.displayName);
        addNotification({
          title: 'Google SSO Login',
          message: `Authenticated as ${profile.displayName} (${profile.role.toUpperCase()}).`,
          type: 'system',
          priority: 'low',
          targetPage: 'dashboard'
        });
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled: Google popup was closed before completing authentication.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup blocked. Please allow popups for this site and retry.');
      }
      throw new Error(err.message || 'Google sign-in could not be completed.');
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      logActivity(`Password reset link dispatched to ${email}`, 'ai', email);
      addNotification({
        title: 'Password Reset Link Dispatched',
        message: `Recovery email sent to ${email}.`,
        type: 'system',
        priority: 'low',
        targetPage: 'dashboard'
      });
    } catch (err: any) {
      console.warn('Password reset failed:', err);
      throw new Error(err.message || 'Unable to dispatch reset email.');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const profile = getRoleAndProfileForEmail(
        email.trim(),
        user.displayName
      );

      setCurrentUser(profile);
      localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
      logActivity(`Logged in as ${profile.displayName} (${profile.role.toUpperCase()})`, 'employee', profile.displayName);
      addNotification({
        title: 'Logged In Successfully',
        message: `Welcome back, ${profile.displayName} (${profile.role.toUpperCase()}).`,
        type: 'system',
        priority: 'low',
        targetPage: 'dashboard'
      });
    } catch (err: any) {
      console.error('Email login failed:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. If you do not have an account yet, please sign up or use Google SSO.');
      } else if (err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please verify your credentials or click "Forget Password?".');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Access temporarily disabled due to many failed login attempts. Please reset your password or retry later.');
      }
      throw new Error(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const profile = getRoleAndProfileForEmail(email.trim(), name, null);

      const newEmp: Employee = {
        id: profile.id,
        name: profile.displayName,
        email: profile.email,
        role: profile.role,
        department: profile.department,
        phone: profile.phone || '+91 98765 43210',
        status: 'Active',
        leadsClosed: 0,
        revenueGenerated: 0,
        tasksCompleted: 0,
        joinedDate: profile.createdAt
      };
      await addEmployee(newEmp);

      setCurrentUser(profile);
      localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
      logActivity(`Registered new employee account ${name} (${profile.role.toUpperCase()})`, 'employee', name);
      addNotification({
        title: 'Account Registered',
        message: `Welcome to Trishul CRM, ${name}. Your profile is active.`,
        type: 'system',
        priority: 'medium',
        targetPage: 'dashboard'
      });
    } catch (err: any) {
      console.error('Email registration failed:', err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(err.message || 'Unable to register account.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    // Clear user session completely so login screen is shown
    setCurrentUser(null);
    localStorage.removeItem('trishul_user_profile');
  };

  // --- Customer Operations ---
  const addCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Omit<Customer, 'id'> = {
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, 'customers'), newCust);
      setCustomers(prev => {
        if (prev.some(c => c.id === docRef.id)) return prev;
        return [{ id: docRef.id, ...newCust }, ...prev];
      });
    } catch (e) {
      console.warn('Firestore addDoc error, using local state:', e);
      const fallbackId = `cust-${Date.now()}`;
      setCustomers(prev => [{ id: fallbackId, ...newCust }, ...prev]);
    }
    logActivity(`Added new customer ${data.name}`, 'customer', data.name);
    addNotification({
      title: 'New Customer Added',
      message: `${data.name} (${data.company}) was onboarded with ₹${(data.value || 0).toLocaleString('en-IN')} valuation.`,
      type: 'customer',
      priority: (data.value || 0) > 200000 ? 'high' : 'medium',
      targetPage: 'customers'
    });
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const updatedWithTime = { ...data, updatedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, 'customers', id), updatedWithTime);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedWithTime } : c));
    } catch (e) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedWithTime } : c));
    }
    logActivity(`Updated customer details`, 'customer', data.name || id);
    if (data.name) {
      addNotification({
        title: 'Customer Details Updated',
        message: `Profile changes saved for ${data.name}.`,
        type: 'customer',
        priority: 'low',
        targetPage: 'customers'
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    const target = customers.find(c => c.id === id);
    try {
      await deleteDoc(doc(db, 'customers', id));
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
    logActivity(`Deleted customer`, 'customer', target?.name || id);
    addNotification({
      title: 'Customer Removed',
      message: `Account for ${target?.name || 'Client'} has been removed.`,
      type: 'customer',
      priority: 'low',
      targetPage: 'customers'
    });
  };

  // --- Lead Operations ---
  const addLead = async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Omit<Lead, 'id'> = {
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, 'leads'), newLead);
      setLeads(prev => {
        if (prev.some(l => l.id === docRef.id)) return prev;
        return [{ id: docRef.id, ...newLead }, ...prev];
      });
    } catch (e) {
      console.warn('Firestore addLead error, using local state:', e);
      const fallbackId = `lead-${Date.now()}`;
      setLeads(prev => [{ id: fallbackId, ...newLead }, ...prev]);
    }
    logActivity(`Created new lead ${data.name}`, 'lead', data.name);
    addNotification({
      title: 'New Lead Inflow',
      message: `${data.name} (${data.company}) captured from ${data.source}. Est: ₹${data.estimatedValue.toLocaleString('en-IN')}`,
      type: 'lead',
      priority: data.estimatedValue >= 100000 ? 'high' : 'medium',
      targetPage: 'leads'
    });
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    try {
      await updateDoc(doc(db, 'leads', id), data);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    } catch (e) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    }
    logActivity(`Updated lead status to ${data.status || 'modified'}`, 'lead', data.name || id);
    if (data.status) {
      addNotification({
        title: 'Lead Stage Updated',
        message: `Lead marked as "${data.status}".`,
        type: 'lead',
        priority: data.status === 'Won' ? 'high' : 'medium',
        targetPage: 'leads'
      });
    }
  };

  const deleteLead = async (id: string) => {
    const target = leads.find(l => l.id === id);
    try {
      await deleteDoc(doc(db, 'leads', id));
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
    logActivity(`Deleted lead`, 'lead', target?.name || id);
    addNotification({
      title: 'Lead Removed',
      message: `Lead ${target?.name || 'record'} removed from pipeline.`,
      type: 'lead',
      priority: 'low',
      targetPage: 'leads'
    });
  };

  const convertLeadToCustomer = async (leadId: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    // Create customer from lead
    const newCustomerData: Omit<Customer, 'id' | 'createdAt'> = {
      name: targetLead.name,
      company: targetLead.company,
      phone: targetLead.phone,
      email: targetLead.email,
      address: "Address pending client verification",
      status: "Active",
      notes: `Converted from Lead (${targetLead.source}). Notes: ${targetLead.notes || 'None'}`,
      value: targetLead.estimatedValue,
      assignedTo: targetLead.assignedUser
    };

    await addCustomer(newCustomerData);
    await updateLead(leadId, { status: "Won" });

    // Update employee statistics for won deals
    const assignedEmp = employees.find(e => e.name === targetLead.assignedUser);
    if (assignedEmp) {
      await updateEmployee(assignedEmp.id, {
        leadsClosed: (assignedEmp.leadsClosed || 0) + 1,
        revenueGenerated: (assignedEmp.revenueGenerated || 0) + targetLead.estimatedValue
      });
    }

    logActivity(`Converted Lead ${targetLead.name} to Customer`, 'customer', targetLead.name);
    addNotification({
      title: 'Deal Won & Converted! 🏆',
      message: `${targetLead.name} (${targetLead.company}) successfully closed for ₹${targetLead.estimatedValue.toLocaleString('en-IN')}.`,
      type: 'lead',
      priority: 'high',
      targetPage: 'customers'
    });
  };

  // --- Task Operations ---
  const addTask = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Omit<Task, 'id'> = {
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks(prev => {
        if (prev.some(t => t.id === docRef.id)) return prev;
        return [{ id: docRef.id, ...newTask }, ...prev];
      });
    } catch (e) {
      console.warn('Firestore addTask error, using local state:', e);
      const fallbackId = `task-${Date.now()}`;
      setTasks(prev => [{ id: fallbackId, ...newTask }, ...prev]);
    }
    logActivity(`Assigned task: ${data.title}`, 'task', data.title);
    addNotification({
      title: 'New Task Created',
      message: `"${data.title}" assigned to ${data.assignedUserName}. Due: ${data.dueDate}`,
      type: 'task',
      priority: data.priority === 'High' ? 'high' : 'medium',
      targetPage: 'tasks'
    });
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), data);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    }
    logActivity(`Updated task`, 'task', data.title || id);
    if (data.status && data.status !== 'Completed') {
      addNotification({
        title: 'Task Status Updated',
        message: `Task status updated to "${data.status}".`,
        type: 'task',
        priority: 'low',
        targetPage: 'tasks'
      });
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    logActivity(`Removed task`, 'task', target?.title || id);
    addNotification({
      title: 'Task Removed',
      message: `"${target?.title || 'Task'}" removed from schedule.`,
      type: 'task',
      priority: 'low',
      targetPage: 'tasks'
    });
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isNowDone = task.status !== 'Completed';
    const nextStatus = isNowDone ? 'Completed' : 'In Progress';
    await updateTask(id, {
      status: nextStatus,
      completedAt: isNowDone ? new Date().toISOString() : undefined
    });
    if (isNowDone) {
      addNotification({
        title: 'Task Completed ✅',
        message: `"${task.title}" has been marked as finished.`,
        type: 'task',
        priority: 'low',
        targetPage: 'tasks'
      });
    }
  };

  // --- Employee Operations ---
  const addEmployee = async (data: Omit<Employee, 'id'>) => {
    const newEmpId = `emp-${Date.now()}`;
    const newEmp: Employee = { id: newEmpId, ...data };
    try {
      await setDoc(doc(db, 'employees', newEmpId), newEmp);
      setEmployees(prev => [...prev, newEmp]);
    } catch (e) {
      setEmployees(prev => [...prev, newEmp]);
    }
    logActivity(`Added team member ${data.name}`, 'employee', data.name);
    addNotification({
      title: 'New Team Member Onboarded',
      message: `${data.name} has been added as ${data.role.toUpperCase()} in ${data.department}.`,
      type: 'employee',
      priority: 'low',
      targetPage: 'employees'
    });
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      await updateDoc(doc(db, 'employees', id), data);
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    } catch (e) {
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    }
    logActivity(`Updated employee profile`, 'employee', data.name || id);
    if (data.name) {
      addNotification({
        title: 'Employee Profile Updated',
        message: `Changes saved for team member ${data.name}.`,
        type: 'employee',
        priority: 'low',
        targetPage: 'employees'
      });
    }
  };

  const deleteEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id);
    try {
      await deleteDoc(doc(db, 'employees', id));
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
    logActivity(`Removed employee`, 'employee', target?.name || id);
    addNotification({
      title: 'Team Member Removed',
      message: `${target?.name || 'Employee'} removed from organization roster.`,
      type: 'employee',
      priority: 'low',
      targetPage: 'employees'
    });
  };

  // --- Settings & Database Reset ---
  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    const merged = { ...settings, ...newSettings };
    localStorage.setItem('trishul_company_settings', JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', 'general'), merged);
      setSettings(merged);
    } catch (e) {
      setSettings(merged);
    }
    logActivity(`Updated CRM system settings`, 'ai', 'Settings');
    addNotification({
      title: 'Settings Saved',
      message: 'Company configuration and system preferences updated.',
      type: 'system',
      priority: 'low',
      targetPage: 'settings'
    });
  };

  const resetToSampleData = async () => {
    setCustomers(initialCustomers.map((c, i) => ({ id: `cust-${Date.now()}-${i}`, ...c })));
    setLeads(initialLeads.map((l, i) => ({ id: `lead-${Date.now()}-${i}`, ...l })));
    setTasks(initialTasks.map((t, i) => ({ id: `task-${Date.now()}-${i}`, ...t })));
    setEmployees(initialEmployees);
    setSettings(initialSettings);
    logActivity(`Reset dataset to verified CRM sample benchmark`, 'ai', 'System Reset');
    addNotification({
      title: 'Benchmark Dataset Restored',
      message: 'CRM data has been synchronized with the clean benchmark baseline.',
      type: 'system',
      priority: 'medium',
      targetPage: 'dashboard'
    });
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        firebaseUser,
        setCurrentUserRole,
        switchUserAccount,
        loginWithEmail,
        loginWithGoogle,
        signupWithEmail,
        sendPasswordReset,
        logout,
        isAuthScreenOpen,
        setIsAuthScreenOpen,
        customers,
        leads,
        tasks,
        employees,
        settings,
        activityLogs,
        isLoading,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        soundEnabled,
        setSoundEnabled,
        playNotificationSound: playNotificationTone,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToCustomer,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateSettings,
        resetToSampleData,
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme,
        showIntroAnimation,
        replayIntro,
        finishIntro,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
