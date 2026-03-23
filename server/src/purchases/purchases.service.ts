import {
  Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { REPOSITORY } from '../common/constants/app.constants';
import { PurchaseBill } from './entities/purchase-bill.entity';
import { PurchaseBillItem } from './entities/purchase-bill-item.entity';
import { DebitNote } from './entities/debit-note.entity';
import { DebitNoteItem } from './entities/debit-note-item.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Party } from '../parties/entities/party.entity';
import { Product } from '../inventory/entities/product.entity';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryService } from '../inventory/inventory.service';
import { TaxService } from '../tax/tax.service';
import { CreatePurchaseBillDto } from './dto/create-purchase-bill.dto';
import { CreateDebitNoteDto } from './dto/create-debit-note.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseBillQueryDto } from './dto/purchase-query.dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject(REPOSITORY.PURCHASE_BILLS) private readonly billRepo: typeof PurchaseBill,
    @Inject(REPOSITORY.PURCHASE_BILL_ITEMS) private readonly billItemRepo: typeof PurchaseBillItem,
    @Inject(REPOSITORY.DEBIT_NOTES) private readonly debitNoteRepo: typeof DebitNote,
    @Inject(REPOSITORY.DEBIT_NOTE_ITEMS) private readonly debitNoteItemRepo: typeof DebitNoteItem,
    @Inject(REPOSITORY.PURCHASE_ORDERS) private readonly poRepo: typeof PurchaseOrder,
    @Inject(REPOSITORY.PURCHASE_ORDER_ITEMS) private readonly poItemRepo: typeof PurchaseOrderItem,
    private readonly accountingService: AccountingService,
    private readonly inventoryService: InventoryService,
    private readonly taxService: TaxService,
    private readonly sequelize: Sequelize,
  ) {}

  // ─── Purchase Bills ──────────────────────────────

  async createPurchaseBill(dto: CreatePurchaseBillDto, userId: string): Promise<PurchaseBill> {
    const party = await Party.findByPk(dto.party_id);
    if (!party) throw new NotFoundException('Vendor not found.');
    if (!party.ledger_account_id) throw new BadRequestException('Vendor has no linked ledger account.');

    const businessSettings = await this.taxService.getBusinessSettings();
    const placeOfSupply = dto.place_of_supply || party.state_code || businessSettings.state_code || '';

    const fy = await this.accountingService.getActiveFinancialYear();
    const billNumber = await this.accountingService.getNextNumber('purchase_bill', fy.name);

    const transaction = await this.sequelize.transaction();
    try {
      // Calculate line items
      let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;
      const itemRecords: any[] = [];

      for (const item of dto.items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) throw new NotFoundException(`Product ${item.product_id} not found.`);

        const qty = item.quantity;
        const lineSubtotal = parseFloat((qty * item.unit_price).toFixed(2));
        const discountPct = item.discount_percent || 0;
        const discountAmt = parseFloat(((lineSubtotal * discountPct) / 100).toFixed(2));
        const taxableAmount = parseFloat((lineSubtotal - discountAmt).toFixed(2));

        const taxRateId = item.tax_rate_id || product.tax_rate_id;
        let taxResult = { cgst_rate: 0, cgst_amount: 0, sgst_rate: 0, sgst_amount: 0, igst_rate: 0, igst_amount: 0, cess_rate: 0, cess_amount: 0, total_tax: 0 };

        if (taxRateId) {
          taxResult = await this.taxService.calculateTax({
            taxableAmount,
            taxRateId,
            placeOfSupply,
            businessStateCode: businessSettings.state_code,
          });
        }

        const lineTotal = parseFloat((taxableAmount + taxResult.total_tax).toFixed(2));

        itemRecords.push({
          product_id: item.product_id,
          hsn_code: product.hsnCode?.code || null,
          quantity: qty,
          unit_id: item.unit_id || product.unit_id,
          unit_price: item.unit_price,
          discount_percent: discountPct,
          discount_amount: discountAmt,
          taxable_amount: taxableAmount,
          tax_rate: (taxResult.cgst_rate * 2) || taxResult.igst_rate,
          cgst_rate: taxResult.cgst_rate, cgst_amount: taxResult.cgst_amount,
          sgst_rate: taxResult.sgst_rate, sgst_amount: taxResult.sgst_amount,
          igst_rate: taxResult.igst_rate, igst_amount: taxResult.igst_amount,
          total: lineTotal,
        });

        subtotal += taxableAmount;
        totalCgst += taxResult.cgst_amount;
        totalSgst += taxResult.sgst_amount;
        totalIgst += taxResult.igst_amount;
        totalCess += taxResult.cess_amount;
      }

      const totalTax = parseFloat((totalCgst + totalSgst + totalIgst + totalCess).toFixed(2));
      const roundOff = dto.round_off || 0;
      const grandTotal = parseFloat((subtotal + totalTax + roundOff).toFixed(2));

      // Create bill
      const bill = await this.billRepo.create({
        bill_number: billNumber,
        vendor_bill_number: dto.vendor_bill_number,
        date: dto.date, due_date: dto.due_date,
        party_id: dto.party_id, place_of_supply: placeOfSupply,
        subtotal, discount_amount: 0, taxable_amount: subtotal,
        cgst_amount: totalCgst, sgst_amount: totalSgst, igst_amount: totalIgst,
        cess_amount: totalCess, total_tax: totalTax,
        round_off: roundOff, grand_total: grandTotal,
        amount_paid: 0, balance_due: grandTotal, payment_status: 'unpaid',
        notes: dto.notes, financial_year: fy.name, created_by: userId,
      } as any, { transaction });

      // Create line items
      for (const rec of itemRecords) {
        await this.billItemRepo.create({ ...rec, purchase_bill_id: bill.id } as any, { transaction });
      }

      // Create stock movements
      for (const item of dto.items) {
        await this.inventoryService.recordStockMovement({
          productId: item.product_id,
          movementType: 'purchase',
          quantity: item.quantity,
          referenceType: 'purchase_bill_item',
          referenceId: bill.id,
          unitCost: item.unit_price,
          notes: `Purchase Bill ${billNumber}`,
          userId,
        });
      }

      await transaction.commit();

      // Create journal entry: Dr Purchase + GST Input, Cr Vendor
      const purchaseLedger = await this.accountingService.findLedgerByName('Purchase Account');
      const cgstInputLedger = await this.accountingService.findLedgerByName('CGST Input');
      const sgstInputLedger = await this.accountingService.findLedgerByName('SGST Input');
      const igstInputLedger = await this.accountingService.findLedgerByName('IGST Input');

      const journalLines: any[] = [];
      if (subtotal > 0 && purchaseLedger) journalLines.push({ ledgerAccountId: purchaseLedger.id, debit: subtotal, credit: 0 });
      if (totalCgst > 0 && cgstInputLedger) journalLines.push({ ledgerAccountId: cgstInputLedger.id, debit: totalCgst, credit: 0 });
      if (totalSgst > 0 && sgstInputLedger) journalLines.push({ ledgerAccountId: sgstInputLedger.id, debit: totalSgst, credit: 0 });
      if (totalIgst > 0 && igstInputLedger) journalLines.push({ ledgerAccountId: igstInputLedger.id, debit: totalIgst, credit: 0 });
      journalLines.push({ ledgerAccountId: party.ledger_account_id, debit: 0, credit: grandTotal });

      if (journalLines.length >= 2) {
        const je = await this.accountingService.createAutoJournalEntry({
          date: dto.date,
          narration: `Purchase Bill ${billNumber} - ${party.name}`,
          referenceType: 'purchase_bill',
          referenceId: bill.id,
          lines: journalLines,
          userId,
        });
        await bill.update({ journal_entry_id: je.id });
      }

      return this.getPurchaseBill(bill.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      console.error('PurchasesService.createPurchaseBill error:', error);
      throw new InternalServerErrorException('Failed to create purchase bill.');
    }
  }

  async getPurchaseBills(query: PurchaseBillQueryDto): Promise<PaginatedResponseDto<PurchaseBill>> {
    const where: any = {};
    if (query.party_id) where.party_id = query.party_id;
    if (query.payment_status) where.payment_status = query.payment_status;
    if (query.from_date) where.date = { ...where.date, [Op.gte]: query.from_date };
    if (query.to_date) where.date = { ...where.date, [Op.lte]: query.to_date };
    if (query.search) {
      where[Op.or] = [
        { bill_number: { [Op.iLike]: `%${query.search}%` } },
        { vendor_bill_number: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.billRepo.findAndCountAll({
      where,
      include: [{ model: Party, attributes: ['id', 'name', 'gstin'] }],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit, offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: { total: count, page: query.page, limit: query.limit, total_pages: totalPages, has_next: query.page < totalPages, has_prev: query.page > 1 },
    };
  }

  async getPurchaseBill(id: string): Promise<PurchaseBill> {
    const bill = await this.billRepo.findByPk(id, {
      include: [
        { model: Party, attributes: ['id', 'name', 'gstin', 'state_code'] },
        { model: PurchaseBillItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
    });
    if (!bill) throw new NotFoundException('Purchase bill not found.');
    return bill;
  }

  async cancelPurchaseBill(id: string, userId: string): Promise<PurchaseBill> {
    const bill = await this.getPurchaseBill(id);
    if (bill.is_cancelled) throw new BadRequestException('Bill is already cancelled.');

    // Reverse stock
    for (const item of bill.items) {
      await this.inventoryService.recordStockMovement({
        productId: item.product_id,
        movementType: 'return_out',
        quantity: parseFloat(String(item.quantity)),
        referenceType: 'purchase_bill_item',
        referenceId: bill.id,
        unitCost: parseFloat(String(item.unit_price)),
        notes: `Cancel Purchase Bill ${bill.bill_number}`,
        userId,
      });
    }

    // Reverse journal entry
    if (bill.journal_entry_id) {
      await this.accountingService.cancelJournalEntry(bill.journal_entry_id, userId);
    }

    await bill.update({ is_cancelled: true });
    return bill;
  }

  // ─── Debit Notes (Purchase Returns) ──────────────────

  async createDebitNote(dto: CreateDebitNoteDto, userId: string): Promise<DebitNote> {
    const bill = await this.getPurchaseBill(dto.original_bill_id);
    if (bill.is_cancelled) throw new BadRequestException('Cannot create debit note for cancelled bill.');

    const party = await Party.findByPk(bill.party_id);
    const businessSettings = await this.taxService.getBusinessSettings();
    const fy = await this.accountingService.getActiveFinancialYear();
    const dnNumber = await this.accountingService.getNextNumber('debit_note', fy.name);

    let totalSubtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;
    const itemRecords: any[] = [];

    for (const item of dto.items) {
      const billItem = bill.items.find((bi) => bi.product_id === item.product_id);
      const taxableAmount = parseFloat((item.quantity * item.unit_price).toFixed(2));

      // Use same tax split as original bill item
      let cgst = 0, sgst = 0, igst = 0;
      if (billItem) {
        const origTaxable = parseFloat(String(billItem.taxable_amount)) || 1;
        const ratio = taxableAmount / origTaxable;
        cgst = parseFloat((parseFloat(String(billItem.cgst_amount)) * ratio).toFixed(2));
        sgst = parseFloat((parseFloat(String(billItem.sgst_amount)) * ratio).toFixed(2));
        igst = parseFloat((parseFloat(String(billItem.igst_amount)) * ratio).toFixed(2));
      }

      itemRecords.push({
        product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price,
        taxable_amount: taxableAmount, cgst_amount: cgst, sgst_amount: sgst, igst_amount: igst,
        total: parseFloat((taxableAmount + cgst + sgst + igst).toFixed(2)),
      });

      totalSubtotal += taxableAmount;
      totalCgst += cgst; totalSgst += sgst; totalIgst += igst;

      // Reverse stock
      await this.inventoryService.recordStockMovement({
        productId: item.product_id, movementType: 'return_out', quantity: item.quantity,
        referenceType: 'debit_note_item', referenceId: dto.original_bill_id,
        unitCost: item.unit_price, notes: `Debit Note ${dnNumber}`, userId,
      });
    }

    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotal = parseFloat((totalSubtotal + totalTax).toFixed(2));

    const dn = await this.debitNoteRepo.create({
      debit_note_number: dnNumber, date: dto.date,
      original_bill_id: dto.original_bill_id, party_id: bill.party_id,
      reason: dto.reason, subtotal: totalSubtotal,
      cgst_amount: totalCgst, sgst_amount: totalSgst, igst_amount: totalIgst,
      total_tax: totalTax, grand_total: grandTotal,
      financial_year: fy.name, created_by: userId,
    } as any);

    for (const rec of itemRecords) {
      await this.debitNoteItemRepo.create({ ...rec, debit_note_id: dn.id } as any);
    }

    // Journal entry: Dr Vendor, Cr Purchase + GST Input
    if (party?.ledger_account_id) {
      const purchaseLedger = await this.accountingService.findLedgerByName('Purchase Account');
      const cgstInput = await this.accountingService.findLedgerByName('CGST Input');
      const sgstInput = await this.accountingService.findLedgerByName('SGST Input');
      const igstInput = await this.accountingService.findLedgerByName('IGST Input');

      const lines: any[] = [{ ledgerAccountId: party.ledger_account_id, debit: grandTotal, credit: 0 }];
      if (totalSubtotal > 0 && purchaseLedger) lines.push({ ledgerAccountId: purchaseLedger.id, debit: 0, credit: totalSubtotal });
      if (totalCgst > 0 && cgstInput) lines.push({ ledgerAccountId: cgstInput.id, debit: 0, credit: totalCgst });
      if (totalSgst > 0 && sgstInput) lines.push({ ledgerAccountId: sgstInput.id, debit: 0, credit: totalSgst });
      if (totalIgst > 0 && igstInput) lines.push({ ledgerAccountId: igstInput.id, debit: 0, credit: totalIgst });

      const je = await this.accountingService.createAutoJournalEntry({
        date: dto.date, narration: `Debit Note ${dnNumber} against ${bill.bill_number}`,
        referenceType: 'debit_note', referenceId: dn.id, lines, userId,
      });
      await dn.update({ journal_entry_id: je.id });
    }

    // Update original bill balance
    const newBalance = parseFloat(String(bill.balance_due)) - grandTotal;
    await bill.update({
      balance_due: Math.max(0, newBalance),
      payment_status: newBalance <= 0 ? 'paid' : 'partial',
    });

    return dn;
  }

  async getDebitNotes(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query?.search) {
      where[Op.or] = [
        { debit_note_number: { [Op.iLike]: `%${query.search}%` } },
        { reason: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.debitNoteRepo.findAndCountAll({
      where,
      include: [
        { model: Party, attributes: ['id', 'name'] },
        { model: PurchaseBill, attributes: ['id', 'bill_number'] },
        { model: DebitNoteItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
      order: [[query?.sort_by || 'created_at', (query?.sort_order || 'DESC').toUpperCase()]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    return {
      items: rows,
      meta: { total: count, page, limit, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 },
    };
  }

  // ─── Purchase Orders ──────────────────────────────

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const fy = await this.accountingService.getActiveFinancialYear();
    const poNumber = await this.accountingService.getNextNumber('purchase_order', fy.name);

    let subtotal = 0, totalTax = 0;
    const itemRecords: any[] = [];

    for (const item of dto.items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) throw new NotFoundException(`Product ${item.product_id} not found.`);

      const taxable = parseFloat((item.quantity * item.unit_price).toFixed(2));
      const taxRate = product.taxRate ? parseFloat(String(product.taxRate.rate)) : 0;
      const taxAmt = parseFloat(((taxable * taxRate) / 100).toFixed(2));

      itemRecords.push({
        product_id: item.product_id, quantity: item.quantity,
        unit_id: item.unit_id || product.unit_id,
        unit_price: item.unit_price, taxable_amount: taxable,
        tax_rate: taxRate, tax_amount: taxAmt,
        total: parseFloat((taxable + taxAmt).toFixed(2)),
      });

      subtotal += taxable;
      totalTax += taxAmt;
    }

    const po = await this.poRepo.create({
      po_number: poNumber, date: dto.date, expected_date: dto.expected_date,
      party_id: dto.party_id, subtotal, total_tax: totalTax,
      grand_total: parseFloat((subtotal + totalTax).toFixed(2)),
      notes: dto.notes, financial_year: fy.name, created_by: userId,
    } as any);

    for (const rec of itemRecords) {
      await this.poItemRepo.create({ ...rec, purchase_order_id: po.id } as any);
    }

    return this.getPurchaseOrder(po.id);
  }

  async getPurchaseOrders(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query?.search) {
      where[Op.or] = [{ po_number: { [Op.iLike]: `%${query.search}%` } }];
    }

    const { rows, count } = await this.poRepo.findAndCountAll({
      where,
      include: [
        { model: Party, attributes: ['id', 'name'] },
        { model: PurchaseOrderItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
      order: [[query?.sort_by || 'created_at', (query?.sort_order || 'DESC').toUpperCase()]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    return {
      items: rows,
      meta: { total: count, page, limit, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 },
    };
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepo.findByPk(id, {
      include: [
        { model: Party, attributes: ['id', 'name', 'gstin'] },
        { model: PurchaseOrderItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
    });
    if (!po) throw new NotFoundException('Purchase order not found.');
    return po;
  }

  async convertToBill(poId: string, userId: string): Promise<PurchaseBill> {
    const po = await this.getPurchaseOrder(poId);
    if (po.status === 'cancelled') throw new BadRequestException('Cannot convert cancelled PO.');

    const billDto: CreatePurchaseBillDto = {
      date: new Date().toISOString().split('T')[0],
      party_id: po.party_id,
      items: po.items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(String(item.quantity)),
        unit_price: parseFloat(String(item.unit_price)),
        unit_id: item.unit_id,
      })),
    };

    const bill = await this.createPurchaseBill(billDto, userId);
    await po.update({ status: 'received' });
    return bill;
  }
}
