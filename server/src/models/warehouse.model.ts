export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWarehouseDto {
  name: string;
  location?: string;
}
