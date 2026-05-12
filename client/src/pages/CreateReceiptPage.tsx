import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getWarehouses, getProducts, createReceipt } from "../services/api";
import type { Warehouse, Product, CreateReceiptItemDto } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";

interface ItemRow extends CreateReceiptItemDto {
  key: string; // unique key for React rendering
}

function generateKey(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function CreateReceiptPage() {
  const navigate = useNavigate();

  // Reference data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);

  // Form state
  const [receiptNumber, setReceiptNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [attachedDocuments, setAttachedDocuments] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [storekeeper, setStorekeeper] = useState("");
  const [accountant, setAccountant] = useState("");

  // Items
  const [items, setItems] = useState<ItemRow[]>([
    { key: generateKey(), product_id: 0, quantity_documented: 0, quantity_actual: 0, unit_price: 0 },
  ]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reference data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wh, prod] = await Promise.all([getWarehouses(), getProducts()]);
        setWarehouses(wh);
        setProducts(prod);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải dữ liệu";
        setError(message);
      } finally {
        setLoadingRef(false);
      }
    };
    loadData();
  }, []);

  // Item handlers
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: generateKey(), product_id: 0, quantity_documented: 0, quantity_actual: 0, unit_price: 0 },
    ]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.key !== key);
    });
  };

  const updateItem = useCallback((key: string, field: keyof CreateReceiptItemDto, value: number) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  }, []);

  // Calculations
  const getItemTotal = (item: ItemRow): number => {
    return item.quantity_actual * item.unit_price;
  };

  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  // Get product info for display
  const getProductUnit = (productId: number): string => {
    const product = products.find((p) => p.id === productId);
    return product?.unit || "—";
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!receiptNumber.trim()) {
      setError("Vui lòng nhập số phiếu nhập kho");
      return;
    }
    if (!receiptDate) {
      setError("Vui lòng chọn ngày nhập kho");
      return;
    }

    const validItems = items.filter((item) => item.product_id > 0);
    if (validItems.length === 0) {
      setError("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    try {
      setSubmitting(true);
      const receipt = await createReceipt({
        receipt_number: receiptNumber.trim(),
        company_name: companyName.trim() || undefined,
        department: department.trim() || undefined,
        receipt_date: receiptDate,
        debit_account: debitAccount.trim() || undefined,
        credit_account: creditAccount.trim() || undefined,
        delivered_by: deliveredBy.trim() || undefined,
        reference_document: referenceDocument.trim() || undefined,
        warehouse_id: warehouseId || undefined,
        attached_documents: attachedDocuments.trim() || undefined,
        created_by: createdBy.trim() || undefined,
        storekeeper: storekeeper.trim() || undefined,
        accountant: accountant.trim() || undefined,
        items: validItems.map(({ product_id, quantity_documented, quantity_actual, unit_price }) => ({
          product_id,
          quantity_documented,
          quantity_actual,
          unit_price,
        })),
      });

      navigate(`/receipts/${receipt.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo phiếu";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRef) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>➕ Tạo Phiếu Nhập Kho</h2>
          <p className="subtitle">Mẫu số 01 - VT (Theo TT 200/2014/TT-BTC)</p>
        </div>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Header Info */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>📝 Thông tin chung</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Số phiếu <span className="required">*</span>
                </label>
                <input
                  id="receipt-number"
                  type="text"
                  className="form-input"
                  placeholder="VD: NK-2024-001"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ngày nhập kho <span className="required">*</span>
                </label>
                <input
                  id="receipt-date"
                  type="date"
                  className="form-input"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Đơn vị</label>
                <input
                  id="company-name"
                  type="text"
                  className="form-input"
                  placeholder="Tên công ty / đơn vị"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bộ phận</label>
                <input
                  id="department"
                  type="text"
                  className="form-input"
                  placeholder="Bộ phận liên quan"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nợ (Tài khoản)</label>
                <input
                  id="debit-account"
                  type="text"
                  className="form-input"
                  placeholder="VD: 152, 153, 156..."
                  value={debitAccount}
                  onChange={(e) => setDebitAccount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Có (Tài khoản)</label>
                <input
                  id="credit-account"
                  type="text"
                  className="form-input"
                  placeholder="VD: 331, 111..."
                  value={creditAccount}
                  onChange={(e) => setCreditAccount(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>🚚 Thông tin giao nhận</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Họ và tên người giao</label>
                <input
                  id="delivered-by"
                  type="text"
                  className="form-input"
                  placeholder="Tên người giao hàng"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nhập tại kho</label>
                <select
                  id="warehouse-id"
                  className="form-select"
                  value={warehouseId || ""}
                  onChange={(e) => setWarehouseId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} {wh.location ? `(${wh.location})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Theo chứng từ (số, ngày, tháng, năm, của...)</label>
                <input
                  id="reference-document"
                  type="text"
                  className="form-input"
                  placeholder="VD: Hóa đơn số 0001234 ngày 01/01/2024 của Công ty ABC"
                  value={referenceDocument}
                  onChange={(e) => setReferenceDocument(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>📦 Chi tiết hàng hóa</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={addItem}>
              ➕ Thêm dòng
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th style={{ minWidth: "200px" }}>Tên sản phẩm / Vật tư</th>
                  <th style={{ width: "70px" }}>ĐVT</th>
                  <th style={{ width: "110px" }}>SL Chứng từ</th>
                  <th style={{ width: "110px" }}>SL Thực nhập</th>
                  <th style={{ width: "130px" }}>Đơn giá (₫)</th>
                  <th style={{ width: "140px" }}>Thành tiền</th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.key}>
                    <td className="text-center" style={{ color: "var(--color-text-muted)" }}>
                      {index + 1}
                    </td>
                    <td>
                      <select
                        className="item-select"
                        value={item.product_id || ""}
                        onChange={(e) => updateItem(item.key, "product_id", parseInt(e.target.value, 10) || 0)}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-center" style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
                      {getProductUnit(item.product_id)}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="item-input"
                        min="0"
                        value={item.quantity_documented || ""}
                        onChange={(e) => updateItem(item.key, "quantity_documented", parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="item-input"
                        min="0"
                        value={item.quantity_actual || ""}
                        onChange={(e) => updateItem(item.key, "quantity_actual", parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="item-input"
                        min="0"
                        step="1000"
                        value={item.unit_price || ""}
                        onChange={(e) => updateItem(item.key, "unit_price", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td className="total-cell">
                      {getItemTotal(item) > 0 ? formatCurrency(getItemTotal(item)) : "—"}
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeItem(item.key)}
                          title="Xóa dòng"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right" style={{ fontSize: "var(--font-size-md)" }}>
                    CỘNG
                  </td>
                  <td className="text-right" style={{ color: "var(--color-secondary)", fontSize: "var(--font-size-md)" }}>
                    {grandTotal > 0 ? formatCurrency(grandTotal) : "—"}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grand Total Display */}
        {grandTotal > 0 && (
          <div className="total-highlight mb-lg">
            <div className="amount">{formatCurrency(grandTotal)}</div>
            <div className="amount-words">Tổng tiền: {formatNumber(grandTotal)} VNĐ</div>
          </div>
        )}

        {/* Additional Info */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>📎 Thông tin bổ sung</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Số chứng từ gốc kèm theo</label>
                <input
                  id="attached-documents"
                  type="text"
                  className="form-input"
                  placeholder="VD: 02 hóa đơn, 01 hợp đồng"
                  value={attachedDocuments}
                  onChange={(e) => setAttachedDocuments(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Người lập phiếu</label>
                <input
                  id="created-by"
                  type="text"
                  className="form-input"
                  placeholder="Họ tên người lập"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thủ kho</label>
                <input
                  id="storekeeper"
                  type="text"
                  className="form-input"
                  placeholder="Họ tên thủ kho"
                  value={storekeeper}
                  onChange={(e) => setStorekeeper(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kế toán trưởng</label>
                <input
                  id="accountant"
                  type="text"
                  className="form-input"
                  placeholder="Họ tên kế toán"
                  value={accountant}
                  onChange={(e) => setAccountant(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-sm">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => navigate("/")}
          >
            ✕ Hủy
          </button>
          <button
            type="submit"
            className="btn btn-success btn-lg"
            disabled={submitting}
          >
            {submitting ? "⏳ Đang lưu..." : "💾 Lưu phiếu nhập kho"}
          </button>
        </div>
      </form>
    </div>
  );
}
