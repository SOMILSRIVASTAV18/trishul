import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Camera,
  Phone,
  Mail,
  Shield,
  UserCheck,
  Check,
  Save,
  Upload,
  Trash2,
  Moon,
  Sun,
  Briefcase,
  Building2,
  FileText,
  MapPin,
  Unlock,
  Coins
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    settings,
    updateSettings,
    theme,
    toggleTheme
  } = useCrm();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Company Profile form state (for Admin)
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpPhone, setCorpPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [taxNumber, setTaxNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state with current user profile
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setDepartment(currentUser.department || '');
      setAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  // Synchronize company settings
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || 'TRISHUL CRM & ENTERPRISE');
      setTagline(settings.tagline || 'Innovate • Empower • Excel');
      setCorpEmail(settings.email || 'support@trishulcrm.com');
      setCorpPhone(settings.phone || '+91 94551 09687');
      setCurrencySymbol(settings.currencySymbol || '₹');
      setTaxNumber(settings.taxNumber || settings.gstin || 'GSTIN07AAACT1234F1Z5');
      setAddress(settings.address || 'Sector 62, Noida & Connaught Place, New Delhi, India');
      setWebsite(settings.website || 'https://trishulcrm.com');
    }
  }, [settings]);

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Please sign in to view your profile settings.</p>
      </div>
    );
  }

  // Handle image upload from file input or drag-and-drop
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Image size should be less than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar(undefined);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Display Name is required.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        phone: phone.trim(),
        department: department.trim(),
        avatar: avatar || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'admin') {
      alert('Administrator privileges are required to update company details.');
      return;
    }
    setIsSavingCompany(true);
    try {
      await updateSettings({
        companyName: companyName.trim(),
        tagline: tagline.trim(),
        email: corpEmail.trim(),
        phone: corpPhone.trim(),
        currencySymbol,
        taxNumber: taxNumber.trim(),
        address: address.trim(),
        website: website.trim()
      });
      setCompanySaveSuccess(true);
      setTimeout(() => setCompanySaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving company settings:', err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const roleBadges = {
    admin: { label: 'Administrator (Full Access)', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: Shield },
    supervisor: { label: 'Supervisor (Team Lead)', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: UserCheck },
    user: { label: 'Account Executive / Staff', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', icon: User }
  };

  const currentRoleBadge = roleBadges[currentUser.role] || roleBadges.user;
  const RoleIcon = currentRoleBadge.icon;
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace & Profile Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal user profile, corporate enterprise branding, and application preferences.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Your profile details have been saved and synced to the database!</span>
          </div>
          <span className="text-[10px] font-mono opacity-75">Synced</span>
        </div>
      )}

      {companySaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Company details and corporate branding updated successfully!</span>
          </div>
          <span className="text-[10px] font-mono opacity-75">Saved to Firestore</span>
        </div>
      )}

      {/* SECTION 1: Company Profile (Admin Only) */}
      {isAdmin && (
        <form onSubmit={handleCompanySubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Company Profile & Corporate Details
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Official enterprise organization branding, tax numbers, and communication channels.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Unlock className="w-3.5 h-3.5" />
                <span>Admin Access</span>
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TRISHUL CRM & ENTERPRISE"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tagline / Mission
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Innovate • Empower • Excel"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={corpEmail}
                  onChange={(e) => setCorpEmail(e.target.value)}
                  placeholder="support@trishulcrm.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Support Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={corpPhone}
                  onChange={(e) => setCorpPhone(e.target.value)}
                  placeholder="+91 94551 09687"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Base Currency
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden cursor-pointer transition-all"
                >
                  <option value="₹">INR - Indian Rupee (₹)</option>
                  <option value="$">USD - US Dollar ($)</option>
                  <option value="€">EUR - Euro (€)</option>
                  <option value="£">GBP - British Pound (£)</option>
                  <option value="AED">AED - UAE Dirham (د.إ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tax ID / GSTIN
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="GSTIN07AAACT1234F1Z5"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Registered Office Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Sector 62, Noida & Connaught Place, New Delhi, India"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSavingCompany}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSavingCompany ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Updating Company Details...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Company Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: User Profile Settings */}
      <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Account & Profile Settings
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update your photo avatar, display name, contact phone, and department.
            </p>
          </div>
        </div>

        {/* Avatar Upload Container */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Profile Photo & Avatar
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-cyan-500/30 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all active:scale-95 cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 w-full p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Click to upload</span> or drag and drop image
                </div>
                <div className="text-[10px] text-slate-400">
                  PNG, JPG, or WebP (max 3MB)
                </div>
              </div>
            </div>

            {avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Section 2: Contact & Identification */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Personal Information
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Somil Srivastav"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94551 09687"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Department / Division
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Sales & Growth"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address (Authenticated)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Section 3: Role & Permissions Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Role & Security Privileges
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Access Level</span>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <RoleIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentRoleBadge.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentRoleBadge.color}`}>
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentUser.role === 'admin' && 'Full administrative access across company settings, leads, deals, employees, and corporate metrics.'}
                  {currentUser.role === 'supervisor' && 'Team pipeline supervisor with assignment delegation and pipeline review privileges.'}
                  {currentUser.role === 'user' && 'Sales account executive access to your assigned customer portfolio and daily task sprints.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Section 4: Workspace Appearance Preference */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Workspace Theme
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose between light and dark interface styles
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-200" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
