import { productRepository, ProductRepository } from "../repositories/product.repository";
import { Product, CreateProductDto } from "../models/product.model";

export class ProductService {
  constructor(private readonly repo: ProductRepository = productRepository) {}

  async getAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Product | null> {
    return this.repo.findById(id);
  }

  async getByCode(code: string): Promise<Product | null> {
    return this.repo.findByCode(code);
  }

  async create(data: CreateProductDto): Promise<Product> {
    // Check for duplicate code
    const existing = await this.repo.findByCode(data.code);
    if (existing) {
      throw new Error(`Mã sản phẩm '${data.code}' đã tồn tại`);
    }
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<CreateProductDto>): Promise<Product | null> {
    return this.repo.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const productService = new ProductService();
