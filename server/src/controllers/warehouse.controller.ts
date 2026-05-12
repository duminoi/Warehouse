import { Request, Response } from "express";
import { warehouseService } from "../services/warehouse.service";
import { createWarehouseSchema } from "../validators/schemas";
import { ZodError } from "zod";

export class WarehouseController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const warehouses = await warehouseService.getAll();
      res.json({ success: true, data: warehouses });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("WarehouseController.getAll error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID không hợp lệ" });
        return;
      }

      const warehouse = await warehouseService.getById(id);
      if (!warehouse) {
        res.status(404).json({ success: false, error: "Không tìm thấy kho" });
        return;
      }

      res.json({ success: true, data: warehouse });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("WarehouseController.getById error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createWarehouseSchema.parse(req.body);
      const warehouse = await warehouseService.create(data);
      res.status(201).json({ success: true, data: warehouse });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Dữ liệu không hợp lệ",
          details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("WarehouseController.create error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID không hợp lệ" });
        return;
      }

      const deleted = await warehouseService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: "Không tìm thấy kho" });
        return;
      }

      res.json({ success: true, message: "Đã xóa kho thành công" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("WarehouseController.delete error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }
}

export const warehouseController = new WarehouseController();
