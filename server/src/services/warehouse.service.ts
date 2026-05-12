import { warehouseRepository, WarehouseRepository } from "../repositories/warehouse.repository";
import { Warehouse, CreateWarehouseDto } from "../models/warehouse.model";

export class WarehouseService {
  constructor(private readonly repo: WarehouseRepository = warehouseRepository) {}

  async getAll(): Promise<Warehouse[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Warehouse | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<CreateWarehouseDto>): Promise<Warehouse | null> {
    return this.repo.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const warehouseService = new WarehouseService();
