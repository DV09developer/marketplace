'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productApi } from '@/features/products/api';
import { serviceApi } from '@/features/services/api';
import { categoryApi } from '@/features/categories/api';
import { Product, Service, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Search,
  Building2,
  Package,
  Wrench,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Utensils,
  Code2,
  Tv,
  Stethoscope,
  Building,
  Palette,
  Car,
  Factory,
  GraduationCap,
  Sparkles,
  Scale,
  FolderOpen,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-6 h-6 text-amber-600" />,
  Code2: <Code2 className="w-6 h-6 text-blue-600" />,
  Tv: <Tv className="w-6 h-6 text-purple-600" />,
  Stethoscope: <Stethoscope className="w-6 h-6 text-red-600" />,
  Building: <Building className="w-6 h-6 text-slate-700" />,
  Palette: <Palette className="w-6 h-6 text-pink-600" />,
  Car: <Car className="w-6 h-6 text-emerald-600" />,
  Wrench: <Wrench className="w-6 h-6 text-orange-600" />,
  Factory: <Factory className="w-6 h-6 text-indigo-600" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-cyan-600" />,
  Sparkles: <Sparkles className="w-6 h-6 text-fuchsia-600" />,
  Scale: <Scale className="w-6 h-6 text-teal-600" />,
};

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    Promise.all([
      categoryApi.getCategories(),
      productApi.getFeatured(4),
      serviceApi.getFeatured(4),
    ]).then(([catRes, prodRes, servRes]) => {
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories.slice(0, 8));
      }
      if (prodRes.success && prodRes.data?.products) {
        setFeaturedProducts(prodRes.data.products);
      }
      if (servRes.success && servRes.data?.services) {
        setFeaturedServices(servRes.data.services);
      }
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" /> Direct B2B & Local Business Discovery
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Find Trusted Local Businesses, Products & Services
          </h1>
          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Search verified companies, compare offerings, and submit direct, confidential inquiries straight to the provider.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-3 text-left">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for? (e.g. IT services, electronics, restaurants)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="w-full md:w-64 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City or Location"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-semibold shadow-md">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-14 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular Business Categories</h2>
              <p className="text-xs text-slate-500 mt-1">Browse trusted providers across major sectors</p>
            </div>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                View All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/search?categoryId=${c.id}`}>
                <div className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-center transition group cursor-pointer h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    {iconMap[c.iconName || ''] || <FolderOpen className="w-6 h-6 text-blue-600" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                    {c.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-14 bg-slate-50 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-xs text-slate-500 mt-1">Direct from approved manufacturers and local merchants</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                View More Products <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-sm text-slate-500">
              No featured products listed yet. Business owners can add products from their dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <Card key={p.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                      {p.images && p.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      {p.price && (
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-bold">
                          ₹{p.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      {p.businessName && (
                        <p className="text-[11px] font-semibold text-blue-600 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 flex-shrink-0" /> {p.businessName}
                        </p>
                      )}
                      <CardTitle className="text-sm font-bold truncate mt-1">{p.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">{p.description}</CardDescription>
                    </CardHeader>
                  </div>
                  <CardFooter className="p-4 pt-2 border-t flex items-center justify-between">
                    {p.city ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" /> {p.city}
                      </span>
                    ) : <span />}
                    <Link href={`/search?keyword=${encodeURIComponent(p.name)}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-blue-600">
                        Inquire
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-14 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Professional Services</h2>
              <p className="text-xs text-slate-500 mt-1">Maintenance, repairs, IT solutions, and consulting</p>
            </div>
            <Link href="/services">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                View More Services <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {featuredServices.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
              No featured services listed yet. Business owners can add services from their dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredServices.map((s) => (
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
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-xs font-medium">
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
                      <CardTitle className="text-sm font-bold truncate mt-1">{s.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">{s.description}</CardDescription>
                    </CardHeader>
                  </div>
                  <CardFooter className="p-4 pt-2 border-t flex items-center justify-between">
                    {s.city ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" /> {s.city}
                      </span>
                    ) : <span />}
                    <Link href={`/search?keyword=${encodeURIComponent(s.name)}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-purple-600">
                        Inquire
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Business Registration CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-extrabold mb-3">Grow Your Business With Us</h2>
          <p className="text-blue-100 mb-6 text-base">
            Create your business profile, showcase your products and services to thousands of buyers, and receive verified, direct inquiries.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 shadow-lg">
              Register Your Business Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-slate-900 text-slate-400 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 Marketplace Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/contact" className="hover:text-white transition">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
