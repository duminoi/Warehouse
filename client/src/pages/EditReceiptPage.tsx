import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWarehouses, getProducts, getReceipt, updateReceipt, createWarehouse, createProduct } from "../services/api";
import type { Warehouse, Product, CreateReceiptItemDto } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";
import CustomSelect, { type CustomSelectOption } from "../components/CustomSelect";
import Modal from "../components/Modal";

interface ItemRow extends CreateReceiptItemDto {
  key: string; // unique key for React rendering
}

function generateKey(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function EditReceiptPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const receiptId = id ? parseInt(id, 10) : 0;

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
  const [warehouseId, setWarehouseId] = useState<number | "">("");
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

  // Modal states
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: "", name: "", unit: "", specification: "" });
  const [savingProduct, setSavingProduct] = useState(false);

  // Load reference data and receipt data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!receiptId) {
          throw new Error("ID phiếu không hợp lệ");
        }

        const [wh, prod, receipt] = await Promise.all([
          getWarehouses(), 
          getProducts(),
          getReceipt(receiptId)
        ]);
        
        setWarehouses(wh);
        setProducts(prod);

        // Populate form
        setReceiptNumber(receipt.receipt_number);
        setCompanyName(receipt.company_name || "");
        setDepartment(receipt.department || "");
        // Format date to YYYY-MM-DD
        setReceiptDate(new Date(receipt.receipt_date).toISOString().split("T")[0]);
        setDebitAccount(receipt.debit_account || "");
        setCreditAccount(receipt.credit_account || "");
        setDeliveredBy(receipt.delivered_by || "");
        setReferenceDocument(receipt.reference_document || "");
        setWarehouseId(receipt.warehouse_id || "");
        setAttachedDocuments(receipt.attached_documents || "");
        setCreatedBy(receipt.created_by || "");
        setStorekeeper(receipt.storekeeper || "");
        setAccountant(receipt.accountant || "");

        // Populate items
        if (receipt.items && receipt.items.length > 0) {
          setItems(receipt.items.map(item => ({
            key: generateKey(),
            product_id: item.product_id,
            quantity_documented: item.quantity_documented,
            quantity_actual: item.quantity_actual,
            unit_price: Number(item.unit_price) // Ensure it's a number
          })));
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải dữ liệu";
        setError(message);
      } finally {
        setLoadingRef(false);
      }
    };
    loadData();
  }, [receiptId]);

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

  const getProductUnit = (productId: number): string => {
    const product = products.find((p) => p.id === productId);
    return product?.unit || "—";
  };

  // Submit main form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const receipt = await updateReceipt(receiptId, {
        receipt_number: receiptNumber.trim(),
        company_name: companyName.trim() || undefined,
        department: department.trim() || undefined,
        receipt_date: receiptDate,
        debit_account: debitAccount.trim() || undefined,
        credit_account: creditAccount.trim() || undefined,
        delivered_by: deliveredBy.trim() || undefined,
        reference_document: referenceDocument.trim() || undefined,
        warehouse_id: warehouseId !== "" ? (warehouseId as number) : undefined,
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
      const message = err instanceof Error ? err.message : "Không thể cập nhật phiếu";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Modals
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingWarehouse(true);
      const created = await createWarehouse({
        name: newWarehouse.name,
        location: newWarehouse.location || undefined,
      });
      setWarehouses([...warehouses, created]);
      setWarehouseId(created.id);
      setIsWarehouseModalOpen(false);
      setNewWarehouse({ name: "", location: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi tạo kho");
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProduct(true);
      const created = await createProduct({
        code: newProduct.code,
        name: newProduct.name,
        unit: newProduct.unit,
        specification: newProduct.specification || undefined,
      });
      setProducts([...products, created]);
      
      // Auto-select the newly created product in the last empty row, or add a new row
      setItems((prev) => {
        const newItems = [...prev];
        const emptyRowIndex = newItems.findIndex((item) => item.product_id === 0);
        if (emptyRowIndex >= 0) {
          newItems[emptyRowIndex].product_id = created.id;
        } else {
          newItems.push({
            key: generateKey(),
            product_id: created.id,
            quantity_documented: 0,
            quantity_actual: 0,
            unit_price: 0,
          });
        }
        return newItems;
      });

      setIsProductModalOpen(false);
      setNewProduct({ code: "", name: "", unit: "", specification: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi tạo sản phẩm");
    } finally {
      setSavingProduct(false);
    }
  };

  // Convert references to CustomSelectOptions
  const warehouseOptions: CustomSelectOption[] = warehouses.map((wh) => ({
    value: wh.id,
    label: `${wh.name} ${wh.location ? `(${wh.location})` : ""}`,
  }));

  const productOptions: CustomSelectOption[] = products.map((p) => ({
    value: p.id,
    label: `[${p.code}] ${p.name}`,
  }));

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
          <h2>✏️ Sửa Phiếu Nhập Kho</h2>
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

              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Nhập tại kho</label>
                <CustomSelect
                  value={warehouseId}
                  onChange={(val) => setWarehouseId(val)}
                  options={warehouseOptions}
                  placeholder="-- Chọn kho --"
                  onAddClick={() => setIsWarehouseModalOpen(true)}
                  addLabel="➕ Thêm kho mới"
                />
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
          <div style={{ overflowX: "auto", minHeight: "250px" }}>
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th style={{ minWidth: "250px" }}>Tên sản phẩm / Vật tư</th>
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
                      <CustomSelect
                        value={item.product_id || ""}
                        onChange={(val) => updateItem(item.key, "product_id", typeof val === 'number' ? val : 0)}
                        options={productOptions}
                        placeholder="-- Chọn sản phẩm --"
                        onAddClick={() => setIsProductModalOpen(true)}
                        addLabel="➕ Thêm sản phẩm mới"
                      />
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

      {/* MODALS */}
      <Modal 
        isOpen={isWarehouseModalOpen} 
        onClose={() => setIsWarehouseModalOpen(false)} 
        title="Thêm Kho Mới"
      >
        <form onSubmit={handleCreateWarehouse}>
          <div className="form-group mb-lg">
            <label className="form-label">Tên kho <span className="required">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Kho chính" 
              value={newWarehouse.name} 
              onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group mb-lg">
            <label className="form-label">Địa chỉ</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Tầng 1, Tòa nhà A" 
              value={newWarehouse.location} 
              onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} 
            />
          </div>
          <div className="flex justify-end gap-sm mt-xl">
            <button type="button" className="btn btn-secondary" onClick={() => setIsWarehouseModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={savingWarehouse}>
              {savingWarehouse ? "Đang lưu..." : "Lưu Kho"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title="Thêm Sản Phẩm Mới"
      >
        <form onSubmit={handleCreateProduct}>
          <div className="form-group mb-lg">
            <label className="form-label">Mã sản phẩm <span className="required">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: SP001" 
              value={newProduct.code} 
              onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group mb-lg">
            <label className="form-label">Tên sản phẩm <span className="required">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Màn hình Dell" 
              value={newProduct.name} 
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group mb-lg">
            <label className="form-label">Đơn vị tính <span className="required">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Cái, Chiếc, Hộp" 
              value={newProduct.unit} 
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group mb-lg">
            <label className="form-label">Quy cách (Tùy chọn)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: 24 inch, 75Hz" 
              value={newProduct.specification} 
              onChange={(e) => setNewProduct({ ...newProduct, specification: e.target.value })} 
            />
          </div>
          <div className="flex justify-end gap-sm mt-xl">
            <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={savingProduct}>
              {savingProduct ? "Đang lưu..." : "Lưu Sản Phẩm"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
