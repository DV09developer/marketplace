'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/features/admin/api';
import { PlatformMetrics } from '@/features/admin/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building2,
  Clock,
  Package,
  Wrench,
  Inbox,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    const res = await adminApi.getMetrics();
    if (res.success && res.data?.metrics) {
      setMetrics(res.data.metrics);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleModeration = async (businessId: string, status: 'approved' | 'rejected') => {
    setActionLoadingId(businessId);
    setActionMsg(null);
    const res = await adminApi.updateBusinessStatus(businessId, status);
    setActionLoadingId(null);

    if (res.success) {
      setActionMsg({
        type: 'success',
        text: `Business listing ${status === 'approved' ? 'approved and published live!' : 'rejected.'}`,
      });
      fetchMetrics();
    } else {
      setActionMsg({
        type: 'error',
        text: res.message || 'Failed to update business status.',
      });
    }
  };

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm text-slate-500">Loading platform metrics and queues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform metrics, business approvals, and user governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
          <Link href="/admin/businesses">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
              Review Queue ({metrics?.pendingBusinesses || 0})
            </Button>
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalUsers ?? 0}</p>
              <Link href="/admin/users" className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 inline-block">
                View Users &rarr;
              </Link>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className={`border-slate-200 shadow-sm ${metrics?.pendingBusinesses ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' : 'bg-white'}`}>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Approvals</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{metrics?.pendingBusinesses ?? 0}</p>
              <Link href="/admin/businesses?status=pending" className="text-[11px] text-amber-800 font-semibold hover:underline mt-1 inline-block">
                Action Required &rarr;
              </Link>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Businesses */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Businesses</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.approvedBusinesses ?? 0}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {metrics?.totalBusinesses ?? 0} total registered
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Inquiries */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Inquiries</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-black text-slate-900">{metrics?.totalInquiries ?? 0}</p>
                {metrics?.newInquiries ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                    {metrics.newInquiries} new
                  </span>
                ) : null}
              </div>
              <Link href="/admin/inquiries" className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 inline-block">
                View Audit &rarr;
              </Link>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Moderation Queue */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Pending Business Review Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Businesses submitted by registered users awaiting admin verification before becoming publicly visible.
            </CardDescription>
          </div>
          <Link href="/admin/businesses?status=pending">
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
              View All ({metrics?.pendingBusinesses ?? 0}) <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!metrics?.recentPendingBusinesses || metrics.recentPendingBusinesses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="font-semibold text-slate-800 text-sm">Review Queue Empty</p>
              <p className="text-xs">All submitted businesses have been reviewed and moderated.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.recentPendingBusinesses.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        Pending Review
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.city} {b.categoryName ? `• ${b.categoryName}` : ''} • Submitted {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={actionLoadingId === b.id}
                      onClick={() => handleModeration(b.id, 'approved')}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      {actionLoadingId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoadingId === b.id}
                      onClick={() => handleModeration(b.id, 'rejected')}
                      className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Recent Users & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Recent User Registrations
              </CardTitle>
              <CardDescription className="text-xs">Latest dual-role user accounts created.</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                Manage Users <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {metrics?.recentUsers?.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Governance & Controls</CardTitle>
            <CardDescription className="text-xs">Quick shortcuts to administrative features.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Category Catalog Management</p>
                <p className="text-[11px] text-slate-500">Configure marketplace sectors, icons, and hierarchy.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/businesses"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Business Listings Moderation</p>
                <p className="text-[11px] text-slate-500">Review pending, approved, rejected, and suspended companies.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/inquiries"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Inquiry Leads Audit</p>
                <p className="text-[11px] text-slate-500">Monitor inquiries across the marketplace for anti-spam and compliance.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
