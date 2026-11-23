'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    const res = await updateProfile({
      fullName,
      phoneNumber,
      profileImage: profileImage || undefined,
    });

    setIsSaving(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update profile' });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal information and contact settings used across all buyer inquiries and businesses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Overview card */}
        <Card className="md:col-span-1 bg-white border-slate-200">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-slate-900 text-lg">{user.fullName}</h2>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <div className="mt-3 flex justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
                {user.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                {user.accountStatus}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t text-left text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Single Account (Buyer & Business)</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6">
                Joined on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Edit form */}
        <Card className="md:col-span-2 bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Edit Details</CardTitle>
            <CardDescription>
              Keep your contact information up-to-date for responses to your inquiries.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-10 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Email address cannot be changed directly.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
