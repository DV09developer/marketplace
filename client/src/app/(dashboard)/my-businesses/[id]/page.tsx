'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context';
import { businessApi } from '@/features/businesses/api';
import { productApi } from '@/features/products/api';
import { serviceApi } from '@/features/services/api';
import { categoryApi } from '@/features/categories/api';
import { inquiryApi } from '@/features/inquiries/api';
import { Business, BusinessMember, Product, Service, Category, Inquiry } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Building2,
  ArrowLeft,
  ExternalLink,
  Package,
  Wrench,
  Inbox,
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  PlusCircle,
  Edit,
  Tag,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  Filter,
  Search,
} from 'lucide-react';

export default function BusinessConsolePage() {
  const params = useParams();
  const businessId = params.id as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'services' | 'inquiries' | 'settings' | 'team'>('overview');
  const [loading, setLoading] = useState(true);

  // Inquiry controls
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(null);

  // Settings form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Team invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'staff'>('staff');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Service form
  const [showAddService, setShowAddService] = useState(false);
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState('');
  const [sPricing, setSPricing] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sImage, setSImage] = useState('');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  const fetchBusinessData = async () => {
    try {
      const [bizRes, membersRes, prodsRes, servsRes, catsRes, inqRes] = await Promise.all([
        businessApi.getBusinessById(businessId),
        businessApi.getMembers(businessId),
        productApi.getBusinessProducts(businessId),
        serviceApi.getBusinessServices(businessId),
        categoryApi.getCategories(),
        inquiryApi.getBusinessInquiries(businessId),
      ]);

      if (bizRes.success && bizRes.data?.business) {
        const b = bizRes.data.business;
        setBusiness(b);
        setName(b.name);
        setDescription(b.description);
        setContactNumber(b.contactNumber);
        setWhatsappNumber(b.whatsappNumber || '');
        setWebsiteUrl(b.websiteUrl || '');
      }

      if (membersRes.success && membersRes.data?.members) {
        setMembers(membersRes.data.members);
      }
      if (prodsRes.success && prodsRes.data?.products) {
        setProducts(prodsRes.data.products);
      }
      if (servsRes.success && servsRes.data?.services) {
        setServices(servsRes.data.services);
      }
      if (inqRes.success && inqRes.data?.inquiries) {
        setInquiries(inqRes.data.inquiries);
      }
      if (catsRes.success && catsRes.data?.categories) {
        setCategories(catsRes.data.categories);
        if (catsRes.data.categories.length > 0) {
          setPCategory(catsRes.data.categories[0].id);
          setSCategory(catsRes.data.categories[0].id);
        }
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: any) => {
    setUpdatingInquiryId(inquiryId);
    const res = await inquiryApi.updateStatus(businessId, inquiryId, status);
    setUpdatingInquiryId(null);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
      );
    } else {
      alert(res.message || 'Failed to update inquiry status');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId, user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    setIsUpdating(true);

    const res = await businessApi.updateBusiness(businessId, {
      name,
      description,
      contactNumber,
      whatsappNumber: whatsappNumber || undefined,
      websiteUrl: websiteUrl || undefined,
    });

    setIsUpdating(false);
    if (res.success && res.data?.business) {
      setBusiness(res.data.business);
      setUpdateMsg({ type: 'success', text: 'Business details updated successfully!' });
    } else {
      setUpdateMsg({ type: 'error', text: res.message || 'Failed to update business.' });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg(null);
    setIsInviting(true);

    const res = await businessApi.addMember(businessId, inviteEmail, inviteRole);
    setIsInviting(false);

    if (res.success) {
      setInviteMsg({ type: 'success', text: 'Team member added successfully!' });
      setInviteEmail('');
      fetchBusinessData();
    } else {
      setInviteMsg({ type: 'error', text: res.message || 'Failed to add member' });
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    await businessApi.removeMember(businessId, targetUserId);
    fetchBusinessData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);

    const res = await productApi.createProduct(businessId, {
      name: pName,
      description: pDesc,
      categoryId: pCategory || undefined,
      price: pPrice ? parseFloat(pPrice) : undefined,
      images: pImage ? [pImage] : [],
      status: 'published',
    });

    setIsSubmittingProduct(false);
    if (res.success) {
      setShowAddProduct(false);
      setPName('');
      setPPrice('');
      setPDesc('');
      setPImage('');
      fetchBusinessData();
    } else {
      alert(res.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await productApi.deleteProduct(id);
    fetchBusinessData();
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingService(true);

    const res = await serviceApi.createService(businessId, {
      name: sName,
      description: sDesc,
      categoryId: sCategory || undefined,
      pricingInfo: sPricing || undefined,
      images: sImage ? [sImage] : [],
      status: 'published',
    });

    setIsSubmittingService(false);
    if (res.success) {
      setShowAddService(false);
      setSName('');
      setSPricing('');
      setSDesc('');
      setSImage('');
      fetchBusinessData();
    } else {
      alert(res.message || 'Failed to add service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await serviceApi.deleteService(id);
    fetchBusinessData();
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading business management console...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Business not found</h2>
        <Link href="/my-businesses" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to My Businesses
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/my-businesses" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Businesses
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                business.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : business.status === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {business.status === 'pending' ? 'Pending Review' : business.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {business.address}, {business.city}, {business.state} - {business.pincode}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/business/${business.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" /> Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" /> Inquiries ({inquiries.length})
          {inquiries.filter((i) => i.status === 'new').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
              {inquiries.filter((i) => i.status === 'new').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Edit Details
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'team'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Team ({members.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {business.status === 'pending' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div className="text-sm">
                <p className="font-semibold">Listing under review</p>
                <p className="mt-1 text-xs text-amber-700">
                  Your business profile has been submitted and is awaiting admin approval. While in review, publish your products and services so they go live immediately once approved.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Profile Views</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{business.view_count ?? business.viewCount ?? 0}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Products</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Services</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{services.length}</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Wrench className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 cursor-pointer hover:border-blue-300 transition" onClick={() => setActiveTab('inquiries')}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Inquiries</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900">{inquiries.length}</p>
                    {inquiries.filter((i) => i.status === 'new').length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        {inquiries.filter((i) => i.status === 'new').length} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Inbox className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" /> Products Catalog
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage business products with multiple images and transparent pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => setActiveTab('products')}>
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Manage Products ({products.length})
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" /> Services Catalog
                </CardTitle>
                <CardDescription className="text-xs">
                  List custom services and maintenance contracts provided by your company.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-xs bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab('services')}>
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Manage Services ({services.length})
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-600" /> Customer Inquiries
                </CardTitle>
                <CardDescription className="text-xs">
                  Direct inquiries received exclusively from prospective buyers and clients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-xs bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab('inquiries')}>
                  <Inbox className="w-3.5 h-3.5 mr-1.5" /> View Inquiries ({inquiries.length})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Products Catalog</h2>
              <p className="text-xs text-slate-500">Showcase products for buyer inquiries.</p>
            </div>
            <Button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> {showAddProduct ? 'Cancel' : 'Add Product'}
            </Button>
          </div>

          {/* Add Product Form */}
          {showAddProduct && (
            <Card className="bg-white border-emerald-200 shadow-sm">
              <CardHeader className="bg-emerald-50/50 pb-3">
                <CardTitle className="text-base text-emerald-900">Add New Product</CardTitle>
                <CardDescription className="text-xs">Enter product details, pricing, and images</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateProduct}>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pName">Product Name *</Label>
                      <Input
                        id="pName"
                        placeholder="e.g. Industrial Inverter 5kVA"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pCat">Category</Label>
                      <select
                        id="pCat"
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-slate-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pPrice">Price (₹ INR, Optional)</Label>
                      <Input
                        id="pPrice"
                        type="number"
                        placeholder="e.g. 14999"
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pImage">Product Image URL</Label>
                      <Input
                        id="pImage"
                        type="url"
                        placeholder="https://example.com/product.jpg"
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pDesc">Product Description *</Label>
                    <textarea
                      id="pDesc"
                      rows={3}
                      placeholder="Specifications, features, warranty, and availability..."
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      required
                      className="w-full p-3 rounded-md border border-input bg-background text-sm text-slate-800"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-3">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmittingProduct} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    {isSubmittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Product'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Product Cards List */}
          {products.length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed p-8 text-center">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Products Published</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Add your business products to start receiving customer inquiries.</p>
              <Button size="sm" onClick={() => setShowAddProduct(true)} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add First Product
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <Card key={p.id} className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    {p.images && p.images.length > 0 && (
                      <div className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                      {p.price && (
                        <span className="font-bold text-slate-900 text-sm flex items-center">
                          ₹{p.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-sm font-bold truncate mt-2">{p.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{p.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Services Catalog</h2>
              <p className="text-xs text-slate-500">Showcase specialized services and solutions.</p>
            </div>
            <Button
              onClick={() => setShowAddService(!showAddService)}
              className="bg-purple-600 hover:bg-purple-700 text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> {showAddService ? 'Cancel' : 'Add Service'}
            </Button>
          </div>

          {/* Add Service Form */}
          {showAddService && (
            <Card className="bg-white border-purple-200 shadow-sm">
              <CardHeader className="bg-purple-50/50 pb-3">
                <CardTitle className="text-base text-purple-900">Add New Service</CardTitle>
                <CardDescription className="text-xs">Enter service details, pricing terms, and images</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateService}>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sName">Service Name *</Label>
                      <Input
                        id="sName"
                        placeholder="e.g. Annual Maintenance Contract (AMC)"
                        value={sName}
                        onChange={(e) => setSName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sCat">Category</Label>
                      <select
                        id="sCat"
                        value={sCategory}
                        onChange={(e) => setSCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-slate-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sPricing">Pricing Information (Optional)</Label>
                      <Input
                        id="sPricing"
                        placeholder="e.g. Starting from ₹2,500 / visit"
                        value={sPricing}
                        onChange={(e) => setSPricing(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sImage">Service Image URL</Label>
                      <Input
                        id="sImage"
                        type="url"
                        placeholder="https://example.com/service.jpg"
                        value={sImage}
                        onChange={(e) => setSImage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sDesc">Service Description *</Label>
                    <textarea
                      id="sDesc"
                      rows={3}
                      placeholder="Scope of work, turnaround time, inclusions, and client requirements..."
                      value={sDesc}
                      onChange={(e) => setSDesc(e.target.value)}
                      required
                      className="w-full p-3 rounded-md border border-input bg-background text-sm text-slate-800"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-3">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddService(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmittingService} size="sm" className="bg-purple-600 hover:bg-purple-700">
                    {isSubmittingService ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Service'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Service Cards List */}
          {services.length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed p-8 text-center">
              <Wrench className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Services Published</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">List your specialized business services and solutions.</p>
              <Button size="sm" onClick={() => setShowAddService(true)} className="bg-purple-600 hover:bg-purple-700 text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add First Service
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((s) => (
                <Card key={s.id} className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    {s.images && s.images.length > 0 && (
                      <div className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {s.status}
                      </span>
                      {s.pricingInfo && (
                        <span className="font-medium text-slate-700 text-xs truncate max-w-[150px]">
                          {s.pricingInfo}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-sm font-bold truncate mt-2">{s.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{s.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(s.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Direct Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Direct Customer Inquiries</h2>
              <p className="text-xs text-slate-500">
                Inquiries sent exclusively to <strong className="text-blue-600">{business.name}</strong> from your profile and product listings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status Filter:</span>
              <select
                value={inquiryFilterStatus}
                onChange={(e) => setInquiryFilterStatus(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none"
              >
                <option value="all">All ({inquiries.length})</option>
                <option value="new">New ({inquiries.filter((i) => i.status === 'new').length})</option>
                <option value="contacted">Contacted ({inquiries.filter((i) => i.status === 'contacted').length})</option>
                <option value="in_progress">In Progress ({inquiries.filter((i) => i.status === 'in_progress').length})</option>
                <option value="completed">Completed ({inquiries.filter((i) => i.status === 'completed').length})</option>
                <option value="cancelled">Cancelled ({inquiries.filter((i) => i.status === 'cancelled').length})</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">New Leads</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {inquiries.filter((i) => i.status === 'new').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Contacted</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {inquiries.filter((i) => i.status === 'contacted').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">In Progress</p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {inquiries.filter((i) => i.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Completed</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {inquiries.filter((i) => i.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search inquiries by customer name, email, phone, or subject..."
              value={inquirySearch}
              onChange={(e) => setInquirySearch(e.target.value)}
              className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm"
            />
          </div>

          {/* Inquiries List */}
          {(() => {
            const filteredInquiries = inquiries.filter((inq) => {
              const matchesStatus =
                inquiryFilterStatus === 'all' || inq.status === inquiryFilterStatus;
              const matchesSearch =
                !inquirySearch ||
                (inq.customer_name || inq.customerName || '')
                  .toLowerCase()
                  .includes(inquirySearch.toLowerCase()) ||
                (inq.customer_email || inq.customerEmail || '')
                  .toLowerCase()
                  .includes(inquirySearch.toLowerCase()) ||
                (inq.customer_phone || inq.customerPhone || '')
                  .toLowerCase()
                  .includes(inquirySearch.toLowerCase()) ||
                inq.subject.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                inq.message.toLowerCase().includes(inquirySearch.toLowerCase());
              return matchesStatus && matchesSearch;
            });

            if (filteredInquiries.length === 0) {
              return (
                <Card className="bg-white border-slate-200 border-dashed p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No Inquiries Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {inquiries.length === 0
                      ? 'No inquiries have been submitted to this business yet. They will appear here in real-time as customers reach out.'
                      : 'No inquiries match the current filter or search criteria.'}
                  </p>
                </Card>
              );
            }

            return (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const custName = inq.customer_name || inq.customerName || 'Anonymous';
                  const custEmail = inq.customer_email || inq.customerEmail || '';
                  const custPhone = inq.customer_phone || inq.customerPhone || '';
                  const itemBadge = inq.product_name || inq.service_name;
                  const dateStr = inq.created_at || inq.createdAt;

                  const statusColors: Record<string, string> = {
                    new: 'bg-blue-100 text-blue-800 border-blue-200',
                    contacted: 'bg-purple-100 text-purple-800 border-purple-200',
                    in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
                    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <Card key={inq.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{custName}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  statusColors[inq.status] || 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {inq.status.replace('_', ' ')}
                              </span>
                              {itemBadge && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-slate-400" />
                                  Item: {itemBadge}
                                </span>
                              )}
                            </div>
                            {dateStr && (
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Received: {new Date(dateStr).toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Quick Status Updater */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                            <select
                              value={inq.status}
                              disabled={updatingInquiryId === inq.id}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {updatingInquiryId === inq.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                          </div>
                        </div>

                        {/* Subject & Message */}
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-700">{inq.subject}</p>
                          <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                            {inq.message}
                          </div>
                        </div>

                        {/* Customer Actions & Contact Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-4 flex-wrap text-slate-600">
                            {custPhone && (
                              <a
                                href={`tel:${custPhone}`}
                                className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <Phone className="w-3.5 h-3.5" /> {custPhone}
                              </a>
                            )}
                            {custEmail && (
                              <a
                                href={`mailto:${custEmail}?subject=${encodeURIComponent(
                                  `Re: ${inq.subject}`
                                )}`}
                                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:underline"
                              >
                                <Mail className="w-3.5 h-3.5" /> {custEmail}
                              </a>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Direct Inquiry Guarantee • Exclusive to this business
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <Card className="bg-white border-slate-200 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg">Update Business Information</CardTitle>
            <CardDescription className="text-xs">
              Make changes to your business details, contacts, and public profile.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              {updateMsg && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                    updateMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {updateMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{updateMsg.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bName">Business Name</Label>
                <Input
                  id="bName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bDesc">Description</Label>
                <textarea
                  id="bDesc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 rounded-md border border-input bg-background text-sm text-slate-800 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bPhone">Contact Phone</Label>
                  <Input
                    id="bPhone"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bWhatsApp">WhatsApp Number</Label>
                  <Input
                    id="bWhatsApp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bWeb">Website URL</Label>
                <Input
                  id="bWeb"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Tab 5: Team Members */}
      {activeTab === 'team' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Add Team Member</CardTitle>
              <CardDescription className="text-xs">
                Authorize additional registered users to manage this business, products, and inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inviteMsg && (
                <div
                  className={`p-3 rounded-lg text-sm mb-4 flex items-start gap-2 ${
                    inviteMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {inviteMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{inviteMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Registered user's email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full sm:w-40">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-slate-800 outline-none"
                  >
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <Button type="submit" disabled={isInviting} className="bg-blue-600 hover:bg-blue-700">
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Authorized Team Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {members.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{m.full_name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase">
                        {m.role}
                      </span>
                      {m.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
