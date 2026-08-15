export type UserRole = 'admin' | 'supervisor' | 'user';

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Won' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Advertisement' | 'Cold Call' | 'Social Media' | 'Partner' | 'Other';
export type CustomerStatus = 'Active' | 'Inactive' | 'Pending';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  supervisorId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  status: CustomerStatus;
  notes?: string;
  value: number; // In ₹ INR
  assignedTo?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: 'Website' | 'Referral' | 'Advertisement' | 'Cold Call' | 'Social Media' | 'Partner' | 'Other';
  assignedUser: string;
  assignedUserId?: string;
  status: LeadStatus;
  estimatedValue: number;
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedUserId: string;
  assignedUserName: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  completedAt?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  avatar?: string;
  status: EmployeeStatus;
  supervisorId?: string;
  supervisorName?: string;
  leadsClosed: number;
  revenueGenerated: number;
  tasksCompleted: number;
  joinedDate: string;
  salesTarget?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'customer' | 'lead' | 'task' | 'employee' | 'ai';
  entityName: string;
  timestamp: string;
}

export type NotificationType = 'lead' | 'task' | 'customer' | 'employee' | 'system' | 'ai';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface CrmNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  targetPage?: string;
  entityId?: string;
  userId?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currencySymbol: string;
  taxNumber?: string;
  gstin?: string;
  currency?: string;
  adminEmail?: string;
  adminPhone?: string;
  companyTagline?: string;
  autoPlayIntro?: boolean;
  website?: string;
  enableAiAssistant: boolean;
  theme: 'dark' | 'light';
}
