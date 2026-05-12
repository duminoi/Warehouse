import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database";
import warehouseRoutes from "./routes/warehouse.routes";
import productRoutes from "./routes/product.routes";
import receiptRoutes from "./routes/receipt.routes";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint không tồn tại" });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Lỗi server nội bộ" });
});

// Start server
async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("❌ Cannot start server: Database connection failed");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 API: http://localhost:${PORT}/api`);
  });
}

// Only start if this file is run directly (not imported for testing)
if (require.main === module) {
  start();
}

export { app };
