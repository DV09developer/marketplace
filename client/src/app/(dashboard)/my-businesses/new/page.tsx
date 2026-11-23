'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context';
import { businessApi } from '@/features/businesses/api';
import { categoryApi } from '@/features/categories/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Building2, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewBusinessPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setEmail(user.email);
      if (user.phoneNumber) setContactNumber(user.phoneNumber);
    }

    categoryApi.getCategories().then((res) => {
      if (res.success && res.data?.categories) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setPrimaryCategoryId(res.data.categories[0].id);
        }
      }
    });
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await businessApi.createBusiness({
      name,
      description,
      email,
      contactNumber,
      whatsappNumber: whatsappNumber || undefined,
      primaryCategoryId: primaryCategoryId || undefined,
      address,
      city,
      state,
      pincode,
      websiteUrl: websiteUrl || undefined,
      logoUrl: logoUrl || undefined,
      coverImageUrl: coverImageUrl || undefined,
      workingHours: {
        monday: '09:00 - 18:00',
        tuesday: '09:00 - 18:00',
        wednesday: '09:00 - 18:00',
        thursday: '09:00 - 18:00',
        friday: '09:00 - 18:00',
        saturday: '09:00 - 14:00',
        sunday: 'Closed',
      },
    });

    setIsSubmitting(false);

    if (res.success && res.data?.business) {
      router.push(`/my-businesses/${res.data.business.id}`);
    } else {
      setError(res.message || 'Failed to create business listing.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/my-businesses" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Businesses
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Register a New Business</h1>
        <p className="text-sm text-slate-500">
          List your business on the marketplace to display your products, services, and receive inquiries.
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
          <CardDescription>
            Newly registered businesses are reviewed by admin moderators before appearing in public searches.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Apex Electricals & Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Primary Category *</Label>
              <select
                id="category"
                value={primaryCategoryId}
                onChange={(e) => setPrimaryCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-slate-800 outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Business / Description *</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe your business offerings, experience, and key capabilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 rounded-md border border-input bg-background text-sm text-slate-800 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Official Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Primary Contact Phone *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://mybusiness.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Street Address *</Label>
              <Input
                id="address"
                placeholder="Shop No. 12, Ground Floor, Commercial Complex"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Business Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Standard working hours (Mon-Fri 9:00 - 18:00, Sat 9:00 - 14:00) will be configured automatically and can be adjusted later.
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t pt-4">
            <Link href="/my-businesses">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Business for Approval'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
