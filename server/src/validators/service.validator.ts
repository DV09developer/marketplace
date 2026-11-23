import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z
    .string({ required_error: 'Service name is required' })
    .trim()
    .min(2, 'Service name must be at least 2 characters')
    .max(200, 'Service name must be under 200 characters'),
  description: z
    .string({ required_error: 'Service description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters long'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  pricingInfo: z.string().max(200, 'Pricing info too long').optional().or(z.literal('')),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']).default('published'),
  isFeatured: z.boolean().default(false),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
