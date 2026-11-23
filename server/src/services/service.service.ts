import { serviceRepository, ServiceRecord } from '../repositories/service.repository';
import { businessRepository } from '../repositories/business.repository';
import { CreateServiceInput, UpdateServiceInput } from '../validators/service.validator';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ServiceService {
  async createService(businessId: string, input: CreateServiceInput): Promise<ServiceRecord> {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    const baseSlug = slugify(input.name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await serviceRepository.findBySlug(businessId, uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    return serviceRepository.createService({
      businessId,
      categoryId: input.categoryId,
      name: input.name,
      slug: uniqueSlug,
      description: input.description,
      pricingInfo: input.pricingInfo,
      status: input.status,
      isFeatured: input.isFeatured,
      images: input.images,
    });
  }

  async getBusinessServices(businessId: string): Promise<ServiceRecord[]> {
    return serviceRepository.findBusinessServices(businessId);
  }

  async getServiceById(id: string): Promise<ServiceRecord> {
    const service = await serviceRepository.findById(id);
    if (!service) {
      const err: any = new Error('Service not found');
      err.statusCode = 404;
      throw err;
    }
    return service;
  }

  async updateService(id: string, input: UpdateServiceInput): Promise<ServiceRecord> {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Service not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await serviceRepository.updateService(id, input);
    return updated!;
  }

  async deleteService(id: string): Promise<void> {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Service not found');
      err.statusCode = 404;
      throw err;
    }
    await serviceRepository.deleteService(id);
  }

  async getFeaturedServices(limit = 8): Promise<ServiceRecord[]> {
    return serviceRepository.findFeatured(limit);
  }
}

export const serviceService = new ServiceService();
