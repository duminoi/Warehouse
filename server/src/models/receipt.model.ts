export interface WarehouseReceipt {
  id: number;
  receipt_number: string;
  company_name: string | null;
  department: string | null;
  receipt_date: Date;
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
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
}

/** Extended item with product info for display */
export interface WarehouseReceiptItemWithProduct extends WarehouseReceiptItem {
  product_code: string;
  product_name: string;
  product_unit: string;
}

/** Full receipt with items for detail view */
export interface WarehouseReceiptWithItems extends WarehouseReceipt {
  warehouse_name: string | null;
  warehouse_location: string | null;
  items: WarehouseReceiptItemWithProduct[];
}

/** DTO for creating a receipt */
export interface CreateReceiptDto {
  receipt_number: string;
  company_name?: string;
  department?: string;
  receipt_date: string; // ISO date string
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

export interface CreateReceiptItemDto {
  product_id: number;
  quantity_documented: number;
  quantity_actual: number;
  unit_price: number;
}
