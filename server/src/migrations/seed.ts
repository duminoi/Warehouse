import { query, testConnection } from "../config/database";
import { numberToVietnameseWords } from "../utils/number-to-words";

async function seed(): Promise<void> {
  console.log("🌱 Seeding database...");

  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  // Seed warehouses
  await query(`
    INSERT INTO warehouses (name, location) VALUES
      ('Kho chính', 'Tầng 1, Tòa nhà A, 123 Nguyễn Huệ, Q.1, TP.HCM'),
      ('Kho phụ', 'Tầng 2, Tòa nhà B, 456 Lê Lợi, Q.1, TP.HCM'),
      ('Kho nguyên liệu', '789 Trần Hưng Đạo, Q.5, TP.HCM')
    ON CONFLICT DO NOTHING
  `);
  console.log("  ✅ Warehouses seeded");

  // Seed products
  await query(`
    INSERT INTO products (code, name, unit, specification) VALUES
      ('VT001', 'Giấy A4 Double A', 'Ram', '80gsm, 500 tờ/ram'),
      ('VT002', 'Bút bi Thiên Long TL-027', 'Cái', 'Mực xanh, đầu 0.5mm'),
      ('VT003', 'Kẹp bướm 32mm', 'Hộp', '12 cái/hộp, thép mạ niken'),
      ('VT004', 'Sổ ghi chép A5', 'Quyển', '200 trang, bìa cứng'),
      ('VT005', 'Mực in HP 680 Black', 'Hộp', 'Mực đen, chính hãng'),
      ('VT006', 'Băng keo trong 48mm', 'Cuộn', '100 yard, trong suốt'),
      ('VT007', 'Phong bì trắng DL', 'Cái', '110x220mm, 100gsm'),
      ('VT008', 'File hồ sơ 2 kẹp', 'Cái', 'A4, bìa nhựa PP, xanh dương'),
      ('VT009', 'Ghim bấm số 10', 'Hộp', '1000 ghim/hộp'),
      ('VT010', 'Dao rọc giấy lớn', 'Cái', 'Lưỡi 18mm, tự khóa')
    ON CONFLICT (code) DO NOTHING
  `);
  console.log("  ✅ Products seeded");

  // ===================== PHIẾU NHẬP KHO =====================

  // Receipt PN-001: Công ty TNHH ABC - Kho chính (id=1)
  //   Giấy A4 Double A (id=1): 50 ram ghi, 48 thực = 12,000đ/ram → 600,000
  //   Bút bi Thiên Long TL-027 (id=2): 200 cái ghi, 195 thực = 5,000đ/cái → 1,000,000
  //   Tổng: 1,600,000
  const total1 = 50 * 12000 + 200 * 5000; // 1,600,000
  await query(`
    INSERT INTO warehouse_receipts (receipt_number, company_name, department, receipt_date, warehouse_id, total_amount, total_amount_in_words, created_by, storekeeper, accountant)
    VALUES ('PN-001', N'Công ty TNHH ABC', 'Kế toán', '2026-05-01', 1, ${total1}, '${numberToVietnameseWords(total1)}', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C')
    ON CONFLICT (receipt_number) DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 1, 50, 48, 12000, 48 * 12000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT001'
    WHERE r.receipt_number = 'PN-001'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 2, 200, 195, 5000, 195 * 5000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT002'
    WHERE r.receipt_number = 'PN-001'
    ON CONFLICT DO NOTHING
  `);
  console.log("  ✅ Receipt PN-001 seeded");

  // Receipt PN-002: Công ty CP XYZ - Kho phụ (id=2)
  //   Kẹp bướm 32mm (id=3): 100 hộp, 100 thực = 15,000đ/hộp → 1,500,000
  //   Sổ ghi chép A5 (id=4): 50 quyển, 48 thực = 25,000đ/quyển → 1,200,000
  //   Phong bì trắng DL (id=7): 200 cái, 198 thực = 2,000đ/cái → 396,000
  //   Tổng: 3,096,000
  const total2 = 100 * 15000 + 48 * 25000 + 198 * 2000; // 3,096,000
  await query(`
    INSERT INTO warehouse_receipts (receipt_number, company_name, department, receipt_date, warehouse_id, total_amount, total_amount_in_words, reference_document, created_by, storekeeper, accountant)
    VALUES ('PN-002', N'Công ty CP XYZ', 'Mua hàng', '2026-05-03', 2, ${total2}, '${numberToVietnameseWords(total2)}', 'HD-202605-002', 'Phạm Văn D', 'Nguyễn Thị E', 'Trần Văn I')
    ON CONFLICT (receipt_number) DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 1, 100, 100, 15000, 100 * 15000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT003'
    WHERE r.receipt_number = 'PN-002'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 2, 50, 48, 25000, 48 * 25000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT004'
    WHERE r.receipt_number = 'PN-002'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 3, 200, 198, 2000, 198 * 2000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT007'
    WHERE r.receipt_number = 'PN-002'
    ON CONFLICT DO NOTHING
  `);
  console.log("  ✅ Receipt PN-002 seeded");

  // Receipt PN-003: Xây dựng Minh Tuấn - Kho nguyên liệu (id=3)
  //   Mực in HP 680 Black (id=5): 30 hộp, 30 thực = 45,000đ/hộp → 1,350,000
  //   Băng keo trong 48mm (id=6): 50 cuộn, 48 thực = 8,000đ/cuộn → 384,000
  //   Ghim bấm số 10 (id=9): 50 hộp, 50 thực = 12,000đ/hộp → 600,000
  //   Dao rọc giấy lớn (id=10): 5 cái, 5 thực = 25,000đ/cái → 125,000
  //   Tổng: 2,459,000
  const total3 = 30 * 45000 + 48 * 8000 + 50 * 12000 + 5 * 25000; // 2,459,000
  await query(`
    INSERT INTO warehouse_receipts (receipt_number, company_name, department, receipt_date, warehouse_id, total_amount, total_amount_in_words, delivered_by, created_by, storekeeper, accountant)
    VALUES ('PN-003', N'Xây dựng Minh Tuấn', 'Kỹ thuật', '2026-05-05', 3, ${total3}, '${numberToVietnameseWords(total3)}', N'Bùi Văn F', 'Đặng Thị G', 'Phạm Văn H', 'Nguyễn Văn J')
    ON CONFLICT (receipt_number) DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 1, 30, 30, 45000, 30 * 45000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT005'
    WHERE r.receipt_number = 'PN-003'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 2, 50, 48, 8000, 48 * 8000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT006'
    WHERE r.receipt_number = 'PN-003'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 3, 50, 50, 12000, 50 * 12000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT009'
    WHERE r.receipt_number = 'PN-003'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 4, 5, 5, 25000, 5 * 25000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT010'
    WHERE r.receipt_number = 'PN-003'
    ON CONFLICT DO NOTHING
  `);
  console.log("  ✅ Receipt PN-003 seeded");

  // Receipt PN-004: Siêu thị Đất Việt - Kho chính (id=1)
  //   File hồ sơ 2 kẹp (id=8): 100 cái, 98 thực = 18,000đ/cái → 1,764,000
  //   Giấy A4 Double A (id=1): 100 ram, 95 thực = 11,500đ/ram → 1,092,500
  //   Tổng: 2,856,500
  const total4 = 98 * 18000 + 95 * 11500; // 2,856,500
  await query(`
    INSERT INTO warehouse_receipts (receipt_number, company_name, department, receipt_date, warehouse_id, total_amount, total_amount_in_words, debit_account, credit_account, attached_documents, created_by, storekeeper, accountant)
    VALUES ('PN-004', N'Siêu thị Đất Việt', 'Kho hàng', '2026-05-08', 1, ${total4}, '${numberToVietnameseWords(total4)}', '1111111111', '3311111111', 'Đơn đặt hàng 004; Biên bản giao nhận', N'Vũ Thanh K', 'Trần Quốc L', 'Lê Thị M')
    ON CONFLICT (receipt_number) DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 1, 100, 98, 18000, 98 * 18000
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT008'
    WHERE r.receipt_number = 'PN-004'
    ON CONFLICT DO NOTHING
  `);
  await query(`
    INSERT INTO warehouse_receipt_items (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
    SELECT r.id, p.id, 2, 100, 95, 11500, 95 * 11500
    FROM warehouse_receipts r
    JOIN products p ON p.code = 'VT001'
    WHERE r.receipt_number = 'PN-004'
    ON CONFLICT DO NOTHING
  `);
  console.log("  ✅ Receipt PN-004 seeded");

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed();
