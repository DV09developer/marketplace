import { businessRepository, BusinessRecord, BusinessMemberRecord } from '../repositories/business.repository';
import { categoryRepository } from '../repositories/category.repository';
import { userRepository } from '../repositories/user.repository';
import { productRepository } from '../repositories/product.repository';
import { serviceRepository } from '../repositories/service.repository';
import {
  CreateBusinessInput,
  UpdateBusinessInput,
  UpdateBusinessStatusInput,
  AddBusinessMemberInput,
} from '../validators/business.validator';

export function generateSlug(name: string, city: string): string {
  const combined = `${name}-${city}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return combined || 'business';
}

export class BusinessService {
  async createBusiness(ownerId: string, input: CreateBusinessInput): Promise<BusinessRecord> {
    // 1. Verify primary category exists if provided
    if (input.primaryCategoryId) {
      const category = await categoryRepository.findById(input.primaryCategoryId);
      if (!category) {
        const err: any = new Error('Selected category does not exist');
        err.statusCode = 400;
        throw err;
      }
    }

    // 2. Generate slug with collision avoidance
    const baseSlug = generateSlug(input.name, input.city);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await businessRepository.findBySlug(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    // 3. Create business in database (inserts into businesses, business_members as owner, business_categories)
    const business = await businessRepository.createBusiness({
      ownerId,
      name: input.name,
      slug: uniqueSlug,
      description: input.description,
      email: input.email,
      contactNumber: input.contactNumber,
      whatsappNumber: input.whatsappNumber,
      logoUrl: input.logoUrl,
      coverImageUrl: input.coverImageUrl,
      primaryCategoryId: input.primaryCategoryId,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      websiteUrl: input.websiteUrl,
      workingHours: input.workingHours,
    });

    return business;
  }

  async getMyBusinesses(userId: string): Promise<BusinessRecord[]> {
    return businessRepository.findUserBusinesses(userId);
  }

  async getBusinessById(
    businessId: string,
    requesterUserId?: string,
    isAdmin = false
  ): Promise<BusinessRecord> {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    // If business is not approved, only members or admins can view it
    if (business.status !== 'approved' && !isAdmin) {
      if (!requesterUserId) {
        const err: any = new Error('Business is pending approval and is not publicly visible');
        err.statusCode = 403;
        throw err;
      }
      const role = await businessRepository.checkUserMembership(business.id, requesterUserId);
      if (!role) {
        const err: any = new Error('Business is pending approval and is not publicly visible');
        err.statusCode = 403;
        throw err;
      }
    }

    return business;
  }

  async getBusinessBySlug(
    slug: string,
    requesterUserId?: string,
    isAdmin = false
  ): Promise<BusinessRecord> {
    const business = await businessRepository.findBySlug(slug);
    if (!business) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    if (business.status !== 'approved' && !isAdmin) {
      if (!requesterUserId) {
        const err: any = new Error('Business is pending approval and is not publicly visible');
        err.statusCode = 403;
        throw err;
      }
      const role = await businessRepository.checkUserMembership(business.id, requesterUserId);
      if (!role) {
        const err: any = new Error('Business is pending approval and is not publicly visible');
        err.statusCode = 403;
        throw err;
      }
    }

    // Increment public view count asynchronously
    businessRepository.incrementViewCount(business.id).catch(console.error);

    const [products, services] = await Promise.all([
      productRepository.findBusinessProducts(business.id),
      serviceRepository.findBusinessServices(business.id),
    ]);

    return {
      ...business,
      products: products.filter(p => isAdmin || requesterUserId ? true : p.status === 'published'),
      services: services.filter(s => isAdmin || requesterUserId ? true : s.status === 'published'),
    } as any;
  }

  async updateBusiness(
    businessId: string,
    input: UpdateBusinessInput
  ): Promise<BusinessRecord> {
    const existing = await businessRepository.findById(businessId);
    if (!existing) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    if (input.primaryCategoryId) {
      const category = await categoryRepository.findById(input.primaryCategoryId);
      if (!category) {
        const err: any = new Error('Selected category does not exist');
        err.statusCode = 400;
        throw err;
      }
    }

    const updated = await businessRepository.updateBusiness(businessId, input);
    if (!updated) {
      const err: any = new Error('Failed to update business');
      err.statusCode = 500;
      throw err;
    }
    return updated;
  }

  async updateStatus(
    businessId: string,
    input: UpdateBusinessStatusInput
  ): Promise<BusinessRecord> {
    const existing = await businessRepository.findById(businessId);
    if (!existing) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await businessRepository.updateStatus(
      businessId,
      input.status,
      input.statusReason
    );
    return updated!;
  }

  async listMembers(businessId: string): Promise<BusinessMemberRecord[]> {
    return businessRepository.listBusinessMembers(businessId);
  }

  async addMember(
    businessId: string,
    input: AddBusinessMemberInput
  ): Promise<BusinessMemberRecord> {
    const targetUser = await userRepository.findByEmail(input.email);
    if (!targetUser) {
      const err: any = new Error('No user account found with that email address');
      err.statusCode = 404;
      throw err;
    }

    return businessRepository.addBusinessMember(
      businessId,
      targetUser.id,
      input.role
    );
  }

  async removeMember(businessId: string, targetUserId: string): Promise<void> {
    const removed = await businessRepository.removeBusinessMember(businessId, targetUserId);
    if (!removed) {
      const err: any = new Error('Member not found or cannot remove business owner');
      err.statusCode = 400;
      throw err;
    }
  }
}

export const businessService = new BusinessService();
