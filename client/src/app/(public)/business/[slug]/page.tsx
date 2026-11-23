'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { businessApi } from '@/features/businesses/api';
import { Business, Product, Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  Package,
  Wrench,
  Send,
  Loader2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ExtendedBusiness extends Business {
  products?: Product[];
  services?: Service[];
  category_name?: string;
}

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<ExtendedBusiness | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'about'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      businessApi.getBusinessBySlug(slug).then((res) => {
        if (res.success && res.data?.business) {
          setBusiness(res.data.business as ExtendedBusiness);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-sm text-slate-500">Loading business profile...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen py-24 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Business Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          The requested business profile is either pending review or does not exist.
        </p>
        <Link href="/search">
          <Button variant="outline">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const products = business.products || [];
  const services = business.services || [];
  const workingHours = business.workingHours || {};

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Cover Banner */}
      <div className="w-full h-52 md:h-64 bg-gradient-to-r from-slate-800 to-blue-900 relative">
        {business.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverImageUrl} alt="Cover" className="w-full h-full object-cover opacity-40" />
        )}
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-20 relative z-10">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white font-bold text-3xl flex items-center justify-center">
                  {business.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{business.name}</h1>
                {business.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                  {business.status}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{business.address}, {business.city}, {business.state} - {business.pincode}</span>
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href={`#inquiry-section`} className="w-full md:w-auto">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md gap-2">
                <Send className="w-4 h-4" /> Send Direct Inquiry
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Catalog and Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 border-b-2 transition ${
                  activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All Listings ({products.length + services.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 border-b-2 transition ${
                  activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`pb-3 border-b-2 transition ${
                  activeTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 border-b-2 transition ${
                  activeTab === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                About Company
              </button>
            </div>

            {/* About Section */}
            {(activeTab === 'all' || activeTab === 'about') && (
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">About {business.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {business.description}
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            {(activeTab === 'all' || activeTab === 'products') && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" /> Products Available ({products.length})
                </h3>
                {products.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
                    No products published by this business yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <Card key={p.id} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                            {p.images && p.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-10 h-10" />
                              </div>
                            )}
                            {p.price && (
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-bold">
                                ₹{p.price.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-bold truncate">{p.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">{p.description}</CardDescription>
                          </CardHeader>
                        </div>
                        <div className="p-4 pt-2 border-t flex justify-end">
                          <Link href="#inquiry-section">
                            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                              Inquire on this Product
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Services Grid */}
            {(activeTab === 'all' || activeTab === 'services') && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-purple-600" /> Services Offered ({services.length})
                </h3>
                {services.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
                    No services published by this business yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <Card key={s.id} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                            {s.images && s.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Wrench className="w-10 h-10" />
                              </div>
                            )}
                            {s.pricingInfo && (
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-medium">
                                {s.pricingInfo}
                              </div>
                            )}
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-bold truncate">{s.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">{s.description}</CardDescription>
                          </CardHeader>
                        </div>
                        <div className="p-4 pt-2 border-t flex justify-end">
                          <Link href="#inquiry-section">
                            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-purple-700 hover:bg-purple-50">
                              Inquire on this Service
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Contact, Hours, and Direct Inquiry Form */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <a href={`tel:${business.contactNumber}`} className="hover:text-blue-600 font-medium">
                    {business.contactNumber}
                  </a>
                </div>

                {business.whatsappNumber && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <a
                      href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-600 font-medium text-emerald-700"
                    >
                      WhatsApp: {business.whatsappNumber}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <a href={`mailto:${business.email}`} className="hover:text-blue-600 truncate">
                    {business.email}
                  </a>
                </div>

                {business.websiteUrl && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 flex items-center gap-1 truncate text-blue-600"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 divide-y divide-slate-100">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="py-2 flex items-center justify-between">
                    <span className="capitalize font-medium text-slate-700">{day}</span>
                    <span className="text-slate-500">{hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Direct Inquiry Target Callout */}
            <div id="inquiry-section" className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-1">
                <Send className="w-4 h-4 text-blue-600" /> Send Direct Inquiry
              </div>
              <p className="text-xs text-blue-700 mb-4">
                <strong>Strict Privacy Rule:</strong> Your message will be sent exclusively to <strong>{business.name}</strong>. It will not be broadcast to competitors.
              </p>

              {/* Inquiry form placeholder - full management wired in Phase 7 */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 bg-white outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 bg-white outline-none"
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 bg-white outline-none"
                />
                <textarea
                  rows={3}
                  placeholder={`Hi ${business.name}, I am interested in your services and would like to request quotation details...`}
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 bg-white outline-none"
                />
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold" onClick={() => alert('Full inquiry messaging is configured in Phase 7!')}>
                  Submit Inquiry Directly to {business.name}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
