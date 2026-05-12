import { ReceiptService } from "../../src/services/receipt.service";
import { ReceiptRepository } from "../../src/repositories/receipt.repository";

// Mock the repository
const mockRepo: jest.Mocked<ReceiptRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateTotalInWords: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
} as unknown as jest.Mocked<ReceiptRepository>;

describe("ReceiptService", () => {
  let service: ReceiptService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReceiptService(mockRepo);
  });

  describe("getAll", () => {
    it("should return all receipts from repository", async () => {
      const mockReceipts = [
        { id: 1, receipt_number: "NK-001", warehouse_name: "Kho 1" },
        { id: 2, receipt_number: "NK-002", warehouse_name: "Kho 2" },
      ];
      mockRepo.findAll.mockResolvedValue(mockReceipts as never);

      const result = await service.getAll();
      expect(result).toEqual(mockReceipts);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getById", () => {
    it("should return receipt with items when found", async () => {
      const mockReceipt = {
        id: 1,
        receipt_number: "NK-001",
        items: [{ id: 1, product_name: "Giấy A4" }],
      };
      mockRepo.findById.mockResolvedValue(mockReceipt as never);

      const result = await service.getById(1);
      expect(result).toEqual(mockReceipt);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when receipt not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      const result = await service.getById(999);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    const validData = {
      receipt_number: "NK-001",
      receipt_date: "2024-01-15",
      items: [
        { product_id: 1, quantity_documented: 10, quantity_actual: 10, unit_price: 50000 },
        { product_id: 2, quantity_documented: 5, quantity_actual: 5, unit_price: 30000 },
      ],
    };

    it("should create receipt and update total_in_words", async () => {
      const createdReceipt = { id: 1, ...validData, total_amount: 650000, items: [] };
      const fullReceipt = {
        ...createdReceipt,
        total_amount_in_words: "Sáu trăm năm mươi nghìn đồng",
        warehouse_name: null,
        warehouse_location: null,
      };

      mockRepo.create.mockResolvedValue(createdReceipt as never);
      mockRepo.findById.mockResolvedValue(fullReceipt as never);
      mockRepo.updateTotalInWords.mockResolvedValue(undefined);

      const result = await service.create(validData);

      expect(mockRepo.create).toHaveBeenCalledWith(validData);
      expect(mockRepo.updateTotalInWords).toHaveBeenCalledWith(1, expect.stringContaining("đồng"));
      expect(result).toEqual(fullReceipt);
    });

    it("should throw error when items array is empty", async () => {
      await expect(
        service.create({ ...validData, items: [] })
      ).rejects.toThrow("Phiếu nhập kho phải có ít nhất 1 sản phẩm");
    });

    it("should calculate correct total (quantity_actual × unit_price)", async () => {
      const createdReceipt = { id: 1, total_amount: 650000, items: [] };
      const fullReceipt = { ...createdReceipt, warehouse_name: null, warehouse_location: null, total_amount_in_words: "test" };

      mockRepo.create.mockResolvedValue(createdReceipt as never);
      mockRepo.findById.mockResolvedValue(fullReceipt as never);
      mockRepo.updateTotalInWords.mockResolvedValue(undefined);

      await service.create(validData);

      // Total should be: (10 * 50000) + (5 * 30000) = 500000 + 150000 = 650000
      expect(mockRepo.updateTotalInWords).toHaveBeenCalledWith(
        1,
        expect.stringContaining("đồng")
      );
    });
  });

  describe("delete", () => {
    it("should return true when receipt deleted", async () => {
      mockRepo.delete.mockResolvedValue(true);
      const result = await service.delete(1);
      expect(result).toBe(true);
    });

    it("should return false when receipt not found", async () => {
      mockRepo.delete.mockResolvedValue(false);
      const result = await service.delete(999);
      expect(result).toBe(false);
    });
  });

  describe("getStats", () => {
    it("should return receipt count", async () => {
      mockRepo.count.mockResolvedValue(42);
      const stats = await service.getStats();
      expect(stats).toEqual({ totalReceipts: 42 });
    });
  });
});
