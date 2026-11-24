'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { inquiryApi } from '@/features/inquiries/api';
import { Inquiry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Inbox, Building2, Clock, CheckCircle2, ArrowRight, Loader2, MessageSquare, ExternalLink } from 'lucide-react';

const statusBadgeColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-700',
};

export default function MyInquiriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      inquiryApi.getMyInquiries().then((res) => {
        if (res.success && res.data?.inquiries) {
          setInquiries(res.data.inquiries);
        }
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading your inquiry history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Inquiries</h1>
          <p className="text-sm text-slate-500">
            Track inquiries you have sent to specific businesses and suppliers.
          </p>
        </div>
        <Link href="/search">
          <Button variant="outline" className="text-xs">
            Explore More Businesses
          </Button>
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <Card className="bg-white border-slate-200 border-dashed p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Inquiries Submitted Yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            When you contact a business, product manufacturer, or service provider, your inquiry and its live status will be tracked here.
          </p>
          <Link href="/search">
            <Button className="bg-blue-600 hover:bg-blue-700">Find Businesses & Products</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id} className="bg-white border-slate-200 shadow-sm hover:shadow transition">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        statusBadgeColors[inq.status] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {inq.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(inq.created_at || inq.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {(inq.business_name || inq.businessName) && (
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <span>Sent strictly to:</span>
                      <strong className="text-blue-600 font-semibold">{inq.business_name || inq.businessName}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  {(inq.product_name || inq.service_name) && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      Item: {inq.product_name || inq.service_name}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900">{inq.subject}</h3>
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {inq.message}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Contact Phone Provided: <strong className="text-slate-700">{inq.customer_phone || inq.customerPhone}</strong>
                  </span>
                  <span>
                    Status: <strong className="capitalize text-slate-800">{inq.status.replace('_', ' ')}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
