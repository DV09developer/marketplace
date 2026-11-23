'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { serviceApi } from '@/features/services/api';
import { categoryApi } from '@/features/categories/api';
import { Service, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wrench, Search, MapPin, Building2, Loader2, ArrowRight } from 'lucide-react';

export default function PublicServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      serviceApi.getFeatured(24),
      categoryApi.getCategories(),
    ]).then(([servRes, catRes]) => {
      if (servRes.success && servRes.data?.services) {
        setServices(servRes.data.services);
      }
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
      }
      setLoading(false);
    });
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.categoryId === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" /> Professional Business Services
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Services</h1>
          <p className="text-slate-600 text-sm mt-1">
            Find vetted local contractors, maintenance experts, IT consulting, and corporate services.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search services, skills, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-sm text-slate-500">Loading published services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">No Services Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              There are no published services matching your search criteria yet.
            </p>
            <Link href="/my-businesses/new">
              <Button className="bg-blue-600 hover:bg-blue-700">List Your Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredServices.map((s) => (
              <Card key={s.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                    {s.images && s.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Wrench className="w-12 h-12" />
                      </div>
                    )}
                    {s.pricingInfo && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-md text-xs font-medium">
                        {s.pricingInfo}
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-4 pb-2">
                    {s.businessName && (
                      <p className="text-[11px] font-semibold text-purple-600 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" /> {s.businessName}
                      </p>
                    )}
                    <CardTitle className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{s.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {s.description}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2 border-t flex items-center justify-between gap-2">
                  {s.city ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" /> {s.city}
                    </span>
                  ) : <span />}

                  <Link href={`/search?keyword=${encodeURIComponent(s.name)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-purple-600 hover:text-purple-700">
                      Send Inquiry
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
