# 📦 Warehouse Receipt Management System
# Hệ Thống Quản Lý Phiếu Nhập Kho

Ứng dụng quản lý tồn kho với chức năng nhập phiếu nhập kho theo **Mẫu số 01-VT** (Thông tư 200/2014/TT-BTC).

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | PostgreSQL 16 |
| **Validation** | Zod |
| **Testing** | Jest, ts-jest, Supertest |
| **DevOps** | Docker Compose |

## 📋 Features

- ✅ Tạo phiếu nhập kho theo mẫu 01-VT chuẩn kế toán
- ✅ Quản lý danh sách phiếu nhập kho
- ✅ Xem chi tiết phiếu với đầy đủ thông tin
- ✅ Bảng chi tiết hàng hóa động (thêm/xóa dòng)
- ✅ Tự động tính thành tiền, tổng cộng
- ✅ Chuyển đổi số sang chữ tiếng Việt
- ✅ Validation dữ liệu đầu vào (Zod)
- ✅ Responsive design (dark mode)
- ✅ Unit tests

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose (cho PostgreSQL)

### 1. Start Database
```bash
docker compose up -d
```

### 2. Setup Backend
```bash
cd server
npm install
npm run migrate   # Tạo bảng
npm run seed      # Dữ liệu mẫu
npm run dev       # Start server (port 3000)
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev       # Start client (port 5173)
```

### 4. Open Browser
Navigate to http://localhost:5173

## 🧪 Testing

```bash
cd server
npm test              # Chạy toàn bộ tests
npm run test:unit     # Chỉ unit tests
npm run test:coverage # Với coverage report
```

## 📁 Project Structure

```
├── docker-compose.yml          # PostgreSQL container
├── .env                        # Environment variables
├── server/                     # Backend
│   ├── src/
│   │   ├── config/database.ts  # PostgreSQL connection pool
│   │   ├── models/             # TypeScript interfaces
│   │   ├── repositories/       # Data access layer (raw SQL)
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Express routes
│   │   ├── validators/         # Zod schemas
│   │   ├── utils/              # Utilities (number-to-words)
│   │   ├── migrations/         # SQL migrations + seed
│   │   └── app.ts              # Entry point
│   └── tests/                  # Jest tests
│       └── unit/
├── client/                     # Frontend
│   ├── src/
│   │   ├── components/         # Layout
│   │   ├── pages/              # List, Create, Detail
│   │   ├── services/api.ts     # API client
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Format helpers
│   └── vite.config.ts          # Vite + API proxy
└── README.md
```

## 📊 Database Schema

4 bảng chính:
- **warehouses** - Danh sách kho
- **products** - Danh sách sản phẩm/vật tư
- **warehouse_receipts** - Phiếu nhập kho (header)
- **warehouse_receipt_items** - Chi tiết phiếu (dòng sản phẩm)

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warehouses` | Danh sách kho |
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/receipts` | Danh sách phiếu nhập kho |
| GET | `/api/receipts/:id` | Chi tiết phiếu |
| POST | `/api/receipts` | Tạo phiếu mới |
| DELETE | `/api/receipts/:id` | Xóa phiếu |
| GET | `/api/health` | Health check |
