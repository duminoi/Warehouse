import { createReceiptSchema, createProductSchema, createWarehouseSchema } from "../../src/validators/schemas";

describe("createReceiptSchema", () => {
  const validReceipt = {
    receipt_number: "NK-2024-001",
    receipt_date: "2024-01-15",
    items: [
      {
        product_id: 1,
        quantity_documented: 100,
        quantity_actual: 100,
        unit_price: 50000,
      },
    ],
  };

  it("should validate a correct receipt", () => {
    const result = createReceiptSchema.safeParse(validReceipt);
    expect(result.success).toBe(true);
  });

  it("should validate a receipt with all optional fields", () => {
    const fullReceipt = {
      ...validReceipt,
      company_name: "Công ty ABC",
      department: "Phòng kế toán",
      debit_account: "152",
      credit_account: "331",
      delivered_by: "Nguyễn Văn A",
      reference_document: "HĐ số 001",
      warehouse_id: 1,
      attached_documents: "02 hóa đơn",
      created_by: "Trần Thị B",
      storekeeper: "Lê Văn C",
      accountant: "Phạm Thị D",
    };
    const result = createReceiptSchema.safeParse(fullReceipt);
    expect(result.success).toBe(true);
  });

  it("should reject receipt without receipt_number", () => {
    const { receipt_number, ...noNumber } = validReceipt;
    void receipt_number;
    const result = createReceiptSchema.safeParse(noNumber);
    expect(result.success).toBe(false);
  });

  it("should reject receipt with empty receipt_number", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      receipt_number: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject receipt without receipt_date", () => {
    const { receipt_date, ...noDate } = validReceipt;
    void receipt_date;
    const result = createReceiptSchema.safeParse(noDate);
    expect(result.success).toBe(false);
  });

  it("should reject receipt with invalid date format", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      receipt_date: "15/01/2024",
    });
    expect(result.success).toBe(false);
  });

  it("should reject receipt with no items", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject receipt with invalid item (missing product_id)", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      items: [
        {
          quantity_documented: 10,
          quantity_actual: 10,
          unit_price: 5000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject item with negative quantity", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      items: [
        {
          product_id: 1,
          quantity_documented: -5,
          quantity_actual: 10,
          unit_price: 5000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject item with negative unit_price", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      items: [
        {
          product_id: 1,
          quantity_documented: 10,
          quantity_actual: 10,
          unit_price: -5000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should accept multiple items", () => {
    const result = createReceiptSchema.safeParse({
      ...validReceipt,
      items: [
        { product_id: 1, quantity_documented: 10, quantity_actual: 10, unit_price: 5000 },
        { product_id: 2, quantity_documented: 20, quantity_actual: 18, unit_price: 3000 },
        { product_id: 3, quantity_documented: 5, quantity_actual: 5, unit_price: 150000 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("createProductSchema", () => {
  it("should validate a correct product", () => {
    const result = createProductSchema.safeParse({
      code: "VT001",
      name: "Giấy A4",
      unit: "Ram",
    });
    expect(result.success).toBe(true);
  });

  it("should reject product without code", () => {
    const result = createProductSchema.safeParse({
      name: "Giấy A4",
      unit: "Ram",
    });
    expect(result.success).toBe(false);
  });

  it("should reject product with empty name", () => {
    const result = createProductSchema.safeParse({
      code: "VT001",
      name: "",
      unit: "Ram",
    });
    expect(result.success).toBe(false);
  });

  it("should accept product with specification", () => {
    const result = createProductSchema.safeParse({
      code: "VT001",
      name: "Giấy A4",
      unit: "Ram",
      specification: "80gsm, 500 tờ",
    });
    expect(result.success).toBe(true);
  });
});

describe("createWarehouseSchema", () => {
  it("should validate a correct warehouse", () => {
    const result = createWarehouseSchema.safeParse({
      name: "Kho chính",
    });
    expect(result.success).toBe(true);
  });

  it("should reject warehouse without name", () => {
    const result = createWarehouseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept warehouse with location", () => {
    const result = createWarehouseSchema.safeParse({
      name: "Kho chính",
      location: "Tầng 1, Tòa A",
    });
    expect(result.success).toBe(true);
  });
});
