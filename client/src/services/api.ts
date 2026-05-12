import type {
  Warehouse,
  Product,
  WarehouseReceipt,
  WarehouseReceiptWithItems,
  CreateReceiptDto,
} from "../types";

const BASE_URL = "/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    const errorMsg = data.details
      ? data.details.map((d) => `${d.field}: ${d.message}`).join(", ")
      : data.error || "Đã xảy ra lỗi";
    throw new Error(errorMsg);
  }

  return data.data as T;
}

// Warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  return fetchApi<Warehouse[]>("/warehouses");
}

export async function getWarehouse(id: number): Promise<Warehouse> {
  return fetchApi<Warehouse>(`/warehouses/${id}`);
}

// Products
export async function getProducts(): Promise<Product[]> {
  return fetchApi<Product[]>("/products");
}

export async function getProduct(id: number): Promise<Product> {
  return fetchApi<Product>(`/products/${id}`);
}

// Receipts
export async function getReceipts(): Promise<(WarehouseReceipt & { warehouse_name: string | null })[]> {
  return fetchApi("/receipts");
}

export async function getReceipt(id: number): Promise<WarehouseReceiptWithItems> {
  return fetchApi<WarehouseReceiptWithItems>(`/receipts/${id}`);
}

export async function createReceipt(data: CreateReceiptDto): Promise<WarehouseReceiptWithItems> {
  return fetchApi<WarehouseReceiptWithItems>("/receipts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteReceipt(id: number): Promise<void> {
  return fetchApi<void>(`/receipts/${id}`, { method: "DELETE" });
}
