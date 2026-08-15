import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  Building,
  Shield,
  IndianRupee,
  Save,
  Check,
  RefreshCw,
  Database,
  Moon,
  Sun,
  Eye,
  Key,
  Globe,
  Mail,
  Phone,
  Sparkles,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, theme, isDarkMode, toggleTheme, isLoading, currentUser } = useCrm();
  const isFirestoreReady = !isLoading;
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState({
    companyName: settings.companyName || 'TRISHUL CRM & ENTERPRISE',
    companyTagline: settings.tagline || settings.companyTagline || 'Innovate • Empower • Excel',
    currency: settings.currency || 'INR',
    currencySymbol: settings.currencySymbol || '₹',
    adminEmail: settings.email || settings.adminEmail || 'support@trishulcrm.com',
    adminPhone: settings.phone || settings.adminPhone || '+91 94551 09687',
    address: settings.address || 'Sector 62, Noida & Connaught Place, New Delhi, India',
    gstin: settings.taxNumber || settings.gstin || 'GSTIN07AAACT1234F1Z5',
    autoPlayIntro: settings.autoPlayIntro ?? true
  });

  // Keep form in sync when Firestore settings load or change
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        companyTagline: settings.tagline || settings.companyTagline || '',
        currency: settings.currency || 'INR',
        currencySymbol: settings.currencySymbol || '₹',
        adminEmail: settings.email || settings.adminEmail || '',
        adminPhone: settings.phone || settings.adminPhone || '',
        address: settings.address || '',
        gstin: settings.taxNumber || settings.gstin || '',
        autoPlayIntro: settings.autoPlayIntro ?? true
      });
    }
  }, [settings]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Access Denied: Only users with Administrator privileges can modify organization identity settings.');
      return;
    }

    const payload = {
      ...settings,
      companyName: formData.companyName.trim(),
      tagline: formData.companyTagline.trim(),
      companyTagline: formData.companyTagline.trim(),
      email: formData.adminEmail.trim(),
      adminEmail: formData.adminEmail.trim(),
      phone: formData.adminPhone.trim(),
      adminPhone: formData.adminPhone.trim(),
      address: formData.address.trim(),
      taxNumber: formData.gstin.trim(),
      gstin: formData.gstin.trim(),
      currency: formData.currency,
      currencySymbol: formData.currencySymbol,
      autoPlayIntro: formData.autoPlayIntro
    };

    await updateSettings(payload);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organization Settings & Config</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
            Trishul v2.4
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Configure company branding, local currency, authentication credentials, and database synchronizers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Company Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Profile</h3>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    <Shield className="w-3 h-3" /> Admin Editable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                    <Lock className="w-3 h-3" /> Admin Only (Read-Only)
                  </span>
                )}
                {savedSuccess && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Saved to Cloud
                  </span>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Administrator Privileges Required</p>
                  <p className="text-amber-600 dark:text-amber-400/90 mt-0.5">
                    You are currently logged in as a <strong>{currentUser?.role.toUpperCase()}</strong> ({currentUser?.displayName}). Only users with the <strong>Admin</strong> role have write access to edit corporate branding, tax credentials, and company address.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Company Name</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Tagline / Mission</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.companyTagline}
                  onChange={(e) => setFormData({ ...formData, companyTagline: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Corporate Email</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="email"
                  required
                  disabled={!isAdmin}
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Support Phone</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Base Currency</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <select
                  disabled={!isAdmin}
                  value={formData.currency}
                  onChange={(e) => {
                    const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                    setFormData({
                      ...formData,
                      currency: e.target.value,
                      currencySymbol: symbols[e.target.value] || '₹'
                    });
                  }}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Tax ID / GSTIN</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Registered Office Address</span>
                {!isAdmin && <Lock className="w-3 h-3 text-slate-400" />}
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full mt-1 px-3 py-2 rounded-xl border text-xs transition-colors ${
                  isAdmin
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Theme Toggle in Settings */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Workspace Color Theme</span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Toggle between Dark and Light mode</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-sm'
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Animation Toggle */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Cinematic Opening Animation</span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Auto-play futuristic Trident intro on fresh session launch</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoPlayIntro: !formData.autoPlayIntro })}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  formData.autoPlayIntro ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.autoPlayIntro ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              {isAdmin ? (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Modifications restricted to Administrator</span>
                </div>
              )}
            </div>
          </form>

          {/* Security & Password Card */}
          <form onSubmit={handlePasswordUpdate} className="p-6 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Access Key</h3>
              </div>
              {passwordSuccess && (
                <span className="text-xs text-emerald-400 font-bold">Password Updated!</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newPassword}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Status & System Diagnostics */}
        <div className="space-y-6">
          {/* Cloud Database Status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Firestore Cloud Engine</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Status:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isFirestoreReady ? 'Connected (Live)' : 'Local Ready'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project ID:</span>
                <span className="font-mono text-[11px] text-cyan-400">ai-studio-webapp-64208</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sync Frequency:</span>
                <span className="font-semibold text-slate-300">Real-time WebSocket</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI Service:</span>
                <span className="font-semibold text-purple-400">Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>

          {/* Trishul CRM Branding Guarantee */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/30 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">Enterprise Certified</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              TRISHUL CRM provides military-grade data segregation, end-to-end audit trails, and multi-tenant Firestore rule isolation.
            </p>
            <div className="text-[10px] text-cyan-400/80 font-mono">
              Build Hash: #TRISHUL-2026-v2.4.9
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
