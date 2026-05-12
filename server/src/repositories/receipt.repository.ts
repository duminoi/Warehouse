import { query, getClient } from "../config/database";
import {
  WarehouseReceipt,
  WarehouseReceiptItem,
  WarehouseReceiptItemWithProduct,
  WarehouseReceiptWithItems,
  CreateReceiptDto,
  UpdateReceiptDto,
} from "../models/receipt.model";

export class ReceiptRepository {
  /** List all receipts with warehouse name, ordered by date desc */
  async findAll(): Promise<(WarehouseReceipt & { warehouse_name: string | null })[]> {
    const result = await query<WarehouseReceipt & { warehouse_name: string | null }>(
      `SELECT r.*, w.name as warehouse_name
       FROM warehouse_receipts r
       LEFT JOIN warehouses w ON r.warehouse_id = w.id
       ORDER BY r.receipt_date DESC, r.created_at DESC`
    );
    return result.rows;
  }

  /** Get single receipt by ID with all items */
  async findById(id: number): Promise<WarehouseReceiptWithItems | null> {
    const receiptResult = await query<WarehouseReceipt & { warehouse_name: string | null; warehouse_location: string | null }>(
      `SELECT r.*, w.name as warehouse_name, w.location as warehouse_location
       FROM warehouse_receipts r
       LEFT JOIN warehouses w ON r.warehouse_id = w.id
       WHERE r.id = $1`,
      [id]
    );

    if (receiptResult.rows.length === 0) {
      return null;
    }

    const receipt = receiptResult.rows[0];

    const itemsResult = await query<WarehouseReceiptItemWithProduct>(
      `SELECT ri.*, p.code as product_code, p.name as product_name, p.unit as product_unit
       FROM warehouse_receipt_items ri
       JOIN products p ON ri.product_id = p.id
       WHERE ri.receipt_id = $1
       ORDER BY ri.line_number`,
      [id]
    );

    return {
      ...receipt,
      items: itemsResult.rows,
    };
  }

  /** Create receipt with items in a transaction */
  async create(data: CreateReceiptDto): Promise<WarehouseReceiptWithItems> {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Calculate total
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.quantity_actual * item.unit_price,
        0
      );

      // Insert receipt header
      const receiptResult = await client.query<WarehouseReceipt>(
        `INSERT INTO warehouse_receipts 
          (receipt_number, company_name, department, receipt_date, debit_account, credit_account,
           delivered_by, reference_document, warehouse_id, total_amount, total_amount_in_words,
           attached_documents, created_by, storekeeper, accountant)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          data.receipt_number,
          data.company_name || null,
          data.department || null,
          data.receipt_date,
          data.debit_account || null,
          data.credit_account || null,
          data.delivered_by || null,
          data.reference_document || null,
          data.warehouse_id || null,
          totalAmount,
          null, // total_amount_in_words will be set by service
          data.attached_documents || null,
          data.created_by || null,
          data.storekeeper || null,
          data.accountant || null,
        ]
      );

      const receipt = receiptResult.rows[0];

      // Insert items
      const items: WarehouseReceiptItem[] = [];
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const totalPrice = item.quantity_actual * item.unit_price;

        const itemResult = await client.query<WarehouseReceiptItem>(
          `INSERT INTO warehouse_receipt_items 
            (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            receipt.id,
            item.product_id,
            i + 1,
            item.quantity_documented,
            item.quantity_actual,
            item.unit_price,
            totalPrice,
          ]
        );
        items.push(itemResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...receipt,
        warehouse_name: null,
        warehouse_location: null,
        items: items as WarehouseReceiptItemWithProduct[],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /** Update receipt with items in a transaction */
  async update(id: number, data: UpdateReceiptDto): Promise<WarehouseReceiptWithItems> {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Calculate total
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.quantity_actual * item.unit_price,
        0
      );

      // Update receipt header
      await client.query(
        `UPDATE warehouse_receipts 
         SET receipt_number = $1, company_name = $2, department = $3, receipt_date = $4,
             debit_account = $5, credit_account = $6, delivered_by = $7, reference_document = $8,
             warehouse_id = $9, total_amount = $10, attached_documents = $11,
             created_by = $12, storekeeper = $13, accountant = $14, updated_at = NOW()
         WHERE id = $15`,
        [
          data.receipt_number,
          data.company_name || null,
          data.department || null,
          data.receipt_date,
          data.debit_account || null,
          data.credit_account || null,
          data.delivered_by || null,
          data.reference_document || null,
          data.warehouse_id || null,
          totalAmount,
          data.attached_documents || null,
          data.created_by || null,
          data.storekeeper || null,
          data.accountant || null,
          id
        ]
      );

      // Delete existing items
      await client.query("DELETE FROM warehouse_receipt_items WHERE receipt_id = $1", [id]);

      // Insert new items
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const totalPrice = item.quantity_actual * item.unit_price;

        await client.query(
          `INSERT INTO warehouse_receipt_items 
            (receipt_id, product_id, line_number, quantity_documented, quantity_actual, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            item.product_id,
            i + 1,
            item.quantity_documented,
            item.quantity_actual,
            item.unit_price,
            totalPrice,
          ]
        );
      }

      await client.query("COMMIT");

      const updatedReceipt = await this.findById(id);
      if (!updatedReceipt) throw new Error("Receipt not found after update");
      return updatedReceipt;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /** Update total_amount_in_words after creation or update */
  async updateTotalInWords(id: number, totalInWords: string): Promise<void> {
    await query(
      "UPDATE warehouse_receipts SET total_amount_in_words = $2, updated_at = NOW() WHERE id = $1",
      [id, totalInWords]
    );
  }

  /** Delete receipt (cascade deletes items) */
  async delete(id: number): Promise<boolean> {
    const result = await query("DELETE FROM warehouse_receipts WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /** Count total receipts */
  async count(): Promise<number> {
    const result = await query<{ count: string }>("SELECT COUNT(*) as count FROM warehouse_receipts");
    return parseInt(result.rows[0].count, 10);
  }
}

export const receiptRepository = new ReceiptRepository();
