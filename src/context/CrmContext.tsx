import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import {
  db,
  auth,
  googleProvider,
  defaultCompanySettings,
  seedFirestoreIfEmpty,
  checkFirestoreConnection,
  formatFirebaseAuthError
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
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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

  // Database Connection Health Check
  checkDatabaseHealth: () => Promise<{ ok: boolean; latencyMs: number; error?: string }>;

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('trishul_company_settings');
    return saved ? JSON.parse(saved) : defaultCompanySettings;
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

  // Helper to resolve designated roles and profile metadata
  const getRoleAndProfileForEmail = (
    email: string,
    providedName?: string | null,
    providedPhoto?: string | null,
    currentEmployeesList?: Employee[]
  ): UserProfile => {
    const lower = email.trim().toLowerCase();
    const listToSearch = currentEmployeesList || employees;

    // 1. Check if an updated profile exists in localStorage
    const savedStr = localStorage.getItem('trishul_user_profile');
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved && saved.email && saved.email.toLowerCase() === lower) {
          return saved;
        }
      } catch {}
    }

    // 2. Match against current team employee records
    const matched = listToSearch.find(e => e.email.toLowerCase() === lower);
    if (matched) {
      return {
        id: matched.id,
        email: matched.email,
        displayName: matched.name,
        role: matched.role,
        department: matched.department,
        phone: matched.phone,
        avatar: (matched as any).avatar || providedPhoto || undefined,
        createdAt: matched.joinedDate
      };
    }

    // 3. Somil Srivastav as Admin
    if (lower === 'somilsrivastav18@gmail.com') {
      return {
        id: 'emp-admin',
        email: 'somilsrivastav18@gmail.com',
        displayName: providedName || 'Somil Srivastav (Admin)',
        role: 'admin',
        department: 'Executive Management',
        phone: '+91 94551 09687',
        avatar: providedPhoto || undefined,
        createdAt: '2024-01-10'
      };
    }

    // 4. Sidharth Srivastava as Supervisor
    if (lower === 'srivastavasidharth180@gmail.com') {
      return {
        id: 'emp-sup',
        email: 'srivastavasidharth180@gmail.com',
        displayName: providedName || 'Sidharth Srivastava (Supervisor)',
        role: 'supervisor',
        department: 'Sales & Operations',
        phone: '+91 94551 09687',
        avatar: providedPhoto || undefined,
        createdAt: '2024-06-15'
      };
    }

    // 5. Default user profile for all other accounts
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

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        // If current user is already set for this email, keep their customized fields
        setCurrentUser(prev => {
          if (prev && prev.email.toLowerCase() === user.email?.toLowerCase()) {
            return prev;
          }
          const profile = getRoleAndProfileForEmail(
            user.email!,
            user.displayName,
            user.photoURL
          );
          localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
          return profile;
        });
      }
    });
    return () => unsubscribe();
  }, []);

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

        // Customers Real-time Listener (Real database only)
        unsubCustomers = onSnapshot(
           collection(db, 'customers'),
           (snapshot) => {
             if (!snapshot.empty) {
               const list = snapshot.docs.map(d => ({
                 id: d.id,
                 ...d.data()
               } as Customer));
               setCustomers(list);
             } else {
               setCustomers([]);
             }
             setIsLoading(false);
           },
           (err) => {
             console.warn('Customers firestore snapshot notice:', err);
             setIsLoading(false);
           }
         );

        // Leads Real-time Listener (Real database only)
        unsubLeads = onSnapshot(
           collection(db, 'leads'),
           (snapshot) => {
             if (!snapshot.empty) {
               const list = snapshot.docs.map(d => ({
                 id: d.id,
                 ...d.data()
               } as Lead));
               setLeads(list);
             } else {
               setLeads([]);
             }
           },
           (err) => {
             console.warn('Leads snapshot notice:', err);
           }
         );

        // Tasks Real-time Listener (Real database only)
        unsubTasks = onSnapshot(
           collection(db, 'tasks'),
           (snapshot) => {
             if (!snapshot.empty) {
               const list = snapshot.docs.map(d => ({
                 id: d.id,
                 ...d.data()
               } as Task));
               setTasks(list);
             } else {
               setTasks([]);
             }
           },
           (err) => {
             console.warn('Tasks snapshot notice:', err);
           }
         );

        // Employees Real-time Listener (Real database only) with intelligent deduplication & auto-cleanup
        unsubEmployees = onSnapshot(
          collection(db, 'employees'),
          async (snapshot) => {
            if (!snapshot.empty) {
              const rawList = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
              } as Employee));

              // Deduplicate employees by normalized email or unique name
              const seenMap = new Map<string, Employee>();
              const duplicatesToDelete: string[] = [];

              for (const emp of rawList) {
                // Filter out corrupted/empty dummy items
                if (!emp.name || emp.name.trim() === '') {
                  duplicatesToDelete.push(emp.id);
                  continue;
                }

                // If test ghost record with no email and placeholder dummy phone
                if (!emp.email && emp.phone === '-91 000000000') {
                  duplicatesToDelete.push(emp.id);
                  continue;
                }

                const normEmail = emp.email ? emp.email.trim().toLowerCase() : '';
                const normName = emp.name.trim().toLowerCase();
                const key = normEmail || `name:${normName}`;

                if (!seenMap.has(key)) {
                  seenMap.set(key, emp);
                } else {
                  const existing = seenMap.get(key)!;
                  // Quality scoring to retain the best enriched profile
                  const empScore = (emp.avatar ? 10 : 0) + (emp.role === 'admin' ? 5 : emp.role === 'supervisor' ? 3 : 0) + (emp.phone && !emp.phone.includes('00000') ? 2 : 0) + (emp.email ? 4 : 0);
                  const existingScore = (existing.avatar ? 10 : 0) + (existing.role === 'admin' ? 5 : existing.role === 'supervisor' ? 3 : 0) + (existing.phone && !existing.phone.includes('00000') ? 2 : 0) + (existing.email ? 4 : 0);

                  if (empScore > existingScore) {
                    duplicatesToDelete.push(existing.id);
                    seenMap.set(key, { ...existing, ...emp });
                  } else {
                    duplicatesToDelete.push(emp.id);
                  }
                }
              }

              // Auto-purge redundant duplicate docs from Firestore
              if (duplicatesToDelete.length > 0) {
                for (const dupId of duplicatesToDelete) {
                  try {
                    await deleteDoc(doc(db, 'employees', dupId));
                  } catch (delErr) {
                    console.warn('Auto-cleanup notice for duplicate employee record:', dupId);
                  }
                }
              }

              setEmployees(Array.from(seenMap.values()));
            } else {
              setEmployees([]);
            }
          },
          (err) => {
            console.warn('Employees snapshot notice:', err);
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
            console.warn('Settings snapshot notice:', err);
          }
        );

      } catch (e) {
        console.error('Error setting up firestore listeners:', e);
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
      userId: currentUser?.id || 'sys',
      userName: currentUser?.displayName || 'User',
      action,
      entityType,
      entityName,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [log, ...prev].slice(0, 50));
  };

  // Role Switcher / User Switcher
  const setCurrentUserRole = (role: UserRole) => {
    if (!currentUser) return;
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
        avatar: (emp as any).avatar || undefined,
        createdAt: emp.joinedDate
      };
      setCurrentUser(profile);
      localStorage.setItem('trishul_user_profile', JSON.stringify(profile));
      logActivity(`Switched session to ${emp.name}`, 'employee', emp.name);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      ...data,
      id: currentUser.id,
      email: currentUser.email,
    };
    setCurrentUser(updated);
    localStorage.setItem('trishul_user_profile', JSON.stringify(updated));

    // Find all matching employee records by ID or email
    const matchingEmps = employees.filter(
      e => e.id === currentUser.id || (e.email && e.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
    );
    const targetEmpId = matchingEmps.length > 0 ? matchingEmps[0].id : currentUser.id;

    const empUpdates: Partial<Employee> = {
      name: updated.displayName,
      phone: updated.phone || '+91 94551 09687',
      department: updated.department,
      avatar: updated.avatar || ''
    };

    try {
      if (matchingEmps.length > 0) {
        // Update the primary matching doc
        await setDoc(doc(db, 'employees', matchingEmps[0].id), { ...empUpdates }, { merge: true });
        // Clean up any extra duplicates
        if (matchingEmps.length > 1) {
          for (let i = 1; i < matchingEmps.length; i++) {
            try {
              await deleteDoc(doc(db, 'employees', matchingEmps[i].id));
            } catch {}
          }
        }
      } else {
        // Create new employee doc for current user if none exists
        const newEmpDoc: Employee = {
          id: targetEmpId,
          name: updated.displayName,
          email: updated.email,
          role: updated.role,
          department: updated.department,
          phone: updated.phone || '+91 94551 09687',
          avatar: updated.avatar || '',
          status: 'Active',
          leadsClosed: 0,
          revenueGenerated: 0,
          tasksCompleted: 0,
          joinedDate: currentUser.createdAt || new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'employees', targetEmpId), newEmpDoc, { merge: true });
      }

      setEmployees(prev => {
        const normEmail = updated.email.trim().toLowerCase();
        const filtered = prev.filter(e => e.id !== targetEmpId && e.email.trim().toLowerCase() !== normEmail);
        const existingPrimary = prev.find(e => e.id === targetEmpId || e.email.trim().toLowerCase() === normEmail);
        const mergedEmp: Employee = existingPrimary
          ? { ...existingPrimary, ...empUpdates }
          : {
              id: targetEmpId,
              name: updated.displayName,
              email: updated.email,
              role: updated.role,
              department: updated.department,
              phone: updated.phone || '+91 94551 09687',
              avatar: updated.avatar || '',
              status: 'Active',
              leadsClosed: 0,
              revenueGenerated: 0,
              tasksCompleted: 0,
              joinedDate: currentUser.createdAt || new Date().toISOString().split('T')[0]
            };
        return [...filtered, mergedEmp];
      });
    } catch (err) {
      console.warn('Could not sync employee document to Firestore:', err);
    }

    // Persist to users collection
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          email: updated.email,
          displayName: updated.displayName,
          role: updated.role,
          department: updated.department,
          phone: updated.phone || '',
          avatar: updated.avatar || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (userDocErr) {
        console.warn('Users collection write notice:', userDocErr);
      }
    }

    // Update Firebase Auth profile if signed in
    if (auth.currentUser) {
      try {
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        if (data.displayName) authUpdates.displayName = data.displayName;
        if (data.avatar && (data.avatar.startsWith('http://') || data.avatar.startsWith('https://'))) {
          authUpdates.photoURL = data.avatar;
        }
        if (Object.keys(authUpdates).length > 0) {
          await updateProfile(auth.currentUser, authUpdates);
        }
      } catch (err) {
        console.warn('Could not update Firebase Auth profile:', err);
      }
    }

    addNotification({
      title: 'Profile Updated',
      message: 'Your user profile details and avatar have been saved to the database.',
      type: 'system',
      category: 'system'
    });
    logActivity('Updated user profile settings', 'system', updated.displayName);
  };

  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState<boolean>(false);

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const profile = getRoleAndProfileForEmail(
          user.email,
          user.displayName,
          user.photoURL,
          employees
        );

        // Ensure user is present in employees state/database without duplicates
        const normEmail = user.email.trim().toLowerCase();
        const matched = employees.find(e => e.email.trim().toLowerCase() === normEmail);
        if (!matched) {
          const newEmp: Employee = {
            id: profile.id,
            name: profile.displayName,
            email: profile.email,
            role: profile.role,
            department: profile.department,
            phone: profile.phone || '+91 94551 09687',
            avatar: profile.avatar || user.photoURL || '',
            status: 'Active',
            leadsClosed: 0,
            revenueGenerated: 0,
            tasksCompleted: 0,
            joinedDate: profile.createdAt
          };
          await addEmployee(newEmp);
        } else if (profile.avatar && !matched.avatar) {
          await updateEmployee(matched.id, { avatar: profile.avatar });
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
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const sendPasswordReset = async (emailToReset: string) => {
    const cleanEmail = emailToReset ? emailToReset.trim() : '';
    if (!cleanEmail) {
      throw new Error('Please provide your registered work email address.');
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      logActivity(`Password reset requested for ${cleanEmail}`, 'employee', cleanEmail);
      addNotification({
        title: 'Password Reset Dispatched',
        message: `Recovery email sent to ${cleanEmail}. Please check your inbox and spam folder.`,
        type: 'system',
        priority: 'low',
        targetPage: 'dashboard'
      });
    } catch (err: any) {
      console.warn('Password reset failed:', err);
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const profile = getRoleAndProfileForEmail(
        email.trim(),
        user.displayName,
        null,
        employees
      );

      // Check if user is in employees list; if not add them
      const normEmail = email.trim().toLowerCase();
      const matched = employees.find(e => e.email.trim().toLowerCase() === normEmail);
      if (!matched) {
        const newEmp: Employee = {
          id: profile.id,
          name: profile.displayName,
          email: profile.email,
          role: profile.role,
          department: profile.department,
          phone: profile.phone || '+91 98765 43210',
          avatar: profile.avatar || '',
          status: 'Active',
          leadsClosed: 0,
          revenueGenerated: 0,
          tasksCompleted: 0,
          joinedDate: profile.createdAt
        };
        await addEmployee(newEmp);
      }

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
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const firebaseUser = userCred.user;

      // Update display name in Firebase Auth
      if (firebaseUser && name.trim()) {
        try {
          await updateProfile(firebaseUser, { displayName: name.trim() });
        } catch (updErr) {
          console.warn('Firebase profile displayName update notice:', updErr);
        }
      }

      const profile = getRoleAndProfileForEmail(email.trim(), name.trim(), null, employees);

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

      // Also persist to Firestore users collection
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: profile.email,
          displayName: profile.displayName,
          role: profile.role,
          department: profile.department,
          phone: profile.phone,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (userDocErr) {
        console.warn('Users collection write notice:', userDocErr);
      }

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
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('trishul_user_profile');
  };

  // --- Customer Operations ---
  const addCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    const newId = `cust-${Date.now()}`;
    const newCust: Customer = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'customers', newId), newCust);
    } catch (e) {
      console.warn('Firestore addCustomer error:', e);
    }
    setCustomers(prev => {
      if (prev.some(c => c.id === newId)) return prev;
      return [newCust, ...prev];
    });
    logActivity(`Added new customer ${data.name}`, 'customer', data.name);
    addNotification({
      title: 'New Customer Added',
      message: `${data.name} (${data.company}) was onboarded.`,
      type: 'customer',
      priority: (data.value || 0) > 200000 ? 'high' : 'medium',
      targetPage: 'customers'
    });
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const updatedWithTime = { ...data, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'customers', id), updatedWithTime, { merge: true });
    } catch (e) {
      console.warn('Firestore updateCustomer error:', e);
    }
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedWithTime } : c));
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
    } catch (e) {
      console.warn('Firestore deleteCustomer error:', e);
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
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
    const newId = `lead-${Date.now()}`;
    const newLead: Lead = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'leads', newId), newLead);
    } catch (e) {
      console.warn('Firestore addLead error:', e);
    }
    setLeads(prev => {
      if (prev.some(l => l.id === newId)) return prev;
      return [newLead, ...prev];
    });
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
      await setDoc(doc(db, 'leads', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore updateLead error:', e);
    }
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
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
    } catch (e) {
      console.warn('Firestore deleteLead error:', e);
    }
    setLeads(prev => prev.filter(l => l.id !== id));
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
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'tasks', newId), newTask);
    } catch (e) {
      console.warn('Firestore addTask error:', e);
    }
    setTasks(prev => {
      if (prev.some(t => t.id === newId)) return prev;
      return [newTask, ...prev];
    });
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
      await setDoc(doc(db, 'tasks', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore updateTask error:', e);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
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
    } catch (e) {
      console.warn('Firestore deleteTask error:', e);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
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
    const normEmail = data.email ? data.email.trim().toLowerCase() : '';
    const normName = data.name ? data.name.trim().toLowerCase() : '';

    // Check if an employee with the same email or exact name already exists
    const existing = employees.find(e => 
      (normEmail && e.email && e.email.trim().toLowerCase() === normEmail) ||
      (!normEmail && e.name.trim().toLowerCase() === normName)
    );

    if (existing) {
      // Update existing record rather than creating duplicate
      await updateEmployee(existing.id, data);
      return;
    }

    const newEmpId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      id: newEmpId,
      ...data,
      name: data.name.trim(),
      email: data.email.trim(),
      leadsClosed: 0,
      revenueGenerated: 0,
      tasksCompleted: 0
    };

    try {
      await setDoc(doc(db, 'employees', newEmpId), newEmp);
    } catch (e) {
      console.warn('Firestore addEmployee error:', e);
    }

    setEmployees(prev => {
      if (prev.some(e => e.id === newEmpId || (normEmail && e.email.trim().toLowerCase() === normEmail))) {
        return prev;
      }
      return [...prev, newEmp];
    });

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
      await setDoc(doc(db, 'employees', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore updateEmployee error:', e);
    }
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));

    // If updating current user's employee record, sync currentUser avatar / name
    if (currentUser && (currentUser.id === id || currentUser.email.toLowerCase() === data.email?.toLowerCase())) {
      const userUpdates: Partial<UserProfile> = {};
      if (data.name) userUpdates.displayName = data.name;
      if (data.avatar) userUpdates.avatar = data.avatar;
      if (data.phone) userUpdates.phone = data.phone;
      if (data.department) userUpdates.department = data.department;
      if (data.role) userUpdates.role = data.role;
      setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);
      if (currentUser) {
        localStorage.setItem('trishul_user_profile', JSON.stringify({ ...currentUser, ...userUpdates }));
      }
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
    } catch (e) {
      console.warn('Firestore deleteEmployee error:', e);
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    logActivity(`Removed employee`, 'employee', target?.name || id);
    addNotification({
      title: 'Team Member Removed',
      message: `${target?.name || 'Employee'} removed from organization roster.`,
      type: 'employee',
      priority: 'low',
      targetPage: 'employees'
    });
  };

  // --- Settings ---
  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    const merged = { ...settings, ...newSettings };
    localStorage.setItem('trishul_company_settings', JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', 'general'), merged, { merge: true });
    } catch (e) {
      console.warn('Firestore updateSettings error:', e);
    }
    setSettings(merged);
    logActivity(`Updated CRM system settings`, 'ai', 'Settings');
    addNotification({
      title: 'Settings Saved',
      message: 'Company configuration and system preferences updated.',
      type: 'system',
      priority: 'low',
      targetPage: 'settings'
    });
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        firebaseUser,
        setCurrentUserRole,
        switchUserAccount,
        updateUserProfile,
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
        checkDatabaseHealth: checkFirestoreConnection,
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
