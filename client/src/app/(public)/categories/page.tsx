'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoryApi } from '@/features/categories/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Utensils,
  Code2,
  Tv,
  Stethoscope,
  Building,
  Palette,
  Car,
  Wrench,
  Factory,
  GraduationCap,
  Sparkles,
  Scale,
  FolderOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-7 h-7 text-amber-600" />,
  Code2: <Code2 className="w-7 h-7 text-blue-600" />,
  Tv: <Tv className="w-7 h-7 text-purple-600" />,
  Stethoscope: <Stethoscope className="w-7 h-7 text-red-600" />,
  Building: <Building className="w-7 h-7 text-slate-700" />,
  Palette: <Palette className="w-7 h-7 text-pink-600" />,
  Car: <Car className="w-7 h-7 text-emerald-600" />,
  Wrench: <Wrench className="w-7 h-7 text-orange-600" />,
  Factory: <Factory className="w-7 h-7 text-indigo-600" />,
  GraduationCap: <GraduationCap className="w-7 h-7 text-cyan-600" />,
  Sparkles: <Sparkles className="w-7 h-7 text-fuchsia-600" />,
  Scale: <Scale className="w-7 h-7 text-teal-600" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      if (res.success && res.data?.categories) {
        setCategories(res.data.categories);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FolderOpen className="w-3.5 h-3.5" /> Marketplace Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Business Categories
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Discover verified companies, wholesale supplies, and local service providers grouped by industry.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-slate-500">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((c) => (
              <Link key={c.id} href={`/search?categoryId=${c.id}`}>
                <Card className="bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition h-full flex flex-col justify-between group cursor-pointer p-6">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                      {iconMap[c.iconName || ''] || <FolderOpen className="w-7 h-7 text-blue-600" />}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {c.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {c.description || 'Explore verified businesses and listings.'}
                    </CardDescription>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span>Browse listings</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
