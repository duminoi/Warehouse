import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">❌</div>
          <h3>{error || "Không tìm thấy phiếu nhập kho"}</h3>
          <Link to="/" className="btn btn-primary mt-lg">
            ← Về danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📄 Phiếu Nhập Kho: {receipt.receipt_number}</h2>
          <p className="subtitle">
            Mẫu số 01 - VT · Ngày {formatDate(receipt.receipt_date)}
          </p>
        </div>
        <div className="flex gap-sm">
          <Link to="/" className="btn btn-secondary">
            ← Quay lại
          </Link>
          <Link to={`/receipts/${receipt.id}/edit`} className="btn btn-primary">
            ✏️ Sửa
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑 Xóa phiếu
          </button>
        </div>
      </div>

      {/* General Info */}
      <div className="card mb-lg">
        <div className="card-header">
          <h3>📝 Thông tin chung</h3>
          <span className="badge badge-success">
            {formatDate(receipt.receipt_date)}
          </span>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Đơn vị</span>
              <span className="value">{receipt.company_name || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Bộ phận</span>
              <span className="value">{receipt.department || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Nợ</span>
              <span className="value">{receipt.debit_account || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Có</span>
              <span className="value">{receipt.credit_account || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Người giao hàng</span>
              <span className="value">{receipt.delivered_by || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Theo chứng từ</span>
              <span className="value">{receipt.reference_document || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Nhập tại kho</span>
              <span className="value">{receipt.warehouse_name || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Địa điểm</span>
              <span className="value">{receipt.warehouse_location || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card mb-lg">
        <div className="card-header">
          <h3>📦 Chi tiết hàng hóa</h3>
          <span className="text-muted">{receipt.items.length} sản phẩm</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-center">STT</th>
                <th>Tên, nhãn hiệu, quy cách</th>
                <th>Mã số</th>
                <th>ĐVT</th>
                <th className="text-right">SL chứng từ</th>
                <th className="text-right">SL thực nhập</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">{item.line_number}</td>
                  <td>{item.product_name || "—"}</td>
                  <td>
                    <span className="badge badge-primary">
                      {item.product_code || "—"}
                    </span>
                  </td>
                  <td>{item.product_unit || "—"}</td>
                  <td className="text-right">{formatNumber(item.quantity_documented)}</td>
                  <td className="text-right">{formatNumber(item.quantity_actual)}</td>
                  <td className="text-right">{formatCurrency(Number(item.unit_price))}</td>
                  <td className="text-right" style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                    {formatCurrency(Number(item.total_price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="total-highlight mb-lg">
        <div className="amount">{formatCurrency(Number(receipt.total_amount))}</div>
        {receipt.total_amount_in_words && (
          <div className="amount-words">{receipt.total_amount_in_words}</div>
        )}
      </div>

      {receipt.attached_documents && (
        <div className="card mb-lg">
          <div className="card-body">
            <div className="detail-item">
              <span className="label">Số chứng từ gốc kèm theo</span>
              <span className="value">{receipt.attached_documents}</span>
            </div>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="signatures-grid">
        <div className="signature-box">
          <div className="role">Người lập phiếu</div>
          <div className="name">{receipt.created_by || "(Ký, họ tên)"}</div>
        </div>
        <div className="signature-box">
          <div className="role">Người giao hàng</div>
          <div className="name">{receipt.delivered_by || "(Ký, họ tên)"}</div>
        </div>
        <div className="signature-box">
          <div className="role">Thủ kho</div>
          <div className="name">{receipt.storekeeper || "(Ký, họ tên)"}</div>
        </div>
        <div className="signature-box">
          <div className="role">Kế toán trưởng</div>
          <div className="name">{receipt.accountant || "(Ký, họ tên)"}</div>
        </div>
      </div>
    </div>
  );
}
