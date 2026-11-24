'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/features/admin/api';
import { AdminBusiness } from '@/features/admin/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  Wrench,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function BusinessesAdminComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject / Reason Modal
  const [rejectingBiz, setRejectingBiz] = useState<AdminBusiness | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBusinesses = async () => {
    setLoading(true);
    const res = await adminApi.getBusinesses({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      search: search || undefined,
      page,
      limit: 10,
    });

    if (res.success && res.data?.businesses) {
      setBusinesses(res.data.businesses);
      setMeta({
        total: res.meta?.total || res.data.businesses.length,
        totalPages: res.meta?.totalPages || 1,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, [filterStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBusinesses();
  };

  const handleUpdateStatus = async (
    businessId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) => {
    setActionLoadingId(businessId);
    setStatusMsg(null);
    const res = await adminApi.updateBusinessStatus(businessId, status, reason);
    setActionLoadingId(null);
    setRejectingBiz(null);
    setRejectReason('');

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Business status successfully updated to '${status}'.`,
      });
      fetchBusinesses();
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Failed to update business status.',
      });
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-slate-200 text-slate-800 border-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Moderation Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, reject, and govern local business listings across the platform.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, city, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <Button type="submit" size="sm" className="h-8 text-xs bg-slate-800 hover:bg-slate-900">
            Search
          </Button>
        </form>
      </div>

      {/* Business List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-500">Loading business entries...</p>
        </div>
      ) : businesses.length === 0 ? (
        <Card className="bg-white border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No Businesses Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no businesses matching status &quot;{filterStatus}&quot; {search ? `and query "${search}"` : ''}.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => (
            <Card key={b.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusColors[b.status] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.category_name && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {b.category_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city}, {b.state}
                      </span>
                      <span>•</span>
                      <span>Owner: <strong>{b.owner_name}</strong> ({b.owner_email})</span>
                      <span>•</span>
                      <span>Submitted: {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>

                    {b.status_reason && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                        Reason: {b.status_reason}
                      </p>
                    )}
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/business/${b.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <ExternalLink className="w-3 h-3" /> Preview
                      </Button>
                    </Link>

                    {b.status !== 'approved' && (
                      <Button
                        size="sm"
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleUpdateStatus(b.id, 'approved')}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        {actionLoadingId === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </Button>
                    )}

                    {b.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoadingId === b.id}
                        onClick={() => setRejectingBiz(b)}
                        className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    )}

                    {b.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleUpdateStatus(b.id, 'suspended', 'Administrative policy suspension')}
                        className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-emerald-600" /> {b.products_count} Products
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-purple-600" /> {b.services_count} Services
                    </span>
                    <span>{b.inquiries_count} Direct Inquiries Received</span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Business ID: {b.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="gap-1 text-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingBiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reject Business Listing</h3>
              <p className="text-xs text-slate-500 mt-1">
                State the reason for rejecting <strong className="text-slate-800">{rejectingBiz.name}</strong>.
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Incomplete address information or invalid contact credentials..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingBiz(null);
                  setRejectReason('');
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(rejectingBiz.id, 'rejected', rejectReason || 'Did not meet listing criteria')}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessesAdminPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading business queue...</div>}>
      <BusinessesAdminComponent />
    </Suspense>
  );
}
