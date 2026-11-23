import { productRepository, ProductRecord } from '../repositories/product.repository';
import { businessRepository } from '../repositories/business.repository';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ProductService {
  async createProduct(businessId: string, input: CreateProductInput): Promise<ProductRecord> {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      const err: any = new Error('Business not found');
      err.statusCode = 404;
      throw err;
    }

    const baseSlug = slugify(input.name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await productRepository.findBySlug(businessId, uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    return productRepository.createProduct({
      businessId,
      categoryId: input.categoryId,
      name: input.name,
      slug: uniqueSlug,
      description: input.description,
      price: input.price,
      currency: input.currency,
      status: input.status,
      isFeatured: input.isFeatured,
      images: input.images,
    });
  }

  async getBusinessProducts(businessId: string): Promise<ProductRecord[]> {
    return productRepository.findBusinessProducts(businessId);
  }

  async getProductById(id: string): Promise<ProductRecord> {
    const product = await productRepository.findById(id);
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ProductRecord> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await productRepository.updateProduct(id, input);
    return updated!;
  }

  async deleteProduct(id: string): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    await productRepository.deleteProduct(id);
  }

  async getFeaturedProducts(limit = 8): Promise<ProductRecord[]> {
    return productRepository.findFeatured(limit);
  }
}

export const productService = new ProductService();
