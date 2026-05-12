-- =============================================
-- Warehouse Receipt Management System
-- Database Migration: 001_init.sql
-- =============================================

-- 1. Bảng Kho (Warehouses)
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Sản phẩm / Vật tư (Products)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    specification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Phiếu Nhập Kho (Warehouse Receipts - Header)
CREATE TABLE IF NOT EXISTS warehouse_receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    department VARCHAR(255),
    receipt_date DATE NOT NULL,
    debit_account VARCHAR(20),
    credit_account VARCHAR(20),
    delivered_by VARCHAR(255),
    reference_document TEXT,
    warehouse_id INTEGER REFERENCES warehouses(id),
    total_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount_in_words TEXT,
    attached_documents TEXT,
    created_by VARCHAR(255),
    storekeeper VARCHAR(255),
    accountant VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Chi tiết Phiếu Nhập Kho (Receipt Items - Lines)
CREATE TABLE IF NOT EXISTS warehouse_receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES warehouse_receipts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    line_number INTEGER NOT NULL,
    quantity_documented INTEGER NOT NULL DEFAULT 0,
    quantity_actual INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(receipt_id, line_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON warehouse_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipts_warehouse ON warehouse_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON warehouse_receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
