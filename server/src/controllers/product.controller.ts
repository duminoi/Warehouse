import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { createProductSchema } from "../validators/schemas";
import { ZodError } from "zod";

export class ProductController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.getAll();
      res.json({ success: true, data: products });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ProductController.getAll error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID không hợp lệ" });
        return;
      }

      const product = await productService.getById(id);
      if (!product) {
        res.status(404).json({ success: false, error: "Không tìm thấy sản phẩm" });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ProductController.getById error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await productService.create(data);
      res.status(201).json({ success: true, data: product });
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
      if (message.includes("đã tồn tại")) {
        res.status(409).json({ success: false, error: message });
        return;
      }
      console.error("ProductController.create error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID không hợp lệ" });
        return;
      }

      const deleted = await productService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: "Không tìm thấy sản phẩm" });
        return;
      }

      res.json({ success: true, message: "Đã xóa sản phẩm thành công" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("ProductController.delete error:", message);
      res.status(500).json({ success: false, error: message });
    }
  }
}

export const productController = new ProductController();
