'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await authApi.forgotPassword(email);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
              M
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Market<span className="text-blue-600">Place</span>
            </span>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Reset Your Password</CardTitle>
            <CardDescription className="text-slate-500">
              Enter your registered email address and we will generate a password reset link.
            </CardDescription>
          </CardHeader>

          {isSubmitted ? (
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="text-sm">
                  <p className="font-semibold">Reset instructions dispatched!</p>
                  <p className="mt-1">
                    If an account matches <strong>{email}</strong>, you will receive password reset instructions.
                  </p>
                </div>
              </div>
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm text-slate-600 hover:text-slate-900 gap-1.5 mt-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
