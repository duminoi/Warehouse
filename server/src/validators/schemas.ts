import { z } from "zod";

/** Validation schema for a single receipt item */
export const receiptItemSchema = z.object({
  product_id: z
    .number({ required_error: "Mã sản phẩm là bắt buộc" })
    .int("Mã sản phẩm phải là số nguyên")
    .positive("Mã sản phẩm phải lớn hơn 0"),
  quantity_documented: z
    .number({ required_error: "Số lượng theo chứng từ là bắt buộc" })
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm"),
  quantity_actual: z
    .number({ required_error: "Số lượng thực nhập là bắt buộc" })
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm"),
  unit_price: z
    .number({ required_error: "Đơn giá là bắt buộc" })
    .min(0, "Đơn giá không được âm"),
});

/** Validation schema for creating a receipt */
export const createReceiptSchema = z.object({
  receipt_number: z
    .string({ required_error: "Số phiếu nhập kho là bắt buộc" })
    .min(1, "Số phiếu nhập kho không được để trống")
    .max(50, "Số phiếu nhập kho tối đa 50 ký tự"),
  company_name: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  receipt_date: z
    .string({ required_error: "Ngày nhập kho là bắt buộc" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD"),
  debit_account: z.string().max(20).optional(),
  credit_account: z.string().max(20).optional(),
  delivered_by: z.string().max(255).optional(),
  reference_document: z.string().optional(),
  warehouse_id: z
    .number()
    .int("Mã kho phải là số nguyên")
    .positive("Mã kho phải lớn hơn 0")
    .optional(),
  attached_documents: z.string().optional(),
  created_by: z.string().max(255).optional(),
  storekeeper: z.string().max(255).optional(),
  accountant: z.string().max(255).optional(),
  items: z
    .array(receiptItemSchema)
    .min(1, "Phiếu nhập kho phải có ít nhất 1 sản phẩm"),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;

/** Validation schema for creating a product */
export const createProductSchema = z.object({
  code: z
    .string({ required_error: "Mã sản phẩm là bắt buộc" })
    .min(1, "Mã sản phẩm không được để trống")
    .max(50, "Mã sản phẩm tối đa 50 ký tự"),
  name: z
    .string({ required_error: "Tên sản phẩm là bắt buộc" })
    .min(1, "Tên sản phẩm không được để trống")
    .max(500, "Tên sản phẩm tối đa 500 ký tự"),
  unit: z
    .string({ required_error: "Đơn vị tính là bắt buộc" })
    .min(1, "Đơn vị tính không được để trống")
    .max(50, "Đơn vị tính tối đa 50 ký tự"),
  specification: z.string().optional(),
});

/** Validation schema for creating a warehouse */
export const createWarehouseSchema = z.object({
  name: z
    .string({ required_error: "Tên kho là bắt buộc" })
    .min(1, "Tên kho không được để trống")
    .max(255, "Tên kho tối đa 255 ký tự"),
  location: z.string().optional(),
});
