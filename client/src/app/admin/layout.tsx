'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  FolderTree,
  Users,
  Inbox,
  ArrowLeft,
  Loader2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Inquiries Audit', href: '/admin/inquiries', icon: Inbox },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Validating administrator privileges...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-600">
            This administration portal requires elevated system privileges. Your current account is not provisioned with administrator access.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return Home
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full text-xs bg-blue-600 hover:bg-blue-700">
                Sign In as Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex-shrink-0 flex flex-col border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow">
              M
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight text-white leading-tight">Admin Console</p>
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Superadmin Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Marketplace Shortcut */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Marketplace
          </Link>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
