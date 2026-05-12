import { query } from "../config/database";
import { Product, CreateProductDto } from "../models/product.model";

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const result = await query<Product>("SELECT * FROM products ORDER BY code");
    return result.rows;
  }

  async findById(id: number): Promise<Product | null> {
    const result = await query<Product>("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async findByCode(code: string): Promise<Product | null> {
    const result = await query<Product>("SELECT * FROM products WHERE code = $1", [code]);
    return result.rows[0] || null;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const result = await query<Product>(
      "INSERT INTO products (code, name, unit, specification) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.code, data.name, data.unit, data.specification || null]
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<CreateProductDto>): Promise<Product | null> {
    const result = await query<Product>(
      `UPDATE products SET 
        code = COALESCE($2, code),
        name = COALESCE($3, name),
        unit = COALESCE($4, unit),
        specification = COALESCE($5, specification),
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id, data.code || null, data.name || null, data.unit || null, data.specification || null]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query("DELETE FROM products WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const productRepository = new ProductRepository();
