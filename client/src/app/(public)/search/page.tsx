'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchApi } from '@/features/search/api';
import { categoryApi } from '@/features/categories/api';
import { SearchResultItem } from '@/features/search/types';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Search,
  MapPin,
  Building2,
  Package,
  Wrench,
  Loader2,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || 'all');
  const [type, setType] = useState<'all' | 'businesses' | 'products' | 'services'>(
    (searchParams.get('type') as any) || 'all'
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });

  const executeSearch = async () => {
    setLoading(true);
    const res = await searchApi.search({
      keyword: keyword || undefined,
      city: city || undefined,
      categoryId: categoryId !== 'all' ? categoryId : undefined,
      type: type !== 'all' ? type : undefined,
      page,
      limit: 12,
    });

    if (res.success && res.data?.items) {
      setResults(res.data.items);
      setMeta({
        total: res.meta?.total || res.data.items.length,
        totalPages: res.meta?.totalPages || 1,
      });
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      if (res.success && res.data?.categories) {
        setCategories(res.data.categories);
      }
    });
  }, []);

  useEffect(() => {
    executeSearch();
  }, [type, page, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    if (categoryId !== 'all') params.set('categoryId', categoryId);
    if (type !== 'all') params.set('type', type);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search Bar Header */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for? (Product, service, business...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City or location"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-semibold">
              Search
            </Button>
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 mt-4 pt-3 overflow-x-auto text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'businesses', label: 'Businesses' },
              { id: 'products', label: 'Products' },
              { id: 'services', label: 'Services' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  type === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            Found <strong className="text-slate-900">{meta.total}</strong> results
            {keyword && <span> for &ldquo;{keyword}&rdquo;</span>}
            {city && <span> in &ldquo;{city}&rdquo;</span>}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-slate-500">Searching marketplace listings...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">No Results Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Try adjusting your search query, selecting a broader category, or clearing the city filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setKeyword('');
                setCity('');
                setCategoryId('all');
                setType('all');
                setPage(1);
                router.push('/search');
              }}
            >
              Reset Search Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((item) => (
              <Card key={`${item.type}-${item.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Media / Header banner */}
                  <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        {item.type === 'business' ? <Building2 className="w-12 h-12" /> : item.type === 'product' ? <Package className="w-12 h-12" /> : <Wrench className="w-12 h-12" />}
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                          item.type === 'business'
                            ? 'bg-blue-600 text-white'
                            : item.type === 'product'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {item.price && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-bold">
                        ₹{item.price.toLocaleString()}
                      </div>
                    )}
                    {item.pricingInfo && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-medium truncate max-w-[180px]">
                        {item.pricingInfo}
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-4 pb-2">
                    {item.businessName && item.type !== 'business' && (
                      <p className="text-[11px] font-semibold text-blue-600 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" /> {item.businessName}
                      </p>
                    )}
                    <CardTitle className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2 border-t flex items-center justify-between gap-2">
                  {item.city ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {item.city}
                    </span>
                  ) : <span />}

                  <Link href={`/business/${item.type === 'business' ? item.slug : item.businessSlug || ''}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700">
                      {item.type === 'business' ? 'View Profile' : 'Send Inquiry'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="gap-1"
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
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading search engine...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
