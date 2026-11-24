'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context';
import { inquiryApi } from '@/features/inquiries/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface InquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  productId?: string;
  productName?: string;
  serviceId?: string;
  serviceName?: string;
}

export function InquiryDialog({
  isOpen,
  onClose,
  businessId,
  businessName,
  productId,
  productName,
  serviceId,
  serviceName,
}: InquiryDialogProps) {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [subject, setSubject] = useState(
    productName
      ? `Inquiry regarding ${productName}`
      : serviceName
      ? `Inquiry regarding ${serviceName}`
      : `General business inquiry for ${businessName}`
  );
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await inquiryApi.submitInquiry({
      businessId,
      productId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      message,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setError(res.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Send Direct Inquiry</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
              Recipient: <strong className="text-blue-600">{businessName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Inquiry Delivered Directly!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your inquiry was sent exclusively to <strong>{businessName}</strong>. A representative from the company will get in touch with you at <strong>{customerEmail}</strong>.
            </p>
            <div className="pt-2">
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 font-semibold px-8">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Privacy Rule Notice */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Confidential Direct Inquiry:</strong> This inquiry will be received exclusively by <strong>{businessName}</strong>. Your contact information is never shared with third parties.
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cName" className="text-xs">Your Name *</Label>
                <Input
                  id="cName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cPhone" className="text-xs">Your Phone Number *</Label>
                <Input
                  id="cPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cEmail" className="text-xs">Email Address *</Label>
              <Input
                id="cEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cSub" className="text-xs">Subject *</Label>
              <Input
                id="cSub"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cMsg" className="text-xs">Your Message / Requirements *</Label>
              <textarea
                id="cMsg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please share details such as quantity, specifications, timeline, or request a quote..."
                required
                className="w-full p-2.5 rounded-md border border-input bg-background text-xs text-slate-800 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Submit to {businessName}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
