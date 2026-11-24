'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi } from '@/features/products/api';
import { categoryApi } from '@/features/categories/api';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Package, Search, MapPin, Building2, Tag, Loader2, ArrowRight } from 'lucide-react';
import { InquiryDialog } from '@/components/marketplace/inquiry-dialog';

export default function PublicProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      productApi.getFeatured(24),
      categoryApi.getCategories(),
    ]).then(([prodRes, catRes]) => {
      if (prodRes.success && prodRes.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
      }
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" /> Direct Business Catalogs
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Products</h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse verified commercial and retail products directly from approved manufacturers and local businesses.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products, keywords, or cities..."
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

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-slate-500">Loading published products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">No Products Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              There are no published products matching your selected search filter yet.
            </p>
            <Link href="/my-businesses/new">
              <Button className="bg-blue-600 hover:bg-blue-700">List Your Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
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
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-md text-xs font-bold">
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
                    <CardTitle className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{p.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2 border-t flex items-center justify-between gap-2">
                  {p.city ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" /> {p.city}
                    </span>
                  ) : <span />}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProductForInquiry(p)}
                    className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Send Inquiry
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Direct Inquiry Dialog */}
        {selectedProductForInquiry && (
          <InquiryDialog
            isOpen={!!selectedProductForInquiry}
            onClose={() => setSelectedProductForInquiry(null)}
            businessId={selectedProductForInquiry.businessId}
            businessName={selectedProductForInquiry.businessName || 'Business'}
            productId={selectedProductForInquiry.id}
            productName={selectedProductForInquiry.name}
          />
        )}
      </div>
    </div>
  );
}
