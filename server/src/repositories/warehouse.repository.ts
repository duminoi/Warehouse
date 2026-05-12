import { query } from "../config/database";
import { Warehouse, CreateWarehouseDto } from "../models/warehouse.model";

export class WarehouseRepository {
  async findAll(): Promise<Warehouse[]> {
    const result = await query<Warehouse>("SELECT * FROM warehouses ORDER BY name");
    return result.rows;
  }

  async findById(id: number): Promise<Warehouse | null> {
    const result = await query<Warehouse>("SELECT * FROM warehouses WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const result = await query<Warehouse>(
      "INSERT INTO warehouses (name, location) VALUES ($1, $2) RETURNING *",
      [data.name, data.location || null]
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<CreateWarehouseDto>): Promise<Warehouse | null> {
    const result = await query<Warehouse>(
      `UPDATE warehouses SET 
        name = COALESCE($2, name),
        location = COALESCE($3, location),
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id, data.name || null, data.location || null]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query("DELETE FROM warehouses WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const warehouseRepository = new WarehouseRepository();
