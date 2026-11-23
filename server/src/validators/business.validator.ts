import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must be under 200 characters'),
  description: z
    .string({ required_error: 'Business description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long'),
  email: z
    .string({ required_error: 'Business email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  contactNumber: z
    .string({ required_error: 'Contact number is required' })
    .trim()
    .regex(/^[0-9+\s\-()]{7,25}$/, 'Invalid phone number format'),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\s\-()]{7,25}$/, 'Invalid WhatsApp number format')
    .optional()
    .or(z.literal('')),
  primaryCategoryId: z.string().uuid('Invalid category ID').optional(),
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(5, 'Address must be at least 5 characters long'),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City name is too short')
    .max(100, 'City name is too long'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State name is too short')
    .max(100, 'State name is too long'),
  pincode: z
    .string({ required_error: 'Pincode is required' })
    .trim()
    .min(3, 'Pincode must be at least 3 characters')
    .max(20, 'Pincode is too long'),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  workingHours: z.record(z.string()).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const updateBusinessStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended'], {
    required_error: 'Status is required',
  }),
  statusReason: z.string().optional(),
});

export const addBusinessMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['manager', 'staff'], {
    required_error: 'Role must be manager or staff',
  }),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type UpdateBusinessStatusInput = z.infer<typeof updateBusinessStatusSchema>;
export type AddBusinessMemberInput = z.infer<typeof addBusinessMemberSchema>;
