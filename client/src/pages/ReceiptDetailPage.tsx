import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, FileText, AlertCircle } from "lucide-react";
import { getReceipt, deleteReceipt } from "../services/api";
import type { WarehouseReceiptWithItems } from "../types";
import { formatCurrency, formatNumber, formatDate } from "../utils/format";

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<WarehouseReceiptWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getReceipt(parseInt(id, 10));
        setReceipt(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải phiếu";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handleDelete = async () => {
    if (!receipt) return;
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu "${receipt.receipt_number}"?`)) return;

    try {
      await deleteReceipt(receipt.id);
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xóa phiếu";
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin-slow" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-danger mb-4 opacity-80" />
        <h3 className="text-lg font-semibold text-text mb-6">{error || "Không tìm thấy phiếu nhập kho"}</h3>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <FileText className="text-primary w-6 h-6" />
            Phiếu Nhập Kho: {receipt.receipt_number}
          </h2>
          <p className="text-text-muted mt-1">Mẫu số 01 - VT · Ngày {formatDate(receipt.receipt_date)}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
          <Link to={`/receipts/${receipt.id}/edit`} className="btn btn-primary">
            <Pencil className="w-4 h-4" />
            Sửa
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>

      <div className="bento-card">
        <div className="flex justify-between items-center p-6 border-b border-border bg-surfaceHover/30">
          <h3 className="text-lg font-semibold text-text">Thông tin chung</h3>
          <span className="badge badge-primary">{formatDate(receipt.receipt_date)}</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Đơn vị</span>
              <span className="text-sm font-medium">{receipt.company_name || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Bộ phận</span>
              <span className="text-sm font-medium">{receipt.department || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tài khoản Nợ</span>
              <span className="text-sm font-medium">{receipt.debit_account || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tài khoản Có</span>
              <span className="text-sm font-medium">{receipt.credit_account || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Người giao hàng</span>
              <span className="text-sm font-medium">{receipt.delivered_by || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Theo chứng từ</span>
              <span className="text-sm font-medium">{receipt.reference_document || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Nhập tại kho</span>
              <span className="text-sm font-medium">{receipt.warehouse_name || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Địa điểm kho</span>
              <span className="text-sm font-medium">{receipt.warehouse_location || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card">
        <div className="flex justify-between items-center p-6 border-b border-border bg-surfaceHover/30">
          <h3 className="text-lg font-semibold text-text">Chi tiết hàng hóa</h3>
          <span className="text-sm text-text-muted">{receipt.items.length} sản phẩm</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-surfaceHover/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-center font-semibold">STT</th>
                <th className="px-6 py-4 font-semibold">Tên, nhãn hiệu, quy cách</th>
                <th className="px-6 py-4 font-semibold">Mã số</th>
                <th className="px-6 py-4 font-semibold">ĐVT</th>
                <th className="px-6 py-4 text-right font-semibold">SL chứng từ</th>
                <th className="px-6 py-4 text-right font-semibold">SL thực nhập</th>
                <th className="px-6 py-4 text-right font-semibold">Đơn giá</th>
                <th className="px-6 py-4 text-right font-semibold">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receipt.items.map((item) => (
                <tr key={item.id} className="hover:bg-surfaceHover/30 transition-colors">
                  <td className="px-6 py-4 text-center text-text-muted">{item.line_number}</td>
                  <td className="px-6 py-4 font-medium">{item.product_name || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-primary font-mono">{item.product_code || "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{item.product_unit || "—"}</td>
                  <td className="px-6 py-4 text-right">{formatNumber(item.quantity_documented)}</td>
                  <td className="px-6 py-4 text-right">{formatNumber(item.quantity_actual)}</td>
                  <td className="px-6 py-4 text-right font-mono">{formatCurrency(Number(item.unit_price))}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-secondary">
                    {formatCurrency(Number(item.total_price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(108,99,255,0.1)]">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
          {formatCurrency(Number(receipt.total_amount))}
        </div>
        {receipt.total_amount_in_words && (
          <div className="text-base text-text-muted italic">
            Bằng chữ: {receipt.total_amount_in_words}
          </div>
        )}
      </div>

      {receipt.attached_documents && (
        <div className="bento-card p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Chứng từ gốc kèm theo</span>
            <span className="text-sm font-medium">{receipt.attached_documents}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center gap-2 border-dashed bg-transparent">
          <span className="text-sm font-semibold text-text">Người lập phiếu</span>
          <span className="text-sm text-text-muted italic">{receipt.created_by || "(Ký, họ tên)"}</span>
        </div>
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center gap-2 border-dashed bg-transparent">
          <span className="text-sm font-semibold text-text">Người giao hàng</span>
          <span className="text-sm text-text-muted italic">{receipt.delivered_by || "(Ký, họ tên)"}</span>
        </div>
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center gap-2 border-dashed bg-transparent">
          <span className="text-sm font-semibold text-text">Thủ kho</span>
          <span className="text-sm text-text-muted italic">{receipt.storekeeper || "(Ký, họ tên)"}</span>
        </div>
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center gap-2 border-dashed bg-transparent">
          <span className="text-sm font-semibold text-text">Kế toán trưởng</span>
          <span className="text-sm text-text-muted italic">{receipt.accountant || "(Ký, họ tên)"}</span>
        </div>
      </div>
    </div>
  );
}
