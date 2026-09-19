import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || 'Campus Residential Hall 4, West Wing');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser({
        name,
        phone,
        address
      });
      setSaving(false);
      toast.success('Profile details updated successfully!');
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Personal Profile & Credentials
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your university identity information and update personal contact records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/20 mb-4">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {user?.name}
          </h3>

          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {user?.collegeId || 'CAMPUS-ID'}
          </p>

          <span className="mt-3 px-3 py-1 rounded-full text-xs font-bold capitalize bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {user?.role} Portal
          </span>

          <div className="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span>Department:</span>
              <strong className="text-slate-800 dark:text-slate-200">{user?.departmentName || 'Computer Science'}</strong>
            </div>
            {user?.role === 'student' && (
              <>
                <div className="flex items-center justify-between">
                  <span>Semester:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{user?.semester || 5}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Roll No:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{user?.rollNumber || 'CS-01'}</strong>
                </div>
              </>
            )}
            {user?.role === 'faculty' && (
              <div className="flex items-center justify-between">
                <span>Designation:</span>
                <strong className="text-slate-800 dark:text-slate-200">{user?.designation || 'Associate Professor'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Contact Information
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus / Residential Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
