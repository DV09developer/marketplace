'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/features/admin/api';
import { AdminInquiry } from '@/features/admin/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Inbox,
  Search,
  Building2,
  Clock,
  Phone,
  Mail,
  Tag,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function InquiriesAdminComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchInquiries = async () => {
    setLoading(true);
    const res = await adminApi.getInquiries({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      search: search || undefined,
      page,
      limit: 12,
    });

    if (res.success && res.data?.inquiries) {
      setInquiries(res.data.inquiries);
      setMeta({
        total: res.meta?.total || res.data.inquiries.length,
        totalPages: res.meta?.totalPages || 1,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, [filterStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    contacted: 'bg-purple-100 text-purple-800 border-purple-200',
    in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Inquiries Audit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor direct customer-to-business communications, inquiry distribution, and anti-spam compliance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'new', 'contacted', 'in_progress', 'completed', 'cancelled'].map((st) => (
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
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, business, or subject..."
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

      {/* Inquiries Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-500">Loading platform inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <Card className="bg-white border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No inquiries match the current filter or search criteria.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{inq.customer_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusColors[inq.status] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                      {(inq.product_name || inq.service_name) && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          Item: {inq.product_name || inq.service_name}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Received: {new Date(inq.created_at).toLocaleString()}
                    </p>
                  </div>

                  {inq.business_name && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      <span>Strict Target:</span>
                      <Link
                        href={`/business/${inq.business_slug || inq.business_id}`}
                        target="_blank"
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {inq.business_name} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-800">{inq.subject}</p>
                  <p className="text-xs text-slate-600 mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 whitespace-pre-line">
                    {inq.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-4 flex-wrap">
                    {inq.customer_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {inq.customer_phone}
                      </span>
                    )}
                    {inq.customer_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {inq.customer_email}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Inquiry ID: {inq.id.slice(0, 8)}...
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
    </div>
  );
}

export default function InquiriesAdminPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading inquiries audit...</div>}>
      <InquiriesAdminComponent />
    </Suspense>
  );
}
