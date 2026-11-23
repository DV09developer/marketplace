'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { businessApi } from '@/features/businesses/api';
import { Business } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, PlusCircle, ExternalLink, MapPin, Phone, Mail, Loader2 } from 'lucide-react';

export default function MyBusinessesPage() {
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
        <p className="text-slate-500 text-sm">Loading your businesses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Businesses</h1>
          <p className="text-sm text-slate-500">
            Create and oversee your business listings, products, services, and inquiries.
          </p>
        </div>
        <Link href="/my-businesses/new">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow font-semibold">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Business
          </Button>
        </Link>
      </div>

      {businesses.length === 0 ? (
        <Card className="bg-white border-slate-200 border-dashed p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Businesses Listed Yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            You haven&apos;t added any businesses yet. Set up your business profile to get discovered by local customers and receive direct inquiries.
          </p>
          <Link href="/my-businesses/new">
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 font-semibold">
              <PlusCircle className="w-4 h-4 mr-2" /> Create Business Profile
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <Card key={biz.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
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
                    {biz.status === 'pending' ? 'Pending Review' : biz.status}
                  </span>

                  {biz.isVerified && (
                    <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                </div>

                <CardTitle className="text-lg mt-2 truncate">{biz.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1">
                  {biz.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between pt-0 text-xs text-slate-600 space-y-2">
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{biz.city}, {biz.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 truncate">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{biz.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 truncate">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{biz.email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link href={`/business/${biz.slug}`} target="_blank" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-xs">
                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                  </Link>

                  <Link href={`/my-businesses/${biz.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs font-semibold">
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
  );
}
