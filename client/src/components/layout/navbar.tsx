'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Inbox,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Market<span className="text-blue-600">Place</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/search" className="hover:text-blue-600 transition">Explore</Link>
          <Link href="/categories" className="hover:text-blue-600 transition">Categories</Link>
          <Link href="/products" className="hover:text-blue-600 transition">Products</Link>
          <Link href="/services" className="hover:text-blue-600 transition">Services</Link>
        </nav>

        {/* Right CTA / User Area */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="w-24 h-8 bg-slate-100 rounded animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/my-businesses">
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <PlusCircle className="w-4 h-4 mr-1.5" /> List Your Business
                </Button>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-sm"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Unified Dashboard
                      </Link>
                      <Link
                        href="/my-businesses"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" /> My Businesses
                      </Link>
                      <Link
                        href="/inquiries"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Inbox className="w-4 h-4 text-slate-400" /> My Inquiries
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Profile Settings
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Portal
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Register Business
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <Link href="/search" onClick={() => setMobileMenuOpen(false)}>Explore Listings</Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          </nav>
          <div className="pt-3 border-t flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" /> Unified Dashboard
                  </Button>
                </Link>
                <Link href="/my-businesses" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" /> My Businesses
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
