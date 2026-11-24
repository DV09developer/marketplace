import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z.string().max(120).optional(),
  description: z.string().max(1000).optional(),
  iconName: z.string().max(60).optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending']).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const updateListingStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']),
  reason: z.string().max(500).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
