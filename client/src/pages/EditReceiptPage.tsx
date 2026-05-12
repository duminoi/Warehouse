import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Truck, Box, Paperclip, Save, X, Plus, AlertCircle } from "lucide-react";
import { getWarehouses, getProducts, getReceipt, updateReceipt, createWarehouse, createProduct } from "../services/api";
import type { Warehouse, Product, CreateReceiptItemDto } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";
import CustomSelect, { type CustomSelectOption } from "../components/CustomSelect";
import Modal from "../components/Modal";

interface ItemRow extends CreateReceiptItemDto {
  key: string;
}

function generateKey(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function EditReceiptPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const receiptId = id ? parseInt(id, 10) : 0;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);

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

  const [items, setItems] = useState<ItemRow[]>([
    { key: generateKey(), product_id: 0, quantity_documented: 0, quantity_actual: 0, unit_price: 0 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: "", name: "", unit: "", specification: "" });
  const [savingProduct, setSavingProduct] = useState(false);

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

        setReceiptNumber(receipt.receipt_number);
        setCompanyName(receipt.company_name || "");
        setDepartment(receipt.department || "");
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

        if (receipt.items && receipt.items.length > 0) {
          setItems(receipt.items.map(item => ({
            key: generateKey(),
            product_id: item.product_id,
            quantity_documented: item.quantity_documented,
            quantity_actual: item.quantity_actual,
            unit_price: Number(item.unit_price)
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

  const getItemTotal = (item: ItemRow): number => item.quantity_actual * item.unit_price;
  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const getProductUnit = (productId: number): string => {
    const product = products.find((p) => p.id === productId);
    return product?.unit || "—";
  };

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
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-text flex items-center gap-2">
          <FileText className="text-primary w-6 h-6" />
          Sửa Phiếu Nhập Kho
        </h2>
        <p className="text-text-muted">Mẫu số 01 - VT (Theo TT 200/2014/TT-BTC)</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-danger/10 border border-danger/20 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin chung */}
          <div className="bento-card p-6 flex flex-col gap-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4">
              <FileText className="w-5 h-5 text-primary" />
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Số phiếu <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: NK-2024-001"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Ngày nhập kho <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Đơn vị</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tên công ty / đơn vị"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Bộ phận</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Bộ phận liên quan"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Nợ (Tài khoản)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: 152, 153, 156..."
                  value={debitAccount}
                  onChange={(e) => setDebitAccount(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Có (Tài khoản)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: 331, 111..."
                  value={creditAccount}
                  onChange={(e) => setCreditAccount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Thông tin giao nhận */}
          <div className="bento-card p-6 flex flex-col gap-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4">
              <Truck className="w-5 h-5 text-secondary" />
              Thông tin giao nhận
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="form-label">Người giao hàng</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Họ và tên người giao"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                />
              </div>
              <div className="z-20">
                <label className="form-label">Nhập tại kho</label>
                <CustomSelect
                  value={warehouseId}
                  onChange={(val) => setWarehouseId(val)}
                  options={warehouseOptions}
                  placeholder="-- Chọn kho --"
                  onAddClick={() => setIsWarehouseModalOpen(true)}
                  addLabel="Thêm kho mới"
                />
              </div>
              <div>
                <label className="form-label">Theo chứng từ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Hóa đơn số... ngày..."
                  value={referenceDocument}
                  onChange={(e) => setReferenceDocument(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chi tiết hàng hóa */}
        <div className="bento-card p-0 flex flex-col z-10">
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" />
              Chi tiết hàng hóa
            </h3>
            <button type="button" className="btn btn-primary text-xs py-1.5 px-3" onClick={addItem}>
              <Plus className="w-4 h-4" />
              Thêm dòng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surfaceHover border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-4 py-3 min-w-[250px]">Sản phẩm / Vật tư</th>
                  <th className="px-4 py-3 text-center w-20">ĐVT</th>
                  <th className="px-4 py-3 w-32">SL Chứng từ</th>
                  <th className="px-4 py-3 w-32">SL Thực nhập</th>
                  <th className="px-4 py-3 w-40">Đơn giá (₫)</th>
                  <th className="px-4 py-3 w-40 text-right">Thành tiền</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, index) => (
                  <tr key={item.key} className="bg-surface hover:bg-surfaceHover/30 transition-colors">
                    <td className="px-4 py-3 text-center text-text-muted">{index + 1}</td>
                    <td className="px-4 py-3">
                      <CustomSelect
                        value={item.product_id || ""}
                        onChange={(val) => updateItem(item.key, "product_id", typeof val === 'number' ? val : 0)}
                        options={productOptions}
                        placeholder="Chọn sản phẩm"
                        onAddClick={() => setIsProductModalOpen(true)}
                        addLabel="Thêm sản phẩm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-text-muted">{getProductUnit(item.product_id)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                        value={item.quantity_documented || ""}
                        onChange={(e) => updateItem(item.key, "quantity_documented", parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                        value={item.quantity_actual || ""}
                        onChange={(e) => updateItem(item.key, "quantity_actual", parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-right font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                        step="1000"
                        value={item.unit_price || ""}
                        onChange={(e) => updateItem(item.key, "unit_price", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-secondary">
                      {getItemTotal(item) > 0 ? formatCurrency(getItemTotal(item)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="p-2 text-text-muted hover:text-white hover:bg-danger rounded-lg transition-colors"
                          onClick={() => removeItem(item.key)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surfaceHover border-t border-border">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-bold text-text">CỘNG</td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-secondary text-lg">
                    {grandTotal > 0 ? formatCurrency(grandTotal) : "—"}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {grandTotal > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(108,99,255,0.1)]">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-sm text-text-muted italic">
              Tổng tiền: {formatNumber(grandTotal)} VNĐ
            </div>
          </div>
        )}

        {/* Thông tin bổ sung */}
        <div className="bento-card p-6 flex flex-col gap-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4">
            <Paperclip className="w-5 h-5 text-text-muted" />
            Thông tin bổ sung & Chữ ký
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-4">
              <label className="form-label">Chứng từ kèm theo</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: 02 hóa đơn, 01 hợp đồng..."
                value={attachedDocuments}
                onChange={(e) => setAttachedDocuments(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Người lập phiếu</label>
              <input type="text" className="form-input" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Người giao hàng</label>
              <input type="text" className="form-input" value={deliveredBy} onChange={(e) => setDeliveredBy(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Thủ kho</label>
              <input type="text" className="form-input" value={storekeeper} onChange={(e) => setStorekeeper(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Kế toán trưởng</label>
              <input type="text" className="form-input" value={accountant} onChange={(e) => setAccountant(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-4 sticky bottom-6 z-50">
          <button type="button" className="btn btn-secondary px-6 shadow-xl" onClick={() => navigate("/")}>
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button type="submit" className="btn btn-primary px-8 shadow-xl" disabled={submitting}>
            <Save className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
            {submitting ? "Đang lưu..." : "Lưu phiếu nhập"}
          </button>
        </div>
      </form>

      {/* Modals */}
      <Modal isOpen={isWarehouseModalOpen} onClose={() => setIsWarehouseModalOpen(false)} title="Thêm Kho Mới">
        <form onSubmit={handleCreateWarehouse} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Tên kho <span className="text-danger">*</span></label>
            <input type="text" className="form-input" value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Địa chỉ</label>
            <input type="text" className="form-input" value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setIsWarehouseModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={savingWarehouse}>
              {savingWarehouse ? "Đang lưu..." : "Lưu Kho"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Thêm Sản Phẩm">
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Mã sản phẩm <span className="text-danger">*</span></label>
            <input type="text" className="form-input" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
            <input type="text" className="form-input" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Đơn vị tính <span className="text-danger">*</span></label>
            <input type="text" className="form-input" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Quy cách</label>
            <input type="text" className="form-input" value={newProduct.specification} onChange={(e) => setNewProduct({ ...newProduct, specification: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
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
