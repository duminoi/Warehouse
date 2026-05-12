import { query, testConnection } from "../config/database";

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

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed();
