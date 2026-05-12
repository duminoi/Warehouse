import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, Eye, Pencil, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="flex flex-col gap-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Danh sách Phiếu Nhập Kho</h2>
          <p className="text-text-muted mt-1">Tổng cộng {receipts.length} phiếu nhập kho</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Tạo phiếu mới
        </Link>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin-slow" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
          <Package className="w-16 h-16 text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text mb-2">Chưa có phiếu nhập kho nào</h3>
          <p className="text-text-muted mb-6">Bấm "Tạo phiếu mới" để bắt đầu nhập hàng</p>
          <Link to="/create" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Tạo phiếu đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bento-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surfaceHover border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Số phiếu</th>
                  <th className="px-6 py-4 font-semibold">Ngày nhập</th>
                  <th className="px-6 py-4 font-semibold">Đơn vị</th>
                  <th className="px-6 py-4 font-semibold">Kho nhập</th>
                  <th className="px-6 py-4 font-semibold">Người giao</th>
                  <th className="px-6 py-4 font-semibold text-right">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-surfaceHover/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/receipts/${receipt.id}`}>
                        <span className="badge badge-primary">
                          {receipt.receipt_number}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{formatDate(receipt.receipt_date)}</td>
                    <td className="px-6 py-4">{receipt.company_name || "—"}</td>
                    <td className="px-6 py-4">{receipt.warehouse_name || "—"}</td>
                    <td className="px-6 py-4">{receipt.delivered_by || "—"}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-secondary">
                      {formatCurrency(Number(receipt.total_amount))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/receipts/${receipt.id}`}
                          className="p-2 text-text-muted hover:text-primary bg-surface border border-border hover:border-primary/50 rounded-lg transition-all"
                          title="Xem"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/receipts/${receipt.id}/edit`}
                          className="p-2 text-text-muted hover:text-white hover:bg-primary border border-border hover:border-primary rounded-lg transition-all"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-text-muted hover:text-white hover:bg-danger border border-border hover:border-danger rounded-lg transition-all"
                          onClick={() => handleDelete(receipt.id, receipt.receipt_number)}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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
