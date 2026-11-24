import { z } from 'zod';

export const createInquirySchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  productId: z.string().uuid('Invalid product ID').optional().or(z.literal('')),
  serviceId: z.string().uuid('Invalid service ID').optional().or(z.literal('')),
  customerName: z
    .string({ required_error: 'Your name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be under 120 characters'),
  customerEmail: z
    .string({ required_error: 'Your email address is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  customerPhone: z
    .string({ required_error: 'Your contact phone is required' })
    .trim()
    .regex(/^[0-9+\s\-()]{7,25}$/, 'Invalid phone number format'),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be under 200 characters'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message must be under 2000 characters'),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'completed', 'cancelled'], {
    required_error: 'Status is required',
  }),
  businessNotes: z.string().max(1000, 'Notes too long').optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
