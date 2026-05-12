export interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  specification: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDto {
  code: string;
  name: string;
  unit: string;
  specification?: string;
}
