import {
  Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { REPOSITORY } from '../common/constants/app.constants';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { CreditNote } from './entities/credit-note.entity';
import { CreditNoteItem } from './entities/credit-note-item.entity';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Party } from '../parties/entities/party.entity';
import { Product } from '../inventory/entities/product.entity';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryService } from '../inventory/inventory.service';
import { TaxService } from '../tax/tax.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { SalesInvoiceQueryDto } from './dto/sales-query.dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class SalesService {
  constructor(
    @Inject(REPOSITORY.SALES_INVOICES) private readonly invoiceRepo: typeof SalesInvoice,
    @Inject(REPOSITORY.SALES_INVOICE_ITEMS) private readonly invoiceItemRepo: typeof SalesInvoiceItem,
    @Inject(REPOSITORY.CREDIT_NOTES) private readonly creditNoteRepo: typeof CreditNote,
    @Inject(REPOSITORY.CREDIT_NOTE_ITEMS) private readonly creditNoteItemRepo: typeof CreditNoteItem,
    @Inject(REPOSITORY.QUOTATIONS) private readonly quotationRepo: typeof Quotation,
    @Inject(REPOSITORY.QUOTATION_ITEMS) private readonly quotationItemRepo: typeof QuotationItem,
    private readonly accountingService: AccountingService,
    private readonly inventoryService: InventoryService,
    private readonly taxService: TaxService,
    private readonly sequelize: Sequelize,
  ) {}

  // ─── Sales Invoices ──────────────────────────────

  async createSalesInvoice(dto: CreateSalesInvoiceDto, userId: string): Promise<SalesInvoice> {
    let party: Party | null = null;
    if (dto.party_id) {
      party = await Party.findByPk(dto.party_id);
      if (!party) throw new NotFoundException('Customer not found.');
    }

    const businessSettings = await this.taxService.getBusinessSettings();
    const placeOfSupply = dto.place_of_supply || party?.state_code || businessSettings.state_code || '';
    const source = dto.source || 'sales';

    const fy = await this.accountingService.getActiveFinancialYear();
    const invoiceNumber = await this.accountingService.getNextNumber('sales_invoice', fy.name);

    const transaction = await this.sequelize.transaction();
    try {
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
            taxableAmount, taxRateId, placeOfSupply,
            businessStateCode: businessSettings.state_code,
          });
        }

        const lineTotal = parseFloat((taxableAmount + taxResult.total_tax).toFixed(2));

        itemRecords.push({
          product_id: item.product_id, description: item.description,
          hsn_code: product.hsnCode?.code || null,
          quantity: qty, unit_id: item.unit_id || product.unit_id,
          unit_price: item.unit_price, discount_percent: discountPct, discount_amount: discountAmt,
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

      const invoiceDiscount = dto.discount_amount || 0;
      const taxableAmount = parseFloat((subtotal - invoiceDiscount).toFixed(2));
      const totalTax = parseFloat((totalCgst + totalSgst + totalIgst + totalCess).toFixed(2));
      const roundOff = dto.round_off || 0;
      const grandTotal = parseFloat((taxableAmount + totalTax + roundOff).toFixed(2));

      const invoice = await this.invoiceRepo.create({
        invoice_number: invoiceNumber, date: dto.date, due_date: dto.due_date,
        party_id: dto.party_id || null, place_of_supply: placeOfSupply,
        billing_address: dto.billing_address || party?.billing_address,
        shipping_address: dto.shipping_address || party?.shipping_address,
        subtotal, discount_amount: invoiceDiscount, taxable_amount: taxableAmount,
        cgst_amount: totalCgst, sgst_amount: totalSgst, igst_amount: totalIgst,
        cess_amount: totalCess, total_tax: totalTax,
        round_off: roundOff, grand_total: grandTotal,
        amount_paid: 0, balance_due: grandTotal, payment_status: 'unpaid',
        notes: dto.notes, terms: dto.terms, source,
        financial_year: fy.name, created_by: userId,
      } as any, { transaction });

      for (const rec of itemRecords) {
        await this.invoiceItemRepo.create({ ...rec, sales_invoice_id: invoice.id } as any, { transaction });
      }

      // Stock movements — reduce stock
      for (const item of dto.items) {
        await this.inventoryService.recordStockMovement({
          productId: item.product_id, movementType: 'sale', quantity: item.quantity,
          referenceType: 'sales_invoice_item', referenceId: invoice.id,
          unitCost: item.unit_price, notes: `Sales Invoice ${invoiceNumber}`, userId,
        });
      }

      await transaction.commit();

      // Journal entry: Dr Customer (AR), Cr Sales + GST Output
      const salesLedger = await this.accountingService.findLedgerByName('Sales Account');
      const cgstOutput = await this.accountingService.findLedgerByName('CGST Output');
      const sgstOutput = await this.accountingService.findLedgerByName('SGST Output');
      const igstOutput = await this.accountingService.findLedgerByName('IGST Output');

      const journalLines: any[] = [];

      // Debit: Customer ledger or a walk-in receivable
      if (party?.ledger_account_id) {
        journalLines.push({ ledgerAccountId: party.ledger_account_id, debit: grandTotal, credit: 0 });
      } else {
        // For POS walk-in without customer, the POS module handles cash/bank debit
        // For sales without customer, use a generic receivable — skip journal for now
        // unless we have a party
      }

      if (salesLedger && taxableAmount > 0) journalLines.push({ ledgerAccountId: salesLedger.id, debit: 0, credit: taxableAmount });
      if (totalCgst > 0 && cgstOutput) journalLines.push({ ledgerAccountId: cgstOutput.id, debit: 0, credit: totalCgst });
      if (totalSgst > 0 && sgstOutput) journalLines.push({ ledgerAccountId: sgstOutput.id, debit: 0, credit: totalSgst });
      if (totalIgst > 0 && igstOutput) journalLines.push({ ledgerAccountId: igstOutput.id, debit: 0, credit: totalIgst });

      if (journalLines.length >= 2) {
        const je = await this.accountingService.createAutoJournalEntry({
          date: dto.date,
          narration: `Sales Invoice ${invoiceNumber}${party ? ` - ${party.name}` : ''}`,
          referenceType: 'sales_invoice', referenceId: invoice.id, lines: journalLines, userId,
        });
        await invoice.update({ journal_entry_id: je.id });
      }

      return this.getSalesInvoice(invoice.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      console.error('SalesService.createSalesInvoice error:', error);
      throw new InternalServerErrorException('Failed to create sales invoice.');
    }
  }

  async getSalesInvoices(query: SalesInvoiceQueryDto): Promise<PaginatedResponseDto<SalesInvoice>> {
    const where: any = {};
    if (query.party_id) where.party_id = query.party_id;
    if (query.payment_status) where.payment_status = query.payment_status;
    if (query.source) where.source = query.source;
    if (query.from_date) where.date = { ...where.date, [Op.gte]: query.from_date };
    if (query.to_date) where.date = { ...where.date, [Op.lte]: query.to_date };
    if (query.search) {
      where[Op.or] = [{ invoice_number: { [Op.iLike]: `%${query.search}%` } }];
    }

    const { rows, count } = await this.invoiceRepo.findAndCountAll({
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

  async getSalesInvoice(id: string): Promise<SalesInvoice> {
    const invoice = await this.invoiceRepo.findByPk(id, {
      include: [
        { model: Party, attributes: ['id', 'name', 'gstin', 'state_code', 'billing_address', 'shipping_address'] },
        { model: SalesInvoiceItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
    });
    if (!invoice) throw new NotFoundException('Sales invoice not found.');
    return invoice;
  }

  async cancelSalesInvoice(id: string, userId: string): Promise<SalesInvoice> {
    const invoice = await this.getSalesInvoice(id);
    if (invoice.is_cancelled) throw new BadRequestException('Invoice is already cancelled.');

    for (const item of invoice.items) {
      await this.inventoryService.recordStockMovement({
        productId: item.product_id, movementType: 'return_in',
        quantity: parseFloat(String(item.quantity)),
        referenceType: 'sales_invoice_item', referenceId: invoice.id,
        unitCost: parseFloat(String(item.unit_price)),
        notes: `Cancel Invoice ${invoice.invoice_number}`, userId,
      });
    }

    if (invoice.journal_entry_id) {
      await this.accountingService.cancelJournalEntry(invoice.journal_entry_id, userId);
    }

    await invoice.update({ is_cancelled: true });
    return invoice;
  }

  // ─── Credit Notes (Sales Returns) ──────────────────

  async createCreditNote(dto: CreateCreditNoteDto, userId: string): Promise<CreditNote> {
    const invoice = await this.getSalesInvoice(dto.original_invoice_id);
    if (invoice.is_cancelled) throw new BadRequestException('Cannot create credit note for cancelled invoice.');

    const party = invoice.party_id ? await Party.findByPk(invoice.party_id) : null;
    const fy = await this.accountingService.getActiveFinancialYear();
    const cnNumber = await this.accountingService.getNextNumber('credit_note', fy.name);

    let totalSubtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;
    const itemRecords: any[] = [];

    for (const item of dto.items) {
      const invoiceItem = invoice.items.find((ii) => ii.product_id === item.product_id);
      const taxableAmount = parseFloat((item.quantity * item.unit_price).toFixed(2));

      let cgst = 0, sgst = 0, igst = 0;
      if (invoiceItem) {
        const origTaxable = parseFloat(String(invoiceItem.taxable_amount)) || 1;
        const ratio = taxableAmount / origTaxable;
        cgst = parseFloat((parseFloat(String(invoiceItem.cgst_amount)) * ratio).toFixed(2));
        sgst = parseFloat((parseFloat(String(invoiceItem.sgst_amount)) * ratio).toFixed(2));
        igst = parseFloat((parseFloat(String(invoiceItem.igst_amount)) * ratio).toFixed(2));
      }

      itemRecords.push({
        product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price,
        taxable_amount: taxableAmount, cgst_amount: cgst, sgst_amount: sgst, igst_amount: igst,
        total: parseFloat((taxableAmount + cgst + sgst + igst).toFixed(2)),
      });

      totalSubtotal += taxableAmount;
      totalCgst += cgst; totalSgst += sgst; totalIgst += igst;

      // Return stock
      await this.inventoryService.recordStockMovement({
        productId: item.product_id, movementType: 'return_in', quantity: item.quantity,
        referenceType: 'credit_note_item', referenceId: dto.original_invoice_id,
        unitCost: item.unit_price, notes: `Credit Note ${cnNumber}`, userId,
      });
    }

    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotal = parseFloat((totalSubtotal + totalTax).toFixed(2));

    const cn = await this.creditNoteRepo.create({
      credit_note_number: cnNumber, date: dto.date,
      original_invoice_id: dto.original_invoice_id, party_id: invoice.party_id,
      reason: dto.reason, subtotal: totalSubtotal,
      cgst_amount: totalCgst, sgst_amount: totalSgst, igst_amount: totalIgst,
      total_tax: totalTax, grand_total: grandTotal,
      financial_year: fy.name, created_by: userId,
    } as any);

    for (const rec of itemRecords) {
      await this.creditNoteItemRepo.create({ ...rec, credit_note_id: cn.id } as any);
    }

    // Journal: Dr Sales + GST Output, Cr Customer
    if (party?.ledger_account_id) {
      const salesLedger = await this.accountingService.findLedgerByName('Sales Account');
      const cgstOutput = await this.accountingService.findLedgerByName('CGST Output');
      const sgstOutput = await this.accountingService.findLedgerByName('SGST Output');
      const igstOutput = await this.accountingService.findLedgerByName('IGST Output');

      const lines: any[] = [];
      if (totalSubtotal > 0 && salesLedger) lines.push({ ledgerAccountId: salesLedger.id, debit: totalSubtotal, credit: 0 });
      if (totalCgst > 0 && cgstOutput) lines.push({ ledgerAccountId: cgstOutput.id, debit: totalCgst, credit: 0 });
      if (totalSgst > 0 && sgstOutput) lines.push({ ledgerAccountId: sgstOutput.id, debit: totalSgst, credit: 0 });
      if (totalIgst > 0 && igstOutput) lines.push({ ledgerAccountId: igstOutput.id, debit: totalIgst, credit: 0 });
      lines.push({ ledgerAccountId: party.ledger_account_id, debit: 0, credit: grandTotal });

      if (lines.length >= 2) {
        const je = await this.accountingService.createAutoJournalEntry({
          date: dto.date, narration: `Credit Note ${cnNumber} against ${invoice.invoice_number}`,
          referenceType: 'credit_note', referenceId: cn.id, lines, userId,
        });
        await cn.update({ journal_entry_id: je.id });
      }
    }

    // Update original invoice balance
    const newBalance = parseFloat(String(invoice.balance_due)) - grandTotal;
    await invoice.update({
      balance_due: Math.max(0, newBalance),
      payment_status: newBalance <= 0 ? 'paid' : 'partial',
    });

    return cn;
  }

  async getCreditNotes(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query?.search) {
      where[Op.or] = [
        { credit_note_number: { [Op.iLike]: `%${query.search}%` } },
        { reason: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.creditNoteRepo.findAndCountAll({
      where,
      include: [
        { model: Party, attributes: ['id', 'name'] },
        { model: SalesInvoice, attributes: ['id', 'invoice_number'] },
        { model: CreditNoteItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
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

  // ─── Quotations ──────────────────────────────

  async createQuotation(dto: CreateQuotationDto, userId: string): Promise<Quotation> {
    const fy = await this.accountingService.getActiveFinancialYear();
    const qtNumber = await this.accountingService.getNextNumber('quotation', fy.name);

    let subtotal = 0, totalTax = 0;
    const itemRecords: any[] = [];

    for (const item of dto.items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) throw new NotFoundException(`Product ${item.product_id} not found.`);

      const lineSubtotal = parseFloat((item.quantity * item.unit_price).toFixed(2));
      const discountPct = item.discount_percent || 0;
      const discountAmt = parseFloat(((lineSubtotal * discountPct) / 100).toFixed(2));
      const taxable = parseFloat((lineSubtotal - discountAmt).toFixed(2));
      const taxRate = product.taxRate ? parseFloat(String(product.taxRate.rate)) : 0;
      const taxAmt = parseFloat(((taxable * taxRate) / 100).toFixed(2));

      itemRecords.push({
        product_id: item.product_id, quantity: item.quantity,
        unit_id: item.unit_id || product.unit_id,
        unit_price: item.unit_price, discount_percent: discountPct,
        taxable_amount: taxable, tax_rate: taxRate, tax_amount: taxAmt,
        total: parseFloat((taxable + taxAmt).toFixed(2)),
      });

      subtotal += taxable;
      totalTax += taxAmt;
    }

    const qt = await this.quotationRepo.create({
      quotation_number: qtNumber, date: dto.date, valid_until: dto.valid_until,
      party_id: dto.party_id, subtotal, total_tax: totalTax,
      grand_total: parseFloat((subtotal + totalTax).toFixed(2)),
      notes: dto.notes, terms: dto.terms,
      financial_year: fy.name, created_by: userId,
    } as any);

    for (const rec of itemRecords) {
      await this.quotationItemRepo.create({ ...rec, quotation_id: qt.id } as any);
    }

    return this.getQuotation(qt.id);
  }

  async getQuotations(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query?.search) {
      where[Op.or] = [
        { quotation_number: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.quotationRepo.findAndCountAll({
      where,
      include: [{ model: Party, attributes: ['id', 'name'] }],
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

  async getQuotation(id: string): Promise<Quotation> {
    const qt = await this.quotationRepo.findByPk(id, {
      include: [
        { model: Party, attributes: ['id', 'name', 'gstin'] },
        { model: QuotationItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      ],
    });
    if (!qt) throw new NotFoundException('Quotation not found.');
    return qt;
  }

  async convertToInvoice(quotationId: string, userId: string): Promise<SalesInvoice> {
    const qt = await this.getQuotation(quotationId);
    if (qt.status === 'converted') throw new BadRequestException('Quotation already converted.');

    const invoiceDto: CreateSalesInvoiceDto = {
      date: new Date().toISOString().split('T')[0],
      party_id: qt.party_id,
      notes: qt.notes, terms: qt.terms,
      items: qt.items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(String(item.quantity)),
        unit_price: parseFloat(String(item.unit_price)),
        discount_percent: parseFloat(String(item.discount_percent)),
        unit_id: item.unit_id,
      })),
    };

    const invoice = await this.createSalesInvoice(invoiceDto, userId);
    await qt.update({ status: 'converted', converted_to_invoice_id: invoice.id });
    return invoice;
  }
}
