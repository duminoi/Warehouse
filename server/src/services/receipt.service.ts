import { receiptRepository, ReceiptRepository } from "../repositories/receipt.repository";
import { WarehouseReceiptWithItems, CreateReceiptDto, UpdateReceiptDto } from "../models/receipt.model";
import { numberToVietnameseWords } from "../utils/number-to-words";

export class ReceiptService {
  constructor(private readonly repo: ReceiptRepository = receiptRepository) {}

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<WarehouseReceiptWithItems | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateReceiptDto): Promise<WarehouseReceiptWithItems> {
    // Validate items are not empty
    if (!data.items || data.items.length === 0) {
      throw new Error("Phiếu nhập kho phải có ít nhất 1 sản phẩm");
    }

    // Create receipt
    const receipt = await this.repo.create(data);

    // Calculate total and update total_amount_in_words
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity_actual * item.unit_price,
      0
    );
    const totalInWords = numberToVietnameseWords(totalAmount);
    await this.repo.updateTotalInWords(receipt.id, totalInWords);

    // Return full receipt with updated words
    const fullReceipt = await this.repo.findById(receipt.id);
    if (!fullReceipt) {
      throw new Error("Không thể tìm thấy phiếu nhập kho vừa tạo");
    }

    return fullReceipt;
  }

  async update(id: number, data: UpdateReceiptDto): Promise<WarehouseReceiptWithItems> {
    // Validate items are not empty
    if (!data.items || data.items.length === 0) {
      throw new Error("Phiếu nhập kho phải có ít nhất 1 sản phẩm");
    }

    // Verify exists
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("Không tìm thấy phiếu nhập kho để cập nhật");
    }

    // Update receipt
    const receipt = await this.repo.update(id, data);

    // Calculate total and update total_amount_in_words
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity_actual * item.unit_price,
      0
    );
    const totalInWords = numberToVietnameseWords(totalAmount);
    await this.repo.updateTotalInWords(receipt.id, totalInWords);

    // Return full receipt with updated words
    const fullReceipt = await this.repo.findById(receipt.id);
    if (!fullReceipt) {
      throw new Error("Lỗi khi tải lại phiếu nhập kho sau khi cập nhật");
    }

    return fullReceipt;
  }

  async delete(id: number): Promise<boolean> {
    return this.repo.delete(id);
  }

  async getStats() {
    const count = await this.repo.count();
    return { totalReceipts: count };
  }
}

export const receiptService = new ReceiptService();
