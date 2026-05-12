export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  specification: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseReceipt {
  id: number;
  receipt_number: string;
  company_name: string | null;
  department: string | null;
  receipt_date: string;
  debit_account: string | null;
  credit_account: string | null;
  delivered_by: string | null;
  reference_document: string | null;
  warehouse_id: number | null;
  total_amount: number;
  total_amount_in_words: string | null;
  attached_documents: string | null;
  created_by: string | null;
  storekeeper: string | null;
  accountant: string | null;
  created_at: string;
  updated_at: string;
  warehouse_name?: string | null;
}

export interface WarehouseReceiptItem {
  id: number;
  receipt_id: number;
  product_id: number;
  line_number: number;
  quantity_documented: number;
  quantity_actual: number;
  unit_price: number;
  total_price: number;
  product_code?: string;
  product_name?: string;
  product_unit?: string;
}

export interface WarehouseReceiptWithItems extends WarehouseReceipt {
  warehouse_location?: string | null;
  items: WarehouseReceiptItem[];
}

export interface CreateReceiptItemDto {
  product_id: number;
  quantity_documented: number;
  quantity_actual: number;
  unit_price: number;
}

export interface CreateReceiptDto {
  receipt_number: string;
  company_name?: string;
  department?: string;
  receipt_date: string;
  debit_account?: string;
  credit_account?: string;
  delivered_by?: string;
  reference_document?: string;
  warehouse_id?: number;
  attached_documents?: string;
  created_by?: string;
  storekeeper?: string;
  accountant?: string;
  items: CreateReceiptItemDto[];
}

export type UpdateReceiptDto = CreateReceiptDto;

export interface CreateWarehouseDto {
  name: string;
  location?: string;
}

export interface CreateProductDto {
  code: string;
  name: string;
  unit: string;
  specification?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}
