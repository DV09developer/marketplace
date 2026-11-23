import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name must be under 200 characters'),
  description: z
    .string({ required_error: 'Product description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters long'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  currency: z.string().default('INR'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']).default('published'),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
