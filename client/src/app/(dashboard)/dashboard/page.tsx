'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { businessApi } from '@/features/businesses/api';
import { Business } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Building2,
  Inbox,
  User,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      businessApi.getMyBusinesses().then((res) => {
        if (res.success && res.data?.businesses) {
          setBusinesses(res.data.businesses);
        }
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Unified Buyer & Business Account
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            You can discover products & services as a buyer, send inquiries, or manage your registered business listings from here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/my-businesses/new">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow">
              <PlusCircle className="w-4 h-4 mr-1.5" /> List New Business
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="bg-blue-500/20 text-white border-white/30 hover:bg-blue-500/30">
              <Search className="w-4 h-4 mr-1.5" /> Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">My Businesses</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{businesses.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inquiries Received</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Inbox className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Buyer Inquiries Sent</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Status</p>
              <p className="text-base font-bold text-emerald-600 capitalize mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Active
              </p>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <User className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Businesses Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Business Profiles</h2>
            <p className="text-xs text-slate-500">Manage listings, view inquiries, and update products</p>
          </div>
          <Link href="/my-businesses">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All ({businesses.length}) <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {businesses.length === 0 ? (
          <Card className="bg-white border-slate-200 border-dashed p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Businesses Registered Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Create your first business listing to publish products, showcase your services, and receive verified buyer inquiries.
            </p>
            <Link href="/my-businesses/new">
              <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">
                <PlusCircle className="w-4 h-4 mr-2" /> Register Your First Business
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.slice(0, 3).map((biz) => (
              <Card key={biz.id} className="bg-white border-slate-200 hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        biz.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : biz.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : biz.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {biz.status}
                    </span>
                    <span className="text-xs text-slate-400">{biz.city}</span>
                  </div>
                  <CardTitle className="text-lg mt-2 truncate">{biz.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs mt-1">
                    {biz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border-t pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      Views: <strong className="text-slate-800">{biz.view_count ?? biz.viewCount ?? 0}</strong>
                    </span>
                    <Link href={`/my-businesses/${biz.id}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Manage Business
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
