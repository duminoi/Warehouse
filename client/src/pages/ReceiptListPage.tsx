import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReceipts, deleteReceipt } from "../services/api";
import type { WarehouseReceipt } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

export default function ReceiptListPage() {
  const [receipts, setReceipts] = useState<(WarehouseReceipt & { warehouse_name: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReceipts();
      setReceipts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách phiếu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleDelete = async (id: number, receiptNumber: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu "${receiptNumber}"?`)) {
      return;
    }

    try {
      await deleteReceipt(id);
      setSuccessMsg(`Đã xóa phiếu "${receiptNumber}" thành công`);
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xóa phiếu";
      setError(message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📋 Danh sách Phiếu Nhập Kho</h2>
          <p className="subtitle">
            Tổng cộng {receipts.length} phiếu nhập kho
          </p>
        </div>
        <Link to="/create" className="btn btn-primary btn-lg">
          ➕ Tạo phiếu mới
        </Link>
      </div>

      {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}
      {error && <div className="alert alert-error">❌ {error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>Chưa có phiếu nhập kho nào</h3>
            <p>Bấm "Tạo phiếu mới" để bắt đầu nhập hàng</p>
            <Link to="/create" className="btn btn-primary mt-lg">
              ➕ Tạo phiếu đầu tiên
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Số phiếu</th>
                  <th>Ngày nhập</th>
                  <th>Đơn vị</th>
                  <th>Kho nhập</th>
                  <th>Người giao</th>
                  <th className="text-right">Tổng tiền</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td>
                      <Link to={`/receipts/${receipt.id}`}>
                        <span className="badge badge-primary">
                          {receipt.receipt_number}
                        </span>
                      </Link>
                    </td>
                    <td>{formatDate(receipt.receipt_date)}</td>
                    <td>{receipt.company_name || "—"}</td>
                    <td>{receipt.warehouse_name || "—"}</td>
                    <td>{receipt.delivered_by || "—"}</td>
                    <td className="text-right" style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                      {formatCurrency(Number(receipt.total_amount))}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-end gap-sm">
                        <Link
                          to={`/receipts/${receipt.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          👁 Xem
                        </Link>
                        <Link
                          to={`/receipts/${receipt.id}/edit`}
                          className="btn btn-primary btn-sm"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(receipt.id, receipt.receipt_number)}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
