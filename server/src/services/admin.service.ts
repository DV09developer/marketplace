import { adminRepository, PlatformMetrics } from '../repositories/admin.repository';
import { businessRepository } from '../repositories/business.repository';
import { categoryRepository } from '../repositories/category.repository';
import { CreateCategoryInput, UpdateCategoryInput, UpdateUserStatusInput } from '../validators/admin.validator';
import { UpdateBusinessStatusInput } from '../validators/business.validator';

export class AdminService {
  async getMetrics(): Promise<PlatformMetrics> {
    return adminRepository.getMetrics();
  }

  async getBusinesses(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return adminRepository.getBusinesses(options);
  }

  async updateBusinessStatus(businessId: string, input: UpdateBusinessStatusInput) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await businessRepository.updateStatus(businessId, input.status, input.statusReason);
    console.log(`[Admin Moderation] Business "${business.name}" status changed to ${input.status}`);
    return updated;
  }

  async getUsers(options: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return adminRepository.getUsers(options);
  }

  async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    return adminRepository.updateUser(userId, input);
  }

  async getInquiries(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return adminRepository.getInquiries(options);
  }

  async getCategories() {
    return adminRepository.getCategories();
  }

  async createCategory(input: CreateCategoryInput) {
    let slug = input.slug?.trim() || '';
    if (!slug) {
      slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return adminRepository.createCategory({
      name: input.name,
      slug,
      description: input.description,
      iconName: input.iconName,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    });
  }

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(categoryId);
    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    return adminRepository.updateCategory(categoryId, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      iconName: input.iconName,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    });
  }

  async deleteCategory(categoryId: string) {
    return adminRepository.deleteCategory(categoryId);
  }
}

export const adminService = new AdminService();
