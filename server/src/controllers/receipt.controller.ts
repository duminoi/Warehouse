import { Request, Response } from "express";
import { receiptService } from "../services/receipt.service";
import { createReceiptSchema, updateReceiptSchema } from "../validators/schemas";
import { ZodError } from "zod";

export class ReceiptController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const receipts = await receiptService.getAll();
      res.json({ success: true, data: receipts });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ReceiptController.getAll error:", message);
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

      const receipt = await receiptService.getById(id);
      if (!receipt) {
        res.status(404).json({ success: false, error: "Không tìm thấy phiếu nhập kho" });
        return;
      }

      res.json({ success: true, data: receipt });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ReceiptController.getById error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createReceiptSchema.parse(req.body);
      const receipt = await receiptService.create(data);
      res.status(201).json({ success: true, data: receipt });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Dữ liệu không hợp lệ",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
        return;
      }

      const message = error instanceof Error ? error.message : "Lỗi không xác định";

      // Handle duplicate receipt number
      if (message.includes("duplicate key") || message.includes("unique constraint")) {
        res.status(409).json({
          success: false,
          error: "Số phiếu nhập kho đã tồn tại",
        });
        return;
      }

      // Handle foreign key violations
      if (message.includes("foreign key") || message.includes("violates")) {
        res.status(400).json({
          success: false,
          error: "Mã kho hoặc mã sản phẩm không tồn tại",
        });
        return;
      }

      console.error("ReceiptController.create error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID không hợp lệ" });
        return;
      }

      const data = updateReceiptSchema.parse(req.body);
      const receipt = await receiptService.update(id, data);
      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Dữ liệu không hợp lệ",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
        return;
      }

      const message = error instanceof Error ? error.message : "Lỗi không xác định";

      if (message === "Không tìm thấy phiếu nhập kho để cập nhật") {
         res.status(404).json({ success: false, error: message });
         return;
      }

      // Handle duplicate receipt number
      if (message.includes("duplicate key") || message.includes("unique constraint")) {
        res.status(409).json({
          success: false,
          error: "Số phiếu nhập kho đã tồn tại",
        });
        return;
      }

      // Handle foreign key violations
      if (message.includes("foreign key") || message.includes("violates")) {
        res.status(400).json({
          success: false,
          error: "Mã kho hoặc mã sản phẩm không tồn tại",
        });
        return;
      }

      console.error("ReceiptController.update error:", message);
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

      const deleted = await receiptService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: "Không tìm thấy phiếu nhập kho" });
        return;
      }

      res.json({ success: true, message: "Đã xóa phiếu nhập kho thành công" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ReceiptController.delete error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await receiptService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ReceiptController.getStats error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }
}

export const receiptController = new ReceiptController();
