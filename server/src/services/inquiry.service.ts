import { inquiryRepository, InquiryRecord } from '../repositories/inquiry.repository';
import { businessRepository } from '../repositories/business.repository';
import { productRepository } from '../repositories/product.repository';
import { serviceRepository } from '../repositories/service.repository';
import { CreateInquiryInput, UpdateInquiryStatusInput } from '../validators/inquiry.validator';

export class InquiryService {
  /**
   * STRICT BUSINESS RULE:
   * Inquiry is submitted ONLY to the specified target business.
   * Never broadcasted or shared with competitors.
   */
  async submitInquiry(
    input: CreateInquiryInput,
    userId?: string
  ): Promise<InquiryRecord> {
    const business = await businessRepository.findById(input.businessId);
    if (!business) {
      const err: any = new Error('Target business not found');
      err.statusCode = 404;
      throw err;
    }

    // Verify product/service belongs to this business if provided
    if (input.productId) {
      const product = await productRepository.findById(input.productId);
      if (!product || product.business_id !== input.businessId) {
        input.productId = undefined;
      }
    }

    if (input.serviceId) {
      const service = await serviceRepository.findById(input.serviceId);
      if (!service || service.business_id !== input.businessId) {
        input.serviceId = undefined;
      }
    }

    const inquiry = await inquiryRepository.createInquiry({
      businessId: input.businessId,
      userId,
      productId: input.productId || undefined,
      serviceId: input.serviceId || undefined,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      subject: input.subject,
      message: input.message,
    });

    console.log(`[Direct Inquiry] Dispatched strictly to business: "${business.name}" (${business.email}) from ${input.customerName}`);
    return inquiry;
  }

  async getBusinessInquiries(
    businessId: string,
    options: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    return inquiryRepository.findBusinessInquiries(businessId, options);
  }

  async getUserInquiries(
    userId: string,
    options: { page?: number; limit?: number }
  ) {
    return inquiryRepository.findUserInquiries(userId, options);
  }

  async getInquiryById(
    inquiryId: string,
    userId: string,
    userRole: string
  ): Promise<InquiryRecord> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      const err: any = new Error('Inquiry not found');
      err.statusCode = 404;
      throw err;
    }

    if (userRole === 'admin') {
      return inquiry;
    }

    if (inquiry.user_id === userId) {
      return inquiry;
    }

    const membershipRole = await businessRepository.checkUserMembership(inquiry.business_id, userId);
    if (membershipRole) {
      return inquiry;
    }

    const err: any = new Error('Forbidden: You are not authorized to view this inquiry');
    err.statusCode = 403;
    throw err;
  }

  async updateInquiryStatus(
    inquiryId: string,
    businessId: string,
    input: UpdateInquiryStatusInput
  ): Promise<InquiryRecord> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry || inquiry.business_id !== businessId) {
      const err: any = new Error('Inquiry not found for this business');
      err.statusCode = 404;
      throw err;
    }

    const updated = await inquiryRepository.updateStatus(
      inquiryId,
      input.status,
      input.businessNotes
    );
    return updated!;
  }
}

export const inquiryService = new InquiryService();
